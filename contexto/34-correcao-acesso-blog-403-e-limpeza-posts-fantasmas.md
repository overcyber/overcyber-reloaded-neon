# 34. Resolução Definitiva: Acesso ao Blog (403 Forbidden) e Limpeza de Posts Fantasmas

**Data:** 02/10/2026  
**Status:** Concluído e Validado em Produção  
**Escopo:** Nginx na VPS, `src/pages/Blog.tsx`, `src/pages/Admin.tsx`, `src/App.tsx`, `src/main.tsx`, `public/blog/index.html`

---

## 1. Problemas Relatados
1. Ao acessar `https://overcyber.online/blog/`, a página não abria e retornava erro **403 Forbidden**.
2. Sensação de que as exclusões de posts não estavam funcionando ("não está deletando").

---

## 2. Diagnóstico & Causas Raiz

### A. Causa do 403 Forbidden em `/blog/`
* No build anterior do Vite, imagens do blog foram incluídas na pasta `public/blog/`.
* Isso fez com que o Vite gerasse o diretório físico `/var/www/overcyber-dev/dist/blog/` no servidor.
* Na configuração do Nginx para SPAs:
  ```nginx
  location / {
      try_files $uri $uri/ /index.html;
  }
  ```
* Quando o usuário acessava `https://overcyber.online/blog/`:
  - O Nginx avaliava `$uri/`. Como a pasta física `dist/blog/` existia no disco, mas **não possuía um `index.html`** e o `autoindex` estava desativado, o Nginx emitia **HTTP 403 Forbidden**.
  - Quando o usuário acessava `https://overcyber.online/blog` (sem barra), o Nginx automaticamente emitia um redirect `301 Moved Permanently` para `/blog/`, caindo no mesmo 403.
  - O mesmo problema havia ocorrido anteriormente com a pasta `/projects/` e fora solucionado adicionando `projects/index.html`.

### B. Causa da Impressão de "Não Estar Deletando"
* **No Backend:** As exclusões estavam sendo executadas com sucesso (`DELETE /api/posts/by-id/{id}` retornando `HTTP 200 OK`). O banco SQLite em produção foi inspecionado e os posts de exemplo antigos (`2`, `3`, `59ae8384`, etc.) foram de fato deletados permanentemente.
* **No Frontend:**
  1. O arquivo `src/main.tsx` e `src/App.tsx` tinham rotinas antigas que injetavam posts fictícios ("The Future of Cybernetic Implants", "Night City's Underground Tech Scene", etc.) no `localStorage` sob a chave `blog-posts` se ela estivesse vazia.
  2. Em `src/pages/Admin.tsx`, ao final da função `loadAll()`, havia código legado que relia `loadData('blog-posts', defaultBlogPosts)` e sobrescrevia o estado do React (`setBlogPosts`), ressuscitando os dados locais/padrão sobre os dados recém-carregados do backend.
  3. Em `src/pages/Blog.tsx`, a condição `if (Array.isArray(data) && data.length > 0)` caía no fallback `FALLBACK_POSTS` caso a lista estivesse vazia.
  4. O usuário não conseguia acessar `https://overcyber.online/blog/` para conferir o resultado devido ao bloqueio 403 do Nginx.

---

## 3. Ações e Soluções Aplicadas

### 1. Nginx Reconfigurado e SPA Fallback
* Adicionado `public/blog/index.html` (e `dist/blog/index.html`) para que a existência da pasta física nunca mais cause 403 Forbidden.
* No Nginx (`/etc/nginx/sites-available/overcyber`):
  ```nginx
  location = /blog {
      try_files /index.html =404;
  }

  location = /projects {
      try_files /index.html =404;
  }
  ```
* Recarregado o Nginx com `sudo nginx -t && sudo systemctl reload nginx`.

### 2. Remoção de Seeding e Posts Fantasmas no Frontend
* **`src/App.tsx`**: Removido array `examplePosts` e o `useEffect` que populava `localStorage`.
* **`src/main.tsx`**: Removida a função `addExampleBlogPosts` e sua chamada.
* **`src/pages/Admin.tsx`**:
  - `defaultBlogPosts` esvaziado (`[]`).
  - `loadAll()` corrigido para não sobrescrever o estado de posts e projetos com dados velhos de `localStorage`.
  - `deleteBlogPost` agora filtra localmente usando comparação estrita de string (`String(post.id) !== String(id) && post.slug !== id`) e recarrega imediatamente da API.
* **`src/pages/Blog.tsx`**:
  - Removido `FALLBACK_POSTS`.
  - Sincronização direta com a API: se o backend retornar posts (ou lista vazia), a interface exibe exatamente a realidade do banco de dados SQLite.

---

## 4. Testes Reais em Produção

1. **Acesso HTTP a `/blog` e `/blog/`:**
   ```bash
   curl -s -i "https://overcyber.online/blog" | head -n 10
   # Retorno: HTTP/2 200 OK (<!DOCTYPE html>)

   curl -s -i "https://overcyber.online/blog/" | head -n 10
   # Retorno: HTTP/2 200 OK (<!DOCTYPE html>)
   ```
2. **Consulta aos Posts Atuais no Backend (`GET /api/posts`):**
   ```bash
   curl -s "https://overcyber.online/api/posts"
   # Retorno: Exatamente os 4 posts legítimos publicados:
   # 1. Oito arquiteturas de RAG
   # 2. Fine-tuning, LoRA, QLoRA
   # 3. Jev e Laya
   # 4. Autonomous Defense Grid
   ```
   Nenhum post duplicado ou deletado reaparece.
