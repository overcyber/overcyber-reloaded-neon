# Documentação de Correção: Exclusão e Edição de Posts do Blog pelo Admin

**Data:** 02/10/2026  
**Status:** Implementado, validado e documentado  
**Escopo:** `fastapi_service/main.py`, `fastapi_service/db.py`, `src/pages/Admin.tsx`, `src/components/AdminBackendPanel.tsx`

---

## 1. Problema Relatado
O usuário relatou que ao tentar apagar postagens do blog através da interface administrativa, as postagens não estavam sendo excluídas e reapareciam após atualização:
> *"estou apagando postagem do blog pela interface mas não estão sendo apagados"*

---

## 2. Diagnóstico & Causa Raiz
1. **Divergência de Rotas entre Frontend e Backend:**
   - O frontend React (`src/pages/Admin.tsx` linha 1120 e `src/components/AdminBackendPanel.tsx` linha 394) executava chamadas HTTP para rotas legadas do padrão Rust:
     - `DELETE /api/posts/by-id/${id}`
     - `PUT /api/posts/by-id/${id}`
   - No entanto, o `fastapi_service/main.py` tinha declarado apenas:
     - `@app.delete("/api/posts/{post_id}")`
     - `@app.put("/api/posts/{post_id}")`
   - O servidor FastAPI retornava **HTTP 404 Not Found** para qualquer requisição enviada para `/api/posts/by-id/{id}`.
   - O log do `journalctl` na VPS Oracle confirmava a ocorrência:
     ```log
     "DELETE /api/posts/by-id/86315e8e-5557-4065-abd9-62f414eba256 HTTP/1.1" 404 Not Found
     ```

2. **Comportamento Falho no Frontend (Offline Fallback Enganoso):**
   - No `Admin.tsx`, ao receber o erro 404 do backend, o bloco `catch` interceptava a exceção, removia o post do estado React em memória e do `localStorage`, exibindo uma notificação de "Post excluído (offline)".
   - Quando o painel recarregava os dados do backend (`loadAll()`), o backend retornava os posts ainda gravados no banco SQLite, fazendo o post reaparecer para o usuário.

3. **Exclusão em Cascata e Resolução de Identificadores:**
   - A função `delete_post(post_id)` em `fastapi_service/db.py` executava `DELETE FROM posts WHERE id = ?`. Caso o identificador fosse o slug ou caso houvesse comentários atrelados na tabela `comments`, a exclusão poderia falhar ou deixar comentários órfãos.

---

## 3. Alterações Implementadas

### A. Backend FastAPI (`fastapi_service/main.py`)
- Adicionadas rotas de compatibilidade com múltiplos decoradores:
  - `@app.get("/api/posts/by-id/{post_id}")` e `@app.get("/api/posts/{slug_or_id}")`
  - `@app.put("/api/posts/{post_id}")` e `@app.put("/api/posts/by-id/{post_id}")`
  - `@app.delete("/api/posts/{post_id}")` e `@app.delete("/api/posts/by-id/{post_id}")`
- Aplicada a mesma proteção preventiva para projetos:
  - `@app.get("/api/projects/{project_id}")` e `@app.get("/api/projects/by-id/{project_id}")`
  - `@app.put("/api/projects/{project_id}")` e `@app.put("/api/projects/by-id/{project_id}")`
  - `@app.delete("/api/projects/{project_id}")` e `@app.delete("/api/projects/by-id/{project_id}")`

### B. Camada de Dados SQLite (`fastapi_service/db.py`)
- **`delete_post(post_id: str) -> bool`**:
  - Resolve o post alvo chamando `get_post(post_id)` (busca por UUID ou slug).
  - Limpa comentários vinculados na tabela `comments` (`WHERE post_id = ?`).
  - Executa `DELETE FROM posts WHERE id = ?`.
  - Retorna `True` se o registro foi removido com sucesso.
- **`update_post(post_id: str, ...)`**:
  - Obtém o post existente e garante que a query `UPDATE` use o `real_id` primário da tabela.

### C. Frontend React (`src/pages/Admin.tsx` e `src/components/AdminBackendPanel.tsx`)
- **`deleteBlogPost` (`Admin.tsx`)**:
  - Tenta `DELETE /posts/by-id/${id}` com fallback transparente para `DELETE /posts/${id}`.
  - Atualiza o estado local e dispara recarregamento imediato do backend (`/posts`) para garantir sincronia do banco de dados.
  - Em caso de falha, exibe toast de erro `destructive` com a mensagem real da falha ao invés de mascarar como "offline".
- **`onBlogPostSubmit` (`Admin.tsx`)**:
  - Tenta `PUT /posts/by-id/${id}` com fallback para `PUT /posts/${id}`.
- **`deleteProject` (`Admin.tsx`)**:
  - Suporta fallback e tratamento de erro rigoroso.
- **`AdminBackendPanel.tsx`**:
  - Salvar post e excluir post atualizados com suporte a `/posts/by-id/${id}` e `/posts/${id}`.

---

## 4. Validação Rigorosa
1. **Sintaxe Python (`py_compile`):**
   ```bash
   python3 -m py_compile fastapi_service/*.py
   # Retorno: Código 0 (sem erros de sintaxe ou indentação)
   ```
2. **Build do Frontend (`npm run build`):**
   ```bash
   npm run build
   # Retorno: ✓ built in 8.91s
   ```
3. **Deploy e Teste de Exclusão em Produção:**
   - Commit & push para o repositório Git (`1e69782`).
   - Sincronização e reinício do serviço `overcyber-fastapi.service` na VPS Oracle (PID 1988941 ativo).
   - **Teste Real 1 - Exclusão de post pelo ID legado (`/api/posts/by-id/{id}`):**
     ```bash
     curl -s -X DELETE -H "Authorization: Bearer ovc_c5r_..." \
       "https://overcyber.online/api/posts/by-id/86315e8e-5557-4065-abd9-62f414eba256"
     ```
     **Resultado:** `{"ok":true,"deleted":"86315e8e-5557-4065-abd9-62f414eba256"}` (Status 200 OK).
     **Verificação no SQLite da VPS:** Post `86315e8e-5557-4065-abd9-62f414eba256` foi 100% removido da tabela `posts`.
   - **Teste Real 2 - Ciclo completo (criação, edição e exclusão via `/by-id/`):**
     1. Post temporário criado via `POST /api/posts` -> Retornou ID `5ec93f14-5940-4095-b8ec-1cc160c5d372`.
     2. Post atualizado via `PUT /api/posts/by-id/5ec93f14-5940-4095-b8ec-1cc160c5d372` -> Título alterado com sucesso (Status 200 OK).
     3. Post excluído via `DELETE /api/posts/by-id/5ec93f14-5940-4095-b8ec-1cc160c5d372` -> `{"ok":true,"deleted":"5ec93f14-5940-4095-b8ec-1cc160c5d372"}` (Status 200 OK).
     4. Consulta pública via `GET /api/posts/5ec93f14-5940-4095-b8ec-1cc160c5d372` -> Retornou `HTTP 404 {"detail":"Post não encontrado"}`.

