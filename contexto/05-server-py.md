# 05 — Server Proxy Python (server.py): Análise Completa

## Função

O `server.py` é um servidor HTTP simples que:
1. Serve arquivos estáticos do diretório `dist/` (build do Vite)
2. Proxy reverso para o backend Rust (`POST /api/*` → `http://127.0.0.1:8787/api/*`)

## Problemas de Segurança

### ❌ CORS Inseguro
```python
self.send_header('Access-Control-Allow-Origin', '*')
self.send_header('Access-Control-Allow-Credentials', 'true')
```
- `*` com `Credentials: true` é inválido/ignorado por navegadores
- A configuração correta exige origens explícitas

### ❌ Sem Headers de Segurança
Nenhum header de segurança é adicionado:
- ❌ CSP ausente
- ❌ HSTS ausente
- ❌ X-Content-Type-Options ausente
- ❌ Referrer-Policy ausente
- ❌ Cache-Control para assets estáticos ausente

### ❌ Logging de Requisições
```python
print(f"  ← {path} ({status})")
```
Path da requisição é logado — pode conter dados sensíveis em URLs (tokens, session IDs). Baixo risco pois é log local.

### ⚠️ Sem Validação de Proxy
```python
if path.startswith('/api/'):
    proxy_path = path[4:]
    ...
    proxy_to = f"{BACKEND_URL}{proxy_path}"
```
Proxy apenas para `/api/*` — prefixo fixo, mas sem validação adicional de path (path traversal não se aplica pois é prefixo fixo).

### ⚠️ Timeout de Proxy
```python
response = urlopen(req, timeout=10)
```
Timeout de 10s para requisições ao backend — proteção básica contra DoS.

## Recomendações para server.py

1. Adicionar headers de segurança (CSP, HSTS, X-Content-Type-Options)
2. Corrigir CORS para origens específicas
3. Adicionar `Cache-Control: no-cache` para arquivos HTML
4. Adicionar timeout configurável para proxy
5. Validar path do proxy (apesar do prefixo fixo)
