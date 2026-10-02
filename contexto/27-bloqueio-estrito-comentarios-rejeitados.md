# 27. Bloqueio Estrito de Comentários Rejeitados na Exibição Pública

## 1. Problema Relatado
- O usuário reportou que comentários com status **rejeitado** (`status = 'rejected'`) estavam aparecendo no site (`/blog/...`).

## 2. Causa Raiz Identificada
1. No gateway FastAPI (`fastapi_service/main.py`), a rota `GET /api/posts/{slug}/comments` continha a seguinte lógica:
   ```python
   if not token and not status:
       status = "approved"
   ```
2. Quando o administrador estava autenticado no navegador (com o cookie de sessão `sid` ativo), o token era identificado como válido (`token` não era nulo).
3. Consequentemente, a condição `if not token` avaliava como falsa, deixando `status = None`.
4. No banco de dados (`fastapi_service/db.py`), a consulta executava `SELECT ... FROM comments WHERE post_id = ?` sem nenhum filtro de status quando `status = None`.
5. Isso retornava **todos** os comentários associados àquele post, inclusive os marcados como `rejected`, `spam` e `pending`, exibindo-os na página do artigo quando o administrador navegava pelo blog.

## 3. Solução Implementada

### 3.1. Backend (`fastapi_service/main.py` e `fastapi_service/db.py`)
- Em `fastapi_service/main.py`:
  - `GET /api/posts/{slug}/comments` foi alterado para forçar estritamente `status = "approved"` por padrão, independentemente de haver ou não sessão de admin:
    ```python
    @app.get("/api/posts/{slug_or_id}/comments")
    def get_post_comments(
        slug_or_id: str,
        status: Optional[str] = Query("approved"),
        token: Optional[str] = Depends(optional_verify_token)
    ):
        if not token or not status:
            status = "approved"
        return db.get_post_comments(slug_or_id, status)
    ```
- Em `fastapi_service/db.py`:
  - A função `get_post_comments` foi atualizada para que, caso receba `None` ou vazio, aplique automaticamente o filtro `AND c.status = 'approved'`.

### 3.2. Frontend (`src/pages/BlogPost.tsx`)
- Implementada defesa em profundidade (*defense-in-depth*):
  - Chamada explícita com parâmetro `?status=approved`:
    `await api<CommentRow[]>('/posts/${slug}/comments?status=approved')`
  - Filtro em memória no cliente antes de renderizar no estado do componente:
    `const approvedOnly = (Array.isArray(cs) ? cs : []).filter((c) => c.status === "approved")`

## 4. Testes e Validação
- Validado via `python3 -m py_compile` em todos os módulos Python.
- Testado contra o post que possuía comentário rejeitado (`TESTE LIXO`), confirmando que agora retorna apenas o comentário aprovado (`Ghost_Operative`).
