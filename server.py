from http.server import HTTPServer, SimpleHTTPRequestHandler
import os
import sys
import http.client
from pathlib import Path

# Definir o diretório para servir os arquivos estáticos
DIST_DIR = Path(__file__).parent / "dist"

# Backend Rust rodando na porta 8787
BACKEND_HOST = "127.0.0.1"
BACKEND_PORT = 8787

# Origens permitidas para CORS (backend API)
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "http://192.168.10.14:8000",
    "https://overcyber.online",
]

# Headers repassados ao backend (autenticação, CSRF, tipo e contexto de rede)
FORWARD_HEADERS = [
    "Cookie",
    "X-CSRF-Token",
    "Content-Type",
    "Accept",
    "Origin",
    "Referer",
    "User-Agent",
]

# SEC-03: defina TRUST_PROXY=1 quando este servidor estiver ATRÁS de um proxy
# confiável (ex.: Nginx) que já define X-Forwarded-For com o IP real do cliente.
# Nesse caso o valor recebido é preservado e o IP da conexão é ANEXADO ao final.
# Sem TRUST_PROXY, o X-Forwarded-For do cliente é descartado (anti-spoofing) e
# substituído pelo IP da conexão TCP.
TRUST_PROXY = os.environ.get("TRUST_PROXY") == "1"


class CORSHTTPRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIST_DIR), **kwargs)

    # ─── Proxy para o backend Rust ──────────────────────────────────

    def _client_ip(self):
        """IP do cliente que conectou neste servidor (para X-Forwarded-For)."""
        return self.client_address[0]

    def _proxy_request(self):
        """Encaminha requisições /api/* para o backend Rust (127.0.0.1:8787)."""
        fwd_headers = {}
        for key in FORWARD_HEADERS:
            val = self.headers.get(key)
            if val:
                fwd_headers[key] = val

        # SEC-03: o backend usa X-Forwarded-For para rate limiting/auditoria.
        # O header enviado pelo CLIENTE nunca é confiável: ou é descartado
        # (XFF = IP da conexão TCP) ou, com TRUST_PROXY=1, é preservado e o
        # IP da conexão é anexado ao final da cadeia.
        client_ip = self._client_ip()
        if TRUST_PROXY and self.headers.get("X-Forwarded-For"):
            fwd_headers["X-Forwarded-For"] = (
                f"{self.headers['X-Forwarded-For']}, {client_ip}"
            )
        else:
            fwd_headers["X-Forwarded-For"] = client_ip
        fwd_headers["X-Real-IP"] = client_ip

        # Ler body para métodos que enviam payload
        body = None
        if self.command in ("POST", "PUT", "PATCH", "DELETE"):
            content_length = int(self.headers.get("Content-Length", 0))
            if content_length > 0:
                body = self.rfile.read(content_length)

        conn = http.client.HTTPConnection(
            BACKEND_HOST, BACKEND_PORT, timeout=30
        )
        try:
            conn.request(self.command, self.path, body=body, headers=fwd_headers)
            response = conn.getresponse()
            data = response.read()

            # Repassar status e headers
            self.send_response(response.status)
            skip_headers = {"transfer-encoding", "connection", "keep-alive"}
            for key, val in response.getheaders():
                if key.lower() not in skip_headers:
                    # CSP do backend é restritiva (API); não interfere com o frontend
                    self.send_header(key, val)

            self.end_headers()
            self.wfile.write(data)
        except Exception as e:
            # Backend offline → 502 Bad Gateway
            try:
                self.send_response(502)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(
                    b'{"error":"backend offline","detail":"%s"}'
                    % str(e).encode()
                )
            except Exception:
                pass
        finally:
            conn.close()

    # ─── CORS + Headers de segurança ────────────────────────────────

    def end_headers(self):
        # Para rotas de API o backend já trata CORS/segurança
        if self.path.startswith("/api/"):
            super().end_headers()
            return

        origin = self.headers.get("Origin", "")
        if origin in ALLOWED_ORIGINS:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header(
                "Access-Control-Allow-Methods",
                "GET, POST, PUT, DELETE, OPTIONS",
            )
            self.send_header(
                "Access-Control-Allow-Headers",
                "Content-Type, X-CSRF-Token",
            )
            self.send_header("Access-Control-Allow-Credentials", "true")

        # Headers de segurança
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header(
            "Referrer-Policy", "strict-origin-when-cross-origin"
        )
        # SEC-08: CSP endurecida com suporte às fontes oficiais (Google Fonts)
        self.send_header(
            "Content-Security-Policy",
            "default-src 'self'; "
            "script-src 'self'; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "img-src 'self' data: https://images.unsplash.com "
            "https://avatars.githubusercontent.com https://pbs.twimg.com; "
            "connect-src 'self'; "
            "font-src 'self' data: https://fonts.gstatic.com; "
            "form-action 'self'; "
            "object-src 'none'; "
            "base-uri 'self'; "
            "frame-ancestors 'none';",
        )

        # HSTS — só em produção (HTTPS)
        if os.environ.get("ENV") == "production":
            self.send_header(
                "Strict-Transport-Security",
                "max-age=31536000; includeSubDomains",
            )

        # Cache-Control: apenas assets versionados são imutáveis
        if self.path.startswith("/assets/"):
            self.send_header("Cache-Control", "public, max-age=31536000, immutable")
        else:
            self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")

        super().end_headers()

    # ─── Métodos HTTP ───────────────────────────────────────────────

    def do_OPTIONS(self):
        # API: delega ao backend (que trata CORS preflight)
        if self.path.startswith("/api/"):
            return self._proxy_request()
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        if self.path.startswith("/api/"):
            return self._proxy_request()
        # Para URLs que não são arquivos estáticos, servir index.html
        # (roteamento React Router)
        path = self.translate_path(self.path)
        if not os.path.exists(path) and not self.path.startswith("/assets/"):
            self.path = "/"
        return super().do_GET()

    def do_POST(self):
        if self.path.startswith("/api/"):
            return self._proxy_request()
        super().do_POST()

    def do_PUT(self):
        if self.path.startswith("/api/"):
            return self._proxy_request()
        super().do_PUT()

    def do_DELETE(self):
        if self.path.startswith("/api/"):
            return self._proxy_request()
        super().do_DELETE()

    def do_PATCH(self):
        if self.path.startswith("/api/"):
            return self._proxy_request()
        super().do_PATCH()

    def do_HEAD(self):
        if self.path.startswith("/api/"):
            return self._proxy_request()
        path = self.translate_path(self.path)
        if not os.path.exists(path) and not self.path.startswith("/assets/"):
            self.path = "/"
        super().do_HEAD()


def run(server_class=HTTPServer, handler_class=CORSHTTPRequestHandler, port=8000):
    server_address = ("", port)
    httpd = server_class(server_address, handler_class)
    print(f"Servidor iniciado em http://localhost:{port}")
    print(f"  → API proxy: /api/* -> http://{BACKEND_HOST}:{BACKEND_PORT}")
    print(f"  → Estáticos: {DIST_DIR}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor encerrado.")
        httpd.server_close()


if __name__ == "__main__":
    if not DIST_DIR.exists():
        print(
            f"Diretório 'dist' não encontrado. Execute 'npm run build' primeiro."
        )
        sys.exit(1)

    port = int(os.environ.get("PORT", 8000))
    run(port=port)
