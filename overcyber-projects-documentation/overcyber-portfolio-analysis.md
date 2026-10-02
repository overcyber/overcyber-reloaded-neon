# Análise do portfólio OverCyber e proposta editorial para `/projects`

**Data da análise:** 2026-10-01  
**Escopo:** `overcyber.online/projects`, `overcyber.online/blog` e os 18 repositórios informados.

## 1. Como `/projects` realmente funciona

A implementação atual usa o título de layout **`PROJECTS DATABASE`** e exibe os projetos como registros técnicos em cards. Cada registro tem:

- imagem em proporção 16:9;
- título monoespaçado;
- descrição curta;
- tags;
- métricas de stars/forks;
- botão GitHub;
- botão opcional de demo;
- botão **Show README / Hide README**, que expande documentação textual dentro do próprio card.

O modelo de dados observado no código é:

```text
title
description
tags[]
image
github
live
stars
forks
readme
ord
```

Essa estrutura pede duas camadas editoriais diferentes:

1. **Card:** 1 frase forte, técnica e verificável.
2. **README expandido:** arquitetura, capacidades, stack, estado de maturidade, validação e limites.

## 2. Linguagem visual

O site usa estética terminal/cyberpunk:

- `Orbitron` para headings;
- `Share Tech Mono`/fontes monoespaçadas para interface e conteúdo;
- tema escuro com fundo quase preto/navy, verde neon e acento laranja;
- tema claro com variação dourada;
- bordas retas, aparência de terminal e scanlines;
- labels operacionais como `DATABASE`, `ARCHIVE`, `DATA ENTRY`, `REF_ID`.

A documentação criada neste pacote segue essa linguagem sem transformar os textos em marketing vazio: títulos curtos, blocos `STATUS / DOMAIN`, arquitetura em ASCII e afirmações separadas por maturidade.

## 3. Como `/blog` complementa `/projects`

O blog é tratado como **`DATALOG` / archive**. Cards usam referência, data, excerpt e `ACCESS DATA`. O post individual usa `DATA ENTRY`, `IMAGE_REF`, `REF_ID` e conteúdo monoespaçado.

Isso sugere uma divisão coerente:

- `/projects` = **o que foi construído**;
- `/blog` = **por que foi construído, experimentos, decisões e resultados**.

Projetos complexos como QSim, OSCEN, Adversarial CyberSec e Crypto Monitor deveriam ter cards concisos em `/projects` e artigos de engenharia separados em `/blog`.

## 4. Problema atual nos filtros de Projects

O código atual calcula tags únicas e usa apenas as **três primeiras** como tabs. Como a ordem vem dos projetos, as tags do primeiro card podem definir toda a navegação.

A ordenação proposta neste pacote começa por `Adversarial CyberSec` com:

```text
Cybersecurity / AI / Research
```

Assim, sem alterar o frontend, as tabs ficam suficientemente amplas.

A correção estrutural preferível é separar `category` de `tags` ou definir tabs curadas estaticamente.

## 5. Consolidação dos 18 repositórios em 14 entradas

| Entrada de portfólio | Repositórios | Tratamento |
|---|---|---|
| Adversarial CyberSec | `adve-c-sec-tese` | projeto principal atual da linha MARL |
| Red-MPPO Evaluation | `red-MPPO-testing_full`, `red-MPPO-testing_model` | uma única entrada |
| CyberGuardian | `CyberGuardian` | predecessor histórico |
| Ruadan | `ruadan`, `ruadan-control-panel` | CLI + painel experimental |
| AEGIS Architecture Viewer | `aegis-architecture`, `aegis-architecture-viewer`, `aegis-refatora-o` | viewer + blueprint; refatoração vazia |
| Crypto Monitor | `crypto-monitor-platform` | entrada própria |
| Docling Qdrant RAG Harness | `docling-qdrant-rag-harness` | entrada própria |
| NEXUS / Multi-Agent Course | `minicurso-mult-agents` | curso + lab |
| Artemis NetFlow | `artemis-netflow` | entrada própria |
| Gemini SuperBrain Memory | `gemini-superbrain-memory` | entrada própria |
| NeoAlice + SuperBrain | `neoalice-superbrain` | entrada própria |
| OSCEN | `OSCEN` | entrada própria |
| QSim | `qsim` | entrada própria |
| Unknown-SO | `Unknown-SO` | arquivo legado/curadoria |

## 6. Pontos de maturidade que não devem ser escondidos

### AEGIS

A aplicação e o viewer existem, mas a documentação de infraestrutura contém exemplos/scaffolding de threat intel, compliance e outras integrações. O card não deve afirmar que todo o blueprint está operacional.

### Ruadan Control Panel

O frontend existe e modela configuração, console, logs e status, porém o próprio código indica que parte da execução é simulada quando não há backend real. Deve aparecer como **painel experimental**.

### OSCEN

O repo já contém código, Docker, modelos e experimentos GPU/NPU, mas vários objetivos do planejamento — escala, latência, validação em hardware neuromórfico — são metas de pesquisa. Não publicar esses targets como resultados concluídos.

### QSim

O planejamento reporta fases 1–4 entregues e várias suites de teste. A fase de aceleradores específicos está explicitamente em validação no hardware e deve continuar marcada assim.

### Unknown-SO

O repositório é curadoria histórica e afirma explicitamente que nem todos os artefatos são autoria própria. O texto público deve preservar crédito/proveniência e evitar apresentar hardening antigo como recomendação universal atual.

## 7. Privacidade/publicação

Vários repositórios são privados. Um botão GitHub público apontando para um repo privado gera uma experiência ruim para visitantes sem acesso.

Opções recomendadas:

- publicar apenas o card e remover/ocultar o botão GitHub para projetos privados;
- criar um mirror documental público sem código sensível;
- adicionar ao schema um campo `visibility` / `githubPublic`;
- alterar o componente para só renderizar o botão GitHub quando `github` for público.

O JSON incluído preserva os URLs fornecidos para rastreabilidade, mas essa decisão deve ser tomada antes do deploy público.

## 8. Imagens

O JSON usa caminhos locais:

```text
/projects/<slug>.webp
```

Isso evita hotlinks frágeis e problemas com OpenGraph de repositórios privados. Os assets ainda precisam ser adicionados ao diretório público do site.

## 9. Arquivos deste pacote

- `projects-overcyber-site-ready-ptbr.json` — payload no formato do Projects atual.
- `projects-audit-manifest.json` — status, visibilidade e repos de origem.
- `project-readmes/*.md` — documentação individual de cada entrada.
- `README-IMPORT.md` — notas para integrar ao site.
