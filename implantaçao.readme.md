# 🚀 Implantação do Zero — Overcyber Reloaded

> Guia completo para re-implantar todo o sistema (Frontend + Proxy + Backend + Banco)
> em uma máquina nova, do `git clone` ao sistema rodando em produção.

---

## Índice

1. [Visão Geral da Arquitetura](#1-visão-geral-da-arquitetura)
2. [Pré-requisitos](#2-pré-requisitos)
3. [Clonagem e Configuração Inicial](#3-clonagem-e-configuração-inicial)
4. [Build do Frontend (React + Vite)](#4-build-do-frontend-react--vite)
5. [Build do Backend (Rust)](#5-build-do-backend-rust)
6. [Banco de Dados (SQLite)](#6-banco-de-dados-sqlite)
7. [Proxy Python (server.py)](#7-proxy-python-serverpy)
8. [Inicialização e Testes](#8-inicialização-e-testes)
9. [Systemd (produção)](#9-systemd-produção)
10. [Nginx (produção com HTTPS)](#10-nginx-produção-com-https)
11. [Solução de Problemas Comuns](#11-solução-de-problemas-comuns)
12. [Check-list de Implantação](#12-check-list-de-implantação)
13. [Referência de Variáveis de Ambiente](#13-referência-de-variáveis-de-ambiente)

---

## 1. Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                   Navegador (usuário)                        │
│            http://192.168.10.14:8000 (ou domínio)            │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  Nginx (porta 80/443) — proxy reverso opcional              │
│  - Termina HTTPS (Let's Encrypt)                            │
│  - Proxy reverso → localhost:8000                           │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  Proxy Python — server.py (porta 8000)                      │
│  - Serve arquivos estáticos (dist/)                         │
│  - SPA routing (redireciona 404 → index.html)              │
│  - Proxy reverso /api/* → localhost:8787                    │
│  - Rate limiting (/api/)                                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  Backend Rust — overcyber-backend (porta 8787)              │
│  - API REST (10 handlers)                                   │
│  - PoW (Proof of Work) anti-spam                            │
│  - Sessões JWT (cookie-based)                               │
│  - Rate limiting interno                                    │
│  - Migrações automáticas de banco                           │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  SQLite — data/overcyber.db                                 │
│  - 10 tabelas (admin_user, sessions, about, resume,         │
│    projects, posts, comments, contact_messages,             │
│    pow_challenges, audit_log)                               │
└─────────────────────────────────────────────────────────────┘
```

### Portas

| Serviço       | Porta  | Acesso        |
|---------------|-------|---------------|
| Nginx         | 80/443| Público       |
| Proxy Python  | 8000  | Local / Nginx  |
| Backend Rust  | 8787  | Local (só proxy) |

---

## 2. Pré-requisitos

### Dependências mínimas

| Ferramenta   | Versão testada       | Instalação (Ubuntu/Debian)                    |
|-------------|----------------------|-----------------------------------------------|
| Node.js     | ≥ 18 (testado 22.22) | `curl -fsSL https://deb.nodesource.com/setup_22.x sudo -E bash - && sudo apt install -y nodejs` |
| npm         | ≥ 10 (vem com Node)  | incluso com Node.js                           |
| Rust/Cargo  | ≥ 1.75 (testado 1.95)| `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs sh` |
| Python 3    | ≥ 3.10 (testado 3.x) | `sudo apt install -y python3`                 |
| SQLite 3    | ≥ 3.40 (testado 3.45)| `sudo apt install -y sqlite3 libsqlite3-dev`  |
| git         | qualquer             | `sudo apt install -y git`                     |
| build-essential | qualquer        | `sudo apt install -y build-essential`         |
| pkg-config  | qualquer            | `sudo apt install -y pkg-config`              |
| openssl-dev | qualquer            | `sudo apt install -y libssl-dev`              |

### Opcionais (produção)

| Ferramenta | Finalidade               | Instalação                              |
|-----------|--------------------------|-----------------------------------------|
| Nginx      | Proxy reverso + HTTPS    | `sudo apt install -y nginx`            |
| certbot    | Let's Encrypt automático | `sudo apt install -y certbot python3-certbot-nginx` |

### Verificar instalações

```bash
node --version
npm --version
rustc --version
cargo --version
python3 --version
sqlite3 --version
nginx -v           # opcional
```

---

## 3. Clonagem e Configuração Inicial

### 3.1 Clonar o repositório

```bash
git clone <URL_DO_REPOSITORIO> overcyber
cd overcyber
```

### 3.2 Estrutura de diretórios (após clone)

```
overcyber/
├── index.html          # Entrypoint Vite
├── package.json        # Dependências frontend
├── vite.config.ts      # Config Vite
├── tailwind.config.ts  # Config Tailwind
├── postcss.config.js   # Config PostCSS
├── tsconfig.json       # Config TypeScript
├── eslint.config.js    # Config ESLint
├── components.json     # Config shadcn/ui
│
├── src/                # Frontend React
│   ├── main.tsx        # Entrypoint
│   ├── App.tsx         # Rotas
│   ├── App.css         # Estilos globais
│   ├── index.css       # Tailwind base
│   ├── lib/            # api.ts, pow.ts, utils.ts
│   ├── hooks/          # use-managed-content, use-toast, use-mobile
│   ├── components/     # UI components
│   └── pages/          # Index, About, Blog, BlogPost, Projects, Admin, Contact, NotFound
│
├── server.py           # Proxy Python
├── build.py            # Script de build completo
│
├── backend/            # Backend Rust
│   ├── Cargo.toml
│   ├── Cargo.lock
│   ├── src/            # main.rs, config.rs, db.rs, models.rs, error.rs
│   │   ├── handlers/   # mod.rs, auth, posts, comments, contact, projects, about, resume, pow
│   │   ├── middleware/ # mod.rs, auth.rs, headers.rs
│   │   └── security/   # mod.rs, pow.rs, session.rs, totp.rs, argon2id.rs, headers.rs, ratelimit.rs
│   ├── migrations/     # 0001_init.sql, 0002_seed.sql
│   ├── nginx/          # site.conf.example
│   └── systemd/        # overcyber.service.example
│
├── data/               # Banco SQLite (criado na primeira execução)
│   └── overcyber.db
│
├── dist/               # Build do frontend (gerado pelo npm run build)
├── node_modules/       # Dependências frontend (gerado pelo npm install)
└── public/             # Assets estáticos (robots.txt, favicon)
```

### 3.3 Criar diretório de dados

```bash
mkdir -p data
```

---

## 4. Build do Frontend (React + Vite)

### 4.1 Instalar dependências

```bash
cd /caminho/para/overcyber
npm install
```

> ⚠️ O `npm install` pode levar 1-2 minutos. Verifique se não há erros.

### 4.2 Build de produção

```bash
npm run build
```

Isso gera os arquivos estáticos em `dist/`:
- `dist/index.html` — HTML principal
- `dist/assets/index-*.js` — JS compilado e minificado
- `dist/assets/index-*.css` — CSS compilado

### 4.3 Verificar build

```bash
ls -la dist/index.html
ls -la dist/assets/index-*.js
```

### 4.4 (Opcional) Desenvolvimento com hot-reload

```bash
npm run dev
# Acessar http://localhost:5173
```

---

## 5. Build do Backend (Rust)

### 5.1 Compilar

```bash
cd /caminho/para/overcyber/backend
cargo build --release
```

> ⏱️ O primeiro build leva **5-15 minutos** (baixa e compila todas as dependências).
> Builds subsequentes são mais rápidos (segundos a minutos).

### 5.2 Verificar binário

```bash
ls -la target/release/overcyber-backend
# Deve ter ~15-30 MB
```

### 5.3 Dependências Rust (Cargo.toml)

Principais crates:
- `actix-web` — Servidor HTTP
- `actix-cors` — CORS
- `serde` / `serde_json` — Serialização
- `rusqlite` — SQLite
- `sha2` / `sha3` — Hashing (PoW, sessões)
- `rand` — Geração de nonce/challenge
- `argon2` — Hash de senhas
- `totp-rs` — Autenticação 2FA
- `chrono` — Timestamps
- `regex` — Validações
- `uuid` — IDs únicos

---

## 6. Banco de Dados (SQLite)

### 6.1 Criação automática

O banco é **criado e migrado automaticamente** na primeira execução do backend.
Não é necessário executar SQL manualmente.

O backend procura o banco no caminho definido por:

| Variável       | Default                          |
|---------------|----------------------------------|
| `DATABASE_PATH` | `./data/overcyber.db` (relativo ao CWD) |

Se o arquivo não existir, o backend:
1. Cria o diretório `data/` se necessário
2. Cria o arquivo SQLite vazio
3. Executa `migrations/0001_init.sql` (cria todas as tabelas)
4. Executa `migrations/0002_seed.sql` (seed data inicial)

### 6.2 Migrações manuais (se necessário)

```bash
# Aplicar migration manualmente
sqlite3 data/overcyber.db < backend/migrations/0001_init.sql
sqlite3 data/overcyber.db < backend/migrations/0002_seed.sql

# Verificar tabelas
sqlite3 data/overcyber.db ".tables"

# Verificar admin
sqlite3 data/overcyber.db "SELECT id, username FROM admin_user"
```

### 6.3 Tabelas (10)

| Tabela             | Finalidade                      |
|--------------------|---------------------------------|
| `admin_user`       | Administradores (login)         |
| `sessions`         | Sessões JWT                     |
| `about`            | Conteúdo da página Sobre        |
| `resume`           | Currículo (educação, experiência, skills, publicações) |
| `projects`         | Projetos                        |
| `posts`            | Posts do blog                   |
| `comments`         | Comentários (com PoW)           |
| `contact_messages` | Mensagens de contato (com PoW)  |
| `pow_challenges`   | Desafios PoW (anti-spam)        |
| `audit_log`        | Log de auditoria                |

### 6.4 Seed data

O `0002_seed.sql` cria o admin padrão:

```sql
INSERT INTO admin_user (id, username, password_hash, display_name, role)
VALUES ('admin-001', 'admin', '<hash_argon2>', 'Administrador', 'admin');
```

> 🔑 Na primeira execução, a senha do admin é definida pela variável `ADMIN_BOOTSTRAP_PASSWORD`.
> Se não definida, a senha padrão é gerada e exibida no log.

---

## 7. Proxy Python (server.py)

### 7.1 O que faz

O `server.py` é um proxy HTTP escrito em Python puro (sem dependências externas) que:

1. **Serve arquivos estáticos** da pasta `dist/` (o frontend compilado)
2. **Faz SPA routing** — qualquer URL que não seja um arquivo existente é redirecionado para `index.html` (necessário para o React Router funcionar com rotas como `/blog/algum-post`)
3. **Proxy reverso** — requisições para `/api/*` são redirecionadas para o backend Rust (`localhost:8787`)
4. **Rate limiting** simples — limita requisições à API por IP

### 7.2 Configuração

| Variável | Default         | Descrição                       |
|----------|-----------------|---------------------------------|
| `PORT`   | `8000`          | Porta do proxy                  |
| `BACKEND`| `http://127.0.0.1:8787` | URL do backend Rust    |

No código (`server.py`):
- `STATIC_DIR = "dist"` — pasta com o frontend buildado
- `RATE_LIMIT = 60` — segundos entre requisições de um mesmo IP à API

### 7.3 Executar

```bash
cd /caminho/para/overcyber
python3 server.py
```

> ⚠️ O proxy **deve** ser executado do diretório raiz do projeto (onde `dist/` existe).

---

## 8. Inicialização e Testes

### 8.1 Iniciar o backend

```bash
cd /caminho/para/overcyber

# Configurar variáveis (ou exportar antes)
DATABASE_PATH=/caminho/para/overcyber/data/overcyber.db \
BIND_ADDR=127.0.0.1:8787 \
ADMIN_BOOTSTRAP_PASSWORD=suasenhaaqui \
./backend/target/release/overcyber-backend
```

> A primeira execução cria o banco e aplica as migrações automaticamente.

### 8.2 Iniciar o proxy

Em outro terminal:

```bash
cd /caminho/para/overcyber
PORT=8000 \
BACKEND=http://127.0.0.1:8787 \
python3 server.py
```

### 8.3 Testar health check

```bash
# Backend direto
curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8787/healthz
# Deve retornar: 200

# Proxy (frontend + API)
curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8000/
# Deve retornar: 200
```

### 8.4 Testar todos os endpoints

```bash
# Challenge PoW
curl -s http://127.0.0.1:8000/api/pow/challenge

# About
curl -s http://127.0.0.1:8000/api/about

# Resume
curl -s http://127.0.0.1:8000/api/resume

# Projetos
curl -s http://127.0.0.1:8000/api/projects

# Posts
curl -s http://127.0.0.1:8000/api/posts

# Comentários (GET)
curl -s 'http://127.0.0.1:8000/api/posts/teste/comments'

# Login
curl -s -X POST http://127.0.0.1:8000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"suasenhaaqui"}'
```

### 8.5 Testar E2E completo (PoW + Comentário)

```bash
cd /caminho/para/overcyber

# 1) Pegar challenge
CHALLENGE=$(curl -s http://127.0.0.1:8000/api/pow/challenge)

# 2) Submeter comentário (o frontend resolve o PoW no navegador)
# Teste sem PoW válido (esperado: 400)
curl -s -w '\nHTTP:%{http_code}' -X POST \
  'http://127.0.0.1:8000/api/posts/teste/comments' \
  -H 'Content-Type: application/json' \
  -d '{"authorName":"Teste","authorEmail":"test@test.com","body":"Teste","website":"","pow":{"nonce":"abc","solution":"abc"}}'
# Deve retornar 400 (pow inválido)
```

### 8.6 Logs

```bash
# Backend (se estiver rodando em foreground, logs vão pro stdout)
# Para rodar em background com logs:
nohup ./backend/target/release/overcyber-backend > /tmp/overcyber-backend.log 2>&1 &
tail -f /tmp/overcyber-backend.log

# Proxy
tail -f /tmp/server-py.log  # ou o stdout se estiver em foreground
```

---

## 9. Systemd (produção)

### 9.1 Instalar serviço

```bash
sudo cp backend/systemd/overcyber.service.example /etc/systemd/system/overcyber.service
```

### 9.2 Editar configuração

```bash
sudo nano /etc/systemd/system/overcyber.service
```

Conteúdo base (ajuste caminhos):

```ini
[Unit]
Description=Overcyber Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/caminho/para/overcyber
ExecStart=/caminho/para/overcyber/backend/target/release/overcyber-backend
Environment=DATABASE_PATH=/caminho/para/overcyber/data/overcyber.db
Environment=BIND_ADDR=127.0.0.1:8787
Environment=ADMIN_BOOTSTRAP_PASSWORD=suasenhaforte
Environment=RUST_LOG=info
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

> ⚠️ O `WorkingDirectory` deve ser o diretório raiz do projeto (onde `data/` existe).

### 9.3 Proxy como serviço (systemd)

Crie `/etc/systemd/system/overcyber-proxy.service`:

```ini
[Unit]
Description=Overcyber Python Proxy
After=network.target overcyber.service
Requires=overcyber.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/caminho/para/overcyber
ExecStart=/usr/bin/python3 /caminho/para/overcyber/server.py
Environment=PORT=8000
Environment=BACKEND=http://127.0.0.1:8787
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

### 9.4 Gerenciar serviços

```bash
sudo systemctl daemon-reload
sudo systemctl enable overcyber.service overcyber-proxy.service
sudo systemctl start overcyber.service
sudo systemctl start overcyber-proxy.service

# Verificar status
sudo systemctl status overcyber.service
sudo systemctl status overcyber-proxy.service

# Ver logs
sudo journalctl -u overcyber.service -f
sudo journalctl -u overcyber-proxy.service -f
```

---

## 10. Nginx (produção com HTTPS)

### 10.1 Configuração base

```bash
sudo cp backend/nginx/site.conf.example /etc/nginx/sites-available/overcyber
sudo nano /etc/nginx/sites-available/overcyber
```

Conteúdo base:

```nginx
server {
    listen 80;
    server_name seudominio.com;

    # Redirecionar para HTTPS (se configurado)
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seudominio.com;

    # SSL (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/seudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seudominio.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy strict-origin-when-cross-origin;

    # Proxy para o frontend (Python)
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket (se necessário)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Logs
    access_log /var/log/nginx/overcyber-access.log;
    error_log /var/log/nginx/overcyber-error.log;
}
```

### 10.2 Ativar site

```bash
sudo ln -s /etc/nginx/sites-available/overcyber /etc/nginx/sites-enabled/
sudo nginx -t  # testar configuração
sudo systemctl reload nginx
```

### 10.3 HTTPS com Let's Encrypt (Certbot)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d seudominio.com
```

### 10.4 Firewall (UFW)

```bash
sudo ufw allow 22/tcp       # SSH
sudo ufw allow 80/tcp       # HTTP
sudo ufw allow 443/tcp      # HTTPS
sudo ufw enable
```

---

## 11. Solução de Problemas Comuns

### 11.1 Backend não inicia

**Sintoma**: O binário morre logo após executar.

**Causas prováveis**:
1. **Porta ocupada**: `sudo lsof -i :8787` — mate o processo com `kill -9 <PID>`
2. **Diretório errado**: O `WorkingDirectory` (ou diretório atual) não contém `data/`
3. **Permissão SQLite**: O usuário não tem permissão de escrita no diretório `data/`
   - `sudo chown -R www-data:www-data data/`
   - `sudo chmod -R 755 data/`
4. **Dependência faltando**: `libsqlite3-dev` não instalado
   - `sudo apt install -y libsqlite3-dev`

### 11.2 Proxy não conecta ao backend

**Sintoma**: `curl http://localhost:8000/api/healthz` retorna 502.

**Causas prováveis**:
1. Backend não está rodando → `systemctl status overcyber.service`
2. Porta do backend mudou mas `BACKEND` env não foi atualizada no proxy
3. Backend rodando em `0.0.0.0` mas proxy aponta para `127.0.0.1`

### 11.3 Frontend não carrega (tela branca)

**Sintoma**: `curl http://localhost:8000/` retorna HTML, mas navegador mostra tela branca.

**Causas prováveis**:
1. Build não foi feito → `npm run build`
2. Cache do navegador → Hard refresh (`Ctrl+Shift+R`)
3. Erro no console do navegador (F12 → Console)

### 11.4 Erro "not_found" ao enviar comentário

**Sintoma**: Toast de erro com `HTTP 404: not_found`.

**Causas prováveis**:
1. **Cache do navegador** — JS antigo sem as correções → Hard refresh
2. **Backend antigo** — binário desatualizado (antes da correção do auto-create de posts)
   → Rebuild: `cd backend && cargo build --release`

### 11.5 Erro "rate_limited" (429)

**Sintoma**: Toast com `HTTP 429: rate_limited` ou `429 Too Many Requests`.

**Causas**:
1. Muitas requisições no mesmo minuto → Aguarde 60s
2. Há rate limiting no proxy (`server.py`) e no backend
3. Testes automatizados podem disparar o limit — reinicie o backend para zerar

### 11.6 Erro "pow invalid" (400)

**Sintoma**: Toast com `HTTP 400: pow invalid`.

**Causas**:
1. O Challenge expirou (10 minutos) → Recarregue a página
2. Bug no solver de PoW do navegador → Verifique o console (F12)
3. Muitas tentativas com PoW inválido → O backend pode começar a rejeitar

### 11.7 Erro de CORS

**Sintoma**: Requisições bloqueadas no navegador com erro de CORS.

**Causas**:
1. Acessando o backend diretamente (porta 8787) em vez de pelo proxy (porta 8000)
2. Configuração CORS incorreta → Verifique `backend/src/main.rs` (`actix-cors`)

---

## 12. Check-list de Implantação

### Pré-implantação

- [ ] Dependências instaladas (Node, Rust, Python, SQLite)
- [ ] Repositório clonado
- [ ] `data/` criado com permissões corretas
- [ ] Variáveis de ambiente definidas (senha admin, etc.)

### Build

- [ ] `npm install` sem erros
- [ ] `npm run build` — `dist/index.html` existe
- [ ] `cargo build --release` — binário compilado

### Inicialização

- [ ] Backend rodando — `curl http://127.0.0.1:8787/healthz` → 200
- [ ] Proxy rodando — `curl http://127.0.0.1:8000/` → 200
- [ ] Admin existe: `sqlite3 data/overcyber.db "SELECT * FROM admin_user"`
- [ ] Testar login: `curl -X POST http://127.0.0.1:8000/api/auth/login -d '...'`

### Produção

- [ ] Nginx configurado e testado
- [ ] HTTPS configurado (Let's Encrypt)
- [ ] Systemd services ativos e enabled
- [ ] Firewall configurado (80, 443, 22)
- [ ] Logs monitorados (journalctl)

### Pós-implantação

- [ ] Acessar site no navegador
- [ ] Testar formulário de comentário (PoW)
- [ ] Testar formulário de contato
- [ ] Testar login no admin
- [ ] Testar hard refresh (cache)

---

## 13. Referência de Variáveis de Ambiente

### Backend (`overcyber-backend`)

| Variável                     | Default                | Descrição                                      |
|------------------------------|------------------------|------------------------------------------------|
| `DATABASE_PATH`              | `./data/overcyber.db`  | Caminho completo para o arquivo SQLite         |
| `BIND_ADDR`                  | `127.0.0.1:8787`       | Endereço e porta do servidor HTTP              |
| `ADMIN_BOOTSTRAP_PASSWORD`   | (gerada aleatoriamente)| Senha inicial do admin (usada uma vez)         |
| `SESSION_SECRET`             | (gerado aleatoriamente)| Chave secreta para assinar cookies JWT         |
| `POW_DIFFICULTY`             | `4`                    | Dificuldade do PoW (número de zeros no hash)   |
| `POW_EXPIRY_SECS`            | `600`                  | Tempo de expiração do challenge PoW (segundos) |
| `RUST_LOG`                   | `info`                 | Nível de log (trace, debug, info, warn, error) |
| `MAX_CONTENT_SIZE`           | `65536` (64KB)         | Tamanho máximo do corpo da requisição          |

### Proxy (`server.py`)

| Variável  | Default                   | Descrição                     |
|-----------|---------------------------|-------------------------------|
| `PORT`    | `8000`                    | Porta do proxy HTTP           |
| `BACKEND` | `http://127.0.0.1:8787`   | URL do backend Rust           |

---

## Comandos Rápidos

```bash
# === BACKEND ===
cd /caminho/para/overcyber
DATABASE_PATH=/caminho/para/overcyber/data/overcyber.db \
BIND_ADDR=127.0.0.1:8787 \
ADMIN_BOOTSTRAP_PASSWORD=admin123 \
nohup ./backend/target/release/overcyber-backend > /tmp/overcyber-backend.log 2>&1 &

# === PROXY ===
cd /caminho/para/overcyber
nohup python3 server.py > /tmp/server-py.log 2>&1 &

# === HEALTH CHECK ===
curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8787/healthz && echo ' backend ok'
curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8000/ && echo ' frontend ok'

# === LOGS ===
tail -f /tmp/overcyber-backend.log
tail -f /tmp/server-py.log

# === MATAR TUDO ===
kill -9 $(pgrep -f 'overcyber-backend')
kill -9 $(pgrep -f 'python3 server.py')

# === REBUILD COMPLETO ===
cd /caminho/para/overcyber && \
  npm run build && \
  cd backend && cargo build --release && \
  cd .. && \
  kill -9 $(pgrep -f 'overcyber-backend') 2>/dev/null; \
  kill -9 $(pgrep -f 'python3 server.py') 2>/dev/null; \
  sleep 2 && \
  DATABASE_PATH=$(pwd)/data/overcyber.db \
  BIND_ADDR=127.0.0.1:8787 \
  ADMIN_BOOTSTRAP_PASSWORD=admin123 \
  nohup ./backend/target/release/overcyber-backend > /tmp/overcyber-backend.log 2>&1 & \
  nohup python3 server.py > /tmp/server-py.log 2>&1 & \
  sleep 3 && \
  echo '--- HEALTH ---' && \
  curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8787/healthz && echo ' backend' && \
  curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8000/ && echo ' frontend'
```

---

> 📝 **Documento gerado em 2025-05-18** — Baseado na arquitetura atual do repositório.
> Para informações sobre persistência de dados e plano de migração, veja [`CONTEXT_DATA_PERSISTENCE.md`](./CONTEXT_DATA_PERSISTENCE.md).
> Para organograma completo do sistema, veja [`FILES.md`](./FILES.md).
