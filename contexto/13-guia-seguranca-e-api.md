# Documentação Completa: Segurança e Uso da API Autônoma

## 1. Arquitetura de Segurança do Sistema

### A. Segurança do Login Administrativo (Painel Web - Porta 8000 / 8787)
O login do painel web passa pelo proxy `server.py` e é autenticado pelo backend Rust (`overcyber-backend`):
1. **Hashing de Senha com Argon2id:**
   - A senha do administrador é armazenada no SQLite com hash criptográfico **Argon2id** (padrão de referência OWASP/NIST).
2. **Proteção Contra Força Bruta (Lockout):**
   - Rate limiting automático: após 3 tentativas incorretas consecutivas, o login é bloqueado temporariamente por 30 segundos (`LOCKOUT_SECONDS`).
3. **Sessão Segura por Cookies Criptográficos:**
   - Cookie `sid`: assinado com HMAC-SHA256 para evitar adulteração de payload.
   - Flags ativas: `HttpOnly` (impede roubo via XSS/JavaScript), `SameSite=Strict` (previne ataques de CSRF entre sites) e `Secure` em ambiente HTTPS.
4. **Proteção Contra CSRF (Double-Submit Token):**
   - Todas as mutações (`POST`, `PUT`, `DELETE`) exigem o header `X-CSRF-Token` casado com o cookie `csrf`.
5. **Content Security Policy (CSP) Endurecida:**
   - `default-src 'self'`: bloqueia carregamento de scripts externos maliciosos.
   - `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'` (anti-clickjacking).
   - Liberação controlada apenas para imagens (`images.unsplash.com`, `avatars.githubusercontent.com`, `pbs.twimg.com`) e fontes (`fonts.googleapis.com`, `fonts.gstatic.com`).

---

### B. Segurança da API Autônoma (FastAPI - Porta 8800)
A API autônoma foi projetada exclusivamente para **automação local, scripts de backend, pipelines CI/CD e integrações de servidor para servidor**:
1. **Bind Estritamente Interno (`127.0.0.1`):**
   - O serviço escuta única e exclusivamente em `192.168.10.14:8800`.
   - **Nenhuma conexão externa da internet ou de outros IPs da rede local pode alcançar a porta 8800 diretamente.**
2. **Autenticação por Bearer Token de Alta Entropia:**
   - Token gerado aleatoriamente com `secrets.token_urlsafe(32)` (256 bits de entropia).
   - O token é armazenado com permissão restrita `0600` em `data/.api_token`.
   - A validação utiliza `secrets.compare_digest(token, API_TOKEN)`, garantindo **proteção contra ataques de temporização (Timing Attacks)**.
3. **Isolamento e Acesso Direto com WAL Mode:**
   - A FastAPI grava diretamente no SQLite `data/overcyber.db` utilizando `PRAGMA journal_mode = WAL;`, permitindo leituras e escritas concorrentes sem travar o backend Rust nem a interface web.
4. **Validação Estrita de Esquema (Pydantic v2):**
   - Todos os inputs de criação e edição são estritamente validados contra tipos de dados inesperados e injeções.

---

## 2. Onde Encontrar a Documentação

1. **Documentação Interativa Swagger / OpenAPI:**
   - Acesse via navegador (na máquina local): [http://192.168.10.14:8800/docs](http://192.168.10.14:8800/docs)
   - Interface OpenAPI interativa onde você pode testar cada endpoint diretamente com o Bearer token clicando em **Authorize**.
2. **Especificação ReDoc:**
   - [http://192.168.10.14:8800/redoc](http://192.168.10.14:8800/redoc)
3. **Arquivo de Token:**
   - Localização: `/llm/overcyber-reloaded-neon/data/.api_token`

---

## 3. Como Usar a API: Guia de Endpoints e Exemplos

### Obtenção do Token de Acesso
```bash
TOKEN=$(cat /llm/overcyber-reloaded-neon/data/.api_token)
echo "Seu Token: $TOKEN"
```

---

### A. Blog / Posts

#### 1. Listar posts (Público / Interno)
```bash
curl -s http://192.168.10.14:8800/api/posts
# Filtrar apenas publicados:
curl -s "http://192.168.10.14:8800/api/posts?status=published"
# Filtrar apenas rascunhos:
curl -s "http://192.168.10.14:8800/api/posts?status=draft"
```

#### 2. Obter post por slug ou id
```bash
curl -s http://192.168.10.14:8800/api/posts/night-city-underground-tech
```

#### 3. Criar novo post (Requer Token)
```bash
curl -s -X POST http://192.168.10.14:8800/api/posts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Nova Descoberta em Defesa Cibernética",
    "slug": "nova-descoberta-em-defesa-cibernetica",
    "excerpt": "Breve introdução sobre a pesquisa realizada.",
    "content": "## Conteúdo do Artigo em Markdown\n\nTexto detalhado...",
    "image": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800",
    "status": "published"
  }'
```

#### 4. Atualizar post existente (Requer Token)
```bash
curl -s -X PUT http://192.168.10.14:8800/api/posts/ID_DO_POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Título Atualizado",
    "status": "published"
  }'
```

#### 5. Excluir post (Requer Token)
```bash
curl -s -X DELETE http://192.168.10.14:8800/api/posts/ID_DO_POST \
  -H "Authorization: Bearer $TOKEN"
```

---

### B. Projetos

#### 1. Listar projetos
```bash
curl -s http://192.168.10.14:8800/api/projects
```

#### 2. Criar novo projeto (Requer Token)
```bash
curl -s -X POST http://192.168.10.14:8800/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "SecureSentinel",
    "description": "Monitor de integridade de rede com IA.",
    "tags": "Python, Rust, AI",
    "github": "https://github.com/overcyber/securesentinel",
    "live": "https://overcyber.online",
    "stars": 120,
    "forks": 15,
    "ord": 4
  }'
```

#### 3. Atualizar projeto (Requer Token)
```bash
curl -s -X PUT http://192.168.10.14:8800/api/projects/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"stars": 350}'
```

#### 4. Excluir projeto (Requer Token)
```bash
curl -s -X DELETE http://192.168.10.14:8800/api/projects/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

### C. Moderação de Comentários

#### 1. Listar comentários pendentes de moderação
```bash
curl -s "http://192.168.10.14:8800/api/comments?status=pending" \
  -H "Authorization: Bearer $TOKEN"
```

#### 2. Aprovar comentário
```bash
curl -s -X POST http://192.168.10.14:8800/api/comments/ID_DO_COMENTARIO/approve \
  -H "Authorization: Bearer $TOKEN"
```

#### 3. Rejeitar comentário
```bash
curl -s -X POST http://192.168.10.14:8800/api/comments/ID_DO_COMENTARIO/reject \
  -H "Authorization: Bearer $TOKEN"
```

#### 4. Marcar como spam
```bash
curl -s -X POST http://192.168.10.14:8800/api/comments/ID_DO_COMENTARIO/spam \
  -H "Authorization: Bearer $TOKEN"
```

#### 5. Excluir comentário permanentemente
```bash
curl -s -X DELETE http://192.168.10.14:8800/api/comments/ID_DO_COMENTARIO \
  -H "Authorization: Bearer $TOKEN"
```

---

### D. Mensagens de Contato Recebidas

#### 1. Listar todas as mensagens recebidas
```bash
curl -s http://192.168.10.14:8800/api/contact/messages \
  -H "Authorization: Bearer $TOKEN"
```

#### 2. Marcar mensagem como lida
```bash
curl -s -X POST http://192.168.10.14:8800/api/contact/messages/ID_DA_MENSAGEM/read \
  -H "Authorization: Bearer $TOKEN"
```

#### 3. Excluir mensagem
```bash
curl -s -X DELETE http://192.168.10.14:8800/api/contact/messages/ID_DA_MENSAGEM \
  -H "Authorization: Bearer $TOKEN"
```

---

### E. Visibilidade de Seções do Site

#### 1. Consultar estado das seções
```bash
curl -s http://127.0.0.1:8800/api/sections
```

#### 2. Alterar visibilidade de seções (Requer Token)
```bash
# Exemplo: Ocultar o Blog temporariamente
curl -s -X PUT http://127.0.0.1:8800/api/sections \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"blog": false}'

# Exemplo: Reativar o Blog
curl -s -X PUT http://127.0.0.1:8800/api/sections \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"blog": true}'
```

---

## 4. Exemplo de Automação em Python

```python
import os
import requests

TOKEN = open("/llm/overcyber-reloaded-neon/data/.api_token").read().strip()
BASE_URL = "http://127.0.0.1:8800"
HEADERS = {"Authorization": f"Bearer {TOKEN}"}

# Criar post automaticamente
res = requests.post(
    f"{BASE_URL}/api/posts",
    headers=HEADERS,
    json={
        "title": "Post Automatizado via Python",
        "slug": "post-automatizado-via-python",
        "content": "Publicação gerada automaticamente via script local.",
        "status": "published"
    }
)
print("Resposta:", res.json())
```
