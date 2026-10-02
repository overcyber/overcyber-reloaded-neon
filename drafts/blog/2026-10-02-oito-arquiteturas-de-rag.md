---
title: "Oito arquiteturas de RAG: do Vanilla RAG ao Agentic e GraphRAG"
slug: "tipos-de-rag-vanilla-hybrid-graphrag-agentic-self-rag-crag-raptor-multimodal"
date: "2026-10-02"
status: "draft"
excerpt: "RAG não é uma arquitetura única. Vanilla, Hybrid, Hierarchical, GraphRAG, Self-RAG, CRAG, Agentic RAG e Multimodal RAG resolvem falhas diferentes. Este artigo compara pipeline, custo, latência, vantagens, limitações e casos de uso."
tags:
  - rag
  - retrieval-augmented-generation
  - graphrag
  - agentic-rag
  - self-rag
  - crag
  - raptor
  - qdrant
  - llm
---

# Oito arquiteturas de RAG: do Vanilla RAG ao Agentic e GraphRAG

> **DATALOG // RETRIEVAL SYSTEMS**
>
> Dizer "estou usando RAG" informa muito pouco sobre a arquitetura. Um sistema com busca vetorial simples, um GraphRAG e um Agentic RAG podem compartilhar o mesmo objetivo — fornecer evidência externa ao modelo — mas possuem custos, falhas e propriedades operacionais muito diferentes.

Retrieval-Augmented Generation tornou-se uma das arquiteturas centrais para aplicações baseadas em LLMs.

O princípio básico é simples:

```text
query -> retrieve external evidence -> augment context -> generate
```

Mas esse pipeline evoluiu. Hoje, "RAG" pode significar desde uma consulta `top-k` em um vector database até um sistema com busca híbrida, reranking, knowledge graph, decomposição de consulta, agentes, avaliação automática de evidência, reflexão e múltiplas modalidades.

Essas arquiteturas não são mutuamente exclusivas. Um sistema real pode ser simultaneamente **Hybrid + Agentic + GraphRAG + Multimodal**. A taxonomia abaixo deve ser entendida como um conjunto de padrões arquiteturais.

---

## 1. Vanilla RAG

O Vanilla RAG é a forma mais direta.

```text
documents
   |
chunk
   |
embedding
   |
vector store
   |
query -> embedding -> top-k
                    |
                    v
               context
                    |
                    v
                   LLM
```

O artigo clássico de Lewis et al. formalizou RAG como a combinação de memória paramétrica e não paramétrica para tarefas intensivas em conhecimento.

Na implementação moderna mais comum, documentos são divididos em chunks, vetorizados e armazenados em um índice. A consulta também é vetorizada; recuperamos os vizinhos mais próximos e colocamos os trechos no contexto do modelo.

### Vantagens

- arquitetura simples;
- baixo número de componentes;
- fácil de prototipar;
- custo previsível;
- boa observabilidade;
- funciona bem para perguntas locais e documentos bem segmentados.

### Desvantagens

- depende fortemente do chunking;
- top-k sem reranking pode trazer contexto irrelevante;
- relações entre documentos podem ser perdidas;
- perguntas multi-hop são difíceis;
- similaridade semântica não garante relevância factual;
- chunks isolados podem perder contexto estrutural.

### Quando usar

Vanilla RAG é um excelente baseline quando o corpus é pequeno ou médio, as perguntas apontam para trechos específicos e a estrutura documental é relativamente simples.

### Quando não usar sozinho

Considere outra arquitetura quando as falhas forem claramente causadas por múltiplas entidades relacionadas, perguntas globais sobre o corpus, necessidade de multi-hop ou documentos longos com dependências hierárquicas.

---

## 2. Hybrid RAG: dense + sparse + reranking

Dense retrieval captura semântica. Sparse retrieval captura correspondência lexical.

```text
                     +--> dense search ----+
query ---------------|                     |
                     +--> sparse/BM25 ------+--> fusion --> reranker --> context
```

Busca vetorial pode relacionar sinônimos e conceitos próximos. BM25 e outros métodos esparsos tendem a preservar melhor identificadores, nomes técnicos, códigos, funções e termos raros.

Uma estratégia comum é combinar rankings com **Reciprocal Rank Fusion — RRF** e depois aplicar um reranker.

### Vantagens

- maior robustez lexical;
- melhora em corpora técnicos;
- reduz dependência exclusiva do embedding;
- reranking pode melhorar a precisão do contexto final;
- preserva correspondências exatas e semânticas.

### Desvantagens

- mais índices;
- mais parâmetros;
- maior latência;
- pesos de fusão precisam ser avaliados;
- reranker adiciona custo computacional;
- debugging fica mais complexo.

### Relação com Qdrant

Qdrant permite arquiteturas que combinam representações densas e esparsas, filtros por metadata e recuperação em múltiplos estágios. Para um harness de RAG técnico, Hybrid RAG costuma ser um upgrade mais racional do que migrar diretamente para uma arquitetura agentic.

---

## 3. Hierarchical RAG e RAPTOR

Vanilla RAG normalmente trata chunks como unidades relativamente planas. Isso é problemático em documentos longos.

Uma pergunta pode exigir entendimento simultâneo de seção, capítulo, documento e relação entre vários trechos.

RAPTOR — **Recursive Abstractive Processing for Tree-Organized Retrieval** — propõe organizar o corpus em uma árvore de abstrações.

```text
                         [global summary]
                         /              \
                 [summary A]        [summary B]
                  /      \           /      \
             chunks     chunks    chunks    chunks
```

O processo descrito no paper envolve embedding, clustering e sumarização recursiva dos chunks. Na inferência, o retriever pode acessar diferentes níveis de abstração.

### Vantagens

- melhora compreensão de documentos longos;
- permite recuperar contexto local e global;
- ajuda perguntas que exigem síntese;
- reduz a dependência de um único tamanho de chunk.

### Desvantagens

- ingestão mais cara;
- summaries introduzem uma camada gerativa;
- erros de sumarização podem propagar;
- atualização parcial é mais complexa;
- a árvore precisa ser ajustada quando o corpus muda.

### Quando usar

Livros, relatórios extensos, documentação arquitetural, normas longas e processos com hierarquia natural.

### Quando evitar

Se a maioria das perguntas aponta para trechos curtos e independentes, a complexidade pode não se justificar.

---

## 4. GraphRAG

Vector search responde bem à pergunta:

> "quais trechos são semanticamente relacionados a esta consulta?"

Algumas tarefas, porém, dependem de outra estrutura:

> "quais entidades estão conectadas e por quais relações?"

GraphRAG introduz uma representação explícita de entidades e relações.

```text
documents
   |
entity/relation extraction
   |
knowledge graph
   |
communities / summaries / graph index
   |
query
   |
local or global graph retrieval
   |
context
   |
LLM
```

O trabalho da Microsoft Research, **From Local to Global: A Graph RAG Approach to Query-Focused Summarization**, explora knowledge graphs derivados de documentos e sumarização de comunidades para responder perguntas globais sobre grandes coleções.

### Exemplo conceitual

```text
Project-A
 | depends on
 v
Library-B ---- maintained by ----> Team-C
 |                                |
 used by                          owns
 v                                v
Service-D                      Service-E
```

Uma pergunta que atravessa várias dessas relações é naturalmente relacional. Embeddings podem encontrar partes relevantes, mas o grafo torna as conexões explícitas.

### Vantagens

- forte para relações entre entidades;
- bom para perguntas globais;
- suporta multi-hop;
- oferece estrutura inspecionável;
- útil para investigação e análise de dependências.

### Desvantagens

- ingestão cara;
- extração de entidades pode errar;
- entity resolution é difícil;
- grafos ficam obsoletos;
- maior custo de armazenamento e manutenção;
- queries locais simples podem ficar mais caras sem benefício.

### Quando usar

Pesquisa, inteligência corporativa, análise de dependências, supply chain, literatura científica e corpora com relações densas.

### Quando evitar

Para FAQ simples e busca documental direta, GraphRAG pode ser engenharia excessiva.

---

## 5. Self-RAG

RAG convencional normalmente recupera contexto sempre.

Self-RAG questiona essa premissa.

O trabalho de Asai et al. propõe um modelo que aprende a decidir quando recuperar, gerar, criticar a evidência recuperada e refletir sobre a própria geração. O método utiliza **reflection tokens** para controlar esses comportamentos.

```text
query
  |
  v
retrieve needed?
  |
 +------+------+
 |             |
no            yes
 |             |
 |        retrieve evidence
 |             |
 +-------> generate
             |
             v
          critique
             |
             v
          final output
```

### Vantagens

- retrieval adaptativo;
- evita consultas externas desnecessárias;
- inclui mecanismo explícito de reflexão;
- pode melhorar factualidade;
- pode avaliar relevância da evidência.

### Desvantagens

- não é apenas "adicionar um vector DB";
- o método original envolve treinamento específico;
- maior complexidade de inferência;
- reflexão não garante correção;
- implementação é mais difícil que Vanilla RAG.

### Quando usar

Quando o custo de recuperar sempre é significativo ou quando a aplicação precisa decidir dinamicamente se conhecimento externo é necessário.

### Quando evitar

Se o sistema utiliza um modelo fechado e só precisa de um RAG de produção simples, reproduzir Self-RAG literalmente pode ser desnecessário. É possível adotar ideias de reflexão sem afirmar que a implementação reproduz o paper original.

---

## 6. Corrective RAG — CRAG

CRAG parte de outra falha importante:

> e se o retriever trouxer documentos ruins?

O paper **Corrective Retrieval Augmented Generation** adiciona um avaliador de retrieval.

```text
query
  |
retrieve
  |
evaluate retrieval quality
  |
  +---------+-----------+
  |                     |
good                  poor
  |                     |
use docs          corrective action
                        |
                 alternative retrieval
                        |
                        v
                 refined evidence
                        |
                        v
                     generate
```

O método também propõe decompor e recompor documentos recuperados para preservar informação útil e filtrar partes irrelevantes.

### Vantagens

- trata explicitamente falha de retrieval;
- aumenta robustez;
- pode buscar evidência alternativa;
- reduz confiança cega em top-k.

### Desvantagens

- o avaliador também pode errar;
- mais chamadas;
- maior latência;
- fontes adicionais exigem provenance;
- a política de fallback precisa ser bem definida.

### Quando usar

Corpus incompleto, perguntas abertas ou sistemas em que retrieval ruim é uma falha recorrente medida.

### Quando evitar

Em ambientes com corpus estritamente controlado, fontes externas podem não ser aceitáveis. O padrão corretivo ainda pode ser usado com índices internos alternativos.

---

## 7. Agentic RAG

Agentic RAG transforma retrieval em uma atividade planejada.

Em vez de:

```text
query -> retrieve -> answer
```

temos:

```text
query
  |
planner/agent
  |
  +--> decompose question
  |
  +--> choose source
  |
  +--> retrieve
  |
  +--> inspect evidence
  |
  +--> reformulate query
  |
  +--> retrieve again
  |
  +--> call tool/API
  |
  +--> synthesize
```

Surveys recentes descrevem Agentic RAG como a incorporação de padrões de agentes — planejamento, reflexão, uso de ferramentas e colaboração — ao pipeline de recuperação.

### Exemplo

Pergunta:

> "Quais decisões de arquitetura do último trimestre ainda afetam o serviço atual e quais documentos registram essas decisões?"

Um Agentic RAG pode:

1. decompor a pergunta;
2. consultar decisões arquiteturais;
3. recuperar documentação do serviço;
4. relacionar datas e componentes;
5. reformular a busca quando faltarem evidências;
6. sintetizar apenas depois.

### Vantagens

- excelente para tarefas multi-step;
- permite múltiplas fontes;
- retrieval adaptativo;
- integra APIs e ferramentas;
- pode corrigir a própria estratégia.

### Desvantagens

- latência alta e variável;
- custo imprevisível;
- loops;
- dificuldade de observabilidade;
- mais estados intermediários;
- avaliação muito mais difícil;
- falhas podem emergir da orquestração, não do retriever.

### Quando usar

Pesquisa, troubleshooting, tarefas multi-hop, múltiplas bases heterogêneas e perguntas cujo plano de busca não é conhecido antecipadamente.

### Quando evitar

Não use Agentic RAG para uma consulta que um `top-k + reranker` resolve com baixa latência. Autonomia sem necessidade é apenas custo adicional.

---

## 8. Multimodal RAG

Muitos corpora não são texto puro.

Eles contêm imagens, diagramas, tabelas, áudio, vídeo, screenshots, gráficos, layouts e fórmulas.

Multimodal RAG amplia retrieval para essas modalidades.

```text
             +--> text embeddings -----+
document ----+--> image embeddings -----+
             +--> table representation -+--> multimodal index
             +--> layout features ------+
                                           |
query -------------------------------------+
                                           |
                                      retrieval
                                           |
                                      multimodal LLM
```

O desafio não é apenas armazenar imagens. É alinhar significado entre modalidades.

Uma pergunta textual pode precisar recuperar um diagrama. Uma imagem pode precisar recuperar uma seção textual. Uma tabela precisa ser interpretada preservando linhas, colunas e cabeçalhos.

### Vantagens

- preserva informação perdida em extração textual;
- útil para documentos técnicos;
- permite busca cross-modal;
- melhora análise de diagramas, screenshots e tabelas.

### Desvantagens

- embeddings diferentes;
- armazenamento maior;
- indexação mais cara;
- avaliação cross-modal é difícil;
- parsing e alinhamento são complexos;
- modelos multimodais tendem a ter custo maior.

### Relação com Docling

Essa arquitetura é particularmente relevante para pipelines com parsing documental estruturado.

Extrair apenas texto de um PDF pode destruir hierarquia, tabela, legenda, relação figura-texto e ordem de leitura. Uma camada como Docling pode preservar estrutura suficiente para construir unidades de recuperação mais ricas do que chunks de texto plano.

---

## 9. Comparação direta

| Arquitetura | Complexidade | Latência | Melhor característica | Principal risco |
|---|---:|---:|---|---|
| Vanilla RAG | baixa | baixa | simplicidade | contexto irrelevante |
| Hybrid RAG | média | média | lexical + semântico | tuning/fusão |
| Hierarchical/RAPTOR | média-alta | média | documentos longos | ingestão complexa |
| GraphRAG | alta | média-alta | relações/multi-hop | custo do grafo |
| Self-RAG | alta | variável | retrieval/reflexão adaptativos | treinamento/complexidade |
| CRAG | alta | alta | correção de retrieval | custo de fallback |
| Agentic RAG | muito alta | alta/variável | planejamento multi-step | loops e observabilidade |
| Multimodal RAG | alta | alta | múltiplas modalidades | alinhamento cross-modal |

---

## 10. Qual RAG usar?

A pergunta deve começar pela topologia da informação.

| Problema dominante | Padrão a avaliar primeiro |
|---|---|
| perguntas locais em documentos | Vanilla RAG |
| termos técnicos e identificadores exatos | Hybrid RAG |
| documentos muito longos | Hierarchical RAG / RAPTOR |
| relações entre entidades | GraphRAG |
| retrieval nem sempre necessário | Self-RAG |
| evidência recuperada frequentemente é ruim | CRAG |
| várias buscas e ferramentas | Agentic RAG |
| informação crítica em imagens/tabelas | Multimodal RAG |

---

## 11. O erro de escolher arquitetura antes de medir retrieval

Muitos sistemas pulam diretamente para uma arquitetura sofisticada.

O processo deveria ser inverso.

Primeiro construa um dataset de avaliação:

```text
query
relevant_documents
expected_evidence
expected_answer
metadata
```

Depois meça.

### Retrieval

- Recall@1;
- Recall@5;
- Recall@10;
- MRR;
- nDCG;
- hit rate.

### Generation

- correctness;
- faithfulness;
- citation precision;
- citation recall;
- completeness.

### Sistema

- p50 latency;
- p95 latency;
- tokens/query;
- retrieval cost;
- generation cost;
- failure rate.

Só então adicione complexidade.

Se Hybrid RAG resolve o problema, GraphRAG não é automaticamente uma melhoria.

---

## 12. Um pipeline progressivo com Qdrant

Para um stack com Qdrant, uma evolução racional pode ser:

### Estágio 1

```text
dense retrieval
+ metadata filters
```

### Estágio 2

```text
dense + sparse
+ fusion
```

### Estágio 3

```text
candidate retrieval
+ reranker
```

### Estágio 4

```text
query rewriting
+ parent/child retrieval
+ metadata-aware routing
```

### Estágio 5

```text
agentic retrieval
ou
graph layer
```

Cada estágio deve existir porque uma métrica anterior revelou uma falha concreta.

---

## 13. Parent-child retrieval: uma técnica transversal

O chunk ideal para busca nem sempre é o chunk ideal para geração.

Chunks pequenos são específicos e produzem embeddings mais focados.

Chunks grandes preservam contexto e ajudam o LLM a interpretar a evidência.

Parent-child retrieval resolve isso.

```text
PARENT DOCUMENT
|
+-- child chunk 1
+-- child chunk 2  <- vector hit
+-- child chunk 3
|
retrieve child -> return parent/section
```

O índice procura unidades pequenas, mas a aplicação devolve uma unidade contextual maior.

Esse padrão pode coexistir com Vanilla, Hybrid, Agentic e outros tipos de RAG.

---

## 14. RAG para agentes não é memória automaticamente

Outro erro arquitetural comum é chamar qualquer vector store de "memória".

RAG responde:

> **qual evidência externa é relevante para esta consulta?**

Memória de agente pode precisar responder:

> o que aconteceu anteriormente?  
> o que aprendemos?  
> quais preferências persistem?  
> qual estado deve sobreviver à sessão?  
> o que deve ser esquecido?

Esses problemas podem compartilhar infraestrutura vetorial, mas possuem semânticas diferentes.

Um Qdrant pode armazenar chunks documentais e episódios de memória. Isso não significa que os dois sistemas sejam conceitualmente iguais.

---

## 15. Quanto mais inteligente o RAG, maior a superfície operacional

Documentos recuperados podem conter informação incorreta, obsoleta, sem autorização adequada ou simplesmente irrelevante.

Em Agentic RAG, o risco operacional aumenta porque o sistema pode usar material recuperado para escolher novas ações.

Um pipeline robusto deve separar:

```text
DATA != POLICY
```

e aplicar:

- controle de acesso antes do retrieval;
- provenance;
- trust labels;
- políticas de ferramenta;
- limites de autonomia;
- logging;
- revisão humana em ações críticas.

RAG melhora grounding, mas não transforma uma fonte não confiável em fonte confiável.

---

## 16. Arquitetura de referência

Uma arquitetura moderna pode combinar vários padrões:

```text
                    +------------------+
                    |      QUERY       |
                    +---------+--------+
                              |
                       query classifier
                              |
                 +------------+------------+
                 |                         |
                 v                         v
          simple retrieval             planner
                 |                         |
          dense + sparse          multi-step retrieval
                 |                         |
                 +------------+------------+
                              |
                           reranker
                              |
                    evidence evaluator
                              |
                 +------------+------------+
                 |                         |
               good                       poor
                 |                         |
                 |                  alternative search
                 |                         |
                 +------------+------------+
                              |
                       context builder
                              |
                     multimodal evidence
                              |
                              v
                             LLM
                              |
                       citation verifier
                              |
                              v
                           response
```

Esse sistema poderia ser descrito ao mesmo tempo como Hybrid RAG, Agentic RAG, Corrective RAG e Multimodal RAG. Os nomes descrevem propriedades, não caixas exclusivas.

---

## Conclusão

RAG deixou de ser apenas:

```text
embedding -> vector database -> top-k -> prompt
```

O campo evoluiu porque retrieval simples possui falhas previsíveis.

Hybrid RAG melhora a combinação lexical e semântica.

RAPTOR adiciona hierarquia.

GraphRAG representa relações.

Self-RAG torna retrieval e reflexão adaptativos.

CRAG tenta corrigir evidência ruim.

Agentic RAG transforma recuperação em planejamento iterativo.

Multimodal RAG expande a memória externa para além do texto.

Mas a principal regra de engenharia continua simples:

> **use a arquitetura menos complexa que atinja os requisitos medidos.**

Complexidade não é inteligência gratuita.

Cada novo retriever, agente, reranker, grafo ou evaluator adiciona latência, custo, estados de falha e superfície de observabilidade.

Um bom RAG não é aquele com mais componentes.

É aquele em que sabemos **por que cada componente existe, qual falha ele corrige e qual métrica demonstra que ele vale o custo**.

---

## Referências

1. Lewis, P. et al. **Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks**. NeurIPS 2020 / arXiv:2005.11401.  
   https://arxiv.org/abs/2005.11401

2. Asai, A. et al. **Self-RAG: Learning to Retrieve, Generate, and Critique through Self-Reflection**. arXiv:2310.11511.  
   https://arxiv.org/abs/2310.11511

3. Yan, S.-Q. et al. **Corrective Retrieval Augmented Generation**. arXiv:2401.15884.  
   https://arxiv.org/abs/2401.15884

4. Sarthi, P. et al. **RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval**. arXiv:2401.18059.  
   https://arxiv.org/abs/2401.18059

5. Edge, D. et al. **From Local to Global: A Graph RAG Approach to Query-Focused Summarization**. Microsoft Research, 2024.  
   https://www.microsoft.com/en-us/research/project/graphrag/publications/

6. Singh, A. et al. **Agentic Retrieval-Augmented Generation: A Survey on Agentic RAG**. arXiv:2501.09136, rev. 2026.  
   https://arxiv.org/abs/2501.09136

7. Deng, J. et al. **Data-Centric Perspectives on Agentic Retrieval-Augmented Generation: A Survey**. Findings of ACL 2026.  
   https://aclanthology.org/2026.findings-acl.78/

8. Abootorabi, M. M. et al. **Ask in Any Modality: A Comprehensive Survey on Multimodal Retrieval-Augmented Generation**. arXiv:2502.08826.  
   https://arxiv.org/abs/2502.08826

9. NVIDIA. **Hybrid Search Support — RAG Blueprint**.  
   https://github.com/NVIDIA-AI-Blueprints/rag/blob/main/docs/hybrid_search.md

---

## Sugestão de imagem

Um mapa arquitetural em estilo terminal/cyberpunk com oito nós conectados a um núcleo `RAG`:

```text
                     [GraphRAG]
                         |
 [RAPTOR] ----+          |          +---- [Self-RAG]
              |          |          |
              v          v          v
           +---------------------------+
           |            RAG            |
           +---------------------------+
              ^          ^          ^
              |          |          |
 [Hybrid] ----+          |          +---- [CRAG]
                         |
                  [Agentic RAG]
                         |
                  [Multimodal RAG]

                [Vanilla baseline]
```

Paleta: fundo preto, linhas cyan, labels verdes e alertas magenta. O visual deve lembrar um diagrama de topologia de sistemas, não uma ilustração genérica de IA.
