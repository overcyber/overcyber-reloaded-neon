---
title: "Jev e Laya: modelos de decisão não são LLMs menores"
slug: "jev-laya-modelos-de-decisao-system-one"
date: "2026-10-02"
status: "draft"
excerpt: "Jev e Laya atacam um problema diferente do chatbot tradicional: transformar contexto em decisões tipadas, probabilísticas e diretamente consumíveis por software. Este artigo analisa arquitetura, limites, benchmarks e onde esses modelos realmente fazem sentido."
tags:
  - inteligencia-artificial
  - decision-models
  - jev
  - laya
  - agentes
  - machine-learning
  - system-one
---

# Jev e Laya: modelos de decisão não são LLMs menores

> **DATALOG // AI ARCHITECTURE**
>
> Nem toda etapa de um sistema inteligente precisa gerar texto. Em muitos pipelines, o que o software realmente precisa é decidir: **qual rota seguir, qual classe selecionar, qual risco atribuir ou se uma condição é verdadeira**.

Durante os últimos anos, grande parte da engenharia de aplicações com IA foi construída em torno de modelos autoregressivos. O padrão tornou-se familiar: enviar um prompt, receber texto ou JSON, validar a saída e então transformar essa saída em uma ação.

Jev e Laya propõem outra abstração.

Em vez de tratar toda decisão como um problema de geração de linguagem, esses sistemas recebem um **estado**, uma ou mais **perguntas tipadas** e retornam **decisões estruturadas acompanhadas de probabilidades**. O objetivo não é escrever melhor. É reduzir o caminho entre inferência e controle de software.

Essa distinção parece pequena, mas muda a arquitetura de agentes, classificadores, pipelines de segurança e sistemas de automação.

---

## 1. O problema: usar geração de texto para tudo

Um LLM autoregressivo é excelente quando a saída precisa ser linguagem: explicações, código, resumos, planejamento, diálogo ou transformação textual.

Mas considere um agente que precisa responder internamente a perguntas como:

- este evento deve ser escalado?
- qual ferramenta deve ser chamada?
- qual documento é mais relevante?
- o alerta é provavelmente falso positivo?
- qual agente especializado deve receber a tarefa?
- a ação solicitada exige revisão humana?

É possível perguntar tudo isso a um LLM e solicitar JSON. Funciona. Porém, arquiteturalmente, há um excesso: um modelo treinado para gerar sequências é usado para produzir uma decisão discreta que depois precisa ser parseada, validada e convertida novamente em controle de fluxo.

Um modelo de decisão elimina parte dessa indireção.

A abstração passa de:

```text
estado -> prompt -> geração de tokens -> parsing -> validação -> decisão -> ação
```

para algo conceitualmente mais próximo de:

```text
estado + pergunta tipada -> distribuição de probabilidade -> decisão -> ação
```

Isso não substitui o LLM. Ele separa duas funções que frequentemente foram misturadas: **decidir** e **gerar**.

---

## 2. O que é Jev

Jev foi apresentado pela TypeSafe AI em setembro de 2026 como seu primeiro **System One Model**.

A própria TypeSafe descreve a categoria como modelos voltados a decisões rápidas e estruturadas para software. A empresa afirma ter desenvolvido uma arquitetura própria, um sampler paralelo e um método de treinamento chamado **Reinforcement Learning for Calibrated Decisions — RLCD**.

Um ponto importante: **a arquitetura interna completa de Jev não foi publicada**. Os pesos também não são públicos. Portanto, qualquer descrição detalhada de camadas, número de parâmetros ou mecanismo interno que não venha da TypeSafe deve ser tratada como especulação.

O que é público e verificável é sua interface.

A API oficial expõe `POST /v1/systemone`. O cliente fornece um `state`, o nome do modelo e um conjunto de perguntas. A documentação oficial descreve três primitivas de decisão:

| Primitiva | Problema | Saída conceitual |
|---|---|---|
| `choice` | selecionar uma alternativa | distribuição sobre opções |
| `score` | avaliar em uma escala ordenada | score/distribuição |
| `noul` | julgamento binário | probabilidade de verdadeiro |

Isso faz Jev parecer menos com um chatbot e mais com uma **camada probabilística de decisão**.

### Exemplo conceitual

Considere um SOC recebendo um alerta:

```json
{
  "state": {
    "event": "PowerShell spawned by Word and contacted an unknown host",
    "asset": "finance-workstation-17",
    "user": "analyst01"
  },
  "questions": {
    "escalate": {
      "type": "noul",
      "instructions": "Should this event be escalated for human investigation?"
    },
    "severity": {
      "type": "score",
      "instructions": "Rate the incident severity."
    }
  }
}
```

O modelo não precisa escrever um relatório. Ele precisa fornecer sinais que o software possa usar.

A política operacional continua sendo responsabilidade do sistema:

```python
if p_escalate >= 0.90:
    create_incident()
elif p_escalate >= 0.60:
    enqueue_human_review()
else:
    continue_pipeline()
```

A diferença é fundamental: **probabilidade não é política**. O modelo estima; o software decide o que fazer com a estimativa.

---

## 3. O que é Laya

Laya surgiu poucos dias depois como uma implementação aberta da mesma classe geral de problema.

O projeto é publicado sob licença Apache 2.0 e oferece pesos executáveis localmente. Seu repositório descreve Laya como um mecanismo de decisão **não autoregressivo**, baseado em encoders, capaz de responder às mesmas categorias de perguntas tipadas — `choice`, `score` e `noul`.

Na versão analisada em outubro de 2026, o projeto publica três checkpoints principais:

| Checkpoint | Backbone | Parâmetros | Uso principal |
|---|---:|---:|---|
| Laya English | ModernBERT-large | ~421M | decisões em inglês |
| Laya Multilingual | mmBERT-base | ~322M | entrada multilíngue |
| Laya Typed Decisions | ModernBERT-large | ~421M | workflows especializados |

O ponto arquitetural mais relevante é que Laya não precisa produzir uma resposta token por token. Para uma decisão limitada a alternativas conhecidas, o sistema pode avaliar as opções e retornar probabilidades em uma passagem de inferência.

Isso reduz uma classe inteira de problemas de integração.

Não existe:

```text
"Claro! Acredito que a melhor opção seja..."
```

quando o programa esperava:

```json
{"route": "security"}
```

Entretanto, é incorreto concluir que um modelo não generativo "não erra" ou "não alucina" em sentido amplo. Laya pode **classificar incorretamente, produzir probabilidades mal calibradas ou falhar fora da distribuição de treinamento**. O que desaparece é a alucinação textual decorrente da geração livre; o erro de decisão continua existindo.

---

## 4. Autoregressivo versus modelo de decisão

A diferença pode ser representada de forma simplificada.

### LLM autoregressivo

```text
input
  |
Transformer
  |
token_1 -> token_2 -> token_3 -> ... -> token_n
  |
texto / JSON
```

Cada token depende dos anteriores. Quanto maior a saída, maior o trabalho de decodificação.

### Modelo de decisão

```text
state + typed question + options
              |
            encoder
              |
        decision/scoring head
              |
      probability distribution
```

Quando o espaço de respostas é conhecido antecipadamente, não há razão matemática para gerar uma frase inteira apenas para descobrir qual ramo de um `if` executar.

---

## 5. Jev versus Laya

Os dois sistemas ocupam espaços semelhantes, mas o modelo operacional é diferente.

| Característica | Jev | Laya |
|---|---|---|
| Distribuição | API hospedada | pesos abertos/self-host |
| Pesos públicos | não | sim |
| Licença dos pesos/código | proprietário | Apache 2.0 no projeto |
| Geração livre de texto | não é o objetivo | não |
| Decisões tipadas | sim | sim |
| Fine-tuning pelo usuário | não é a proposta pública principal | suportado pelo projeto |
| Operação local | não para os pesos Jev | sim |
| Controle de dados | depende do serviço | pode permanecer local |
| Arquitetura detalhada | não publicada | inspecionável no projeto |

Essa tabela já sugere dois perfis.

Jev favorece quem quer consumir uma API de decisão sem operar infraestrutura de modelo.

Laya favorece quem precisa de **self-hosting, auditabilidade, adaptação de domínio ou controle operacional dos pesos**.

---

## 6. Cuidado com benchmarks

Benchmarks de Jev e Laya começaram a aparecer rapidamente após o lançamento. Eles são úteis, mas exigem disciplina metodológica.

O próprio repositório de Laya alerta que vários números de Jev usados em suas tabelas foram publicados por terceiros e não necessariamente medidos no mesmo conjunto, com o mesmo prompt e o mesmo protocolo.

Em um benchmark independente publicado por Harry Munro, Jev 1.13 e Laya 421M foram avaliados no mesmo conjunto sintético. Nesse experimento, Jev apresentou maior acurácia agregada, enquanto Laya teve menor latência para uma pergunta curta localmente. Em outro conjunto de testes, resultados variaram de forma significativa conforme número de opções, tamanho do contexto e tarefa.

Isso leva a uma conclusão de engenharia mais importante do que qualquer placar:

> **não existe benchmark universal para um decision head.**

Para uso real, a avaliação precisa refletir:

- distribuição de produção;
- número de classes;
- comprimento do estado;
- idioma;
- custo de falso positivo;
- custo de falso negativo;
- calibração;
- latência;
- taxa de abstention/revisão humana;
- mudança de distribuição ao longo do tempo.

Em segurança cibernética, por exemplo, uma acurácia global de 95% pode ser operacionalmente inferior a 90% se os 5% restantes concentrarem exatamente os incidentes de maior impacto.

---

## 7. Calibração é tão importante quanto acurácia

Modelos como Jev e Laya tornam probabilidades parte explícita da interface.

Isso é útil apenas se essas probabilidades tiverem significado operacional.

Se um modelo retorna `0.90` em cem casos comparáveis, idealmente algo próximo de noventa deles deveria ser positivo. Quando isso não ocorre, o sistema está mal calibrado.

As métricas relevantes incluem:

- **Brier Score**;
- **Expected Calibration Error — ECE**;
- reliability diagrams;
- AUROC/AUPRC quando aplicável;
- precision/recall por limiar;
- custo esperado por decisão.

O repositório de Laya é especialmente explícito nesse ponto: documenta temperature scaling e recomenda recalibração em dados held-out antes de confiar em thresholds.

Isso é uma prática que deveria ser padrão em agentes.

Um `confidence = 0.93` sem avaliação de calibração é apenas um número com aparência científica.

---

## 8. Onde esses modelos fazem sentido em agentes

A aplicação mais interessante não é substituir o modelo generativo. É construir uma arquitetura heterogênea.

```text
                        +-------------------+
                        |   user / event    |
                        +---------+---------+
                                  |
                                  v
                        +-------------------+
                        | normalize state   |
                        +---------+---------+
                                  |
                                  v
                     +-------------------------+
                     | Jev / Laya decision head|
                     +-----------+-------------+
                                 |
                  +--------------+--------------+
                  |                             |
                  v                             v
          deterministic code               LLM / agent
          rules / routing                   reasoning
                  |                             |
                  +--------------+--------------+
                                 |
                                 v
                           action policy
```

O decision model pode atuar como:

1. **router** entre agentes;
2. **relevance gate** antes de uma consulta RAG;
3. **risk scorer** antes de uma ação;
4. **human-review gate**;
5. **tool selector**;
6. **policy classifier**;
7. **observability head** sobre traces de agentes;
8. **confidence gate** para decidir se um modelo maior deve ser acionado.

Essa composição é particularmente interessante em arquiteturas multiagente: o modelo generativo deixa de ser obrigado a decidir tudo.

---

## 9. Aplicação em cibersegurança

Um pipeline de resposta a incidentes pode decompor uma decisão ampla em julgamentos menores.

Em vez de:

```text
"Analise todo este incidente e diga o que fazer."
```

podemos decompor:

```text
Q1: a atividade parece autorizada?
Q2: há evidência de execução persistente?
Q3: credenciais parecem comprometidas?
Q4: existe movimento lateral?
Q5: qual a severidade?
Q6: requer contenção imediata?
```

Depois, regras explícitas transformam as respostas em ação.

Essa arquitetura tem três propriedades desejáveis:

**Observabilidade.** É possível registrar qual julgamento alterou a rota.

**Testabilidade.** Cada pergunta pode possuir seu próprio conjunto de avaliação.

**Controle.** A política final permanece em código, não escondida dentro de uma geração textual.

Isso se aproxima mais de engenharia de sistemas críticos do que de um chatbot.

---

## 10. Quando usar Jev

Jev faz sentido quando:

- o espaço de decisão é bem definido;
- a aplicação precisa de probabilidades estruturadas;
- uma API externa é aceitável;
- operar pesos localmente não é requisito;
- o custo de integração deve ser baixo;
- o pipeline precisa de decisões rápidas antes de acionar modelos generativos maiores.

Não é a escolha natural quando:

- a saída precisa ser texto;
- o problema exige raciocínio aberto longo;
- há exigência de pesos locais;
- o domínio exige fine-tuning controlado pelo operador;
- o comportamento precisa ser auditável até o nível dos pesos e do código do modelo.

---

## 11. Quando usar Laya

Laya é particularmente interessante quando:

- dados não devem sair do ambiente;
- self-hosting é requisito;
- existe necessidade de fine-tuning;
- o domínio possui taxonomia própria;
- a organização quer medir e recalibrar o modelo internamente;
- uma decisão de baixa latência precisa ocorrer próxima da aplicação.

Por outro lado, self-hosting transfere responsabilidade.

Agora são seus:

- GPU/CPU e capacidade;
- atualização de dependências;
- avaliação;
- monitoramento de drift;
- calibração;
- segurança da cadeia de modelos;
- rollback;
- versionamento dos pesos.

Open source reduz dependência de fornecedor, mas não elimina custo operacional.

---

## 12. Um padrão que considero mais importante que o modelo

A inovação mais útil aqui talvez não seja Jev ou Laya isoladamente.

É o padrão:

```text
GENERATIVE MODEL != UNIVERSAL CONTROL PLANE
```

Uma arquitetura madura pode combinar:

- **código determinístico** para regras;
- **decision models** para julgamentos limitados;
- **retrievers** para conhecimento externo;
- **LLMs** para raciocínio e geração;
- **humanos** para decisões de alto impacto ou baixa confiança.

Cada componente faz aquilo para o qual é mais adequado.

Em projetos de agentes e sistemas de memória, isso permite uma separação limpa. Um sistema pode recuperar contexto com RAG, usar um decision head para avaliar relevância ou risco e somente então entregar o conjunto final a um modelo generativo.

Essa abordagem reduz custo, aumenta observabilidade e cria pontos explícitos de controle.

---

## Conclusão

Jev e Laya não devem ser interpretados como "novos chatbots".

Eles representam uma tentativa de retirar do paradigma generativo uma classe de problemas que nunca precisou realmente de geração: **decisões estruturadas sobre um estado conhecido**.

Jev oferece essa ideia como serviço proprietário. Laya mostra que a mesma abstração pode ser implementada com pesos abertos, execução local e especialização.

O aspecto mais importante não é escolher um vencedor. É reconhecer a mudança arquitetural:

> **quando a saída que seu software precisa é uma decisão, gerar texto pode ser uma camada desnecessária.**

O próximo estágio dos agentes provavelmente não será construído com um único modelo fazendo tudo. Será composto por modelos diferentes, memórias diferentes, mecanismos de recuperação diferentes e políticas explícitas conectando cada parte.

Jev e Laya são exemplos recentes dessa direção.

---

## Referências

1. TypeSafe AI. **Introducing System One Models & Jev**. 15 set. 2026.  
   https://typesafe.ai/blog/introducing-system-one-models-and-jev

2. TypeSafe AI. **OpenAPI / System One API Reference**.  
   https://api.typesafe.ai/redoc

3. TypeSafe AI. **Workflow Evals**.  
   https://evals.typesafe.ai/

4. NandhaKishorM. **Laya — Multilingual, non-autoregressive System 1 decision engine**. GitHub.  
   https://github.com/NandhaKishorM/laya

5. NandhaKishorM. **Laya Benchmarks**.  
   https://github.com/NandhaKishorM/laya/blob/main/BENCHMARKS.md

6. NandhaKishorM. **Fine-tuning Laya**.  
   https://github.com/NandhaKishorM/laya/blob/main/docs/finetune.md

7. Munro, H. **jev-laya-benchmark: Speed and accuracy benchmark**.  
   https://github.com/harrymunro/jev-laya-benchmark

---

## Sugestão de imagem

Um diagrama cyberpunk/terminal dividido em duas trilhas:

```text
AUTOREGRESSIVE                  DECISION MODEL

STATE                           STATE
  |                               |
  v                               v
LLM                             ENCODER
  |                               |
token -> token -> token          probability heads
  |                               |
  v                               v
JSON/TEXT                        CHOICE / SCORE / NOUL
  |                               |
parser                            |
  +------------- ACTION <---------+
```

Paleta: preto, verde terminal, cyan e magenta. Visual de telemetria, não de "robô humanoide".
