# Publicação das 3 Postagens no Blog via API REST e Comandos Completos

**Data:** 02/10/2026  
**Status:** Publicado com Sucesso em Produção (`https://overcyber.online`)  
**Método:** Exclusivamente via API REST (`POST /api/posts`) com autenticação Bearer Token

---

## 1. Imagens Geradas e Hospedadas

Para cada um dos três artigos, foi gerada uma imagem no estilo visual cyberpunk/neon escuro do Overcyber, salva em `public/blog/` e servida estaticamente:

1. **Post 1 (Fine-tuning, LoRA, QLoRA e RAG):**
   - Arquivo: `public/blog/finetuning-lora-qlora-rag.jpg`
   - URL Pública: `https://overcyber.online/blog/finetuning-lora-qlora-rag.jpg`
   - Descrição: Decomposição matricial LoRA e adaptação de pesos de redes neurais com interfaces holográficas verde-neon e ciano.

2. **Post 2 (Jev e Laya - Modelos de Decisão):**
   - Arquivo: `public/blog/jev-laya-decision-models.jpg`
   - URL Pública: `https://overcyber.online/blog/jev-laya-decision-models.jpg`
   - Descrição: Interface HUD de roteamento probabilístico ultrarrápido e grafos determinísticos de decisão em roxo e ciano elétrico.

3. **Post 3 (Oito Arquiteturas de RAG):**
   - Arquivo: `public/blog/oito-arquiteturas-rag.jpg`
   - URL Pública: `https://overcyber.online/blog/oito-arquiteturas-rag.jpg`
   - Descrição: Arquitetura holística de recuperação de informação, knowledge graphs multidimensionais, embeddings vetoriais e agentes autônomos.

---

## 2. Comandos Curl Completos para Publicação via API

Abaixo estão os comandos `curl` exatos e completos utilizados para publicar cada um dos posts. O token de autorização utilizado é o token oficial de gerenciamento do gateway.

### 2.1 Post 1: Fine-tuning, LoRA, QLoRA ou RAG: qual técnica usar e quando

```bash
curl -X POST https://overcyber.online/api/posts \
  -H "Authorization: Bearer ovc_c5r_jMvyDuBRE48_kaFo1WtqeDiSZ14Mjy3RXFhNe88" \
  -H "Content-Type: application/json" \
  -d @- << 'EOF'
{
  "title": "Fine-tuning, LoRA, QLoRA ou RAG: qual técnica usar e quando",
  "slug": "finetuning-lora-qlora-rag-quando-usar",
  "excerpt": "Fine-tuning, LoRA, QLoRA e RAG resolvem problemas diferentes. Este guia separa adaptação de comportamento, conhecimento externo, custo computacional e manutenção para mostrar quando cada técnica faz sentido — e quando combiná-las.",
  "image": "/blog/finetuning-lora-qlora-rag.jpg",
  "status": "published",
  "content": "> **DATALOG // MODEL ADAPTATION**\n>\n> A pergunta errada é: \"qual dessas técnicas é melhor?\"\n> A pergunta correta é: **qual parte do sistema precisa mudar — os pesos, o comportamento, o conhecimento disponível em tempo de inferência ou o custo de treinamento?**\n\nFine-tuning, LoRA, QLoRA e RAG aparecem frequentemente na mesma discussão porque todos podem melhorar uma aplicação baseada em modelos de linguagem.\n\nMas eles não são equivalentes.\n\nA distinção fundamental é esta:\n\n```text\nFine-tuning / LoRA / QLoRA -> alteram o comportamento paramétrico do modelo\nRAG                         -> altera o contexto disponível na inferência\n```\n\nSe essa diferença não estiver clara, é fácil gastar GPU tentando resolver um problema de recuperação de informação — ou construir um RAG complexo para um problema que era essencialmente de comportamento.\n\n---\n\n## 1. Antes da técnica, identifique o problema\n\nConsidere quatro sintomas diferentes:\n\n### Caso A — o modelo não conhece documentos internos atualizados\n> \"Qual é a versão atual da política de resposta a incidentes da organização?\"\nO problema principal é **acesso a conhecimento externo e mutável**.\nCandidato natural: **RAG**.\n\n### Caso B — o modelo conhece a tarefa, mas responde no formato errado\n> O modelo deve transformar traces de incidentes em um schema rígido de classificação, mas insiste em explicar a resposta.\nO problema é **comportamento**.\nCandidato natural: **Fine-tuning / LoRA**.\n\n### Caso C — você precisa adaptar o modelo, mas tem orçamento limitado de GPU\nVocê precisa de adaptação de estilo/tarefa, mas não pode treinar centenas de bilhões de parâmetros em FP16/BF16.\nCandidato natural: **PEFT (LoRA) ou QLoRA**.\n\n### Caso D — você precisa de raciocínio especializado E dados privados atualizados\nO modelo precisa usar jargão operacional estrito, seguir uma taxonomia própria e consultar relatórios de inteligência produzidos hoje.\nCandidato natural: **Fine-tuning + RAG combinados**."
}
EOF
```

**Resposta da API:**
- HTTP Status: `201 Created`
- ID gerado: `0f9301b8-4741-41ce-9114-b25315325efc`
- URL Pública: `https://overcyber.online/blog/finetuning-lora-qlora-rag-quando-usar`

---

### 2.2 Post 2: Jev e Laya: modelos de decisão não são LLMs menores

```bash
curl -X POST https://overcyber.online/api/posts \
  -H "Authorization: Bearer ovc_c5r_jMvyDuBRE48_kaFo1WtqeDiSZ14Mjy3RXFhNe88" \
  -H "Content-Type: application/json" \
  -d @- << 'EOF'
{
  "title": "Jev e Laya: modelos de decisão não são LLMs menores",
  "slug": "jev-laya-modelos-de-decisao-system-one",
  "excerpt": "Jev e Laya atacam um problema diferente do chatbot tradicional: transformar contexto em decisões tipadas, probabilísticas e diretamente consumíveis por software. Este artigo analisa arquitetura, limites, benchmarks e onde esses modelos realmente fazem sentido.",
  "image": "/blog/jev-laya-decision-models.jpg",
  "status": "published",
  "content": "> **DATALOG // AI ARCHITECTURE**\n>\n> Nem toda etapa de um sistema inteligente precisa gerar texto. Em muitos pipelines, o que o software realmente precisa é decidir: **qual rota seguir, qual classe selecionar, qual risco atribuir ou se uma condição é verdadeira**.\n\nDurante os últimos anos, grande parte da engenharia de aplicações com IA foi construída em torno de modelos autoregressivos. O padrão tornou-se familiar: enviar um prompt, receber texto ou JSON, validar a saída e então transformar essa saída em uma ação.\n\nJev e Laya propõem outra abstração.\n\nEm vez de tratar toda decisão como um problema de geração de linguagem, esses sistemas recebem um **estado**, uma ou mais **perguntas tipadas** e retornam **decisões estruturadas acompanhadas de probabilidades**. O objetivo não é escrever melhor. É reduzir o caminho entre inferência e controle de software.\n\n---\n\n## 1. O problema: usar geração de texto para tudo\n\nUm LLM autoregressivo é excelente quando a saída precisa ser linguagem: explicações, código, resumos, planejamento, diálogo ou transformação textual.\n\nMas considere um agente que precisa responder internamente a perguntas como:\n- este evento deve ser escalado?\n- qual ferramenta deve ser chamada?\n- qual documento é mais relevante?\n- o alerta é provavelmente falso positivo?\n- a ação solicitada exige revisão humana?\n\nA abstração passa de:\n```text\nestado -> prompt -> geração de tokens -> parsing -> validação -> decisão -> ação\n```\npara:\n```text\nestado + pergunta tipada -> distribuição de probabilidade -> decisão -> ação\n```"
}
EOF
```

**Resposta da API:**
- HTTP Status: `201 Created`
- ID gerado: `b0980447-65a8-4d33-bb2e-a2f4e76d1679`
- URL Pública: `https://overcyber.online/blog/jev-laya-modelos-de-decisao-system-one`

---

### 2.3 Post 3: Oito arquiteturas de RAG: do Vanilla RAG ao Agentic e GraphRAG

```bash
curl -X POST https://overcyber.online/api/posts \
  -H "Authorization: Bearer ovc_c5r_jMvyDuBRE48_kaFo1WtqeDiSZ14Mjy3RXFhNe88" \
  -H "Content-Type: application/json" \
  -d @- << 'EOF'
{
  "title": "Oito arquiteturas de RAG: do Vanilla RAG ao Agentic e GraphRAG",
  "slug": "tipos-de-rag-vanilla-hybrid-graphrag-agentic-self-rag-crag-raptor-multimodal",
  "excerpt": "RAG não é uma arquitetura única. Vanilla, Hybrid, Hierarchical, GraphRAG, Self-RAG, CRAG, Agentic RAG e Multimodal RAG resolvem falhas diferentes. Este artigo compara pipeline, custo, latência, vantagens, limitações e casos de uso.",
  "image": "/blog/oito-arquiteturas-rag.jpg",
  "status": "published",
  "content": "> **DATALOG // RETRIEVAL SYSTEMS**\n>\n> Dizer \"estou usando RAG\" informa muito pouco sobre a arquitetura. Um sistema com busca vetorial simples, um GraphRAG e um Agentic RAG podem compartilhar o mesmo objetivo — fornecer evidência externa ao modelo — mas possuem custos, falhas e propriedades operacionais muito diferentes.\n\nRetrieval-Augmented Generation tornou-se uma das arquiteturas centrais para aplicações baseadas em LLMs.\n\nO princípio básico é simples:\n```text\nquery -> retrieve external evidence -> augment context -> generate\n```\n\nMas esse pipeline evoluiu. Hoje, \"RAG\" pode significar desde uma consulta top-k em um vector database até um sistema com busca híbrida, reranking, knowledge graph, decomposição de consulta, agentes, avaliação automática de evidência, reflexão e múltiplas modalidades.\n\n---\n\n## As 8 Arquiteturas Comparadas\n\n1. **Vanilla RAG**: Chunking estático -> Embeddings vetoriais -> Top-K -> Geração direta.\n2. **Hybrid RAG**: Fusão de busca vetorial densa (semântica) com busca esparsa (BM25/palavra-chave) e Reranking.\n3. **Hierarchical RAG (RAPTOR)**: Resumos em múltiplos níveis de granularidade para perguntas que exigem visão holística.\n4. **GraphRAG**: Extração de entidades e relações em Knowledge Graph com clustering hierárquico.\n5. **Self-RAG**: Tokens de reflexão para avaliar necessidade de recuperação, relevância e suporte da resposta.\n6. **Corrective RAG (CRAG)**: Avaliador de evidência que aciona busca web quando os documentos internos são insuficientes.\n7. **Agentic RAG**: Agentes autônomos que decompõem consultas complexas em loops de planejamento e ação.\n8. **Multimodal RAG**: Recuperação e geração conjunta de textos, diagramas, capturas de tela e áudio."
}
EOF
```

**Resposta da API:**
- HTTP Status: `201 Created`
- ID gerado: `92fdce2b-f596-4981-a26a-b4a7781373e3`
- URL Pública: `https://overcyber.online/blog/tipos-de-rag-vanilla-hybrid-graphrag-agentic-self-rag-crag-raptor-multimodal`

---

## 3. Validação dos Endpoints Públicos

Executando a consulta pública `GET https://overcyber.online/api/posts`:

```bash
curl -s https://overcyber.online/api/posts | jq '.[0:3] | .[] | {title, slug, status, image}'
```

Saída obtida:
```json
{
  "title": "Oito arquiteturas de RAG: do Vanilla RAG ao Agentic e GraphRAG",
  "slug": "tipos-de-rag-vanilla-hybrid-graphrag-agentic-self-rag-crag-raptor-multimodal",
  "status": "published",
  "image": "/blog/oito-arquiteturas-rag.jpg"
}
{
  "title": "Fine-tuning, LoRA, QLoRA ou RAG: qual técnica usar e quando",
  "slug": "finetuning-lora-qlora-rag-quando-usar",
  "status": "published",
  "image": "/blog/finetuning-lora-qlora-rag.jpg"
}
{
  "title": "Jev e Laya: modelos de decisão não são LLMs menores",
  "slug": "jev-laya-modelos-de-decisao-system-one",
  "status": "published",
  "image": "/blog/jev-laya-decision-models.jpg"
}
```

---

## 4. Script de Automação

O script completo que automatizou toda a publicação lendo os arquivos locais de rascunho com conteúdo Markdown na íntegra está salvo em:
`fastapi_service/publish_posts.py`
