# 18 - Deploy na Infraestrutura Remota e Resolução dos Bugs de Admin e Blog

## Data e Ambiente
- **Data:** 01/10/2026
- **Host Remoto:** `ubuntu@168.75.94.233` (Oracle Cloud, x86_64, Ubuntu 22.04 LTS)
- **Domínio Público:** `https://overcyber.online` (via Cloudflare Proxy)
- **Caminho do Projeto no Host Remoto:** `/var/www/overcyber-dev/`
- **Nginx Config Remota:** `/etc/nginx/sites-available/overcyber` (habilitado via `/etc/nginx/sites-enabled/overcyber`)
- **Backend Rust (Axum + SQLite):** `127.0.0.1:8787` gerido por `overcyber-backend.service`
- **Gateway Autônomo FastAPI:** `127.0.0.1:8800` gerido por `overcyber-fastapi.service`

---

## 1. Diagnóstico e Causa Raiz dos Bugs

### Bug 1: `/admin` não pedia senha e autenticava indevidamente
- **Causa Raiz Identificada:**
  - O arquivo Nginx remoto (`/etc/nginx/sites-available/overcyber`) **não possuía a diretiva `location /api/`**.
  - Todas as chamadas para `/api/auth/me` caíam no fallback SPA `try_files $uri $uri/ /index.html` e retornavam **HTTP 200 OK** contendo o arquivo HTML do SPA (649 bytes).
  - O código frontend anterior em `src/pages/Admin.tsx` executava `await api("/auth/me")`. Como a resposta retornava HTTP 200 (sem lançar erro), o código assumia sessão ativa e chamava `setIsAuthenticated(true)`, pulando o modal de senha!
- **Correção Aplicada:**
  - No Nginx: inclusão de `location /api/ { proxy_pass http://127.0.0.1:8787; ... }`.
  - No Backend Rust: `GET /api/auth/me` agora responde **HTTP 401 Unauthorized** com `{"error":"unauthorized"}` quando não há sessão.
  - No Frontend (`src/lib/api.ts` e `src/pages/Admin.tsx`): validação estrita de `Content-Type: application/json` e checagem explícita de `me && me.userId`. Se não autenticado, força `setIsAuthenticated(false)` e abre a tela de login.

### Bug 2: Blog com erro ao carregar postagens
- **Causa Raiz Identificada:**
  - Sem a rota `/api/` no Nginx, a chamada `fetch('/api/posts')` recebia o HTML `index.html`.
  - Ao executar `res.json()`, o JavaScript lançava `SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON`.
- **Correção Aplicada:**
  - O Nginx agora encaminha `/api/posts` para o backend Rust em `http://127.0.0.1:8787/api/posts`.
  - O endpoint retorna o array JSON real de posts do banco de dados SQLite.
  - O frontend foi endurecido (`src/pages/Blog.tsx`) com tratamento seguro de datas e strings.

---

## 2. Ações Executadas no Host Remoto

1. **Backup Preventivo:**
   - Diretório pré-existente copiado para `/var/www/backup_overcyber_dev_20261001_191514/`.
   - Nginx original salvo como backup em `/etc/nginx/sites-available/overcyber.bak_*`.

2. **Compilação do Backend Nativo em Rust (x86_64):**
   - Compilado nativamente na VM Ubuntu x86_64: `cargo build --release`.
   - Binário final: `/var/www/overcyber-dev/backend/target/release/overcyber-backend` (ELF 64-bit x86-64, 6.6MB).

3. **Atualização do Repositório Git Remoto:**
   - Comando executado: `git pull origin main` (fast-forward cleanly até commit `5c550bc`).

4. **Build do Frontend de Produção:**
   - Executado `npm run build` gerando os bundles em `/var/www/overcyber-dev/dist`:
     - `dist/index.html`
     - `dist/assets/index-DU1nHQr4.js`
     - `dist/assets/index-Bf5UHy6B.css`

5. **Configuração e Ativação dos Serviços Systemd:**
   - **`overcyber-backend.service`**:
     - `ExecStart=/var/www/overcyber-dev/backend/target/release/overcyber-backend`
     - `DATABASE_PATH=/var/www/overcyber-dev/data/overcyber.db`
     - `BIND_ADDR=127.0.0.1:8787`
     - `PUBLIC_ORIGIN=https://overcyber.online`
     - `Status: active (running)`
   - **`overcyber-fastapi.service`**:
     - `ExecStart=/usr/bin/python3 -m uvicorn fastapi_service.main:app --host 127.0.0.1 --port 8800`
     - `DATABASE_PATH=/var/www/overcyber-dev/data/overcyber.db`
     - `Status: active (running)`

6. **Atualização e Reload do Nginx:**
   - Configurado `/etc/nginx/sites-available/overcyber` com as rotas:
     - `location /api/ { proxy_pass http://127.0.0.1:8787; ... }` (Backend Rust)
     - `location = /healthz { proxy_pass http://127.0.0.1:8787; }` (Healthcheck Rust)
     - `location /gateway/ { proxy_pass http://127.0.0.1:8800/; ... }` (Gateway FastAPI)
     - `location / { try_files $uri $uri/ /index.html; }` (Frontend SPA)
     - Preservação integral das portas e regras SSL dos desafios CTF (8585, 9080, 9090).
   - Validação com `sudo nginx -t` (syntax is ok / test is successful).
   - Recarregado com `sudo systemctl reload nginx`.

---

## 3. Testes Reais e Validação Ponta a Ponta

| Teste | Endpoint | Resultado Obtido | Status |
|---|---|---|---|
| Healthcheck Rust | `https://overcyber.online/healthz` | `ok` (200 OK) | **Aprovado** |
| Verificação de Sessão Deslogada | `https://overcyber.online/api/auth/me` | HTTP 401 `{"error":"unauthorized"}` | **Aprovado** |
| Listagem de Posts Públicos | `https://overcyber.online/api/posts` | Array JSON com posts publicados | **Aprovado** |
| Post por Slug | `https://overcyber.online/api/posts/autonomous-defense-grid-...` | JSON com dados completos do post | **Aprovado** |
| Seções Ativas | `https://overcyber.online/api/sections` | JSON com visibilidade das seções | **Aprovado** |
| Projetos | `https://overcyber.online/api/projects` | JSON com lista de projetos | **Aprovado** |
| Perfil About | `https://overcyber.online/api/about` | JSON com dados de perfil | **Aprovado** |
| Currículo / Resume | `https://overcyber.online/api/resume` | JSON com seções de currículo | **Aprovado** |
| Desafio PoW | `https://overcyber.online/api/pow/challenge` | `{"nonce":"...","difficulty":18}` | **Aprovado** |
| Publicação de Post via Gateway | `POST /gateway/api/posts` (Bearer Token) | Post criado e publicado com sucesso | **Aprovado** |
| Envio de Comentário com PoW | `POST /api/posts/{slug}/comments` | `{"ok":true,"status":"approved"}` | **Aprovado** |
| Consulta Comentários Publicados | `GET /api/posts/{slug}/comments` | Array JSON com comentário aprovado | **Aprovado** |
| Tentativa de Login Inválido | `POST /api/auth/login` | HTTP 401 `{"error":"unauthorized"}` | **Aprovado** |

---

## 4. Conclusão
O deploy na infraestrutura remota foi concluído com sucesso absoluto. O proxy reverso Nginx agora direciona corretamente todas as requisições `/api/` para o backend Rust nativo e `/gateway/` para o FastAPI autônomo. O bug de login sem senha no `/admin` foi completamente erradicado e o carregamento do Blog está funcionando com integridade total de dados.
