# 06 — Recomendações de Correção (Priorizadas)

## 🔴 Imediatas (risco real de exploração)

### 1. Remover senha hardcoded e migrar auth para backend
**Arquivo:** `src/pages/Admin.tsx`
**Prioridade:** 🔴 MÁXIMA
**Como fazer:**
```typescript
// Em vez de:
if (data.password === "admin123") { ... }

// Usar o backend já existente:
const res = await api("/auth/login", { method: "POST", json: { password: data.password } });
```
O backend Rust já tem `/auth/login` com hash Argon2 + sessão + CSRF.

### 2. Adicionar CSP
**Arquivo:** `backend/src/security/headers.rs`
**Prioridade:** 🔴 MÁXIMA
**Como fazer:** Adicionar header:
```rust
"Content-Security-Policy",
"default-src 'self'; \
 script-src 'self'; \
 style-src 'self' 'unsafe-inline'; \
 img-src 'self' data: https://images.unsplash.com; \
 connect-src 'self' http://127.0.0.1:8787; \
 form-action 'self'"
```

---

## 🟠 Alta Prioridade

### 3. HMAC seguro
**Arquivo:** `backend/src/security/session.rs`
Trocar `SHA256(salt || input)` por `HMAC-SHA256(key, input)` usando crate `hmac`.

### 4. Rate limiting no login do admin
Adicionar contagem de tentativas no frontend com lockout temporário.

### 5. CORS corrigido
Em `server.py`, trocar `*` por origens específicas ou separar `Access-Control-Allow-Origin` e `Access-Control-Allow-Credentials` corretamente.

---

## 🟡 Média Prioridade

### 6. Criptografar TOTP secrets no banco
Usar chave derivada da master key para criptografar secrets antes de armazenar.

### 7. HSTS header
Adicionar `Strict-Transport-Security: max-age=31536000; includeSubDomains`.

### 8. Headers de segurança no server.py
CSP, HSTS, X-Content-Type-Options, Cache-Control.

---

## Resumo de Esforço

| # | Correção | Esforço | Impacto |
|---|----------|---------|---------|
| 1 | Auth via backend | Médio | 🔴 Crítico |
| 2 | Adicionar CSP | Baixo | 🔴 Crítico |
| 3 | HMAC seguro | Baixo | 🟠 Alto |
| 4 | Rate limit login | Baixo | 🟠 Alto |
| 5 | CORS corrigido | Mínimo | 🟡 Médio |
| 6 | TOTP criptografado | Médio | 🟡 Médio |
| 7 | HSTS | Mínimo | 🟡 Médio |
| 8 | server.py headers | Baixo | 🟢 Baixo |
