# Auditoria de Segurança — Overcyber

> **Escopo:** todo o código do site — frontend (`src/**`), proxy (`server.py`) e backend Rust/Axum (`backend/src/**`, migrações, exemplos systemd/nginx).
> **Data:** 2026-10-01 · **Atualização:** correções aplicadas e validadas em 2026-10-01 — ver seção 6.
> **Método:** revisão manual de código (leitura estática), análise de fluxos de autenticação/autorização, tratamento de entrada/saída, configuração de cookies/CORS/headers, persistência e segredos. Não foi executado teste dinâmico de intrusão nesta rodada.

---

## 1. Resumo executivo

A base do projeto é sólida: senhas com Argon2id, sessões assinadas com HMAC-SHA256, CSRF double-submit, 2FA TOTP, PoW, rate limiting, queries parametrizadas (sem SQL injection) e conteúdo renderizado como texto pelo React (sem XSS refletido/armazenado nos fluxos atuais).

Foram encontradas **21 observações**, sendo **3 de severidade alta** e que devem ser corrigidas antes de expor o sistema publicamente.

| ID | Severidade | Título | Local |
|----|-----------|--------|-------|
| SEC-01 | 🔴 Alta | `ADMIN_BOOTSTRAP_PASSWORD` sobrescreve a senha do admin a cada reinício | `backend/src/db.rs` |
| SEC-02 | 🔴 Alta | `must_change_pw` não é aplicado no backend (senha default usável para tudo) | `backend/src/middleware/mod.rs`, `handlers/mod.rs` |
| SEC-03 | 🔴 Alta | Rate limiting global: proxy não repassa o IP real | `server.py`, `backend/src/middleware/mod.rs` |
| SEC-04 | 🟠 Média | Posts-fantasma: comentário cria `post` publicado com slug arbitrário | `backend/src/handlers/comments.rs` |
| SEC-05 | 🟠 Média | Cookies de sessão sem `Secure` / sem prefixo `__Host-` | `backend/src/security/session.rs` |
| SEC-06 | 🟠 Média | `data/` (`.session_secret`, `*.db`) fora do `.gitignore` | `.gitignore` |
| SEC-07 | 🟠 Média | E-mail do contato armazenado em claro (PII inconsistente) | `backend/src/handlers/contact.rs` |
| SEC-08 | 🟠 Média | Script de terceiro (`cdn.gpteng.co`) em produção + CSP permissiva | `index.html`, `server.py` |
| SEC-09 | 🟠 Média | Sem `Cache-Control: no-store` em respostas autenticadas | `backend/src` (todas as respostas) |
| SEC-10 | 🟡 Baixa | Sessão não valida vínculo IP/UA gravado no login | `backend/src/middleware/mod.rs` |
| SEC-11 | 🟡 Baixa | `/api/pow/challenge` sem rate limit (crescimento da tabela) | `backend/src/handlers/pow.rs` |
| SEC-12 | 🟡 Baixa | Comparação de expiração por string RFC3339 (frágil) | `backend/src/middleware/mod.rs` |
| SEC-13 | 🟡 Baixa | `migrate::import` sem validação/tamanho e com `INSERT` duplicável | `backend/src/handlers/migrate.rs` |
| SEC-14 | 🟡 Baixa | CORS não implementado apesar de documentado/dependência presente | `backend/src/main.rs`, `server.py` |
| SEC-15 | 🟡 Baixa | Falhas de login não são auditadas; sem backoff/bloqueio | `backend/src/handlers/auth.rs` |
| SEC-16 | 🟡 Baixa | Sessões expiradas nunca são limpas no banco | `backend/src` |
| SEC-17 | ⚪ Info | `sanitize()` ingênuo (ok hoje porque React escapa) | `backend/src/handlers/comments.rs` |
| SEC-18 | ⚪ Info | `dangerouslySetInnerHTML` em `chart.tsx` (sink único) | `src/components/ui/chart.tsx` |
| SEC-19 | ⚪ Info | `SameSite=Lax` em vez de `Strict` nos cookies | `backend/src/security/session.rs` |
| SEC-20 | ⚪ Info | Dificuldade de PoW baixa (14 bits) + sem lockout de TOTP | `backend/src/main.rs`, `handlers/auth.rs` |
| SEC-21 | ⚪ Info | `backend/target/` e `data/overcyper.db` (typo) sem higiene de repositório | `.gitignore`, `data/` |

---

## 2. Achados detalhados

### 🔴 SEC-01 — `ADMIN_BOOTSTRAP_PASSWORD` sobrescreve a senha a cada reinício

**Local:** `backend/src/db.rs` (`bootstrap_admin`, linhas ~53–78).

**Evidência:**
```rust
if exists > 0 {
    if let Some(pw) = password_override {
        if !pw.is_empty() {
            let current_hash = conn.query_row("SELECT password_hash FROM admin_user WHERE id=1", ...).ok();
            let needs_update = match &current_hash {
                Some(h) => !argon2id::verify(pw.as_bytes(), h),
                None => true,
            };
            if needs_update {
                // UPDATE admin_user SET password_hash=?1 ...
            }
        }
    }
    return Ok(());
}
```

**Impacto:** se `ADMIN_BOOTSTRAP_PASSWORD` permanecer definida no `EnvironmentFile`/systemd (prática comum), **todo reinício do serviço compara a senha atual com a variável e, se forem diferentes, regrava o hash de volta para a senha bootstrap**. O dono troca a senha no painel, reinicia o serviço (deploy, reboot, crash-restart) e a senha volta a ser a antiga (`admin123`, por exemplo). Isso anula a rotação de senha e mantém credenciais conhecidas válidas.

**Recomendação:** aplicar a variável **apenas na criação** (tabela vazia) e ignorá-la quando o admin já existir. Alternativamente, só sobrescrever se `must_change_pw = 1` e documentar que a variável deve ser removida após o primeiro boot.

---

### 🔴 SEC-02 — `must_change_pw` não é aplicado no backend

**Local:** `backend/src/middleware/mod.rs` (flag `must_change_pw` setada em `AuthUser`) e `backend/src/handlers/mod.rs` (rotas admin protegidas **somente** por `require_auth`).

**Impacto:** um admin criado com senha bootstrap (`must_change_pw = 1`) consegue executar **todas** as mutações (`PUT /api/about`, `POST /api/projects`, `POST /api/posts`, `POST /api/migrate/import`, moderação de comentários, etc.) sem nunca trocar a senha. O bloqueio existe só no frontend (`AdminBackendPanel` mostra `ChangePasswordForm`), o que não impede acesso direto à API. Combinado com SEC-01, a credencial default fica plenamente funcional.

**Recomendação:** no `require_auth`, ou em um guard específico, negar (ex.: `403 must_change_password`) qualquer rota que não seja `GET /auth/me`, `POST /auth/logout` e `POST /auth/change-password` enquanto `must_change_pw` for verdadeiro.

---

### 🔴 SEC-03 — Rate limiting global: o proxy não repassa o IP real

**Local:** `server.py` (`_proxy_request`, lista `fwd_headers`) e `backend/src/middleware/mod.rs` (`client_ip`).

**Evidência:** o proxy encaminha apenas `Cookie, X-CSRF-Token, Content-Type, Accept, Origin, Referer, User-Agent` — **não** encaminha `X-Forwarded-For`.

```python
for key in ["Cookie","X-CSRF-Token","Content-Type","Accept","Origin","Referer","User-Agent"]:
```

No backend:
```rust
pub fn client_ip(headers: &HeaderMap, fallback: SocketAddr) -> String {
    if let Some(v) = headers.get("x-forwarded-for") { ... }   // nunca vem do proxy
    fallback.ip().to_string()                                  // = 127.0.0.1 para TODOS
}
```

**Impacto:**
1. Todas as requisições vindas do proxy chegam como `127.0.0.1`. Os limites `login` (5/15 min), `cmt` (1/60 s), `cmt-day` (10/dia) e `contact` (3/h) tornam-se **globais** — não por usuário. Um único atacante esgota o limite e bloqueia o login/comentários de todo mundo (DoS de disponibilidade).
2. O `ip_hash` gravado em auditoria/comentários é sempre o mesmo, perdendo valor forense.
3. Como `client_ip()` confia cegamente no header `X-Forwarded-For`, **se o backend for exposto diretamente** (não só via proxy), qualquer cliente forja o IP e burla os limites.

**Recomendação:** o proxy deve enviar `X-Forwarded-For: <ip-do-cliente>` (idealmente combinado com `X-Real-IP`), e o backend deve só confiar no header quando a conexão vier de um proxy confiável. Mantenha `BIND_ADDR=127.0.0.1:8787`. Documentar no deploy.

---

### 🟠 SEC-04 — Posts-fantasma: comentário cria `post` publicado com slug arbitrário

**Local:** `backend/src/handlers/comments.rs` (`create`).

**Evidência:**
```rust
let post_id: String = match conn.query_row("SELECT id FROM posts WHERE slug=?1", [&slug], ...) {
    Ok(id) => id,
    Err(_) => {
        // Post não existe no backend → cria um stub para permitir comentários.
        conn.execute("INSERT INTO posts(id, slug, title, content, status, published_at, ...)
                      VALUES (?1,?2,?3,'','published',?4,?4,?4)", ...)?;
        id
    }
};
```

**Impacto:** qualquer visitante que acerte o PoW (dif. 14 = trivial) e respeite o rate limit de comentários pode criar **posts publicados vazios** com qualquer slug. Como `list_public` filtra `status='published'`, esses stubs **aparecem em `GET /api/posts` / na página `/blog`** (título = slug, conteúdo vazio). É um vetor de poluição de conteúdo/spam e de consumo de banco, e ainda amplia a superfície localStorage↔backend.

**Recomendação:** não criar stub. Se o slug não existir, retornar `404` (`AppError::NotFound`). Se o stub for realmente necessário para posts gerenciados no frontend, crie-o como `draft` (nunca publicado) ou desacople a listagem pública dos stubs.

---

### 🟠 SEC-05 — Cookies de sessão sem `Secure` / sem prefixo `__Host-`

**Local:** `backend/src/security/session.rs`.

```rust
"{SESSION_COOKIE}={value}; Path=/; HttpOnly; SameSite=Lax; Max-Age={max_age}"
"{CSRF_COOKIE}={value}; Path=/; SameSite=Lax; Max-Age={max_age}"
```

**Impacto:** em produção (HTTPS), a ausência de `Secure` permite que o cookie trafegue em HTTP caso haja downgrade/mixed content, expondo a sessão a sniffing. Sem prefixo `__Host-`, um subdomínio comprometido pode sobrescrever o cookie (cookie tossing).

**Recomendação:** emitir `Secure` sempre que `PUBLIC_ORIGIN` for `https://…` (ou sempre em produção) e considerar `__Host-` prefixado + `Path=/` sem `Domain`.

---

### 🟠 SEC-06 — `data/` (segredo de sessão e banco) fora do `.gitignore`

**Local:** `.gitignore` (não contém `data/`, `*.db`, `.session_secret`, `backend/target/`).

**Estado atual:** o repositório **não** versiona esses arquivos (`git ls-files data/` = vazio), então não há vazamento ativo. Porém um `git add .` incluiria `data/.session_secret` (chave HMAC para forjar cookies de sessão), `data/overcyber.db` (contém `contact_messages.email` em claro) e artefatos de build.

**Recomendação:** adicionar ao `.gitignore`:
```gitignore
data/
*.db
*.db-wal
*.db-shm
.session_secret
backend/target/
```

---

### 🟠 SEC-07 — E-mail do contato armazenado em claro (PII inconsistente)

**Local:** `backend/src/handlers/contact.rs` grava `email` em texto puro; `comments.rs` grava apenas `author_email_hash` (via `hash_pii`), e IPs são sempre hasheados.

**Impacto:** inconsistência de proteção de PII. Vazamento/backup do banco expõe diretamente os e-mails de quem usa o formulário de contato.

**Recomendação:** alinhar a política — armazenar hash (se o e-mail não precisa ser reenviado) ou cifrar em repouso. No mínimo, documentar a exceção e proteger o banco.

---

### 🟠 SEC-08 — Script de terceiro em produção + CSP permissiva/desatualizada

**Local:** `index.html` carrega `https://cdn.gpteng.co/gptengineer.js` (script do Lovable); `server.py` permite esse host no `script-src`.

**Impacto:** script de terceiro executado no contexto da página (risco de supply-chain / comprometimento do CDN). Não é necessário em produção. Além disso a CSP carece de `object-src 'none'`, `base-uri 'self'` e `frame-ancestors 'none'`, e contém `connect-src 'self' http://127.0.0.1:8787` (irrelevante/indesejado em produção).

**Recomendação:** remover o `<script>` do Lovable no build de produção (ex.: condicionar ao modo dev) e endurecer:
```text
script-src 'self';
object-src 'none';
base-uri 'self';
frame-ancestors 'none';
connect-src 'self';
```

---

### 🟠 SEC-09 — Respostas autenticadas sem `Cache-Control: no-store`

**Local:** backend não define `Cache-Control` em nenhuma resposta; o proxy só aplica cache a estáticos e `no-cache` a HTML.

**Impacto:** respostas sensíveis (`GET /api/contact/messages`, `GET /api/comments`, `GET /api/auth/me`) podem ser retidas por caches intermediários ou persistidas no disco do navegador.

**Recomendação:** aplicar `Cache-Control: no-store` a todas as respostas `/api/**` (middleware global).

---

### 🟡 SEC-10 — Sessão não valida vínculo IP/UA

O login grava `ip_hash`/`ua_hash` (`auth.rs`), mas `require_auth` nunca os confere. Um cookie roubado funciona de qualquer origem/dispositivo até expirar (30 min, com rolling). Recomendação: validar opcionalmente (ou pelo menos registrar divergência para auditoria).

---

### 🟡 SEC-11 — `/api/pow/challenge` sem rate limit

Cada `GET` insere uma linha em `pow_challenges`; o GC (`DELETE ... issued_at < now-10min`) só roda quando um novo desafio é emitido, mas o endpoint não é limitado — um cliente pode inflar a tabela rapidamente. Recomendação: `rate.check("pow:{ip}", …)`.

---

### 🟡 SEC-12 — Comparação de expiração por string

`middleware/mod.rs`: `if expires_at <= Utc::now().to_rfc3339()`. Depende de os dois strings terem exatamente o mesmo formato/offset (`+00:00`). É frágil; prefira epoch (i64) ou `DateTime::parse_from_rfc3339`.

---

### 🟡 SEC-13 — `migrate::import` sem validação

Admin-only, mas insere `about`/`resume`/`projects`/`posts` sem limites de tamanho, sem `validate()` de `PostInput`, e usa `INSERT` (não upsert) para projetos — reimportar duplica. Recomendação: reusar `posts::validate`, impor limites e usar upsert.

---

### 🟡 SEC-14 — CORS ausente apesar de documentado

`Cargo.toml` compila a feature `cors` do `tower-http` e `Config.public_origin` é carregado, mas **não há `CorsLayer`** em `main.rs`/`handlers`. `server.py` comenta "backend já trata CORS". Em dev com `VITE_API_BASE_URL=http://localhost:8787` o navegador bloqueia (cross-origin). Em produção é same-origin, então não é explorável — mas a documentação está incorreta. Recomendação: implementar `CorsLayer` restrito a `public_origin` **ou** remover a dependência e corrigir os docs.

---

### 🟡 SEC-15 / SEC-16 — Auditoria e ciclo de vida de sessão

- `audit_log` registra apenas login bem-sucedido (`auth.rs`); falhas de autenticação não são registradas e não há backoff progressivo além do rate limit.
- Linhas de `sessions` expiradas permanecem no banco indefinidamente; não há "logout de todas as sessões".

Recomendação: auditar falhas de login/TOTP, adicionar backoff, job de limpeza de sessões e endpoint de revogação global.

---

### ⚪ SEC-17 a SEC-21 — Informativo

- **SEC-17:** `sanitize()` remove tags de forma ingênua. Hoje não há risco porque o React renderiza comentários como texto (`{c.body}`), mas a função é insuficiente se algum dia o conteúdo for servido como HTML. Mantenha a regra "nunca renderizar conteúdo de usuário como HTML".
- **SEC-18:** `src/components/ui/chart.tsx` usa `dangerouslySetInnerHTML` (padrão shadcn) — é o único sink de HTML. Garanta que `chartConfig` nunca receba dados de usuário.
- **SEC-19:** cookies usam `SameSite=Lax`. Recomendação: `Strict` para o painel admin (o CSRF double-submit já protege mutações).
- **SEC-20:** PoW com 14 bits (~16k hashes) é trivial para bots; a proteção real vem do rate limit. Considere elevar a dificuldade ou tornar adaptativa. O TOTP não tem limite próprio de tentativas (coberto pelo rate limit de login, hoje global — ver SEC-03).
- **SEC-21:** remover `backend/target/` e o arquivo com typo `data/overcyper.db` do repositório/ignorados.

---

## 3. Pontos fortes verificados (manter)

- **Sem SQL injection:** todas as queries usam bind params (`params![]`/`[...]`), nunca interpolação de string.
- **Sem XSS nos fluxos atuais:** posts, comentários, sobre e projetos são renderizados como nós de texto React; `content` é quebrado por linhas (`formatContent`), sem `innerHTML`.
- **Senhas:** Argon2id (m=64 MiB, t=3, p=1).
- **Sessão:** token opaco de 24 bytes em hex + cookie assinado com HMAC-SHA256 e comparação constant-time (`subtle::ConstantTimeEq`).
- **CSRF:** double-submit cookie (`csrf` + header `X-CSRF-Token`) exigido em métodos mutáveis, com comparação constant-time.
- **Autorização:** rotas admin protegidas por `require_auth`; rotas públicas não expõem drafts (`list_public` filtra `status='published'`).
- **Anti-abuso público:** PoW de uso único (`used_at`) + honeypot + rate limits + hashing de IP/e-mail.
- **Headers de segurança** no backend (`headers.rs`) e no proxy (`server.py`).
- **systemd hardening** exemplar (`NoNewPrivileges`, `ProtectSystem=strict`, `DynamicUser`, etc.).
- **Erro interno** não vaza detalhes ao cliente (`error.rs` retorna `"internal"` e loga o detalhe).

---

## 4. Ordem de correção sugerida

1. **SEC-01, SEC-02, SEC-03, SEC-04** — bloqueiam exposição segura (pré-produção).
2. **SEC-05, SEC-06, SEC-08, SEC-09** — hardening de sessão, segredos, CSP e cache.
3. **SEC-07, SEC-10…SEC-16** — privacidade, CORS, auditoria e robustez.
4. **SEC-17…SEC-21** — higiene e consistência.

## 5. Checklist de validação das correções

- [x] Reiniciar o serviço com `ADMIN_BOOTSTRAP_PASSWORD` definida **não** altera a senha já trocada.
- [x] `PUT /api/about` com sessão de admin `must_change_pw=1` retorna `403` (corpo `must_change_password`).
- [x] IPs passam a ser distintos por cliente (`X-Forwarded-For` real via proxy; header do cliente descartado sem proxy).
- [x] `POST /api/posts/slug-inexistente/comments` retorna `404` e **não** cria post.
- [x] Cookie de sessão contém `Secure` (com `PUBLIC_ORIGIN=https://…`), `HttpOnly` e `SameSite=Strict`.
- [x] `git status` não mostra `data/`, `*.db` nem `.session_secret` após `git add .`.
- [x] Respostas `/api/**` trazem `Cache-Control: no-store`.
- [x] CSP de produção não inclui CDNs de terceiros nem `127.0.0.1:8787`.

## 6. Registro das correções aplicadas (2026-10-01)

Todas as correções foram implementadas e validadas por smoke tests (curl + Node) contra o backend compilado em release e o proxy Python.

| ID | Correção aplicada | Arquivos | Verificação |
|----|-------------------|----------|-------------|
| SEC-01 | `ADMIN_BOOTSTRAP_PASSWORD` só é aplicada na **criação** do admin; restart nunca reseta a senha | `backend/src/db.rs` | Troca de senha → restart com a variável → login antigo `401`, senha nova `200` |
| SEC-02 | `must_change_pw=1` bloqueia mutações com `403 must_change_password`; liberadas apenas `GET /auth/me`, `POST /auth/logout`, `POST /auth/change-password` | `backend/src/middleware/mod.rs`, `backend/src/error.rs` | `PUT /api/about` → `403`; após trocar senha → `200` |
| SEC-03 | Proxy envia `X-Forwarded-For`/`X-Real-IP` com o IP da conexão (header do cliente descartado; `TRUST_PROXY=1` encadeia quando atrás do Nginx). Backend só confia no header de conexões loopback | `server.py`, `backend/src/middleware/mod.rs` | XFF falsificado pelo cliente não chega ao backend |
| SEC-04 | Comentário em slug inexistente → `404`; sem criação de stub. Stubs legados do banco movidos para `draft` | `backend/src/handlers/comments.rs`, `data/overcyber.db` | `404` confirmado; `/api/posts` sem posts-fantasma |
| SEC-05 | `Secure` adicionado aos cookies quando `PUBLIC_ORIGIN` é `https://…` (middleware dedicado) | `backend/src/security/session_cookie_security.rs` (novo), `backend/src/main.rs` | `Set-Cookie …; Secure` com `PUBLIC_ORIGIN=https://…` |
| SEC-06/21 | `.gitignore` com `data/`, `*.db*`, `.session_secret`, `backend/target/` | `.gitignore` | Padrões presentes |
| SEC-07 | E-mail do contato cifrado em repouso (AES-256-GCM, chave derivada do `SESSION_SECRET`; fallback de leitura para legados em claro) | `backend/src/security/crypto.rs` (novo), `backend/src/handlers/contact.rs`, `backend/Cargo.toml` | Banco mostra `v1:gc1:…`; inbox admin exibe o e-mail correto; teste unitário `crypto::roundtrip` ok |
| SEC-08 | Script de terceiros removido do `index.html`; CSP sem hosts de terceiros, com `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'` e `connect-src 'self'` | `index.html`, `server.py` | `dist/index.html` sem scripts externos |
| SEC-09 | `Cache-Control: no-store` em todas as respostas do backend | `backend/src/security/headers.rs` | Header presente em `/api/*` |
| SEC-10 | `require_auth` registra log de divergência de IP da sessão (evidência forense) | `backend/src/middleware/mod.rs` | Log `divergência de IP na sessão` gerado |
| SEC-11 | Rate limit 60/min por IP em `GET /api/pow/challenge` | `backend/src/handlers/pow.rs` | 61ª chamada → `429` |
| SEC-12 | Expiração de sessão comparada via `DateTime::parse_from_rfc3339` | `backend/src/middleware/mod.rs` | Compilação + fluxo de sessão ok |
| SEC-13 | `/api/migrate/import`: máx. 500 projetos / 1.000 posts / 100 kB em `about`; valida slug/título/tamanho de post; projetos sem duplicação por título | `backend/src/handlers/migrate.rs` | 501 projetos → `400`; reimport não duplica; slug inválido ignorado |
| SEC-14 | `CorsLayer` restrito a `PUBLIC_ORIGIN` (origem, métodos GET/POST/PUT/DELETE, headers `content-type`/`x-csrf-token`, credentials) | `backend/src/main.rs` | Preflight `Origin: http://localhost:5173` reflete origem e methods |
| SEC-15 | Falhas de login (usuário inexistente / senha errada / TOTP) registradas em `audit_log` | `backend/src/handlers/auth.rs` | `login_failed_bad_password` no `audit_log` |
| SEC-16 | Sessões expiradas removidas no login | `backend/src/handlers/auth.rs` | Sessão expirada inserida à mão foi apagada no próximo login |
| SEC-19 | Cookies com `SameSite=Strict` | `backend/src/security/session.rs` | `Set-Cookie … SameSite=Strict` |
| SEC-20 | PoW elevado de 14 para **18 bits**, configurável via `POW_DIFFICULTY_BITS` | `backend/src/main.rs` | `difficulty=18` no desafio; resolução em ~150–400 ms no cliente |

**Observação de comportamento (SEC-04):** posts gerenciados pelo frontend via localStorage **não** aceitam mais comentários enquanto não existirem no backend como `published` (crie-os pelo painel Admin → aba BACKEND ou use `MIGRAR`).

**Pendências (informativas):** SEC-17/SEC-18 seguem como diretrizes (não renderizar HTML de usuário; `chartConfig` sem dado de usuário). Sincronização total localStorage→backend permanece na Fase 3 do plano (`FILES.md`).
