# Estado do Planejamento — 2026-10-01

## Diagnósticos Concluídos

### Backend Rust: ✅ COMPILA SEM ERROS
- `cargo check` retorna sucesso (apenas 1 warning de dead_code)
- O erro `r2d2_sqlite::r2d2_sqlite::rusqlite::Connection` mencionado pelo usuário **já foi corrigido** pela IA anterior
- Binário release existe em `backend/target/release/overcyber-backend` (5.7MB)
- Todas as 21 correções de segurança (SEC-01 a SEC-21) implementadas

### Frontend: ⚠️ BUGS IDENTIFICADOS
1. **Moldura CSS:** `body::before` (absolute) vs corners (fixed) = desalinhamento ao scroll
2. **Admin schemas Zod:** `profileSchema` tem todos os campos obrigatórios (min validators)
3. **Sem UI para sections visibility:** Backend tem `GET/PUT /api/sections` pronto, mas Admin não tem toggle
4. **Sem FastAPI gateway:** Não existe camada de automação por token

### Endpoints do Backend Rust Disponíveis
- Auth: login, me, logout, change-password, setup-2fa, verify-2fa, disable-2fa
- Content: about (GET/PUT), resume (GET, PUT/:section), projects (CRUD), posts (CRUD)
- Moderação: comments (list, approve, reject, spam, delete)
- Contato: contact/messages (list, mark-read, delete)
- Config: sections (GET/PUT), pow/challenge, migrate/import

## Plano Aprovado (Aguardando)
- Ver: plano-correcoes-e-features.md no diretório de artefatos
- 5 frentes: CSS fix, campos opcionais, visibility toggles, FastAPI, API comments/messages
