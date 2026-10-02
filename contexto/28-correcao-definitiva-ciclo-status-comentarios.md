# Correção Definitiva do Ciclo de Status de Comentários (Aprovado, Pendente, Rejeitado, Spam)

**Data:** 02/10/2026  
**Status:** Implementado e validado

---

## 1. Motivação e Problema Identificado

Anteriormente, o gerenciamento de comentários apresentava falhas graves no ciclo de vida dos status:
1. **Falta de endpoint e botão para retornar comentários a `pending`**: Se um comentário fosse aprovado, rejeitado ou marcado como spam acidentalmente, era impossível devolvê-lo ao status inicial de moderação (`pending`).
2. **Contadores e Abas Incompletos**: A interface do painel `CommentsPanel` dentro da aba `BACKEND` só exibia contagem para comentários pendentes e filtrava sem indicar visualmente o status real individual em cada card. Além disso, a busca por `status=all` executava uma query SQL literal `WHERE c.status = 'all'`, retornando 0 registros em vez de todos os comentários.
3. **Ações Inconsistentes**: Os botões de ação ("Aprovar", "Rejeitar", "Spam") eram exibidos com base no filtro da aba atual e não no status real de cada comentário (`c.status`).
4. **Data de Moderação Incorreta**: Ao alterar status para `pending`, a data `moderated_at` recebia timestamp ao invés de ser limpa (`NULL`).

---

## 2. Alterações Realizadas

### 2.1 Backend SQLite & FastAPI (`fastapi_service/db.py`)
- **`list_comments(status)`**: Corrigido para interpretar `"all"`, `"*"` ou `""` como ausência de filtro, executando `SELECT` sem cláusula `WHERE c.status = ?`.
- **`get_comments_counts()`**: Nova função com agregação SQL `SELECT status, count(*) FROM comments GROUP BY status` retornando dicionário completo com `{ all, pending, approved, rejected, spam }`.
- **`update_comment_status(comment_id, new_status)`**:
  - Valida rigorosamente se o novo status pertence a `("pending", "approved", "rejected", "spam")`.
  - Se for `"pending"`, define `moderated_at = NULL`. Caso contrário, registra o timestamp ISO atual.

### 2.2 Rotas da API (`fastapi_service/main.py`)
- **`GET /api/comments/counts`**: Endpoint protegido (Bearer token ou sessão `sid`) que retorna contagens em tempo real por status.
- **`POST /api/comments/{comment_id}/pending`**: Endpoint dedicado para transicionar qualquer comentário de volta a `pending`.
- **`PUT /api/comments/{comment_id}/status`** e **`PATCH /api/comments/{comment_id}/status`**: Endpoint genérico recebendo `CommentStatusInput(status: str)`.
- Validação e tratamento de erros com `HTTP 400` para status inválidos.

### 2.3 Interface Administrativa (`src/components/AdminBackendPanel.tsx`)
- **Filtros e Abas Completas**:
  - Abas: `Pendentes ({counts.pending})`, `Aprovados ({counts.approved})`, `Rejeitados ({counts.rejected})`, `Spam ({counts.spam})`, `Todos ({counts.all})`.
- **Badge Visual de Status**: Cada card de comentário agora exibe um badge colorido destacado:
  - `[APROVADO]` em verde (`bg-green-500/20 text-green-400 border-green-500/40`)
  - `[PENDENTE]` em amarelo (`bg-yellow-500/20 text-yellow-400 border-yellow-500/40`)
  - `[REJEITADO]` em vermelho (`bg-red-500/20 text-red-400 border-red-500/40`)
  - `[SPAM]` em laranja (`bg-orange-500/20 text-orange-400 border-orange-500/40`)
- **Botões de Ação Bidirecionais**:
  - Comentário com status diferente de `approved`: exibe botão **Aprovar**.
  - Comentário com status diferente de `pending`: exibe botão **Pendente** (com ícone `RotateCcw`).
  - Comentário com status diferente de `rejected`: exibe botão **Rejeitar** (com ícone `X`).
  - Comentário com status diferente de `spam`: exibe botão **SPAM** (com ícone `AlertTriangle`).
  - Botão **Excluir** permanente com confirmação.

---

## 3. Validação Local
- `python3 -m py_compile fastapi_service/*.py`: Sucesso (0 erros de sintaxe ou indentação).
- `npm run build`: Sucesso (0 erros de compilação TypeScript/Vite).
