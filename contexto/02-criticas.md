# 02 — Vulnerabilidades Críticas e Altas

## 🔴 CRÍTICA #1: Senha hardcoded no bundle JS

**Arquivo:** `src/pages/Admin.tsx` (linha ~627)
**Código:**
```typescript
if (data.password === "admin123") {
```

**Impacto:**
- A senha `admin123` está hardcoded no código-fonte e é embarcada no bundle JS de produção
- Qualquer usuário pode inspecionar o código (View Source, DevTools) e descobrir a senha
- Acesso total ao painel admin → permite modificar conteúdo (About, Blog, Projetos), ver dados de backend, etc.

**Gravidade:** CRÍTICA — acesso administrativo completo exposto

**Como corrigir:** Implementar autenticação via backend (Rust). O backend já tem `POST /auth/login` com hash bcrypt + sessão + CSRF.

---

## 🔴 CRÍTICA #2: CSP (Content Security Policy) ausente

**Arquivo:** `backend/src/security/headers.rs`
**Código atual:**
```rust
headers.insert("X-Content-Type-Options", "nosniff");
headers.insert("X-Frame-Options", "DENY");
headers.insert("X-XSS-Protection", "1; mode=block");
```

**Impacto:**
- Sem CSP, qualquer XSS no frontend permite ao atacante executar scripts arbitrários, exfiltrar dados, redirecionar o usuário, etc.
- Headers básicos (X-XSS-Protection) são obsoletos e não substituem CSP

**Gravidade:** CRÍTICA — combinada com #1, permite exploração completa

**Como corrigir:** Adicionar header CSP com diretivas restritivas. Exemplo:
```
Content-Security-Policy: default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https://images.unsplash.com;
  connect-src 'self' http://127.0.0.1:8787;
```

---

## 🟠 ALTA #3: Admin sem rate limiting / lockout

**Arquivo:** `src/pages/Admin.tsx`

**Impacto:**
- Nenhum limite de tentativas de login — ataque de força bruta ilimitado contra `admin123`
- Sem lockout após N tentativas falhas

**Gravidade:** ALTA — força bruta viável em segundos via script

**Como corrigir:** Adicionar contagem de tentativas no frontend com lockout temporário, ou melhor, migrar auth para o backend Rust que já tem rate limiting.

---

## 🟠 ALTA #4: TOTP secret armazenado em texto plano

**Arquivo:** `backend/src/handlers/auth.rs`

**Impacto:**
- Se o banco SQLite for comprometido, todos os TOTP secrets são imediatamente legíveis

**Gravidade:** ALTA

**Como corrigir:** Criptografar o secret no banco usando uma chave derivada da master key.

---

## 🟡 MÉDIA #5: CORS inseguro

**Arquivo:** `server.py`

```python
self.send_header('Access-Control-Allow-Origin', '*')
self.send_header('Access-Control-Allow-Credentials', 'true')
```

**Impacto:** `Access-Control-Allow-Origin: *` combinado com `Credentials: true` é inválido e inseguro. Navegadores ignoram `*` com credentials, mas a configuração confusa pode levar a problemas.

**Como corrigir:** Especificar origens exatas ou remover `Allow-Credentials` quando usando `*`.

---

## 🟡 MÉDIA #6: HMAC inseguro

**Arquivo:** `backend/src/security/session.rs`

```rust
let expected = format!("{:x}", Sha256::digest(format!("{}{}", salt, input)));
```

**Impacto:** O HMAC caseiro (`SHA256(salt || input)`) é vulnerável a ataques de extensão de comprimento. Deveria usar `HMAC-SHA256` verdadeiro.

**Gravidade:** MÉDIA — ataque de extensão viável mas requer acesso à rede

**Como corrigir:** Usar `hmac::Hmac::<Sha256>::new_from_slice(key)` da crate `hmac`.
