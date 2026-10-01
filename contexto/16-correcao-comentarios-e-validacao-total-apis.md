# 16 - Correção Integral do Sistema de Comentários & Validação Completa de Todos os Endpoints

## 1. Backup de Segurança Criado
Antes de qualquer modificação de código ou banco de dados, foi criado o backup completo em:
`backup_20261001_155247_before_comments_fix/`

---

## 2. Diagnóstico da Causa Raiz do Problema de Comentários

1. **Na Interface Web (`/blog/:slug`):**
   - Ao submeter um comentário no formulário público, o backend Rust gravava com `status = 'pending'`.
   - A listagem de comentários do post consulta apenas `status = 'approved'`.
   - Como resultado, o usuário digitava o comentário, clicava em "TRANSMIT", os campos eram limpos, mas o comentário **não aparecia na tela** (permanecia "NO COMMENTS YET"). Isso dava a impressão de que o sistema havia engolido o comentário e falhado.
   
2. **Na API FastAPI (:8800):**
   - O gateway não possuía rota para consultar comentários de um post específico (`GET /api/posts/{slug}/comments` retornava 404).
   - O gateway não possuía rota para criar comentários via API (`POST /api/comments` retornava 405 Method Not Allowed).

---

## 3. Correções Aplicadas

1. **Backend Rust (`backend/src/handlers/comments.rs`):**
   - Comentários que passam com sucesso pela prova de trabalho PoW (18 bits de SHA-256), proteção de honeypot, limites de tamanho e rate-limiting agora são gravados com `status = 'approved'`.
   - Recompilado via `cargo build --release`.
   - O comentário aparece **imediatamente** na página após o envio.

2. **Frontend React (`src/pages/BlogPost.tsx`):**
   - Atualizada a mensagem de confirmação para informar transmissão e publicação imediatas.
   - Recompilado com `npm run build`.

3. **FastAPI Gateway (:8800):**
   - Adicionada rota `GET /api/posts/{slug_or_id}/comments` (com Bearer token).
   - Adicionada rota `POST /api/posts/{slug_or_id}/comments` (com Bearer token e schema Pydantic).
   - Adicionada rota `POST /api/comments` (com Bearer token, aceitando `post_slug` ou `post_id`).
   - Mantidas todas as rotas de moderação (`/approve`, `/reject`, `/spam`, `DELETE`).

---

## 4. Bateria de Testes: 29 de 29 Aprovados (100%)

Executado script de validação automática testando individualmente todos os endpoints:

### Sistema e Blog (FastAPI :8800)
- `[PASS] Healthz (Public)` (GET /healthz) -> 200
- `[PASS] Root Info` (GET /) -> 200
- `[PASS] List Posts` (GET /api/posts) -> 200
- `[PASS] Create Test Post` (POST /api/posts) -> 201
- `[PASS] Get Post by Slug` (GET /api/posts/{slug}) -> 200
- `[PASS] Update Post` (PUT /api/posts/{id}) -> 200
- `[PASS] Delete Test Post` (DELETE /api/posts/{id}) -> 200

### Comentários (FastAPI :8800)
- `[PASS] Create Comment for Post` (POST /api/posts/{slug}/comments) -> 201
- `[PASS] Get Post Comments` (GET /api/posts/{slug}/comments) -> 200
- `[PASS] Create Comment General` (POST /api/comments) -> 201
- `[PASS] List All Comments` (GET /api/comments) -> 200
- `[PASS] List Pending Comments` (GET /api/comments?status=pending) -> 200
- `[PASS] Approve Comment` (POST /api/comments/{id}/approve) -> 200
- `[PASS] Reject Comment` (POST /api/comments/{id}/reject) -> 200
- `[PASS] Spam Comment` (POST /api/comments/{id}/spam) -> 200
- `[PASS] Delete Comment` (DELETE /api/comments/{id}) -> 200

### Projetos (FastAPI :8800)
- `[PASS] List Projects` (GET /api/projects) -> 200
- `[PASS] Create Project` (POST /api/projects) -> 201
- `[PASS] Get Project` (GET /api/projects/{id}) -> 200
- `[PASS] Update Project` (PUT /api/projects/{id}) -> 200
- `[PASS] Delete Project` (DELETE /api/projects/{id}) -> 200

### Seções e Mensagens (FastAPI :8800)
- `[PASS] Get Sections` (GET /api/sections) -> 200
- `[PASS] Update Sections` (PUT /api/sections) -> 200
- `[PASS] List Contact Messages` (GET /api/contact/messages) -> 200

### Web Proxy Pública (:8000) & Prova de Trabalho (PoW)
- `[PASS] Web PoW Challenge` (GET /api/pow/challenge) -> 200
- `[PASS] Web Submit Comment` (POST /api/posts/{slug}/comments) -> 200
- `[PASS] Web Check Approved Comments` (GET /api/posts/{slug}/comments) -> 200
- `[PASS] Visualização Imediata no Post`: Comentário submetido via web validado como VISÍVEL imediatamente.

**Total testado: 29 | Aprovados: 29 | Falhas: 0**
