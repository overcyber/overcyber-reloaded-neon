# FILES.md — ORGANOGRAMA DO SISTEMA E STATUS DE MIGRAÇÃO

> **Propósito:** Documentar toda a arquitetura do sistema overcyber-reloaded-neon,
> mapear cada arquivo com seu status de persistência (funcional / parcial / migrar),
> e iniciar o planejamento de migração para unificar dados no backend SQLite.
>
> **Gerado em:** 2025-05-18
> **Baseado em:** CONTEXT_DATA_PERSISTENCE.md + análise do código-fonte

---

## 1. ORGANOGRAMA COMPLETO DO SISTEMA

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       OVERCYBER-RELOADED-NEON                                │
│                  Plataforma Cyberpunk — Frontend React + Backend Rust        │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
            ┌──────────────────────────┼──────────────────────────┐
            │                          │                          │
            ▼                          ▼                          ▼
┌───────────────────────┐  ┌───────────────────────┐  ┌───────────────────────┐
│   FRONTEND (React)    │  │   PROXY (Python)      │  │   BACKEND (Rust)      │
│   src/                 │  │   server.py            │  │   backend/src/        │
│   Porta: 5173 (dev)   │  │   Porta: 8000          │  │   Porta: 8787         │
│   Servido via: proxy  │──▶│   Serve dist/ + proxy │──▶│   API REST (Axum)     │
│   Ou: build estático  │  │   /api/* → backend     │  │   SQLite (Rusqlite)   │
└───────────────────────┘  └───────────────────────┘  └───────────────────────┘
         │                                                     │
         │                                                     │
         ▼                                                     ▼
┌───────────────────────┐                             ┌───────────────────────┐
│   localStorage        │                             │   data/overcyber.db   │
│   (cache local)       │                             │   (fonte da verdade)  │
│   ↓↓↓↓↓               │                             │   ↓↓↓↓↓               │
│   admin-about-data    │                             │   Tabelas:             │
│   admin-education-data│                             │   ├─ admin_user       │
│   admin-experience-dat│                             │   ├─ sessions         │
│   admin-publications-d│                             │   ├─ about            │
│   admin-skills-data   │                             │   ├─ resume           │
│   admin-projects-data │                             │   ├─ projects         │
│   blog-posts          │                             │   ├─ posts           │
└───────────────────────┘                             │   ├─ comments         │
                                                      │   ├─ contact_messages │
                                                      │   ├─ pow_challenges   │
                                                      │   └─ audit_log       │
                                                      └───────────────────────┘
```

---

## 2. ORGANOGRAMA DO FRONTEND (src/)

```
src/
│
├── main.tsx                              ← INICIALIZAÇÃO
│   ├── setInitialTheme()                   Aplica tema dark/light
│   └── addExampleBlogPosts()               ❗ Semeia posts exemplo no localStorage
│
├── App.tsx                               ← ROTEAMENTO
│   ├── Exemplo de posts no useEffect()     ❗ Duplicata de main.tsx (posts exemplo)
│   └── Rotas: /, /blog, /blog/:slug, /projects, /contact, /about, /admin, *
│
├── lib/
│   ├── api.ts                             ✅ Cliente HTTP para backend
│   │   ├── API_BASE_URL
│   │   ├── ApiError class
│   │   └── api() + backend.available()
│   │
│   ├── pow.ts                             ✅ Proof-of-Work (jsSha256 fallback)
│   │   └── requestAndSolvePow()
│   │
│   └── utils.ts                           ⚪ Utilitários gerais
│
├── hooks/
│   ├── use-managed-content.ts             ❌ Hook só localStorage/hardcoded
│   │   ├── loadStoredContent()
│   │   ├── getAboutContent()               → localStorage → hardcoded
│   │   └── getProjectsContent()            → localStorage → hardcoded
│   │
│   ├── use-mobile.tsx                      ⚪ Hook de detecção mobile
│   └── use-toast.ts                        ⚪ Hook de toast notifications
│
├── components/
│   ├── AdminBackendPanel.tsx               ✅ Tab BACKEND do Admin
│   │   ├── Login / ChangePassword / 2FA    API backend (/auth/*)
│   │   ├── PostsPanel                      API backend (/posts/*)  ← CRUD funcional
│   │   ├── CommentsPanel                   API backend (/comments/*)
│   │   ├── InboxPanel                      API backend (/contact/messages)
│   │   └── MigratePanel                    API backend (/migrate/import)
│   │
│   ├── Layout.tsx                          ⚪ Layout wrapper
│   ├── ProfileHeader.tsx                   ⚪ Header do perfil na home
│   ├── NavigationLinks.tsx                 ⚪ Links de navegação
│   ├── SocialIcons.tsx                     ⚪ Ícones sociais
│   ├── GlitchEffect.tsx                    ⚪ Efeito visual
│   ├── ThemeToggle.tsx                     ⚪ Alternador de tema
│   ├── ThemeProvider.tsx                   ⚪ Provider de tema
│   └── ui/                                ⚪ Componentes shadcn/ui (~60 arquivos)
│
├── pages/
│   ├── Admin.tsx                           ❌ Painel Admin LEGACY
│   │   ├── Tabs: PERFIL, EDUCAÇÃO, EXPERIÊNCIA, PUBLICAÇÕES, HABILIDADES
│   │   │   └── Todas salvam em localStorage ❌
│   │   ├── Tabs: PROJETOS, BLOG
│   │   │   └── Salvam em localStorage ❌
│   │   ├── Tab: BACKEND
│   │   │   └── Renderiza AdminBackendPanel ✅
│   │   └── Login via API backend ✅ (mas usa rate limiter próprio)
│   │
│   ├── About.tsx                           ❌ Página About
│   │   ├── Lê de localStorage → hardcoded  (NUNCA usa backend)
│   │   └── Dados: perfil, educação, experiência, publicações, skills
│   │
│   ├── About-new.tsx                       ❌ Alternativa hardcoded (não usa nada)
│   │   └── Só dados fixos do getAboutContent()
│   │
│   ├── Blog.tsx                            ❌ Listagem do blog
│   │   ├── Lê de localStorage → hardcoded  (NUNCA usa backend)
│   │   └── FALLBACK_POSTS com 3 entries
│   │
│   ├── BlogPost.tsx                        ⚠️ Post individual
│   │   ├── Lê de localStorage → hardcoded → backend (terciário)
│   │   ├── Comentários: API backend ✅
│   │   └── Busca post no backend SÓ se não achar em localStorage
│   │
│   ├── Projects.tsx                        ❌ Página de projetos
│   │   ├── Lê de use-managed-content → localStorage → hardcoded
│   │   └── NUNCA usa backend
│   │
│   ├── Contact.tsx                         ✅ Formulário de contato
│   │   └── Envia para API backend com PoW
│   │
│   ├── Index.tsx                           ⚪ Home page (não tem dados dinâmicos)
│   │   └── Boot sequence + ProfileHeader + NavigationLinks
│   │
│   └── NotFound.tsx                        ⚪ Página 404
│
├── index.css                               ⚪ Estilos globais
└── App.css                                 ⚪ Estilos do App
```

---

## 3. ORGANOGRAMA DO BACKEND (backend/src/)

```
backend/src/
│
├── main.rs                                ← PONTO DE ENTRADA
│   ├── Axum router setup
│   ├── CORS restrito a PUBLIC_ORIGIN (SEC-14)
│   ├── Dificuldade PoW: 18 bits (configurável via POW_DIFFICULTY_BITS, SEC-20)
│   └── Middleware Secure-cookie (SEC-05)
│
├── config.rs                              ✅ Config (DB path, bind addr, etc.)
├── db.rs                                  ✅ Conexão SQLite + bootstrap admin
├── models.rs                              ✅ Structs (Post, Comment, Project, etc.)
├── error.rs                               ✅ AppError enum (NotFound, BadRequest, etc.)
│
├── middleware/
│   └── mod.rs                             ✅ Session middleware (require_auth)
│
├── security/
│   ├── mod.rs                             ✅ Module exports
│   ├── argon2id.rs                        ✅ Hash/verify Argon2id
│   ├── session.rs                         ✅ Session tokens (HMAC-SHA256)
│   ├── csrf.rs                            ✅ CSRF tokens
│   ├── totp.rs                            ✅ 2FA TOTP
│   ├── pow.rs                             ✅ PoW verify_solution (SHA-256)
│   ├── ratelimit.rs                       ✅ Rate limiter (1 req/60s por IP)
│   └── headers.rs                         ✅ Security headers
│
├── handlers/
│   ├── mod.rs                             ✅ Module exports
│   ├── auth.rs                            ✅ Login/logout/change-password/2FA
│   ├── about.rs                           ✅ GET/PUT /api/about      ← PRONTO, NÃO USADO
│   ├── resume.rs                          ✅ GET /api/resume, PUT /api/resume/:section
│   │                                         ← PRONTO, NÃO USADO (educação, experiência, etc.)
│   ├── projects.rs                        ✅ CRUD /api/projects      ← PRONTO, NÃO USADO
│   ├── posts.rs                           ✅ CRUD /api/posts         ← USADO PARCIALMENTE
│   ├── comments.rs                        ✅ /api/posts/:slug/comments ← ✅ FUNCIONAL
│   ├── contact.rs                         ✅ /api/contact            ← ✅ FUNCIONAL
│   ├── pow.rs                             ✅ /api/pow/challenge      ← ✅ FUNCIONAL
│   └── migrate.rs                         ✅ /api/migrate/import     ← TAB MIGRAR
│
└── migrations/
    ├── 0001_init.sql                      ✅ Schema completo (10 tabelas)
    └── 0002_seed.sql                      ✅ Seed data (Dr. Melquizedequi)
```

---

## 4. STATUS DE CADA ARQUIVO — TABELA COMPLETA

### Legenda

| Ícone | Status | Significado |
|-------|--------|-------------|
| ✅ | **Funcional** | Usa backend corretamente |
| ⚠️ | **Parcial** | Usa backend em parte do fluxo |
| ❌ | **Migrar** | Ignora backend, só localStorage/hardcoded |
| ⚪ | **Neutro** | Sem dados persistentes (UI, utils, config) |

### 4.1 Frontend — Páginas públicas

| Arquivo | Status | Fonte de dados atual | Deveria ler de |
|---------|--------|---------------------|----------------|
| `src/pages/About.tsx` | ❌ **Migrar** | localStorage → hardcoded | `GET /api/about` + `GET /api/resume` |
| `src/pages/About-new.tsx` | ❌ **Migrar** | Só hardcoded | Remover ou refatorar |
| `src/pages/Blog.tsx` | ❌ **Migrar** | localStorage → hardcoded | `GET /api/posts` |
| `src/pages/BlogPost.tsx` | ⚠️ **Parcial** | localStorage → hardcoded → backend | `GET /api/posts/:slug` (primário) |
| `src/pages/Projects.tsx` | ❌ **Migrar** | use-managed-content → localStorage → hardcoded | `GET /api/projects` |
| `src/pages/Contact.tsx` | ✅ **Funcional** | API backend (PoW + POST /api/contact) | ✅ Já funcional |
| `src/pages/Index.tsx` | ⚪ **Neutro** | Sem dados dinâmicos | N/A |

### 4.2 Frontend — Painel Admin

| Arquivo | Status | Onde salva | Deveria salvar em |
|---------|--------|-----------|-------------------|
| `src/pages/Admin.tsx` (tab PERFIL) | ❌ **Migrar** | `localStorage` (`admin-about-data`) | `PUT /api/about` |
| `src/pages/Admin.tsx` (tab EDUCAÇÃO) | ❌ **Migrar** | `localStorage` (`admin-education-data`) | `PUT /api/resume/education` |
| `src/pages/Admin.tsx` (tab EXPERIÊNCIA) | ❌ **Migrar** | `localStorage` (`admin-experience-data`) | `PUT /api/resume/experience` |
| `src/pages/Admin.tsx` (tab PUBLICAÇÕES) | ❌ **Migrar** | `localStorage` (`admin-publications-data`) | `PUT /api/resume/publications` |
| `src/pages/Admin.tsx` (tab HABILIDADES) | ❌ **Migrar** | `localStorage` (`admin-skills-data`) | `PUT /api/resume/skills` |
| `src/pages/Admin.tsx` (tab PROJETOS) | ❌ **Migrar** | `localStorage` (`admin-projects-data`) | CRUD `/api/projects` |
| `src/pages/Admin.tsx` (tab BLOG) | ❌ **Migrar** | `localStorage` (`blog-posts`) | CRUD `/api/posts` |
| `src/pages/Admin.tsx` (tab BACKEND) | ✅ **Funcional** | API backend (`/posts/*`, `/comments/*`, etc.) | ✅ Já funcional |
| `src/components/AdminBackendPanel.tsx` | ✅ **Funcional** | API backend completa | ✅ Já funcional |

### 4.3 Frontend — Hooks e Libs

| Arquivo | Status | Observação |
|---------|--------|------------|
| `src/lib/api.ts` | ✅ **Funcional** | Cliente HTTP, usado por AdminBackendPanel, Contact, BlogPost |
| `src/lib/pow.ts` | ✅ **Funcional** | PoW com fallback jsSha256 |
| `src/hooks/use-managed-content.ts` | ❌ **Migrar** | Só sabe ler localStorage/hardcoded — precisa incluir backend |
| `src/main.tsx` | ❌ **Migrar** | `addExampleBlogPosts()` semeia dados no localStorage — precisa migrar para backend |

### 4.4 Backend — Handlers

| Arquivo | Status | Observação |
|---------|--------|------------|
| `backend/src/handlers/about.rs` | ✅ **Pronto, não usado** | GET/PUT /api/about — dados do Dr. Melquizedequi |
| `backend/src/handlers/resume.rs` | ✅ **Pronto, não usado** | GET /api/resume, PUT /api/resume/:section |
| `backend/src/handlers/projects.rs` | ✅ **Pronto, não usado** | CRUD /api/projects |
| `backend/src/handlers/posts.rs` | ✅ **Pronto, usado parcialmente** | CRUD /api/posts — só AdminBackendPanel usa |
| `backend/src/handlers/comments.rs` | ✅ **Funcional** | Com auto-create de post stub |
| `backend/src/handlers/contact.rs` | ✅ **Funcional** | Com PoW |
| `backend/src/handlers/migrate.rs` | ✅ **Pronto** | /api/migrate/import (painel MIGRAR) |
| `backend/src/handlers/auth.rs` | ✅ **Funcional** | Login, 2FA, change-password |
| `backend/src/handlers/pow.rs` | ✅ **Funcional** | Challenge PoW |

### 4.5 Backend — Infra

| Arquivo | Status | Observação |
|---------|--------|------------|
| `backend/migrations/0001_init.sql` | ✅ **Completo** | Schema: admin_user, sessions, about, resume, projects, posts, comments, contact_messages, pow_challenges, audit_log |
| `backend/migrations/0002_seed.sql` | ✅ **Completo** | Seed: admin admin123, Dr. Melquizedequi |
| `backend/src/main.rs` | ✅ **Funcional** | Router, CORS, rate limiter |
| `backend/src/config.rs` | ✅ **Funcional** | Config vars |
| `backend/src/models.rs` | ✅ **Funcional** | Structs |
| `backend/src/error.rs` | ✅ **Funcional** | Error handling |
| `backend/src/middleware/mod.rs` | ✅ **Funcional** | Session auth middleware |
| `backend/src/security/*` | ✅ **Funcional** | Argon2id, TOTP, CSRF, rate limit, PoW, headers |

---

## 5. MAPA DE FLUXO DE DADOS — ESTADO ATUAL

```
                    ┌─────────────────────────────────────┐
                    │         ADMIN PANEL (Admin.tsx)      │
                    │                                     │
                    │  PERFIL ──────→ localStorage  ❌     │
                    │  EDUCAÇÃO ────→ localStorage  ❌     │
                    │  EXPERIÊNCIA ─→ localStorage  ❌     │
                    │  PUBLICAÇÕES ─→ localStorage  ❌     │
                    │  HABILIDADES ─→ localStorage  ❌     │
                    │  PROJETOS ────→ localStorage  ❌     │
                    │  BLOG ────────→ localStorage  ❌     │
                    │  BACKEND ─────→ API backend    ✅     │
                    └─────────────────────────────────────┘
                                      │
          ┌───────────────────────────┼───────────────────────────┐
          │                           │                           │
          ▼                           ▼                           ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│  ABOUT PAGE       │    │  BLOG PAGE       │    │  PROJECTS PAGE   │
│  localStorage ❌  │    │  localStorage ❌ │    │  localStorage ❌ │
│  → hardcoded      │    │  → hardcoded     │    │  → hardcoded     │
│  BACKEND: NUNCA   │    │  BACKEND: NUNCA  │    │  BACKEND: NUNCA  │
└──────────────────┘    └──────────────────┘    └──────────────────┘

┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│  BLOGPOST PAGE    │    │  CONTACT PAGE    │    │  COMENTÁRIOS     │
│  localStorage ⚠️ │    │  API backend ✅  │    │  API backend ✅  │
│  → hardcoded      │    │  (PoW + POST)    │    │  (PoW + POST)    │
│  → backend (3º)   │    └──────────────────┘    └──────────────────┘
│  Comentários: ✅  │
└──────────────────┘
```

---

## 6. PLANO DE MIGRAÇÃO — FASES

### FASE 1: Admin.tsx salvar no backend (em vez de localStorage)

**Objetivo:** Unificar o Admin.tsx para que todas as tabs usem a API do backend.

| Passo | Tab | Ação | Backend endpoint |
|-------|-----|------|-----------------|
| 1.1 | PERFIL`onProfileSubmit()` | Chamar `PUT /api/about` | `backend/src/handlers/about.rs` |
| 1.2 | EDUCAÇÃO`onEducationSubmit()` | Chamar `PUT /api/resume/education` | `backend/src/handlers/resume.rs` |
| 1.3 | EXPERIÊNCIA`onExperienceSubmit()` | Chamar `PUT /api/resume/experience` | `backend/src/handlers/resume.rs` |
| 1.4 | PUBLICAÇÕES`onPublicationsSubmit()` | Chamar `PUT /api/resume/publications` | `backend/src/handlers/resume.rs` |
| 1.5 | HABILIDADES`onSkillsSubmit()` | Chamar `PUT /api/resume/skills` | `backend/src/handlers/resume.rs` |
| 1.6 | PROJETOS | CRUD via `GET/POST/PUT/DELETE /api/projects` | `backend/src/handlers/projects.rs` |
| 1.7 | BLOG | CRUD via `GET/POST/PUT/DELETE /api/posts` | `backend/src/handlers/posts.rs` |

**Detalhamento:**
- **1.1–1.5**: Substituir `saveData('admin-xxx-data', data)` por `api('/about', { method: 'PUT', json: data })` e similares.
  - Campos do `PUT /api/about`: `{ name, title, bio, email, location, lattes, profileImage, researchFocus }`
  - Campos do `PUT /api/resume/:section`: JSON com os dados da seção (educação, experiência, publicações, skills)
- **1.6**: Substituir `saveData('admin-projects-data', ...)` por CRUD via `api('/projects', ...)`.
  - Listar: `api<Project[]>('/projects')`
  - Criar: `api('/projects', { method: 'POST', json: project })`
  - Editar: `api(\`/projects/\${id}\`, { method: 'PUT', json: project })`
  - Excluir: `api(\`/projects/\${id}\`, { method: 'DELETE', json: {} })`
- **1.7**: Substituir `saveData('blog-posts', ...)` por CRUD via `api('/posts', ...)`.
  - Listar: `api<Post[]>('/posts')` (só retorna published — para drafts, usar endpoint admin)
  - Criar: `api('/posts', { method: 'POST', json: post })`
  - Editar: `api(\`/posts/by-id/\${id}\`, { method: 'PUT', json: post })`
  - Excluir: `api(\`/posts/by-id/\${id}\`, { method: 'DELETE', json: {} })`

**Considerações da Fase 1:**
- Manter `saveData()` como fallback caso backend offline
- Adicionar loading states e tratamento de erro
- Usar toast para feedback ao usuário
- O endpoint `GET /posts` do backend só retorna `published` — para listar drafts no admin, pode ser necessário criar um endpoint admin

---

### FASE 2: Páginas públicas lerem do backend

**Objetivo:** Fazer About, Blog, Projects lerem do backend como fonte primária.

| Passo | Página | Ação | Backend endpoint |
|-------|--------|------|-----------------|
| 2.1 | About.tsx | Carregar perfil + currículo do backend | `GET /api/about` + `GET /api/resume` |
| 2.2 | Projects.tsx | Carregar projetos do backend | `GET /api/projects` |
| 2.3 | Blog.tsx | Listar posts do backend | `GET /api/posts` |
| 2.4 | BlogPost.tsx | Priorizar backend sobre localStorage | `GET /api/posts/:slug` (primário) |

**Detalhamento:**
- **2.1**: Substituir `loadData('admin-about-data', defaultAboutData)` por `api('/about')` + `api('/resume')`.
  - Manter localStorage como fallback (cache local se backend offline)
  - `GET /api/resume` retorna todas as seções (education, experience, publications, skills)
- **2.2**: Substituir `getProjectsContent()` por `api('/projects')`.
  - O backend retorna `tags` como array de strings — adaptar Projects.tsx que espera `project.tags` como array
  - Backend também retorna `description`, `image`, `github`, `live`, `stars`, `forks`
- **2.3**: Substituir `localStorage.getItem('blog-posts')` por `api<Post[]>('/posts')`.
  - `GET /api/posts` só retorna posts com `status = 'published'`
  - O formato retornado pelo backend inclui: `id`, `title`, `slug`, `excerpt`, `content`, `image`, `status`, `publishedAt`, `createdAt`, `updatedAt`
- **2.4**: Mudar ordem de precedência: backend → localStorage → hardcoded.
  - Atualmente é: localStorage → hardcoded → backend
  - Novo: backend → localStorage (cache) → hardcoded (fallback)

**Considerações da Fase 2:**
- Adicionar loading skeleton UI
- Cache local: salvar resposta do backend no localStorage para exibição offline
- Compatibilidade retroativa: se dados do backend estiverem vazios, usar localStorage/hardcoded

---

### FASE 3: Migração de Dados Existente

**Objetivo:** Mover dados que já estão no localStorage para o backend.

| Passo | Ação | Ferramenta |
|-------|------|-----------|
| 3.1 | Migrar perfil (`admin-about-data`) | Painel MIGRAR (já existe!) |
| 3.2 | Migrar educação (`admin-education-data`) | Painel MIGRAR |
| 3.3 | Migrar experiência (`admin-experience-data`) | Painel MIGRAR |
| 3.4 | Migrar publicações (`admin-publications-data`) | Painel MIGRAR |
| 3.5 | Migrar habilidades (`admin-skills-data`) | Painel MIGRAR |
| 3.6 | Migrar projetos (`admin-projects-data`) | Painel MIGRAR |
| 3.7 | Migrar posts (`blog-posts`) | Painel MIGRAR |

**Detalhamento:**
- O painel MIGRAR (`AdminBackendPanel.tsx` → `MigratePanel`) já existe e envia snapshot para `POST /api/migrate/import`
- Verificar se o handler `migrate.rs` aceita todos os formatos de dados do localStorage
- Executar migração UMA VEZ, depois esconder o painel

---

### FASE 4: Limpeza e Refatoração

**Objetivo:** Remover código legado e fontes de dados duplicadas.

| Passo | Ação | Arquivo |
|-------|------|---------|
| 4.1 | Remover `addExampleBlogPosts()` | `src/main.tsx` |
| 4.2 | Remover exemplo de posts no `useEffect()` | `src/App.tsx` |
| 4.3 | Remover `FALLBACK_POSTS` | `src/pages/Blog.tsx`, `src/pages/BlogPost.tsx` |
| 4.4 | Remover `defaultAboutData`, `defaultEducationData`, etc. (ou reduzir) | `src/pages/Admin.tsx`, `src/pages/About.tsx` |
| 4.5 | Refatorar/remover `use-managed-content.ts` | `src/hooks/use-managed-content.ts` |
| 4.6 | Remover `About-new.tsx` (página alternativa não usada) | `src/pages/About-new.tsx` |
| 4.7 | Adaptar Admin.tsx para carregar dados do backend no `useEffect()` | `src/pages/Admin.tsx` |
| 4.8 | Sincronizar seed data (Dr. Melquizedequi vs Claudio Henrique) | `backend/migrations/0002_seed.sql` |

---

## 7. CRONOGRAMA ESTIMADO

```  
Fase 1 — Admin.tsx salvar no backend       │  ████████░░░░  4h
Fase 2 — Páginas lerem do backend          │  ████████░░░░  4h
Fase 3 — Migração de dados existentes      │  ██░░░░░░░░░░  1h
Fase 4 — Limpeza e refatoração             │  ████░░░░░░░░  2h
                                            │
Total estimado: ~11h                        │
```

---

## 8. RISCOS E CONSIDERAÇÕES

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Backend offline durante salvamento | Perda de dados | Manter localStorage como fallback |
| Formato de dados diferente entre frontend e backend | Erros de parse | Validar payload antes de enviar |
| Seed data divergente (Dr. Melquizedequi vs Claudio) | Conteúdo inconsistente | Alinhar seed data com dados reais do usuário |
| Quebra de compatibilidade com dados existentes | Usuário perde dados não migrados | Manter localStorage legado por 1 versão |
| Endpoint `GET /posts` não lista drafts | Admin não vê rascunhos | Criar endpoint admin `/admin/posts` ou usar query param |

---

## 9. PREPARAÇÃO PARA INICIAR A MIGRAÇÃO

### Check-list antes de começar a codificar:

- [ ] ✅ **Backend compilado e rodando** (`cargo build --release`)
- [ ] ✅ **Endpoints testados** (about, resume, projects, posts — todos 200)
- [ ] ✅ **Proxy configurado** (server.py na porta 8000)
- [ ] ✅ **Documentação gerada** (CONTEXT_DATA_PERSISTENCE.md + FILES.md)
- [ ] ❌ **Seed data alinhado** (definir qual perfil usar: Claudio Henrique)
- [ ] ❌ **Backup do localStorage** (opcional — os dados estão no navegador do admin)
- [ ] ❌ **Decidir: remover ou manter tab BLOG legada?** (tab BLOG do Admin.tsx vs tab BACKEND → Posts)

### Para começar a Fase 1.1 (PERFIL → backend):

Arquivos a editar:
1. `src/pages/Admin.tsx` — modificar `onProfileSubmit()`
2. `src/lib/api.ts` — já tem tudo que precisa
3. `backend/src/handlers/about.rs` — verificar se campos correspondem ao formulário

Payload do `PUT /api/about`:
```json
{
  "name": "Claudio Henrique Marques de Oliveira",
  "title": "Militar - Marinha do Brasil | ...",
  "bio": "Profissional com 19 anos de experiência...",
  "email": "unixsolution@gmail.com",
  "location": "Brasília, DF, Brasil",
  "lattes": "https://lattes.cnpq.br/2915812289846388",
  "profileImage": "https://avatars.githubusercontent.com/u/583231",
  "researchFocus": ["Defesa Cibernética", "IA", "ML"],
  "languages": [
    { "language": "Português", "level": "Nativo", "proficiency": "Leitura, Fala, Escrita, Compreensão" }
  ]
}
```

---

*Este documento serve como guia técnico e de planejamento para a migração completa*
*da persistência de dados de localStorage para o backend SQLite.*
*overcyber-reloaded-neon — 2025*
