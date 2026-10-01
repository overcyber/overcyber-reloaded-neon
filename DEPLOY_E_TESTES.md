# Deploy e Testes — Overcyber

Guia prático e autocontido para **subir o site** (frontend + backend) e **testá-lo** — em ambiente local e em produção. Complementa `SECURITY_AUDIT.md` (achados de segurança — **correções SEC-01…SEC-16, SEC-19 e SEC-20 já aplicadas e validadas**, ver seção 6 da auditoria), `implantaçao.readme.md` (implantação detalhada) e `backend/README.md`.

---

## 1. Arquitetura

```
Navegador
   │  HTTPS
   ▼
Nginx (produção)  ──►  /            → arquivos estáticos em dist/ (SPA)
   │                   /api/*        ─┐
   │                                   │ proxy reverso
   ▼                                   ▼
server.py (opcional em prod, porta 8000)   overcyber-backend (Axum, 127.0.0.1:8787)
   │  serve dist/ e faz proxy /api/*   ──►  SQLite em DATABASE_PATH (data/overcyber.db)
```

- **Frontend:** React + Vite + TypeScript (build em `dist/`).
- **Proxy de dev:** `server.py` (porta 8000) serve `dist/` e encaminha `/api/*` para o backend.
- **Backend:** Rust/Axum + SQLite (porta 8787, binário `backend/target/release/overcyber-backend`).
- **Dev do frontend:** Vite em 8080 (`vite.config.ts`) — `PUBLIC_ORIGIN` do backend é configurável.

**Importante:** o proxy Python repassa o IP real do cliente em `X-Forwarded-For`/`X-Real-IP` (SEC-03) e **descarta** o valor enviado pelo cliente (anti-spoofing). Se o server.py ficar atrás do Nginx, defina `TRUST_PROXY=1`. O backend só aceita o header de conexões loopback.

---

## 2. Pré-requisitos

| Ferramenta | Versão sugerida | Uso |
|-----------|-----------------|-----|
| Node.js + npm | 18+ | build do frontend |
| Rust + Cargo | 1.75+ | build do backend |
| Python | 3.6+ | proxy de dev (`server.py`) |
| Nginx | 1.18+ | produção (TLS + proxy) |
| SQLite | — | embutido no binário (`rusqlite bundled`) |

Instale as dependências do frontend:

```bash
npm install
```

---

## 3. Variáveis de ambiente

### Backend (`overcyber-backend`)

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `BIND_ADDR` | `127.0.0.1:8787` | Endereço de escuta. **Mantenha localhost** e exponha via proxy. |
| `DATABASE_PATH` | `./data/overcyber.db` | Caminho do SQLite. Não use o arquivo com typo `overcyper.db`. |
| `SESSION_SECRET` | gerado e salvo em `data/.session_secret` | Base64, ≥32 bytes. **Defina em produção.** |
| `ADMIN_BOOTSTRAP_PASSWORD` | senha aleatória logada uma vez | Senha inicial do admin — **usada só na criação** (SEC-01: reinícios não resetam a senha). **Remova após o primeiro boot.** |
| `POW_DIFFICULTY_BITS` | `18` | Dificuldade do PoW (SEC-20; era 14). Reduza temporariamente para testes manuais. |
| `PUBLIC_ORIGIN` | `http://localhost:5173` | Origem pública. **Com `https://…`, os cookies passam a levar `Secure`** (SEC-05) e o CORS é liberado só para esta origem (SEC-14). |
| `RUST_LOG` | `info` | Ex.: `info,overcyber_backend=debug`. |

Gerar um segredo seguro:
```bash
export SESSION_SECRET=$(openssl rand -base64 32)
```

### Frontend (build-time)

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `VITE_API_BASE_URL` | vazio (same-origin `/api`) | Só para dev com backend separado. Em produção deixe vazio. |

### Proxy (`server.py`)

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `PORT` | `8000` | Porta do servidor estático |
| `TRUST_PROXY` | — | `1` quando o server.py está **atrás do Nginx**: preserva o `X-Forwarded-For` recebido e anexa o IP da conexão (SEC-03). |
| `ENV` | — | `production` habilita HSTS |

---

## 4. Rodando localmente (desenvolvimento)

### 4.1 Backend

```bash
cd backend
cargo build --release

DATABASE_PATH="$(pwd)/../data/overcyber.db" \
BIND_ADDR=127.0.0.1:8787 \
ADMIN_BOOTSTRAP_PASSWORD="admin123" \
RUST_LOG=info \
./target/release/overcyber-backend
```

Na primeira execução o banco e as migrações (`0001_init.sql`, `0002_seed.sql`) são criados automaticamente e o admin é criado com `must_change_pw = 1`.

### 4.2 Frontend (Vite) + proxy

Em outro terminal:
```bash
npm run dev          # Vite em http://localhost:8080
```
O frontend chama `/api/*`. Para apontar direto ao backend, crie `.env.local`:
```
VITE_API_BASE_URL=http://localhost:8787
```
> Sem `VITE_API_BASE_URL`, use o `server.py` (§4.3) como same-origin.

### 4.3 Alternativa: build + proxy Python

```bash
npm run build        # gera dist/
python3 server.py    # http://localhost:8000  (proxy /api → 8787)
```

### 4.4 Health checks rápidos

```bash
curl -s http://127.0.0.1:8787/healthz            # ok
curl -s http://127.0.0.1:8787/api/about | head   # JSON do "about"
curl -s http://127.0.0.1:8787/api/posts          # lista de posts publicados
```

---

## 5. Deploy em produção

### 5.1 Build do frontend

```bash
npm ci
npm run build        # gera dist/
```

### 5.2 Build e instalação do backend

```bash
cd backend
cargo build --release
sudo install -m 0755 target/release/overcyber-backend /usr/local/bin/overcyber-backend
```

### 5.3 Segredos e ambiente (`/etc/overcyber/overcyber.env`)

```bash
sudo mkdir -p /etc/overcyber
sudo tee /etc/overcyber/overcyber.env >/dev/null <<EOF
SESSION_SECRET=$(openssl rand -base64 32)
ADMIN_BOOTSTRAP_PASSWORD=$(openssl rand -base64 18)
PUBLIC_ORIGIN=https://SEU_DOMINIO
RUST_LOG=info
EOF
sudo chmod 600 /etc/overcyber/overcyber.env
```

### 5.4 systemd

Baseie-se em `backend/systemd/overcyber.service.example`:

```bash
sudo cp backend/systemd/overcyber.service.example /etc/systemd/system/overcyber.service
# edite: descomente EnvironmentFile=/etc/overcyber/overcyber.env
sudo systemctl daemon-reload
sudo systemctl enable --now overcyber
sudo systemctl status overcyber
```

Após o **primeiro boot com sucesso**, faça login, troque a senha e ative o 2FA, então **remova `ADMIN_BOOTSTRAP_PASSWORD`** do EnvironmentFile (SEC-01: hoje o restart não reseta mais a senha, mas manter segredos desnecessários no env é má prática).

### 5.5 Nginx (TLS + proxy)

Use `backend/nginx/site.conf.example`: ele serve `dist/` como SPA (`try_files $uri $uri/ /index.html`), faz proxy de `/api/` para `127.0.0.1:8787`, injeta `X-Forwarded-For` e aplica headers de segurança.

```bash
sudo cp dist -r /var/www/overcyber/dist
sudo cp backend/nginx/site.conf.example /etc/nginx/sites-available/overcyber.conf
# edite server_name e caminhos de certificado (Let's Encrypt)
sudo ln -s /etc/nginx/sites-available/overcyber.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 5.6 Verificação pós-deploy

```bash
curl -I https://SEU_DOMINIO/                 # 200, SPA
curl -s https://SEU_DOMINIO/api/about        # JSON (não HTML)
curl -s https://SEU_DOMINIO/api/posts        # [] ou posts
curl -s -o /dev/null -w '%{http_code}\n' https://SEU_DOMINIO/api/auth/me   # 401 (sem sessão)
```

Confirme os headers de segurança:
```bash
curl -sI https://SEU_DOMINIO/ | grep -Ei 'strict-transport|x-frame|content-security|referrer'
```

---

## 6. Testes

### 6.1 Testes automáticos de build/qualidade

```bash
# Frontend — tipos e lint
npx tsc --noEmit
npm run lint
npm run build          # build de produção

# Backend — compilação e warnings
cd backend && cargo build --release
cd backend && cargo clippy --all-targets   # se disponível
```

### 6.2 Smoke tests de API (curl)

**Públicos:**
```bash
BASE=http://127.0.0.1:8000            # via proxy; use :8787 direto para testar o backend
curl -s $BASE/healthz
curl -s $BASE/api/about
curl -s $BASE/api/resume
curl -s $BASE/api/projects
curl -s $BASE/api/posts
curl -s $BASE/api/pow/challenge        # {"nonce":"...","difficulty":18}
```

**Login + fluxo autenticado (cookies + CSRF):**
```bash
curl -s -c /tmp/ck.txt -X POST $BASE/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin123"}'

CSRF=$(awk '/csrf/{print $7}' /tmp/ck.txt)
curl -s -b /tmp/ck.txt $BASE/api/auth/me

# Mutação autenticada (deve funcionar)
curl -s -b /tmp/ck.txt -X PUT $BASE/api/resume/education \
  -H 'Content-Type: application/json' -H "X-CSRF-Token: $CSRF" \
  -d '[]'

# Sem CSRF (deve retornar 403)
curl -s -o /dev/null -w '%{http_code}\n' -b /tmp/ck.txt \
  -X PUT $BASE/api/resume/education -H 'Content-Type: application/json' -d '[]'

# Sem sessão (deve retornar 401)
curl -s -o /dev/null -w '%{http_code}\n' \
  -X PUT $BASE/api/resume/education -H 'Content-Type: application/json' -d '[]'
```

**Formulários públicos (PoW):** comentários e contato exigem resolver o PoW, o que é impraticável à mão. Teste pelo navegador (§6.3) ou com um pequeno script Node reutilizando `src/lib/pow.ts`.

### 6.3 Checklist manual E2E (navegador)

| # | Passo | Resultado esperado |
|---|-------|--------------------|
| 1 | Abrir `/` | Página inicial carrega, sem erros no console |
| 2 | `/about` | Dados de perfil (nome, bio, foco de pesquisa) |
| 3 | `/projects` | Lista de projetos |
| 4 | `/blog` | Lista de posts publicados |
| 5 | `/blog/:slug` | Post abre; comentários aprovados aparecem |
| 6 | Enviar comentário (nome, e-mail, texto) | "Aguardando moderação" (= 200, `status: pending`) |
| 7 | `/contact` — enviar mensagem | Toast de sucesso |
| 8 | `/admin` → aba BACKEND → login | Sessão ativa (ou troca de senha se `must_change_pw`) |
| 9 | Criar post publicado no painel | Aparece em `/blog` após recarregar |
| 10 | Comentário pendente → Aprovar | Aparece no post público |
| 11 | Contato enviado → aparece no INBOX | Mensagem listada |
| 12 | Logout | `/api/auth/me` retorna 401 |
| 13 | Ativar 2FA (Setup TOTP) | QR/segredo válido; login passa a exigir código |

> Dica de automação: o agente `agent-browser` funciona com `CHROME_PATH=/usr/bin/chromium-browser`. Inputs React exigem o setter nativo de valor (`Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el, v)` + `dispatchEvent(new Event('input',{bubbles:true}))`).

### 6.4 Testes de segurança (após correções de `SECURITY_AUDIT.md`)

```bash
# SEC-02: mutação com must_change_pw deve ser bloqueada
# (logar com senha bootstrap e tentar PUT /api/about → esperado 403)

# SEC-04: comentário em slug inexistente não deve criar post
curl -s -b /tmp/ck.txt $BASE/api/posts | grep -c 'slug-inexistente'   # esperado 0

# SEC-01: trocar senha, reiniciar o serviço mantendo ADMIN_BOOTSTRAP_PASSWORD
#         e conferir que a senha nova continua válida (corrigido e testado)

# SEC-05: cookie deve conter Secure em HTTPS
curl -sI -X POST https://SEU_DOMINIO/api/auth/login ... | grep -i set-cookie

# SEC-09: respostas autenticadas com no-store
curl -sI -b /tmp/ck.txt $BASE/api/contact/messages | grep -i cache-control
```

---

## 7. Operação, backup e recuperação

**Backup do banco (WAL):**
```bash
sqlite3 data/overcyber.db ".backup 'backup-$(date +%F).db'"
```

**Restauração:** pare o backend, substitua `data/overcyber.db` (+ `-wal`/`-shm`), reinicie.

**Rotação de segredo de sessão:** trocar `SESSION_SECRET` invalida todas as sessões (efetivo como "logout global").

**Logs:**
```bash
journalctl -u overcyber -f           # systemd
tail -f /tmp/overcyber-backend.log   # execução manual
```

---

## 8. Troubleshooting

| Sintoma | Causa provável | Ação |
|---------|----------------|------|
| `/api/*` retorna 502 no proxy | backend offline | suba `overcyber-backend` e confira `/healthz` |
| 401 em tudo após reiniciar | `SESSION_SECRET` mudou | mantenha o segredo persistido |
| Login aceita senha antiga após restart | — | Corrigido (SEC-01): reinícios não resetam mais a senha. Se precisar restaurar a senha bootstrap, apague a linha do `admin_user` no banco |
| Rate limit "global" / bloqueios inesperados | proxy sem `X-Forwarded-For` | ver SEC-03; use Nginx injetando o header |
| Comentários não aparecem | estão `pending` | aprove no painel admin |
| Comentário em post do localStorage falha com 404 | SEC-04: backend não cria mais stub | Crie o post no backend (Admin → BACKEND ou MIGRAR) antes de comentar |
| SPA 404 em sub-rotas | Nginx sem `try_files` | ajuste `location /` |
| Front não fala com a API em dev | origem cruzada sem CORS | SEC-14 resolvido: `PUBLIC_ORIGIN` deve ser exatamente a origem do front em dev |
| PoW "lento" no cliente | dificuldade elevada (SEC-20) | padrão 18 bits (~0,1–0,5 s); ajuste `POW_DIFFICULTY_BITS` se necessário |
| Dados antigos no admin | cache localStorage | limpe `blog-posts`/chaves antigas e recarregue |
| Banco "errado" aberto | typo `overcyper.db` | sempre aponte para `overcyber.db` |

---

## 9. Checklist final de go-live

- [ ] `npm run build` sem erros; `dist/` servido pelo Nginx.
- [ ] `cargo build --release` OK; binário instalado e serviço ativo.
- [ ] `SESSION_SECRET` forte e fora do repositório.
- [ ] Admin com senha trocada e 2FA ativo; `ADMIN_BOOTSTRAP_PASSWORD` removida.
- [ ] `data/`, `*.db` e `.session_secret` no `.gitignore` (SEC-06).
- [ ] Achados **SEC-01 a SEC-21** tratados (SEC-01…16, 19, 20 corrigidos e validados — ver seção 6 de `SECURITY_AUDIT.md`).
- [ ] Headers de segurança conferidos (`curl -I`).
- [ ] Backup do banco agendado.
- [ ] Smoke tests (§6.2) e checklist E2E (§6.3) executados.
