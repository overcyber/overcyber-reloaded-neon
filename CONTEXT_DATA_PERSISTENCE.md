# CONTEXTO DE PERSISTÊNCIA DE DADOS

> **Propósito:** Documentar a arquitetura atual de armazenamento de dados do site,
> identificando onde cada tipo de dado é salvo e lido, e o gap entre os dados
> gerenciados no frontend (localStorage / hardcoded) vs. o backend SQLite.

---

## 1. VISÃO GERAL DA ARQUITETURA

O sistema possui **duas camadas de armazenamento independentes** que deveriam
estar sincronizadas:

### 1.1 Backend Rust (SQLite — `data/overcyber.db`)

Backend self-hostado em Rust com Axum. Banco SQLite com as seguintes tabelas:

| Tabela | Conteúdo | Endpoint API |
|--------|----------|-------------|
| `admin_user` | Admin único (id=1) | `/api/auth/*` |
| `sessions` | Sessões de login | `/api/auth/*` |
| `about` | Perfil (JSON blob, id=1) | `GET/PUT /api/about` |
| `resume` | Educação, Experiência, Publicações, Skills (4 linhas, JSON blob) | `GET /api/resume`, `PUT /api/resume/:section` |
| `projects` | Projetos (CRUD completo) | `GET/POST /api/projects`, `PUT/DELETE /api/projects/:id` |
| `posts` | Posts do blog (CRUD completo, status draft/published) | `GET /api/posts`, `GET /api/posts/:slug`, `POST /api/posts`, `PUT/DELETE /api/posts/by-id/:id` |
| `comments` | Comentários (pending/approved/rejected/spam) | `GET/POST /api/posts/:slug/comments`, admin endpoints |
| `contact_messages` | Mensagens de contato | `POST /api/contact`, admin endpoints |
| `pow_challenges` | Desafios Proof-of-Work (anti-spam) | `GET /api/pow/challenge` |
| `audit_log` | Log de ações administrativas | (admin interno) |

### 1.2 Frontend React (localStorage + código hardcoded)

O frontend React em `src/` usa **três fontes de dados** em ordem de precedência:

1. **localStorage** — dados salvos pelo painel Admin (tabs PERFIL, EDUCAÇÃO, etc.)
2. **Fallback hardcoded** — valores padrão definidos diretamente no código-fonte
3. **Backend API** — usado SOMENTE como fallback terciário (exceto comentários/contato)

---

## 2. MAPEAMENTO DETALHADO POR TIPO DE DADO

### 2.1 PERFIL (About page — nome, bio, email, etc.)

| Aspecto | Detalhe |
|---------|---------|
| **Admin salva em** | `localStorage` chave `admin-about-data` (Admin.tsx → `onProfileSubmit()`) |
| **Página lê de** | `localStorage` chave `admin-about-data` → fallback hardcoded (`defaultAboutData` em About.tsx) |
| **Backend disponível?** | ✅ `GET /api/about` + `PUT /api/about` (tabela `about`, JSON blob) |
| **Backend é usado?** | ❌ **NUNCA** — Admin.tsx ignora completamente os endpoints do backend para perfil |
| **Seed no backend** | Dados do Dr. Melquizedequi Cabral dos Santos (migration 0002_seed.sql) |
| **Dados divergentes** | O seed do backend tem dados do Dr. Melquizedequi; o About.tsx tem dados do Claudio Henrique |

**Impacto:** Alterar o perfil no Admin → salva no navegador local. Em outro navegador/dispositivo, os dados antigos aparecem. Se o localStorage for limpo, volta para o fallback hardcoded.

---

### 2.2 EDUCAÇÃO (About page)

| Aspecto | Detalhe |
|---------|---------|
| **Admin salva em** | `localStorage` chave `admin-education-data` |
| **Página lê de** | `localStorage` → fallback hardcoded (`defaultEducationData`) |
| **Backend disponível?** | ✅ `PUT /api/resume/education` + `GET /api/resume` (tabela `resume`, seção `education`) |
| **Backend é usado?** | ❌ **NUNCA** |

---

### 2.3 EXPERIÊNCIA (About page)

| Aspecto | Detalhe |
|---------|---------|
| **Admin salva em** | `localStorage` chave `admin-experience-data` |
| **Página lê de** | `localStorage` → fallback hardcoded |
| **Backend disponível?** | ✅ `PUT /api/resume/experience` + `GET /api/resume` |
| **Backend é usado?** | ❌ **NUNCA** |

---

### 2.4 PUBLICAÇÕES (About page)

| Aspecto | Detalhe |
|---------|---------|
| **Admin salva em** | `localStorage` chave `admin-publications-data` |
| **Página lê de** | `localStorage` → fallback hardcoded |
| **Backend disponível?** | ✅ `PUT /api/resume/publications` + `GET /api/resume` |
| **Backend é usado?** | ❌ **NUNCA** |

---

### 2.5 HABILIDADES / SKILLS (About page)

| Aspecto | Detalhe |
|---------|---------|
| **Admin salva em** | `localStorage` chave `admin-skills-data` |
| **Página lê de** | `localStorage` → fallback hardcoded |
| **Backend disponível?** | ✅ `PUT /api/resume/skills` + `GET /api/resume` |
| **Backend é usado?** | ❌ **NUNCA** |

---

### 2.6 PROJETOS (Projects page)

| Aspecto | Detalhe |
|---------|---------|
| **Admin salva em** | `localStorage` chave `admin-projects-data` |
| **Página lê de** | `use-managed-content.ts` → `localStorage` → hardcoded fallback |
| **Backend disponível?** | ✅ CRUD completo: `GET /api/projects`, `POST /api/projects`, `PUT/DELETE /api/projects/:id` |
| **Backend é usado?** | ❌ **NUNCA** — Projects.tsx usa `getProjectsContent()` que só lê localStorage |
| **Nota** | O backend tem tabela `projects` com colunas: id, title, description, tags, image, github, live, stars, forks, readme, ord |

---

### 2.7 BLOG POSTS (Blog + BlogPost pages)

| Aspecto | Detalhe |
|---------|---------|
| **Admin salva em (tab BLOG)** | `localStorage` chave `blog-posts` (Admin.tsx → `onBlogPostSubmit()`) |
| **Admin salva em (tab BACKEND)** | ✅ Backend via `POST/PUT /api/posts` (AdminBackendPanel.tsx → PostsPanel) |
| **Blog.tsx lê de** | `localStorage` → hardcoded fallback (`FALLBACK_POSTS`) |
| **BlogPost.tsx lê de** | `localStorage` → hardcoded fallback → backend `GET /api/posts/:slug` (terciário) |
| **Backend disponível?** | ✅ CRUD completo: `GET /api/posts`, `GET /api/posts/:slug`, `POST /api/posts`, `PUT/DELETE /api/posts/by-id/:id` |
| **Backend é usado?** | ⚠️ **PARCIALMENTE** — A tab BACKEND do Admin usa. A página pública do blog usa como fallback TERCIÁRIO. |
| **Problema** | A tab BLOG do Admin (a principal) salva em localStorage. A tab BACKEND salva no backend. São sistemas paralelos e não sincronizados. |

---

### 2.8 COMENTÁRIOS

| Aspecto | Detalhe |
|---------|---------|
| **Admin modera em** | Backend via AdminBackendPanel (CommentsPanel) — ✅ |
| **Página pública lê de** | Backend via `GET /api/posts/:slug/comments` |
| **Formulário envia para** | Backend via `POST /api/posts/:slug/comments` (com PoW) |
| **Backend é usado?** | ✅ **SIM** — Único fluxo completamente funcional com backend |

---

### 2.9 CONTATO

| Aspecto | Detalhe |
|---------|---------|
| **Formulário envia para** | Backend via `POST /api/contact` (com PoW) |
| **Admin lê de** | Backend via AdminBackendPanel (InboxPanel) |
| **Backend é usado?** | ✅ **SIM** |

---

## 3. O GAP: O QUE PRECISA MUDAR

### 3.1 Dados que estão APENAS no localStorage mas DEVERIAM estar no backend:

```
┌─────────────────────────────────────────────────────────────────────┐
│  DADO                  │  localStorage │  Backend SQLite            │
├─────────────────────────────────────────────────────────────────────┤
│  Perfil (About)        │  ✅ salvo     │  ❌ ignorado               │
│  Educação              │  ✅ salvo     │  ❌ ignorado               │
│  Experiência           │  ✅ salvo     │  ❌ ignorado               │
│  Publicações           │  ✅ salvo     │  ❌ ignorado               │
│  Skills                │  ✅ salvo     │  ❌ ignorado               │
│  Projetos              │  ✅ salvo     │  ❌ ignorado               │
│  Blog posts            │  ✅ salvo     │  ⚠️ usado só na tab BACKEND│
│  Comentários           │  ❌           │  ✅ funcional              │
│  Contato               │  ❌           │  ✅ funcional              │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 Causas raiz

1. **Admin.tsx legacy** — As tabs PERFIL, EDUCAÇÃO, EXPERIÊNCIA, PUBLICAÇÕES, HABILIDADES, PROJETOS e BLOG são gerenciadas por código React que só sabe ler/escrever localStorage. Elas **nunca** foram refatoradas para usar a API do backend.

2. **AdminBackendPanel.tsx (tab BACKEND)** — Foi adicionado posteriormente e já usa a API do backend corretamente para posts, comentários e inbox. Mas é um painel **separado** com dados não sincronizados com as outras tabs.

3. **Páginas públicas** — Blog.tsx, BlogPost.tsx, About.tsx, Projects.tsx foram construídas primeiro para ler de localStorage/hardcoded. O backend foi adicionado depois como fallback opcional, não como fonte primária.

4. **Seed data divergente** — O backend tem seed data (Dr. Melquizedequi), enquanto o frontend tem hardcoded data (Claudio Henrique). Isso cria inconsistência.

### 3.3 Impactos

| Problema | Consequência |
|----------|-------------|
| Dados só no navegador | Ao trocar de dispositivo, dados não acompanham |
| localStorage pode ser limpo | Cache do navegador, atualização, ou modo anônimo perdem dados |
| Dois painéis admin | Usuário precisa ir na tab BACKEND para posts salvos no backend, mas na tab BLOG para posts salvos localmente — confusão |
| Hardcoded fallbacks | Se localStorage for limpo, dados antigos do código-fonte reaparecem |
| Seed divergente | Backend seed contém dados diferentes do frontend hardcoded |

---

## 4. ARQUIVOS ENVOLVIDOS

| Arquivo | Papel | Status |
|---------|-------|--------|
| `src/pages/Admin.tsx` | Painel admin principal — tabs PERFIL a BLOG salvam em localStorage | ❌ Precisa migrar para backend |
| `src/components/AdminBackendPanel.tsx` | Tab BACKEND do admin — já usa API do backend | ✅ Funcional |
| `src/pages/About.tsx` | Página About — lê de localStorage → hardcoded | ❌ Precisa ler do backend |
| `src/pages/About-new.tsx` | Página About alternativa — só hardcoded | ❌ Não usa nenhuma fonte |
| `src/pages/Projects.tsx` | Página Projects — lê de `use-managed-content` → localStorage → hardcoded | ❌ Precisa ler do backend |
| `src/pages/Blog.tsx` | Listagem do blog — lê de localStorage → hardcoded | ❌ Precisa ler do backend |
| `src/pages/BlogPost.tsx` | Post individual — localStorage → hardcoded → backend (terciário) | ⚠️ Parcial |
| `src/hooks/use-managed-content.ts` | Hook para dados gerenciados — só localStorage/hardcoded | ❌ Precisa incluir backend |
| `src/lib/api.ts` | Cliente HTTP para o backend | ✅ Funcional |
| `src/main.tsx` | Inicializa blog posts de exemplo no localStorage | ❌ Semeia dados no localStorage |
| `backend/src/handlers/about.rs` | Handler about API | ✅ Pronto, não usado |
| `backend/src/handlers/resume.rs` | Handler resume API (educação, experiência, etc.) | ✅ Pronto, não usado |
| `backend/src/handlers/projects.rs` | Handler projects API | ✅ Pronto, não usado |
| `backend/src/handlers/posts.rs` | Handler posts API | ✅ Pronto, usado parcialmente |
| `backend/migrations/0001_init.sql` | Schema do banco (tabelas: about, resume, projects, posts, etc.) | ✅ Completo |
| `backend/migrations/0002_seed.sql` | Seed data inicial | ✅ Completo |

---

## 5. ROTEIRO DE MIGRAÇÃO (Para referência futura)

Para resolver o gap, é necessário:

### Fase 1 — Admin.tsx salvar no backend (em vez de localStorage)

1. **PERFIL tab**: `onProfileSubmit()` deve chamar `PUT /api/about` em vez de `saveData('admin-about-data', ...)`
2. **EDUCAÇÃO tab**: `onEducationSubmit()` deve chamar `PUT /api/resume/education`
3. **EXPERIÊNCIA tab**: `onExperienceSubmit()` deve chamar `PUT /api/resume/experience`
4. **PUBLICAÇÕES tab**: `onPublicationsSubmit()` deve chamar `PUT /api/resume/publications`
5. **HABILIDADES tab**: `onSkillsSubmit()` deve chamar `PUT /api/resume/skills`
6. **PROJETOS tab**: CRUD deve usar `GET/POST/PUT/DELETE /api/projects`
7. **BLOG tab**: CRUD deve usar `GET/POST/PUT/DELETE /api/posts`

### Fase 2 — Páginas públicas lerem do backend

1. **About.tsx**: Carregar dados de `GET /api/about` + `GET /api/resume`
2. **Projects.tsx**: Carregar dados de `GET /api/projects`
3. **Blog.tsx + BlogPost.tsx**: Carregar posts de `GET /api/posts` e `GET /api/posts/:slug`

### Fase 3 — Limpeza

1. Remover `addExampleBlogPosts()` de `src/main.tsx`
2. Remover fallbacks hardcoded das páginas públicas
3. Remover `use-managed-content.ts` (ou adaptar para usar backend)
4. Manter localStorage apenas como **cache local** (fallback se backend offline)

---

## 6. TESTES DE VALIDAÇÃO (executados em 2025-05-18)

| Teste | Resultado |
|-------|-----------|
| Backend health (`/healthz`) | ✅ 200 OK |
| `GET /api/about` (backend) | ✅ Retorna dados do Dr. Melquizedequi |
| `GET /api/resume` (backend) | ✅ Retorna estrutura vazia para todas as seções |
| `GET /api/projects` (backend) | ✅ Retorna lista vazia (backend ready) |
| `GET /api/posts` (backend) | ✅ Retorna posts publicados |
| Proxy (8000) → backend API | ✅ Forwarding funciona |
| AdminBackendPanel (BACKEND tab) | ✅ Posts, comentários, inbox funcionam via backend |
| Comment submission + PoW | ✅ Fluxo completo funcional |
| Contact form + PoW | ✅ Fluxo completo funcional |

---

*Documento gerado para análise da arquitetura de persistência.*
*overcyber-reloaded-neon — 2025*
