# overcyber-backend

Self-hosted backend escrito em Rust (axum + rusqlite) para o site Overcyber.

- **Banco**: SQLite local (`DATABASE_PATH`, default `./data/overcyber.db`)
- **Auth**: usuário único + senha Argon2id + TOTP (RFC 6238)
- **Sessão**: cookie `__Host-sid`, HttpOnly, Secure, SameSite=Strict, assinado HMAC-SHA256
- **CSRF**: double-submit token (`X-CSRF-Token` + cookie `csrf`)
- **Anti-spam**: honeypot + Proof-of-Work (SHA-256, 18 bits) + rate-limit in-memory
- **Headers**: CSP estrita, HSTS, X-Frame, nosniff, Referrer-Policy, Permissions-Policy
- **Bind**: `127.0.0.1:8787` (atrás do Nginx)

---

## Sumário

1. [Build](#build)
2. [Configuração de senha (IMPORTANTE)](#configuração-de-senha-importante)
3. [Variáveis de ambiente](#variáveis-de-ambiente)
4. [Primeiro boot — passo a passo](#primeiro-boot--passo-a-passo)
5. [Deploy com systemd + Nginx](#deploy-com-systemd--nginx)
6. [Modo desenvolvimento (frontend + backend)](#modo-desenvolvimento-frontend--backend)
7. [Backup](#backup)
8. [Troubleshooting](#troubleshooting)
9. [Checklist de hardening](#checklist-de-hardening)

---

## Build

```bash
cd backend
cargo build --release
# binário: target/release/overcyber-backend
```

---

## Configuração de senha (IMPORTANTE)

O backend cria automaticamente um usuário `admin` no primeiro bootstrap, **mas você precisa decidir como a senha será definida**:

### Opção 1 — Definir via variável de ambiente (recomendado)

Defina `ADMIN_BOOTSTRAP_PASSWORD` antes de iniciar o servidor:

```bash
export ADMIN_BOOTSTRAP_PASSWORD="suasenhaaqui"
./target/release/overcyber-backend
```

- O servidor criará o usuário `admin` com esta senha.
- **A senha é usada apenas no primeiro boot** — se o banco já existir e o admin já tiver sido criado, a variável é ignorada.
- No primeiro login, o sistema **forçará a troca de senha** (mínimo 12 caracteres).

### Opção 2 — Deixar o servidor gerar senha automática

Se `ADMIN_BOOTSTRAP_PASSWORD` **não** for definida:

1. Inicie o servidor normalmente.
2. **Olhe os logs do terminal** — o servidor gera uma senha aleatória e a exibe **uma única vez**:
   ```
   WARN overcyber_backend: ADMIN_BOOTSTRAP_PASSWORD não definido — senha gerada para 'admin': aB3@kL9xY2#mP7qR
   ```
3. Copie essa senha imediatamente, pois ela **não será mostrada novamente**.
4. Use essa senha para fazer login em `/admin`.

> ⚠️ Se você perder a senha gerada, delete o banco de dados (`data/overcyber.db`) e reinicie — um novo bootstrap será feito.

### Após o primeiro login

- O sistema **forçará a troca de senha** (mínimo 12 caracteres).
- **Configure o 2FA (TOTP)** — escaneie o QR code com Google Authenticator, Aegis, 1Password etc.

---

## Variáveis de ambiente

| Var | Default | Obrigatório | Descrição |
|-----|---------|-------------|-----------|
| `BIND_ADDR` | `127.0.0.1:8787` | não | Endereço e porta de escuta |
| `DATABASE_PATH` | `./data/overcyber.db` | não | Caminho do arquivo SQLite |
| `SESSION_SECRET` | auto-gerado em `./data/.session_secret` | recomendado | Chave HMAC para assinar cookies de sessão |
| `ADMIN_BOOTSTRAP_PASSWORD` | gera senha aleatória logada 1x | recomendado | Senha inicial do admin |
| `PUBLIC_ORIGIN` | `http://localhost:5173` | sim em produção | Origem do frontend (usado CSP/CORS) |
| `RUST_LOG` | `info,overcyber_backend=info` | não | Nível de log (tracing) |

### Gerando um SESSION_SECRET seguro

```bash
openssl rand -base64 32
# Exemplo de saída: 4q8L9m2X7pR5sT1vY3wZ6aB0cD9eF4gH
```

Exporte a variável antes de iniciar:

```bash
export SESSION_SECRET="4q8L9m2X7pR5sT1vY3wZ6aB0cD9eF4gH"
```

> Se `SESSION_SECRET` não for definida, o servidor gera um segredo automaticamente e o persiste em `./data/.session_secret` (permissões 600). Em produção, **sempre defina via environment ou EnvironmentFile**.

---

## Primeiro boot — passo a passo

### 1. Prepare o ambiente

```bash
# Gere o session secret
export SESSION_SECRET=$(openssl rand -base64 32)

# Defina a senha do admin
export ADMIN_BOOTSTRAP_PASSWORD="MinhaS3nh@F0rt3!"

# Defina a origem do frontend (para dev local)
export PUBLIC_ORIGIN="http://localhost:5173"

# Opcional: configure o bind
export BIND_ADDR="127.0.0.1:8787"
```

### 2. Inicie o servidor

```bash
./target/release/overcyber-backend
```

Você verá logs como:
```
INFO overcyber_backend: overcyber-backend ouvindo em http://127.0.0.1:8787
```

### 3. Abra o frontend

Se estiver em **desenvolvimento**:
```bash
# Em outro terminal, na raiz do projeto:
npm run dev
# Frontend em http://localhost:5173
```

### 4. Faça login no admin

1. Acesse `http://localhost:5173/admin` (ou seu domínio de produção).
2. Vá até a aba **BACKEND**.
3. Faça login com:
   - **Usuário**: `admin`
   - **Senha**: a que você definiu em `ADMIN_BOOTSTRAP_PASSWORD` (ou a gerada automaticamente)
   - **Código TOTP**: deixe em branco (ainda não configurado)

### 5. Troque a senha (obrigatório)

Após o login, o sistema exibirá a tela **TROCA OBRIGATÓRIA DE SENHA**:
- Digite a senha atual
- Digite a nova senha (mínimo 12 caracteres)
- Confirme a nova senha
- Clique em "Salvar"

### 6. Configure o 2FA (recomendado)

1. No painel admin, clique em **"Ativar 2FA"**.
2. Um modal será exibido com:
   - URI `otpauth://` para escanear com app autenticador
   - Segredo em texto puro (para configuração manual)
3. Escaneie o QR code com Google Authenticator, Aegis, Authy ou 1Password.
4. Digite o código de 6 dígitos gerado pelo app.
5. Clique em **"Confirmar"**.

### 7. Migre dados legados (se houver)

Se você usava a versão anterior (com localStorage), vá até a aba **MIGRAR** no painel e clique em **"Importar agora"** para migrar posts, projetos e about do localStorage para o banco SQLite.

---

## Deploy com systemd + Nginx

Veja `systemd/overcyber.service.example` e `nginx/site.conf.example`.

```bash
sudo cp systemd/overcyber.service.example /etc/systemd/system/overcyber.service
sudo cp nginx/site.conf.example /etc/nginx/sites-available/overcyber.conf
sudo ln -s /etc/nginx/sites-available/overcyber.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo systemctl enable --now overcyber.service
```

> No systemd, crie `/etc/overcyber/overcyber.env` com as variáveis `SESSION_SECRET` e `ADMIN_BOOTSTRAP_PASSWORD` (descomente `EnvironmentFile` no `.service`).

---

## Modo desenvolvimento (frontend + backend)

Em **desenvolvimento**, o frontend Vite roda em `localhost:5173` e o backend em `localhost:8787`.

Configure o frontend para apontar para o backend:

```bash
export VITE_API_BASE_URL=http://localhost:8787
npm run dev
```

O `PUBLIC_ORIGIN` no backend deve ser `http://localhost:5173`.

---

## Backup

```bash
sqlite3 /var/lib/overcyber/overcyber.db ".backup '/var/backups/overcyber-$(date +%F).db'"
```

---

## Troubleshooting

### "Invalid route" / erro de rota no startup

Se você vir:
```
Invalid route "/posts/:id": insertion failed due to conflict with previously registered route: /posts/:slug/comments
```

Isso indica conflito entre rotas admin (`/:id`) e públicas (`/:slug/comments`). A solução é usar caminhos distintos — ex: `/posts/by-id/:id` para admin. Já corrigido nesta versão.

### "Connection refused" ao acessar o backend

1. Verifique se o servidor está rodando: `ps aux | grep overcyber-backend`
2. Verifique o bind: `ss -tlnp | grep 8787`
3. Confirme que `BIND_ADDR` não está restrito a `127.0.0.1` se o frontend estiver em outra máquina.

### Login falha com "unauthorized"

1. Confirme que está usando o usuário `admin`.
2. Se esqueceu a senha bootstrap:
   - Pare o servidor
   - Delete o banco: `rm data/overcyber.db`
   - Reinicie com `ADMIN_BOOTSTRAP_PASSWORD` definida
3. Verifique os logs do servidor — a senha gerada aparece apenas na primeira execução.

### "Muitas requisições" ao fazer login ou comentar

O rate limiter está ativo:
- Login: 1 req/s por IP
- Comentários: 1 req/60s + 10 req/dia por IP
- API geral: 10 req/s (configurado no Nginx)

Aguarde e tente novamente.

### "pow inválido" ao enviar comentário

O frontend precisa resolver um Proof-of-Work (SHA-256, 18 bits) antes de enviar. Se estiver testando com `curl` diretamente, você precisa obter um desafio PoW primeiro:

```bash
# Obter desafio
curl http://localhost:8787/api/pow/challenge

# Resolver e enviar comentário (requer computação do PoW)
```

### Erro de permissão no `.session_secret`

O arquivo é criado com permissões `600`. Se estiver rodando como root, verifique o dono do diretório `data/`.

---

## Checklist de hardening

- [ ] TLS válido (Let's Encrypt) com HSTS preload
- [ ] `SESSION_SECRET` 32B+ persistido fora do repositório (ex: EnvironmentFile)
- [ ] Senha admin trocada e 2FA ativado
- [ ] Firewall: somente 80/443 expostos
- [ ] Backup diário do SQLite verificado
- [ ] Logs sem PII (já garantido pelo middleware)
- [ ] Rate limiting configurado no Nginx
- [ ] `PUBLIC_ORIGIN` definido corretamente (CSP)
- [ ] `ADMIN_BOOTSTRAP_PASSWORD` **removida** após primeiro boot (não é mais necessária)
