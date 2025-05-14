
from http.server import HTTPServer, SimpleHTTPRequestHandler
import os
import sys
from pathlib import Path

# Definir o diretório para servir os arquivos estáticos
DIST_DIR = Path(__file__).parent / "dist"

class CORSHTTPRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIST_DIR), **kwargs)
    
    def end_headers(self):
        # Adicionar cabeçalhos CORS
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def do_OPTIONS(self):
        # Lidar com solicitações OPTIONS para CORS
        self.send_response(200)
        self.end_headers()
    
    def do_GET(self):
        # Para URLs que não são arquivos estáticos, redirecionar para index.html
        # Isso é necessário para roteamento do lado do cliente (React Router)
        path = self.translate_path(self.path)
        if not os.path.exists(path) and not self.path.startswith('/assets/'):
            self.path = '/'
        return super().do_GET()

def run(server_class=HTTPServer, handler_class=CORSHTTPRequestHandler, port=8000):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f"Servidor iniciado em http://localhost:{port}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor encerrado.")
        httpd.server_close()

if __name__ == "__main__":
    if not DIST_DIR.exists():
        print(f"Diretório 'dist' não encontrado. Execute 'npm run build' primeiro.")
        sys.exit(1)
    
    port = int(os.environ.get("PORT", 8000))
    run(port=port)
