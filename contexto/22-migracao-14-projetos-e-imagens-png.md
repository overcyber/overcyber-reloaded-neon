# 22 - Migração Completa dos 14 Projetos, Backup e Disponibilização de Imagens PNG

## 1. Visão Geral da Operação

Conforme solicitado:
1. Foi realizado **backup completo** dos bancos de dados e dos projetos existentes (local e remoto) antes de qualquer exclusão.
2. Todas as 14 imagens `.png` (e versões otimizadas `.webp`) foram salvas diretamente nos diretórios públicos do servidor (`public/projects/` e `dist/projects/`).
3. Foi verificado via requisição HTTP que todas as imagens retornam `HTTP 200` diretamente pelo Nginx antes da execução das chamadas da API.
4. Os 4 projetos antigos foram removidos via endpoint `DELETE /api/projects/{id}`.
5. Os 14 novos projetos documentados em `projects-overcyber-site-ready-ptbr.json` e auditados em `projects-audit-manifest.json` foram cadastrados via `POST /api/projects` com suas respectivas imagens `.png`, metadados de visibilidade, status, repositórios fonte e READMEs completos.

---

## 2. Registro dos Backups Realizados

### Backup no Host Remoto (`168.75.94.233`):
- **Banco SQLite:** `/var/www/overcyber-dev/data/backups/overcyber_before_14_projects_20261002_012454.db`
- **Exportação JSON dos Projetos:** `/var/www/overcyber-dev/data/backups/projects_backup_20261002_012454.json`

### Backup no Ambiente Local:
- **Banco SQLite:** `/llm/overcyber-reloaded-neon/data/backups/overcyber_before_14_projects_20261001_222448.db`
- **Exportação JSON dos Projetos:** `/llm/overcyber-reloaded-neon/data/backups/projects_backup_20261001_222448.json`

---

## 3. Mapeamento das Imagens PNG no Servidor

Todas as imagens estão publicamente acessíveis sob a raiz `/projects/`:

| # | Slug do Projeto | Imagem Vinculada | Status HTTP |
|---|---|---|---|
| 1 | `adversarial-cybersec` | `/projects/adversarial.png` | 200 OK |
| 2 | `neoalice-superbrain` | `/projects/neoalice_superbrain.png` | 200 OK |
| 3 | `qsim` | `/projects/qsim.png` | 200 OK |
| 4 | `crypto-monitor-platform` | `/projects/cryptomonitorplatform.png` | 200 OK |
| 5 | `docling-qdrant-rag-harness` | `/projects/doclingqdranharness.png` | 200 OK |
| 6 | `oscen` | `/projects/oscen.png` | 200 OK |
| 7 | `red-mppo-evaluation` | `/projects/red_mppo_evaluationharness.png` | 200 OK |
| 8 | `ruadan` | `/projects/ruadan.png` | 200 OK |
| 9 | `aegis-architecture` | `/projects/aegis.png` | 200 OK |
| 10 | `gemini-superbrain-memory` | `/projects/gemini-superbrain-memory.png` | 200 OK |
| 11 | `artemis-netflow` | `/projects/artemis.png` | 200 OK |
| 12 | `minicurso-multiagents` | `/projects/nexus-minicurso-mult-agents.png` | 200 OK |
| 13 | `cyberguardian` | `/projects/cyberguardian.png` | 200 OK |
| 14 | `unknown-so` | `/projects/unknown-so.png` | 200 OK |

---

## 4. Relação dos 14 Projetos Cadastrados

1. **Adversarial CyberSec — Coevolutionary Cyber MARL** (ord: 1, vis: private)
2. **NeoAlice + SuperBrain — Persistent Cognitive Agent** (ord: 2, vis: private)
3. **QSim — Distributed Quantum Simulation Platform** (ord: 3, vis: public)
4. **Crypto Monitor Platform — Streaming Market Analytics** (ord: 4, vis: public)
5. **Docling Qdrant RAG Harness — Advanced Retrieval Infrastructure** (ord: 5, vis: public)
6. **OSCEN — Open Source Cognitive Embodied Neuromorphic** (ord: 6, vis: private)
7. **Red-MPPO Evaluation Harness — Auditable Autonomous Security Research** (ord: 7, vis: private)
8. **Ruadan — Adaptive Kali Enumeration Orchestrator** (ord: 8, vis: public + private companion)
9. **AEGIS Architecture Viewer — Cyber Defense System Model** (ord: 9, vis: private)
10. **Gemini SuperBrain Memory — Persistent Memory Extension** (ord: 10, vis: public)
11. **Artemis NetFlow — Interactive Flow Analysis Workbench** (ord: 11, vis: private)
12. **NEXUS — Local Multi-Agent Systems Course & Lab** (ord: 12, vis: public)
13. **CyberGuardian — Early Adversarial Cybersecurity Research** (ord: 13, vis: private)
14. **Unknown-SO — Linux Hardening & Privacy Research Archive** (ord: 14, vis: private)

---

## 5. Resposta sobre Compilação: Quando é necessário e quando NÃO é?

- **Para adicionar, alterar ou remover projetos, posts do blog, READMEs ou imagens:**  
  **NÃO PRECISA COMPILAR NADA.**  
  Os dados são persistidos no banco SQLite (`overcyber.db`) e consumidos dinamicamente pela API. As alterações via `curl` ou painel refletem **em tempo real** no site.

- **Para alterar o código Python do gateway FastAPI:**  
  **NÃO PRECISA COMPILAR.**  
  É Python interpretado. Basta recarregar o daemon (`systemctl restart overcyber-fastapi.service`), o que dura menos de 1 segundo.

- **Quando precisa compilar?**  
  Apenas quando houver alteração de arquitetura no código-fonte da aplicação:
  1. Componentes visuais do React (`.tsx`/`.css`) -> exige `npm run build`.
  2. Código nativo em Rust (`.rs`) -> exige `cargo build`.
