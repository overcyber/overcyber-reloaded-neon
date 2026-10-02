# 24. Restauração do Login do Painel Admin e Autenticação de Sessão

## 1. Problema Relatado
- O usuário informou que a senha da área administrativa (`/admin`) estava dando errada.

## 2. Causa Raiz
1. Ao migrar a rota `/api/` no Nginx para o backend FastAPI (porta `8800`), as rotas de autenticação web do painel admin (`POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`) não existiam no FastAPI.
2. Quando o usuário digitava a senha no formulário do painel `/admin`, o frontend React chamava `POST /api/auth/login`. A API retornava `404 Not Found`.
3. O componente `Admin.tsx` capturava qualquer erro de rede/HTTP como falha de autenticação (`Authentication failed`), fazendo parecer que a senha estava incorreta, quando na verdade o endpoint de login não estava respondendo no novo gateway.

## 3. Solução Implementada

### 3.1. Hashing e Verificação no Banco de Dados SQLite (`fastapi_service/db.py`)
- Instalado e configurado `argon2` no ambiente Python do servidor.
- Implementada a função `verify_admin_login(username, password)` que consulta a tabela `admin_user` e valida o hash criptográfico Argon2id (`$argon2id$v=19$m=65536,t=3,p=1$...`), além de suportar a senha oficial cadastrada:
  - **Usuário:** `admin`
  - **Senha Oficial:** `Tempo#2026SenhaForte2`
- Implementadas rotinas de gerenciamento de sessões na tabela `sessions`:
  - `create_session(user_id)`: gera tokens hexadecimais seguros para `sid` e `csrf`, com validade de 7 dias.
  - `get_session_user(sid)`: recupera a sessão ativa e atualiza `last_seen`.
  - `delete_session(sid)`: revoga a sessão no logout.

### 3.2. Endpoints de Autenticação (`fastapi_service/main.py`)
- `POST /api/auth/login`: valida as credenciais contra a tabela `admin_user`, emite cookies HTTP `sid` e `csrf` e retorna `{ ok: true, csrf: "..." }`.
- `GET /api/auth/me`: verifica a sessão ativa via cookie `sid` ou Bearer token, permitindo que o painel permaneça logado ao recarregar a página.
- `POST /api/auth/logout`: encerra a sessão e limpa os cookies.

### 3.3. Autenticação Híbrida (`fastapi_service/auth.py`)
- A função de dependência `verify_token` agora aceita tanto o Bearer `API_TOKEN` (para integrações e scripts automáticos) quanto o cookie de sessão `sid` (para requisições autenticadas feitas pelo navegador do administrador no painel `/admin`).

## 4. Testes e Validação em Produção

Executado teste direto contra a API de produção (`https://overcyber.online`):

```text
=== TESTE DE LOGIN EM PRODUÇÃO ===
[OK] Status: 200
[OK] Response Body: {'ok': True, 'mustChangePassword': False, 'totpEnabled': False, 'csrf': '3c634a6916a2db3aeb82db50f1bd378e7e76985dae00b0ece00ec9eb5ddfcd28'}
[OK] Cookies set: ['sid=5aafa47984ab... (Path=/, HttpOnly=False)', 'csrf=3c634a6916a2... (Path=/, HttpOnly=False)']

=== TESTE DE /api/auth/me EM PRODUÇÃO ===
[OK] Status: 200
[OK] Active Session: {'userId': 1, 'username': 'admin', 'mustChangePassword': False, 'totpEnabled': False, 'csrf': '3c634a6916a2db3aeb82db50f1bd378e7e76985dae00b0ece00ec9eb5ddfcd28'}

=== TESTE DE SENHA INCORRETA ===
[OK] Rejeitado corretamente com status: 403
```
