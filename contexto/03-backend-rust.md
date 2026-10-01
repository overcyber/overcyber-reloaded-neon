# 03 — Backend Rust: Análise Completa

## Rotas e Proteções

| Método | Rota | Auth | Rate Limit | CSRF | PoW |
|--------|------|------|------------|------|-----|
| POST | `/auth/login` | ❌ | ✅ (60/min) | ❌ | ❌ |
| GET | `/auth/me` | ✅ | ❌ | ❌ | ❌ |
| GET | `/about` | ❌ | ❌ | ❌ | ❌ |
| PUT | `/about` | ✅ | ❌ | ✅ | ❌ |
| GET | `/posts` | ❌ | ❌ | ❌ | ❌ |
| GET | `/posts/:slug` | ❌ | ❌ | ❌ | ❌ |
| GET | `/posts/:slug/comments` | ❌ | ❌ | ❌ | ❌ |
| POST | `/posts/:slug/comments` | ❌ | ❌ | ❌ | ✅ |
| POST | `/contact` | ❌ | ❌ | ❌ | ✅ |
| GET | `/projects` | ❌ | ❌ | ❌ | ❌ |
| POST | `/migrate/import` | ✅ | ❌ | ✅ | ❌ |

## SQL Injection

**Status: ✅ PROTEGIDO**

Todas as queries usam `rusqlite::params![]` ou `sqlx::query("...").bind()`. Nenhuma concatenação de strings em SQL.

## Autenticação

**Status: ⚠️ PARCIALMENTE SEGURO**

- Sessão via cookie HTTP-only (`session` + HMAC `session.sig`)
- CSRF token via cookie + header `X-CSRF-Token`
- Rate limiting em memória (`HashMap`) — não escala horizontalmente
- HMAC caseiro (`SHA256(salt || input)`) em vez de `HMAC-SHA256` — vulnerável a ataques de extensão

## Headers de Segurança

**Status: ❌ CSP AUSENTE**

Headers atuais:
- `X-Content-Type-Options: nosniff` ✅
- `X-Frame-Options: DENY` ✅
- `X-XSS-Protection: 1; mode=block` ⚠️ (obsoleto)

Ausentes:
- `Content-Security-Policy` ❌ 🔴
- `Strict-Transport-Security` ❌
- `Referrer-Policy` ❌

## Rate Limiting

**Status: ⚠️ LIMITADO**

- `backend/src/security/ratelimit.rs`: HashMap em memória — não compartilhado entre instâncias
- 60 req/min para login, 120 req/min para comentários/contato
- Sem persistência — reinicia ao restartar

## Hash de Senhas

**Status: ✅ ARGON2 (BOM)**

Usa `argon2` com salt de 16 bytes — padrão seguro e recomendado.

## Comentários + PoW (Proof of Work)

**Status: ✅ BOM**

- Usa Proof of Work (PoW) com desafio aleatório (challenge)
- Hashcash-style: encontrar nonce que produza hash com N zeros à esquerda
- Previne spam automatizado sem sacrificar UX

## Erro: Informação vazada

- Mensagens de erro em português ("slug em uso", "title 3..300") vazam detalhes de implementação
- Não crítico, mas boa prática usar mensagens genéricas
