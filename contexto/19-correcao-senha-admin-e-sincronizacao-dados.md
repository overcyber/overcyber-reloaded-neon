# 19 - Resolução da Senha do Admin e Sincronização Completa de Dados

## Data e Ambiente
- **Data:** 01/10/2026
- **Host Remoto:** `ubuntu@168.75.94.233`
- **Domínio:** `https://overcyber.online`

---

## 1. Problemas Identificados e Causas Raiz

### 1.1. Senha do Admin (`Tempo#2026SenhaForte2`)
- **Causa Raiz:** Ao atualizar o banco via SSH com comando `sqlite3` dentro de aspas duplas, o Bash interpretou os caracteres `$` do hash Argon2id (`$argon2id$v=19$m=...`) como variáveis de ambiente, resultando em uma string corrompida no banco de dados (`=19=65536,...`).
- **Solução:**
  - Gerado hash Argon2id exato para a senha `Tempo#2026SenhaForte2` via rotina nativa Rust:
    `$argon2id$v=19$m=65536,t=3,p=1$HP2Zpnx/JWEOj/ue+fgIAw$yxdcXEjwEERSsNZJ8fl5gW4NRsz/aciwHpQeMXKCD0A`
  - Inserido no banco remoto e local utilizando Python parametrizado para garantir escape absoluto de caracteres especiais sem expansão de shell.
  - Testado login via `POST https://overcyber.online/api/auth/login`: **HTTP 200 OK** com geração dos cookies `sid` e `csrf`.

### 1.2. Erro "API retornou resposta não-JSON (1/3 attempts)"
- **Causa Raiz:** Antes do reload do Nginx, requisições POST para `/api/auth/login` caíam no fallback SPA retornando `405 Method Not Allowed` em formato HTML. O método `api()` lançava `API retornou resposta não-JSON`.
- **Solução:**
  - Ajustado `src/lib/api.ts` para tratar respostas não-OK com extração do erro real (`await res.text()` ou `await res.json()`), status `204 No Content` com retorno nulo sem erro, e rejeição de HTML apenas em respostas de sucesso indevido (SPA fallback).

### 1.3. Dados do Perfil (`/about`)
- **Causa Raiz:** A tabela `about` no banco continha apenas `{"name":"x"}`. No componente `About.tsx`, ao receber `{"name":"x"}`, o estado substituía o perfil inteiro, apagando título, biografia, foto, e-mail e focos de pesquisa.
- **Solução:**
  - Atualizado `seed_db_full.py` com o perfil completo e oficial de Claudio Henrique Marques de Oliveira.
  - Atualizado `About.tsx` com merge defensivo para garantir que campos vitais nunca sejam sobrescritos por valores vazios.

### 1.4. Projetos (`/projects`)
- **Causa Raiz:**
  - No banco de dados, a tabela `projects` possuía apenas um registro de teste `Projeto Duplicado Teste`.
  - No frontend `Projects.tsx`, o componente não buscava `/api/projects` via fetch e esperava `project.tags` estritamente como array. Como o backend armazena tags como string separada por vírgula, chamadas a `project.tags.some()` podiam falhar.
- **Solução:**
  - Populados no banco SQLite os 3 projetos reais: **NeuraScan**, **CyberShield** e **QuantumCrypt**.
  - Adicionado fetch reativo em `Projects.tsx` para sincronizar com `/api/projects` com normalização de tags (`string -> string[]`).

---

## 2. Validação dos Testes

- `POST https://overcyber.online/api/auth/login` (admin + Tempo#2026SenhaForte2) -> **HTTP 200 OK**
- `GET https://overcyber.online/api/about` -> **HTTP 200 OK** com dados completos de Claudio Henrique
- `GET https://overcyber.online/api/projects` -> **HTTP 200 OK** (NeuraScan, CyberShield, QuantumCrypt)
- `GET https://overcyber.online/api/posts` -> **HTTP 200 OK** (3 postagens publicadas)
- Build remoto Vite gerado: `index-B36c5hF3.js` (HTTP 200)
- Páginas `/about`, `/blog`, `/projects`, `/admin` -> **HTTP 200 OK**
