# overcyber-backend

Self-hosted backend escrito em Rust (axum + rusqlite) para o site Overcyber.

- **Banco**: SQLite local (`DATABASE_PATH`, default `./data/overcyber.db`)
- **Auth**: usuário único + senha Argon2id + TOTP (RFC 6238)
- **Sessão**: cookie `__Host-sid`, HttpOnly, Secure, SameSite=Strict, assinado HMAC-SHA256
- **CSRF**: double-submit token (`X-CSRF-Token` + cookie `csrf`)
- **Anti-spam**: honeypot + Proof-of-Work (SHA-256, 18 bits) + rate-limit in-memory
- **Headers**: CSP estrita, HSTS, X-Frame, nosniff, Referrer-Policy, Permissions-Policy
- **Bind**: `127.0.0.1:8787` (atrás do Nginx)

## Build

```bash
cd backend
cargo build --release
# binário: target/release/overcyber-backend
```

## Variáveis de ambiente

| Var | Default | Obrigatório |
|-----|---------|-------------|
| `BIND_ADDR` | `127.0.0.1:8787` | não |
| `DATABASE_PATH` | `./data/overcyber.db` | não |
| `SESSION_SECRET` | (auto-gerado em `./data/.session_secret` se faltar) | recomendado |
| `ADMIN_BOOTSTRAP_PASSWORD` | (gera senha aleatória logada 1x se faltar) | recomendado |
| `PUBLIC_ORIGIN` | `https://overcyber.local` | sim em produção |
| `RUST_LOG` | `info,overcyber_backend=info` | não |

Gere um segredo seguro:
```bash
openssl rand -base64 32
```

## Primeiro boot

1. Logue em `/admin` com usuário `admin` e a senha de `ADMIN_BOOTSTRAP_PASSWORD`.
2. O servidor força troca de senha.
3. Configure o 2FA TOTP (escaneie o QR no app autenticador).
4. Clique em "Importar do localStorage" no painel para migrar conteúdo legado.

## Deploy com systemd + Nginx

Veja `systemd/overcyber.service.example` e `nginx/site.conf.example`.

```bash
sudo cp systemd/overcyber.service.example /etc/systemd/system/overcyber.service
sudo cp nginx/site.conf.example /etc/nginx/sites-available/overcyber.conf
sudo ln -s /etc/nginx/sites-available/overcyber.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo systemctl enable --now overcyber.service
```

## Backup

```bash
sqlite3 /var/lib/overcyber/overcyber.db ".backup '/var/backups/overcyber-$(date +%F).db'"
```

## Checklist de hardening

- [ ] TLS válido (Let's Encrypt) com HSTS preload
- [ ] `SESSION_SECRET` 32B+ persistido fora do repositório
- [ ] Senha admin trocada e 2FA ativado
- [ ] Firewall: somente 80/443 expostos
- [ ] Backup diário do SQLite verificado
- [ ] Logs sem PII (já garantido pelo middleware)
