
# Plano: Backend Rust self-hosted + Admin completo + Blog com comentários

Objetivo: substituir o "admin" baseado em localStorage por um backend Rust robusto (axum + rusqlite), com autenticação forte, gestão completa de conteúdo e sistema de blog com moderação, mantendo **100% do layout atual intacto**.

---

## 1. Repositório backend (novo diretório `backend/`)

Criado dentro do projeto, mas é um crate Rust independente que você compila e sobe atrás do Nginx.

```text
backend/
├── Cargo.toml
├── README.md                 # build, deploy, nginx, systemd
├── migrations/
│   ├── 0001_init.sql
│   └── 0002_seed.sql
├── nginx/site.conf.example   # reverse proxy + headers de segurança
├── systemd/overcyber.service.example
└── src/
    ├── main.rs               # bootstrap, config, router
    ├── config.rs             # env vars, paths
    ├── db.rs                 # pool rusqlite + migrations
    ├── error.rs              # AppError -> Response
    ├── security/
    │   ├── argon2id.rs       # wrapper sobre argon2 crate (única dep cripto)
    │   ├── totp.rs           # RFC 6238 implementado à mão (HMAC-SHA1 via ring/hmac stdlib-like)
    │   ├── session.rs        # cookie httpOnly+Secure+SameSite=Strict assinado HMAC
    │   ├── csrf.rs           # double-submit token
    │   ├── ratelimit.rs      # token-bucket em memória por IP+rota
    │   ├── pow.rs            # proof-of-work SHA-256 para comentários
    │   └── headers.rs        # CSP, HSTS, X-Frame, Referrer-Policy, Permissions-Policy
    ├── middleware/
    │   ├── auth.rs           # exige sessão válida
    │   ├── csrf.rs
    │   └── logging.rs        # log estruturado sem PII
    ├── handlers/
    │   ├── auth.rs           # login, logout, setup-2fa, verify-2fa, change-password
    │   ├── about.rs          # GET público, PUT admin
    │   ├── projects.rs       # CRUD admin, GET público
    │   ├── resume.rs         # education/experience/publications/skills
    │   ├── contact.rs        # POST público (honeypot+PoW), GET admin (inbox)
    │   ├── posts.rs          # CRUD + draft/published, GET público só published
    │   ├── comments.rs       # POST público p/ moderação, GET/approve/reject admin
    │   └── migrate.rs        # POST admin: importa snapshot do localStorage
    └── models.rs
```

### Dependências mínimas (Cargo.toml)
Apenas o estritamente necessário; nada de frameworks de auth de terceiros.
- `axum`, `tokio`, `tower`, `tower-http` (compressão/headers)
- `rusqlite` (bundled) + `r2d2` + `r2d2_sqlite`
- `serde`, `serde_json`
- `argon2` (RustCrypto, hashing de senha — recomendado pela RFC 9106; reimplementar Argon2 do zero seria irresponsável)
- `hmac`, `sha2`, `sha1`, `subtle` (constant-time) — primitivas cripto auditadas
- `rand` (CSPRNG do SO)
- `time`, `uuid`

> "Sem libs de terceiros" é interpretado como **sem frameworks de auth/CMS prontos** (nada de actix-identity, casbin, pocketbase, etc.). Primitivas criptográficas continuam vindo das crates RustCrypto auditadas — reimplementar Argon2/SHA é vetor de bug.

---

## 2. Modelo de segurança

### Autenticação
- Conta única `admin` criada no primeiro boot via env `ADMIN_BOOTSTRAP_PASSWORD`; obrigatório trocar no primeiro login.
- Senha: **Argon2id** (m=64MiB, t=3, p=1), salt 16B CSPRNG, comparação constant-time.
- **TOTP** RFC 6238 (SHA-1, 30s, 6 dígitos) com janela ±1; segredo base32 gerado server-side, QR via `otpauth://` URI renderizado no painel.
- Sessão: cookie `__Host-sid`, `HttpOnly; Secure; SameSite=Strict; Path=/`, valor = `id.HMAC(id, server_secret)`; sessões em tabela `sessions` com expiração rolling 30 min e absoluta 12 h; revogáveis.
- **CSRF**: double-submit token em header `X-CSRF-Token` para toda rota mutável.
- **Rate-limit** in-memory por IP: 5 tentativas/15min em `/api/auth/login`; backoff exponencial.

### Endurecimento HTTP
- Headers: `Content-Security-Policy` estrita (self + nonce), `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, `Permissions-Policy` mínima.
- Body limit 1 MiB (configurável), JSON-only, validação por serde + checagens de tamanho.
- Logs sem senha/token/IP-completo (IP truncado /24).

### Comentários — anti-spam sem captcha
1. **Honeypot**: campo `website` oculto; preenchido = descartar silenciosamente.
2. **Proof-of-Work**: servidor emite desafio `(nonce, difficulty=18 bits)`, cliente faz SHA-256 até achar prefixo zero; resposta inclui solução validada server-side.
3. **Rate-limit**: 1 comentário/min/IP, 10/dia/IP.
4. **Fila de moderação**: status `pending|approved|rejected|spam`; só `approved` aparece publicamente.
5. Sanitização de HTML: strip total — render como texto, links auto-detectados com `rel="nofollow ugc noopener"`.

### Nginx (exemplo entregue em `nginx/site.conf.example`)
- TLS only, HTTP/2, OCSP stapling.
- `proxy_pass` para `127.0.0.1:8787`.
- `limit_req_zone` por IP para `/api/`.
- Headers de segurança redundantes (defense-in-depth).
- Servir SPA build estático direto pelo Nginx; só `/api/*` vai pro Rust.

---

## 3. Schema SQLite (migrations/0001_init.sql)

```text
admin_user(id, username UNIQUE, password_hash, totp_secret, totp_enabled, must_change_pw, created_at, updated_at)
sessions(id PK, user_id, created_at, last_seen, expires_at, ip_hash, ua_hash)
about(id=1 singleton, name, title, bio, email, location, lattes, profile_image, research_focus, updated_at)
resume_education(id, ord, content)
resume_experience(id, ord, content)
resume_publications(id=1 singleton, articles, conferences, patents)
resume_skills(id=1 singleton, core, advanced, technologies, awards)
projects(id, title, slug UNIQUE, description, tags_csv, image, github, live, readme, ord, created_at, updated_at)
posts(id, slug UNIQUE, title, excerpt, content_md, cover_image, status TEXT CHECK(status IN('draft','published')), published_at, created_at, updated_at)
post_tags(post_id, tag)
comments(id, post_id FK, author_name, author_email_hash, body, status TEXT CHECK(status IN('pending','approved','rejected','spam')), ip_hash, created_at, moderated_at)
contact_messages(id, name, email, subject, body, ip_hash, created_at, read_at)
pow_challenges(nonce PK, difficulty, issued_at, used_at)
audit_log(id, actor, action, target, meta_json, ip_hash, created_at)
```

Todos os timestamps em UTC ISO-8601. `WAL` habilitado, `foreign_keys=ON`, `synchronous=NORMAL`.

---

## 4. API (todas JSON, prefixo `/api`)

Público:
- `GET /about`, `GET /resume`, `GET /projects`, `GET /projects/:slug`
- `GET /posts?status=published&page=` , `GET /posts/:slug`
- `GET /posts/:slug/comments` (só aprovados)
- `POST /posts/:slug/comments` (honeypot + PoW)
- `GET /pow/challenge`
- `POST /contact`

Admin (sessão + CSRF):
- `POST /auth/login` → se sem 2FA configurado, exige setup; senão exige `totp`.
- `POST /auth/logout`, `GET /auth/me`
- `POST /auth/setup-2fa`, `POST /auth/verify-2fa`, `POST /auth/change-password`
- `PUT /about`
- `PUT /resume/education`, `PUT /resume/experience`, `PUT /resume/publications`, `PUT /resume/skills`
- `POST/PUT/DELETE /projects[/...]`
- `POST/PUT/DELETE /posts[/...]` com `status: draft|published`, `POST /posts/:id/publish`, `POST /posts/:id/unpublish`
- `GET /comments?status=pending`, `POST /comments/:id/approve|reject|spam`, `DELETE /comments/:id`
- `GET /contact/messages`, `POST /contact/messages/:id/read`, `DELETE /contact/messages/:id`
- `POST /migrate/import` (payload do snapshot do localStorage)
- `GET /audit-log`

---

## 5. Mudanças no frontend (SEM alterar layout)

Apenas troca da camada de dados — nenhuma classe Tailwind, componente visual, animação ou estrutura JSX muda.

Novos arquivos:
- `src/lib/api.ts` — fetch wrapper com `credentials: 'include'`, header `X-CSRF-Token` (lido de cookie não-HttpOnly `csrf`), tratamento 401 → redireciona `/admin`.
- `src/lib/queries.ts` — hooks React Query: `useAbout`, `useProjects`, `usePosts`, `usePost`, `useComments`, `useAdminSession`, etc.

Arquivos editados (somente a fonte dos dados):
- `src/hooks/use-managed-content.ts` → passa a consumir `/api/about`, `/api/projects`, `/api/resume` via React Query, com fallback aos defaults atuais enquanto carrega (mesma forma do objeto retornado).
- `src/pages/Blog.tsx`, `src/pages/BlogPost.tsx` → ler de `/api/posts`; BlogPost ganha bloco de comentários (mesmo design de `cyber-terminal`, sem novos estilos) com form que executa PoW em Web Worker.
- `src/pages/About.tsx`, `src/pages/Projects.tsx`, `src/pages/Contact.tsx` → consumir API; Contact envia para `/api/contact`.
- `src/pages/Admin.tsx` → mantém o **mesmo layout e tabs** atuais (About, Projects, Resume etc.) + abas novas **"Blog"** (lista de posts com filtro Draft/Published, editor com toggle de status) e **"Comments"** (fila de moderação) e **"Inbox"** (mensagens do contato). Login passa a chamar `/api/auth/login`; adiciona tela de setup TOTP e tela de troca de senha obrigatória. Botão **"Importar do localStorage"** roda 1x no primeiro acesso autenticado.
- `src/App.tsx` → remove o seed de posts em localStorage (passa a vir do backend).

Worker:
- `src/workers/pow.worker.ts` — calcula o PoW sem travar UI.

`.env` frontend:
- `VITE_API_BASE_URL` (vazio em produção = mesmo host via Nginx; `http://localhost:8787` em dev).

---

## 6. Deploy (documentado no README do backend)

- `cargo build --release` → binário único `overcyber-backend`.
- Variáveis: `DATABASE_PATH`, `SESSION_SECRET` (32B base64), `BIND_ADDR=127.0.0.1:8787`, `ADMIN_BOOTSTRAP_PASSWORD`, `PUBLIC_ORIGIN`.
- `systemd` unit com `DynamicUser=yes`, `ProtectSystem=strict`, `ReadWritePaths=/var/lib/overcyber`, `NoNewPrivileges=yes`, `PrivateTmp=yes`, `RestrictAddressFamilies=AF_INET AF_INET6 AF_UNIX`.
- Nginx exemplo já citado; backup do SQLite via `sqlite3 .backup` em cron.

---

## 7. Entregáveis desta implementação

1. Todo o crate `backend/` pronto para `cargo build --release`.
2. Migrations + seeds com o conteúdo atual de exemplo.
3. `nginx/site.conf.example` e `systemd/overcyber.service.example`.
4. Frontend convertido para consumir a API, **com layout pixel-idêntico**.
5. Fluxo de migração one-click do localStorage existente.
6. README com passo-a-passo de deploy, rotação de segredos e checklist de hardening.

## 8. Fora do escopo (confirmar se quer depois)

- Upload de imagens (hoje URLs externas continuam sendo usadas).
- E-mail transacional para notificar novos comentários/mensagens.
- Múltiplos admins / RBAC.
- Backup automático off-site.
