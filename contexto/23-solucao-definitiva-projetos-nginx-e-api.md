# 23. Solução Definitiva: Projetos, Nginx, API Pública e Resposta sobre Compilação

## 1. Resposta Direta: Toda vez que atualizar terá que compilar?

**NÃO. Você NÃO precisa compilar toda vez que atualizar projetos, posts ou readmes.**

### Como funciona agora:
1. **O Backend (FastAPI):**
   - Lê e grava dados **diretamente no banco de dados SQLite** (`/var/www/overcyber-dev/data/overcyber.db`).
   - Qualquer inserção, atualização ou exclusão feita via API (`POST`, `PUT`, `DELETE /api/projects`, etc.) ou direto no banco tem **efeito imediato no mesmo segundo**. Nenhuma compilação de código ou reinicialização de serviço é necessária.

2. **O Frontend React (Vite SPA):**
   - Ao abrir a página `https://overcyber.online/projects`, o React faz imediatamente uma requisição dinâmica em tempo real:
     ```javascript
     fetch('/api/projects')
     ```
   - Como a API agora é pública para leitura e responde com HTTP 200 contendo o JSON dos projetos direto do SQLite, a interface é montada e atualizada com os dados do banco na hora.

3. **Quando compilação seria necessária?**
   - **Apenas** se você alterar código-fonte React/TypeScript do frontend (adicionar novos componentes visuais, alterar layouts JSX ou estilos CSS em `src/`).
   - Para alterações normais de conteúdo (cadastrar novo projeto, mudar texto do README, atualizar stars/forks, publicar post no blog, moderar comentários), **NÃO se compila nada**.

---

## 2. Por que `https://overcyber.online/projects` estava mostrando dados antigos?

Havia quatro causas simultâneas que causavam o problema:

1. **Proxy do Nginx desatualizado na Oracle Cloud:**
   - O arquivo `/etc/nginx/sites-available/overcyber` direcionava `location /api/` para a porta `8787` (backend em Rust), que estava inoperante devido a incompatibilidade de arquitetura de compilação.
   - O backend oficial autônomo com SQLite e todas as novas colunas roda na porta `8800` (FastAPI).

2. **Autenticação Bearer indevida nas rotas públicas da FastAPI:**
   - As rotas `GET /api/projects`, `GET /api/posts` e `GET /api/sections` no FastAPI estavam exigindo token Bearer do administrador (`verify_token`).
   - Quando um visitante comum entrava no site, o navegador chamava `GET /api/projects` sem token e a API devolvia `401 Unauthorized` (`Header Authorization com Bearer token ausente`).

3. **Colisão de Diretório Nginx x Rota SPA (`/projects` vs pasta `/projects/`):**
   - No diretório de arquivos estáticos `/var/www/overcyber-dev/dist/`, existia a pasta física `projects/` contendo as 14 imagens PNG.
   - Quando alguém acessava a URL `https://overcyber.online/projects`, o Nginx detectava que existia uma pasta com esse nome no disco e emitia um redirecionamento `301 Moved Permanently` para `https://overcyber.online/projects/`.
   - Na pasta `dist/projects/` não havia nenhum `index.html` e a listagem de diretório estava desativada (`autoindex off`).
   - Resultado: o Nginx retornava **403 Forbidden** (`directory index of /var/www/overcyber-dev/dist/projects/ is forbidden`). O navegador nunca chegava ao `index.html` do React quando a página era recarregada diretamente na URL.

4. **Fallback estático e LocalStorage com dados legados ("NeuraScan", "CyberShield"):**
   - Como a chamada à API falhava (seja por 401 ou 502), o código do React caía no fallback de emergência definido em `src/hooks/use-managed-content.ts` e `src/pages/Admin.tsx`, onde "NeuraScan" e "CyberShield" estavam salvos estaticamente e armazenados no `localStorage.getItem('admin-projects-data')`.

---

## 3. Correções Aplicadas

### 1. Nginx Reconfigurado e Recarregado
- `location /api/` alterado de `http://127.0.0.1:8787` para `http://127.0.0.1:8800`.
- `location = /healthz` alterado de `http://127.0.0.1:8787` para `http://127.0.0.1:8800/healthz`.
- Criado `index.html` em `dist/projects/index.html` e `public/projects/index.html` para resolver a colisão da pasta física com o roteador SPA. Agora `https://overcyber.online/projects` e `/projects/` respondem com HTTP 200 servindo a aplicação React perfeitamente.

### 2. FastAPI Gateway com Rotas Públicas Abertas
- `GET /api/projects` (Público - retorna os 14 projetos do SQLite)
- `GET /api/projects/{id_ou_slug}` (Público)
- `GET /api/projects/{id_ou_slug}/readme` (Público)
- `GET /api/posts` (Público - posts publicados)
- `GET /api/posts/{slug_ou_id}` (Público)
- `GET /api/posts/{slug_ou_id}/comments` (Público - comentários aprovados)
- `POST /api/posts/{slug_ou_id}/comments` (Público - envio de comentários)
- `GET /api/sections` (Público - visibilidade das seções)
- `GET /api/about` (Público - perfil Claudio Henrique)
- `GET /api/resume` (Público - educação, experiência, publicações, skills)
- `GET /api/pow/challenge` (Público - desafio Proof-of-Work para comentários/contato)
- `POST /api/contact` (Público - envio de mensagens de contato)
- **Rotas de Escrita Administrativas (`POST`, `PUT`, `DELETE` de posts, projetos, seções, moderação):** Continuam 100% protegidas e exigem o Bearer Token.

### 3. Frontend Atualizado e Sanitizado
- `src/hooks/use-managed-content.ts`: atualizado com os 14 projetos reais como fallback e adicionada rotina automática que expurga dados obsoletos ("NeuraScan", "CyberShield") do `localStorage` de qualquer visitante.
- `src/pages/Admin.tsx`: atualizado para consumir os 14 projetos reais e purgar dados obsoletos do `localStorage`.
- Frontend recompilado em produção (`dist/assets/index-IuYiCJwy.js`).

---

## 4. Testes Reais em Produção (19/19 Passaram)

Executado teste fim-a-fim via HTTPS direto na internet pública (`https://overcyber.online`):

```text
=== VERIFICAÇÃO FINAL COMPLETA EM PRODUÇÃO ===
[OK 200] API: Projects List: 14 projects returned
[OK 200] API: First Project Title: Adversarial CyberSec — Coevolutionary Cyber MARL
[OK 200] API: Last Project Title: Unknown-SO — Linux Hardening & Privacy Research Archive
[OK 200] API: Project Readme (adversarial-cybersec): # ADVERSARIAL CYBERSEC // COEVOLUTIONARY CYBE...
[OK 200] API: Project Readme (unknown-so): # UNKNOWN-SO // LINUX HARDENING & PRIVACY RES...
[OK 200] API: Posts List: 3 posts returned
[OK 200] API: Sections: {'profile': True, 'education': True, 'experience': True, 'publications': True, 'skills': True, 'projects': True, 'blog': True, 'contact': True}
[OK 200] API: About: Claudio Henrique Marques de Oliveira
[OK 200] API: Resume: ['education', 'experience', 'publications', 'skills']
[OK 200] API: PoW Challenge: {'nonce': '9f7208df7814cad72cc48969c2977110', 'difficulty': 8}
[OK 200] Asset: Project Image (.png): 2656269 bytes binary image
[OK 200] Asset: Project Image 2 (.png): 1649035 bytes binary image
[OK 200] Asset: Project Image 3 (.png): 1777877 bytes binary image
[OK 200] Page: Homepage (/): HTML 2113 bytes
[OK 200] Page: Projects Page (/projects): HTML 2113 bytes - Bundle: True
[OK 200] Page: Projects Page (/projects/): HTML 2113 bytes - Bundle: True
[OK 200] Page: Blog (/blog): HTML 2113 bytes
[OK 200] Page: About (/about): HTML 2113 bytes
[OK 200] Page: Contact (/contact): HTML 2113 bytes

>>> TODOS OS 19 TESTES PASSARAM COM SUCESSO ABSOLUTO! <<<
```
