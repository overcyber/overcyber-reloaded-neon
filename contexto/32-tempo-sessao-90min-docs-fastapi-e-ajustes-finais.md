# 32 - Tempo de Sessão de 90 Minutos, Acesso aos Docs da FastAPI e Ajuste do Título da Home

**Data:** 02/10/2026  
**Ambiente:** Local & Servidor de Produção Oracle Cloud (`https://overcyber.online`)

---

## 1. Limpeza da Seção "Sugestão de Imagem" das Postagens via API

### Diagnóstico
As postagens criadas continham no final do corpo o trecho `## Sugestão de imagem` e o prompt descritivo utilizado para gerar as artes no DALL-E / Nano. Esses prompts eram orientações internas e não deviam ser exibidos aos leitores do blog.

### Ação Realizada
1. Atualizado o script [`fastapi_service/publish_posts.py`](file:///llm/overcyber-reloaded-neon/fastapi_service/publish_posts.py) com a função de sanitização `clean_post_body`:
   ```python
   def clean_post_body(body: str) -> str:
       pattern = r'(?i)\n*---*\s*\n*##\s*Sugest[ãa]o\s+de\s+imagem[\s\S]*$'
       cleaned = re.sub(pattern, '', body)
       if cleaned == body:
           pattern2 = r'(?i)\n*##\s*Sugest[ãa]o\s+de\s+imagem[\s\S]*$'
           cleaned = re.sub(pattern2, '', body)
       return cleaned.strip()
   ```
2. Executada a atualização das 3 postagens exclusivamente via API (`PUT /api/posts/{post_id}`) com Bearer Token.
3. Validação realizada em `https://overcyber.online/api/posts/{slug}` confirmando que nenhuma postagem contém mais o texto de sugestão de imagem.

---

## 2. Como Acessar a Documentação da FastAPI (`/docs` e `/openapi.json`) e Como Alterar

A documentação interativa Swagger UI (`/docs`), ReDoc (`/redoc`) e especificação (`/openapi.json`) da FastAPI roda internamente na porta local **8800** (`127.0.0.1:8800`).

### A. Acesso Padrão Seguro (Somente por IP Local / Túnel SSH)

Por padrão de segurança, o Nginx bloqueia qualquer requisição externa vinda da internet pública para `/docs` ou `/gateway/docs` retornando **`HTTP 403 Forbidden`**.

Para acessar com segurança como administrador a partir de sua máquina local:
1. Abra um terminal em seu computador e crie um túnel SSH seguro direcionando a porta local 8800 para a porta 8800 do servidor:
   ```bash
   ssh -i ~/.ssh/oracle -L 8800:127.0.0.1:8800 ubuntu@168.75.94.233
   ```
2. No seu navegador, acesse diretamente:
   - **Swagger UI:** [http://localhost:8800/docs](http://localhost:8800/docs)
   - **ReDoc:** [http://localhost:8800/redoc](http://localhost:8800/redoc)
   - **OpenAPI JSON:** [http://localhost:8800/openapi.json](http://localhost:8800/openapi.json)

Como a conexão é feita via localhost (`127.0.0.1`), ela não é exposta na internet e todo o tráfego é criptografado pelo SSH.

---

### B. Como Alterar a Política de Acesso no Nginx (Liberar seu IP ou Liberar Público)

O arquivo de configuração do Nginx no servidor está em:
`/etc/nginx/sites-available/overcyber`

O bloco responsável pelo controle de acesso é:
```nginx
    # FastAPI Swagger Docs & OpenAPI (Acesso Restrito: Somente Localhost / IP Local)
    location ~* ^/(gateway/)?(docs|redoc|openapi.json) {
        # Permite apenas IP local
        allow 127.0.0.1;
        allow ::1;

        # Para liberar seu IP de acesso direto, descomente e insira seu IP público:
        # allow 177.xxx.xxx.xxx;

        # Bloqueia outros acessos externos da internet
        deny all;

        proxy_pass http://127.0.0.1:8800;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
```

#### Para permitir o seu IP de internet residencial/escritório:
1. Conecte no servidor: `ssh -i ~/.ssh/oracle ubuntu@168.75.94.233`
2. Edite o arquivo: `sudo nano /etc/nginx/sites-available/overcyber`
3. Localize o bloco e adicione seu IP:
   ```nginx
   allow 177.100.20.15; # Seu IP aqui
   ```
4. Teste e recarregue o Nginx:
   ```bash
   sudo nginx -t && sudo systemctl reload nginx
   ```
5. Agora você poderá acessar diretamente por:
   `https://overcyber.online/gateway/docs` ou `https://overcyber.online/docs`

#### Para liberar publicamente para qualquer IP:
Comente a linha `deny all;` inserindo `#` na frente:
```nginx
   # deny all;
```
E recarregue com `sudo systemctl reload nginx`.

---

### C. Como Desativar ou Ativar a Documentação no Código da FastAPI

No arquivo [`fastapi_service/config.py`](file:///llm/overcyber-reloaded-neon/fastapi_service/config.py):
```python
ENABLE_DOCS = os.environ.get("ENABLE_DOCS", "true").lower() in ("true", "1", "yes")
DOCS_URL = "/docs" if ENABLE_DOCS else None
REDOC_URL = "/redoc" if ENABLE_DOCS else None
OPENAPI_URL = "/openapi.json" if ENABLE_DOCS else None
```
- Para desativar a documentação globalmente, defina a variável `ENABLE_DOCS=false` no serviço systemd ou altere o padrão para `false`.
- Reinicie o serviço: `sudo systemctl restart overcyber-fastapi.service`.

---

## 3. Ajuste do Título na Página Inicial (`Index.tsx`)

O título da página inicial em [`src/pages/Index.tsx`](file:///llm/overcyber-reloaded-neon/src/pages/Index.tsx) foi atualizado preservando o padrão estético cyberpunk original com as barras duplas (`//`) em destaque com a classe `text-accent`:

```tsx
<GlitchEffect>
  <h1 className="text-4xl md:text-5xl font-bold text-center cyber-glow font-mono uppercase tracking-wide">
    CLAUDIO HENRIQUE <span className="text-accent">//</span> MARQUES
  </h1>
</GlitchEffect>
```
- `CLAUDIO HENRIQUE`: Renderizado com o brilho `cyber-glow` verde neon.
- `<span className="text-accent">//</span>`: Barras duplas estilizadas na cor de acento ciano/neon.
- `MARQUES`: Renderizado com `cyber-glow`.

---

## 4. Limite de Sessão do Admin em 90 Minutos

### Diagnóstico Anterior
A sessão anterior utilizava `max_age = 7 * 86400` (7 dias) tanto no banco SQLite quanto nos cookies HTTP `sid` e `csrf`. O administrador permanecia autenticado por tempo excessivo.

### Alterações Implementadas

1. **Configuração Centralizada (`fastapi_service/config.py`):**
   ```python
   # Tempo máximo de sessão do Admin: 90 minutos (90 * 60 = 5400 segundos)
   SESSION_TIMEOUT_MINUTES = int(os.environ.get("SESSION_TIMEOUT_MINUTES", "90"))
   SESSION_MAX_AGE_SECONDS = int(os.environ.get("SESSION_MAX_AGE_SECONDS", str(SESSION_TIMEOUT_MINUTES * 60)))
   ```

2. **Banco de Dados SQLite (`fastapi_service/db.py`):**
   - Ao gerar nova sessão em `create_session`:
     `expires_at = (now + timedelta(minutes=SESSION_TIMEOUT_MINUTES)).strftime("%Y-%m-%dT%H:%M:%SZ")`
   - Adicionada função de manutenção `clean_expired_sessions()` que remove registros de sessões expiradas.

3. **Cookies HTTP (`fastapi_service/main.py`):**
   - No endpoint `POST /api/auth/login`, os cookies `sid` e `csrf` agora são gravados com `max_age=SESSION_MAX_AGE_SECONDS` (5400 segundos).
   - No startup da aplicação (`lifespan`), é exibido no log e executada a limpeza de sessões expiradas.

4. **Monitoramento Ativo no Frontend (`src/pages/Admin.tsx`):**
   - Adicionado um hook `useEffect` com polling a cada 60 segundos que consulta `/api/auth/me`.
   - Se o backend retornar status 401 (sessão expirada após 90 minutos), o estado `isAuthenticated` é revertido para `false`, deslogando o administrador imediatamente e apresentando o toast de alerta:
     `"Sessão Expirada: O tempo limite de 90 minutos da sessão expirou. Faça login novamente."`

---

## 5. Validação e Testes em Produção

1. **Validação da Sintaxe Python:**
   `python3 -m py_compile fastapi_service/*.py` — 0 erros.
2. **Compilação do Frontend:**
   `npm run build` — compilação concluída com código 0 em 8.17s.
3. **Deploy em Produção:**
   Código enviado para branch `main`, sincronizado em `/var/www/overcyber-dev`, compilado com Vite e serviço `overcyber-fastapi.service` reiniciado.
4. **Verificação dos Endpoints:**
   - `GET /api/posts/{slug}`: Conteúdos das 3 postagens limpos sem a seção de sugestão de imagem.
   - `GET /docs` e `GET /gateway/docs` via internet externa: Retorna `HTTP 403 Forbidden`.
   - `GET /docs` via `127.0.0.1:8800`: Retorna `HTTP 200 OK`.
   - Homepage `https://overcyber.online`: Título renderizado como `CLAUDIO HENRIQUE // MARQUES` com barras duplas em ciano neon.
   - Login do Admin: Cookies e registro do banco de dados configurados para expirar estritamente em 90 minutos.
