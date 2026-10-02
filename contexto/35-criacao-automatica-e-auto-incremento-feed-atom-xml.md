# 35. Implementação: Feed Atom 1.0 Automático e Auto-Incrementado (`/atom.xml`)

**Data:** 02/10/2026  
**Status:** Implementado, Validado e Publicado  
**URL do Feed:** `https://overcyber.online/atom.xml` (Aliases: `/rss.xml`, `/feed.xml`, `/api/atom.xml`)  
**Escopo:** `fastapi_service/atom.py`, `fastapi_service/main.py`, `/etc/nginx/sites-available/overcyber`, `index.html`

---

## 1. Objetivo da Demanda
Atender à solicitação:
> *"voce tambem deve implementar a cricacao automatica e auto-incremento do https://overcyber.online/atom.xml o atom.xml deve conter postagens do blog"*

O feed Atom 1.0 (especificação RFC 4287) deve:
1. Conter dinamicamente todas as postagens publicadas no blog.
2. Auto-incrementar e sincronizar de forma 100% automática e em tempo real a cada criação, edição ou exclusão de posts, sem depender de compilação ou ação manual.
3. Fornecer links semânticos, datas formatadas no padrão RFC 3339/ISO 8601, títulos, resumos e conteúdo formatado em HTML com imagens de capa.
4. Possuir auto-descoberta (Autodiscovery) via tags `<link rel="alternate">` no `<head>` do site.

---

## 2. Arquitetura Implementada

### A. Gerador Dinâmico (`fastapi_service/atom.py`)
* Função `generate_atom_feed() -> str`:
  - Consulta `db.list_posts("published")` diretamente do banco de dados SQLite.
  - Formata timestamps em conformidade estrita com a **RFC 3339** (`YYYY-MM-DDTHH:MM:SSZ`).
  - Converte Markdown para HTML semântico com tags `<p>`, `<h1>` a `<h3>`, `<code>`, `<pre>`, links e blocos de código com highlight.
  - Inclui suporte a imagens de capa de alta resolução em `<content type="html"><![CDATA[ ... ]]></content>`.
  - Configura metadados do canal: autor ("Claudio Henrique Marques"), links alternativos e self, e identificador único.
* Função `sync_atom_file()`:
  - Gera e persiste `atom.xml` estático em `dist/atom.xml` e `public/atom.xml` como camada adicional de resiliência.

### B. Endpoints FastAPI (`fastapi_service/main.py`)
* Rotas públicas expostas com `Content-Type: application/atom+xml; charset=utf-8`:
  - `GET /atom.xml`
  - `GET /api/atom.xml`
  - `GET /feed.xml`
  - `GET /rss.xml`
* **Auto-incremento em tempo real:**
  - Como a rota consulta diretamente o SQLite a cada requisição, qualquer novo post publicado, editado ou excluído via API ou painel administrativo é refletido **imediatamente no mesmo milissegundo**.
  - Além disso, as rotas `create_post`, `update_post` e `delete_post` disparam `sync_atom_file()` para manter os arquivos estáticos de backup sincronizados.

### C. Proxy Nginx na VPS
* Adicionado bloco de proxy reverso em `/etc/nginx/sites-available/overcyber` (portas 80 e 443):
  ```nginx
  location ~* ^/(atom|rss|feed)\.xml$ {
      proxy_pass http://127.0.0.1:8800;
      proxy_http_version 1.1;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
  }
  ```

### D. Auto-descoberta no Frontend (`index.html`)
* Adicionadas tags de descoberta para leitores de RSS/Atom e crawlers de busca:
  ```html
  <link rel="alternate" type="application/atom+xml" title="Overcyber - Blog Atom Feed" href="/atom.xml" />
  <link rel="alternate" type="application/rss+xml" title="Overcyber - Blog RSS Feed" href="/rss.xml" />
  ```

---

## 3. Validação e Testes
* Sintaxe validada com `python3 -m py_compile fastapi_service/*.py`.
* Validação do XML gerado com parser `xml.etree.ElementTree` (0 erros de sintaxe XML).
* Nginx testado com `sudo nginx -t` (100% OK).
