# 21 - Suporte Completo a Campos de Projetos, README via API e Registro do CyberGuardian

## 1. Visão Geral das Alterações

Foi implementado o suporte integral a todos os metadados de projetos e à manipulação direta de `README.md` via API REST, com suporte tanto a IDs numéricos quanto a **slugs amigáveis** (ex.: `cyberguardian`), além da inserção/sincronização do projeto histórico **CyberGuardian**.

---

## 2. Novos Campos Suportados

A tabela `projects` e os modelos Pydantic da API agora suportam oficialmente:

| Campo | Tipo | Descrição |
|---|---|---|
| `slug` | String | Identificador amigável em URLs (ex: `"cyberguardian"`) |
| `title` | String | Título completo do projeto |
| `description` | String | Descrição detalhada da pesquisa/projeto |
| `tags` | Array ou String | Lista de tags (`["Cybersecurity", "AI", ...]`) ou separada por vírgula |
| `github` | String | URL do repositório GitHub |
| `live` | String | URL de demonstração ou aplicação ao vivo (opcional) |
| `stars` | Integer | Quantidade de estrelas |
| `forks` | Integer | Quantidade de forks |
| `visibility` | String | `"public"` ou `"private"` |
| `status` | String | Status/fase do projeto (ex: `"Protótipo histórico / predecessor da arquitetura atual"`) |
| `source_repos` | Array ou String | Lista de repositórios fonte (`["overcyber/CyberGuardian"]`) |
| `readme` | String | Conteúdo completo em Markdown do README |
| `ord` | Integer | Ordem de exibição |

---

## 3. Endpoints Disponíveis

Base URL Remota: `https://overcyber.online/gateway`
Header obrigatório para mutações e leitura autenticada: `Authorization: Bearer <TOKEN>`

### 3.1. Obter Detalhes do Projeto por Slug ou ID
```bash
# Por slug:
curl -s -H "Authorization: Bearer ovc_c5r_jMvyDuBRE48_kaFo1WtqeDiSZ14Mjy3RXFhNe88" \
  https://overcyber.online/gateway/api/projects/cyberguardian

# Por ID numérico:
curl -s -H "Authorization: Bearer ovc_c5r_jMvyDuBRE48_kaFo1WtqeDiSZ14Mjy3RXFhNe88" \
  https://overcyber.online/gateway/api/projects/5
```

### 3.2. Obter Apenas o README de um Projeto
```bash
curl -s -H "Authorization: Bearer ovc_c5r_jMvyDuBRE48_kaFo1WtqeDiSZ14Mjy3RXFhNe88" \
  https://overcyber.online/gateway/api/projects/cyberguardian/readme
```

### 3.3. Alterar o README Enviando JSON
```bash
curl -s -X PUT https://overcyber.online/gateway/api/projects/cyberguardian/readme \
  -H "Authorization: Bearer ovc_c5r_jMvyDuBRE48_kaFo1WtqeDiSZ14Mjy3RXFhNe88" \
  -H "Content-Type: application/json" \
  -d '{
    "readme": "# NOVO TITULO DO README\n\nConteudo atualizado via JSON."
  }'
```

### 3.4. Alterar o README Enviando Markdown / Texto Puro Diretamente
É possível enviar o arquivo `.md` bruto sem precisar escapar caracteres:
```bash
curl -s -X PUT https://overcyber.online/gateway/api/projects/cyberguardian/readme \
  -H "Authorization: Bearer ovc_c5r_jMvyDuBRE48_kaFo1WtqeDiSZ14Mjy3RXFhNe88" \
  -H "Content-Type: text/markdown" \
  --data-binary @README.md
```

Ou via string inline:
```bash
curl -s -X PUT https://overcyber.online/gateway/api/projects/cyberguardian/readme \
  -H "Authorization: Bearer ovc_c5r_jMvyDuBRE48_kaFo1WtqeDiSZ14Mjy3RXFhNe88" \
  -H "Content-Type: text/markdown" \
  --data-binary $'# CYBERGUARDIAN\n\nTexto do README em markdown puro.'
```

### 3.5. Criar Projeto Completo com Todos os Campos
```bash
curl -s -X POST https://overcyber.online/gateway/api/projects \
  -H "Authorization: Bearer ovc_c5r_jMvyDuBRE48_kaFo1WtqeDiSZ14Mjy3RXFhNe88" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "cyberguardian",
    "title": "CyberGuardian -- Early Adversarial Cybersecurity Research",
    "description": "Primeira geração da linha de pesquisa de doutorado em Red-vs-Blue MARL, com arquitetura Docker, CybORG-inspired environment, MADDPG, MAPPO/CTDE e self-play.",
    "tags": ["Cybersecurity", "AI", "Research", "MARL", "Legacy", "CybORG"],
    "github": "https://github.com/overcyber/CyberGuardian",
    "live": "",
    "stars": 0,
    "forks": 0,
    "visibility": "private",
    "status": "Protótipo histórico / predecessor da arquitetura atual",
    "source_repos": ["overcyber/CyberGuardian"],
    "readme": "# CYBERGUARDIAN // EARLY ADVERSARIAL CYBERSECURITY RESEARCH\n\nPrimeira geração..."
  }'
```

### 3.6. Atualizar Metadados de um Projeto
```bash
curl -s -X PUT https://overcyber.online/gateway/api/projects/cyberguardian \
  -H "Authorization: Bearer ovc_c5r_jMvyDuBRE48_kaFo1WtqeDiSZ14Mjy3RXFhNe88" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Fase de transição para o novo núcleo Overcyber",
    "stars": 5
  }'
```

---

## 4. Frontend e Interface do Usuário

No arquivo [Projects.tsx](file:///llm/overcyber-reloaded-neon/src/pages/Projects.tsx):
- Renderização condicional da imagem: cards de projetos sem imagem não exibem quebra de layout.
- Badges adicionados para `status` (em destaque neon laranja) e para `visibility: private` (em vermelho neon restrito).
- Suporte a tags enviadas tanto como listas serializadas quanto strings separadas por vírgula.
- Exibição inline expansível do `README.md` estilizado para terminal cyberpunk.

---

## 5. Validações e Testes Executados

1. **Python Syntax Validation:** Executado `python3 -m py_compile` em todos os scripts Python (`fastapi_service/*.py`) localmente e no servidor remoto.
2. **Build do Frontend:** Executado `npm run build` localmente e no servidor remoto (`dist/assets/index-DIqsTL2R.js`).
3. **Testes Reais HTTP no Host Remoto:**
   - `GET /gateway/api/projects/cyberguardian` -> HTTP 200 OK
   - `GET /gateway/api/projects/cyberguardian/readme` -> HTTP 200 OK
   - `PUT /gateway/api/projects/cyberguardian/readme` (JSON) -> HTTP 200 OK
   - `PUT /gateway/api/projects/cyberguardian/readme` (Raw Text) -> HTTP 200 OK
   - `GET /projects` -> HTTP 200 OK
