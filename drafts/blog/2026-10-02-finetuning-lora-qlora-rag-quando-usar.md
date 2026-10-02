---
title: "Fine-tuning, LoRA, QLoRA ou RAG: qual técnica usar e quando"
slug: "finetuning-lora-qlora-rag-quando-usar"
date: "2026-10-02"
status: "draft"
excerpt: "Fine-tuning, LoRA, QLoRA e RAG resolvem problemas diferentes. Este guia separa adaptação de comportamento, conhecimento externo, custo computacional e manutenção para mostrar quando cada técnica faz sentido — e quando combiná-las."
tags:
  - llm
  - fine-tuning
  - lora
  - qlora
  - rag
  - peft
  - machine-learning
  - engenharia-de-ia
---

# Fine-tuning, LoRA, QLoRA ou RAG: qual técnica usar e quando

> **DATALOG // MODEL ADAPTATION**
>
> A pergunta errada é: "qual dessas técnicas é melhor?"  
> A pergunta correta é: **qual parte do sistema precisa mudar — os pesos, o comportamento, o conhecimento disponível em tempo de inferência ou o custo de treinamento?**

Fine-tuning, LoRA, QLoRA e RAG aparecem frequentemente na mesma discussão porque todos podem melhorar uma aplicação baseada em modelos de linguagem.

Mas eles não são equivalentes.

A distinção fundamental é esta:

```text
Fine-tuning / LoRA / QLoRA -> alteram o comportamento paramétrico do modelo
RAG                         -> altera o contexto disponível na inferência
```

Se essa diferença não estiver clara, é fácil gastar GPU tentando resolver um problema de recuperação de informação — ou construir um RAG complexo para um problema que era essencialmente de comportamento.

---

## 1. Antes da técnica, identifique o problema

Considere quatro sintomas diferentes.

### Caso A — o modelo não conhece documentos internos atualizados

Exemplo:

> "Qual é a versão atual da política de resposta a incidentes da organização?"

O problema principal é **acesso a conhecimento externo e mutável**.

Candidato natural: **RAG**.

### Caso B — o modelo conhece a tarefa, mas responde no formato errado

Exemplo:

> O modelo deve transformar traces de incidentes em um schema rígido de classificação, mas insiste em explicar a resposta.

O problema é **comportamento**.

Candidatos: **LoRA, QLoRA ou fine-tuning**, dependendo de escala e recursos.

### Caso C — o modelo precisa aprender uma distribuição altamente específica

Exemplo:

> Classificar eventos usando uma ontologia proprietária, terminologia própria e padrões recorrentes do domínio.

Isso pode exigir adaptação paramétrica.

Candidatos: **LoRA/QLoRA** inicialmente; full fine-tuning quando houver justificativa experimental.

### Caso D — o modelo sabe responder, mas o hardware não comporta treinamento convencional

O problema é **memória de treinamento**.

Candidato: **QLoRA**.

Uma técnica não deve ser escolhida pelo nome. Ela deve ser escolhida pela falha que estamos tentando corrigir.

---

# 2. Full fine-tuning

No fine-tuning completo, atualizamos todos ou grande parte dos parâmetros do modelo base.

Em forma simplificada:

```text
W' = W - η∇L(W)
```

onde:

- `W` representa os pesos do modelo;
- `L` é a função de perda;
- `η` é a taxa de aprendizado.

O resultado é uma nova versão do modelo cujos próprios parâmetros foram modificados pela tarefa.

## O que isso oferece

O full fine-tuning fornece a maior liberdade de adaptação porque o treinamento não está limitado a pequenos módulos adicionais.

Isso pode ser relevante quando:

- há grande quantidade de dados de alta qualidade;
- o domínio difere significativamente do pré-treinamento;
- a tarefa exige mudança profunda de comportamento;
- existe infraestrutura para treinamento distribuído;
- o ganho foi demonstrado por avaliação controlada.

## O custo

Para modelos grandes, atualizar todos os pesos é caro.

Não armazenamos apenas os parâmetros. Durante o treinamento também podem existir:

- gradientes;
- estados do otimizador;
- ativações;
- buffers;
- cópias em diferentes precisões.

O custo de memória pode ser várias vezes maior que o necessário apenas para inferência.

Além disso, uma nova especialização pode significar uma nova cópia de um checkpoint grande.

## Riscos

Full fine-tuning também amplia a superfície de erro:

- catastrophic forgetting;
- overfitting;
- regressão em capacidades gerais;
- maior custo de experimentação;
- maior custo de armazenamento;
- maior dificuldade de manter múltiplas especializações.

Por isso, em 2026, começar diretamente com full fine-tuning raramente é a primeira decisão econômica para um LLM grande.

---

# 3. LoRA: Low-Rank Adaptation

LoRA foi proposta por Hu et al. em 2021.

A ideia parte da hipótese de que a atualização necessária para adaptar um modelo pode ser representada em um subespaço de baixa dimensão.

Em vez de atualizar diretamente uma matriz grande `W`, congelamos o peso original e aprendemos uma atualização de baixo posto:

```text
W' = W + ΔW
ΔW = B A
```

com:

```text
A ∈ R^(r × d)
B ∈ R^(k × r)
r << min(d, k)
```

Se `r` for pequeno, o número de parâmetros treináveis cai drasticamente.

## Consequência prática

O modelo base permanece congelado.

Treinamos apenas os adapters LoRA.

```text
BASE MODEL
   |
   +---- frozen weights
   |
   +---- LoRA adapters <- trainable
```

Isso reduz:

- memória de gradientes;
- estado do otimizador;
- tamanho do artefato treinado;
- custo para manter múltiplas especializações.

## Quando LoRA funciona bem

LoRA é uma escolha forte quando queremos ensinar:

- formato;
- estilo;
- vocabulário;
- padrões de resposta;
- comportamento de ferramenta;
- classificação;
- instruções de domínio;
- políticas operacionais relativamente estáveis.

Também é útil quando precisamos manter vários adapters para o mesmo modelo base.

Por exemplo:

```text
Qwen base
  |
  +-- LoRA SOC triage
  +-- LoRA malware analysis
  +-- LoRA network telemetry
  +-- LoRA document classification
```

O custo de armazenamento de cada especialização é muito menor que manter quatro modelos completos.

## Limitação

LoRA não transforma conhecimento mutável em uma base de dados.

Treinar um adapter com procedimentos internos não fornece, por si só:

- provenance;
- citação;
- atualização instantânea;
- remoção simples de um documento;
- controle explícito de versão do conhecimento.

Se a informação muda semanalmente, provavelmente estamos olhando para um problema de RAG.

---

# 4. QLoRA: LoRA sobre um modelo quantizado

QLoRA foi apresentada por Dettmers et al. em 2023.

A ideia central é elegante:

> manter o modelo base congelado em baixa precisão e treinar adapters LoRA em precisão adequada.

O paper demonstrou fine-tuning de um modelo de 65 bilhões de parâmetros em uma única GPU de 48 GB.

A arquitetura conceitual é:

```text
4-bit quantized base model
          |
          | frozen
          v
     LoRA adapters
          |
       trainable
```

QLoRA introduziu técnicas como:

- **NF4 — NormalFloat 4-bit**;
- **double quantization**;
- **paged optimizers**.

O objetivo principal é reduzir drasticamente o consumo de memória sem abandonar a adaptação via LoRA.

## LoRA versus QLoRA

Uma simplificação útil:

| | LoRA | QLoRA |
|---|---|---|
| Modelo base durante treino | normalmente precisão maior | quantizado, tipicamente 4-bit |
| Pesos base | congelados | congelados |
| Adapters | treináveis | treináveis |
| Memória | baixa | ainda menor |
| Complexidade | menor | maior |
| Melhor uso | há VRAM suficiente | VRAM é restrição crítica |

QLoRA não é "LoRA melhor".

É uma estratégia para tornar LoRA viável sob restrição de memória.

---

# 5. RAG: Retrieval-Augmented Generation

RAG resolve outro problema.

O trabalho clássico de Lewis et al. combinou memória paramétrica com memória não paramétrica recuperada externamente.

Na implementação moderna mais comum:

```text
documents
   |
chunking
   |
embeddings / sparse index
   |
vector DB / search engine
   |
retrieval
   |
query --------------------+
                          |
                          v
                    retrieved context
                          |
                          v
                         LLM
                          |
                          v
                       answer
```

O modelo base pode permanecer completamente inalterado.

O conhecimento entra pela janela de contexto.

## O que isso muda

Se amanhã um procedimento for atualizado:

```text
old_document -> remove/update
new_document -> ingest
```

Não é necessário retreinar o LLM.

Essa propriedade torna RAG adequado para:

- documentação interna;
- normas;
- legislação;
- manuais;
- bases técnicas;
- runbooks;
- tickets;
- conhecimento empresarial;
- inteligência que muda com frequência.

## Outra propriedade: provenance

Como o sistema sabe quais documentos recuperou, podemos registrar:

- documento;
- chunk;
- score;
- versão;
- timestamp;
- metadata;
- fonte usada na resposta.

Isso é muito mais difícil quando o "conhecimento" foi absorvido nos pesos por treinamento.

---

# 6. RAG não é fine-tuning

Essa frase merece ser explícita.

```text
RAG != treinamento
```

RAG não ensina permanentemente o modelo.

Ele fornece informação durante a inferência.

Se o contexto recuperado desaparecer, a informação deixa de estar disponível — exceto pelo que já existia nos pesos do modelo.

Por outro lado:

```text
Fine-tuning != banco de conhecimento
```

Fine-tuning altera a distribuição do modelo. Isso pode fazer o modelo reproduzir fatos presentes no dataset, mas não fornece as propriedades de uma base de conhecimento versionada e consultável.

---

# 7. A matriz de decisão

| Necessidade | Full FT | LoRA | QLoRA | RAG |
|---|---:|---:|---:|---:|
| mudar estilo | forte | forte | forte | fraco |
| mudar formato de saída | forte | forte | forte | limitado |
| ensinar comportamento | forte | forte | forte | limitado |
| conhecimento atualizado | ruim | ruim | ruim | excelente |
| citar fonte | ruim | ruim | ruim | excelente |
| remover conhecimento específico | difícil | difícil | difícil | simples |
| baixo custo de treino | ruim | bom | excelente | não exige treino do LLM |
| pouca VRAM | ruim | moderado | excelente | excelente |
| dados mudam diariamente | ruim | ruim | ruim | excelente |
| múltiplas especializações | caro | excelente | excelente | depende do índice |
| self-host | sim | sim | sim | sim |
| latência adicional de retrieval | não | não | não | sim |
| complexidade de ingestão | não | não | não | sim |

A tabela não significa que RAG sempre vence para conhecimento.

Há situações em que o conhecimento é tão estável e tão intrínseco à tarefa que adaptação paramétrica pode ajudar. Mas, para fatos que precisam ser atualizados, auditados e citados, RAG oferece propriedades operacionais melhores.

---

# 8. Uma árvore de decisão prática

```text
O problema é falta de conhecimento externo?
        |
       SIM
        |
Esse conhecimento muda?
        |
       SIM --------------------------> RAG
        |
       NÃO
        |
Precisa citar/provar a fonte?
        |
       SIM --------------------------> RAG
        |
       NÃO
        v
Avaliar RAG ou adaptação paramétrica

O problema é comportamento/formato?
        |
       SIM
        |
Há VRAM confortável?
        |
     +--+--+
     |     |
    SIM   NÃO
     |     |
   LoRA  QLoRA
     |
O ganho de PEFT é insuficiente e há
dados + compute + evidência experimental?
     |
    SIM
     |
Full fine-tuning
```

O ponto importante é que **full fine-tuning aparece no final da árvore, não no início**.

---

# 9. Quando combinar RAG e LoRA

Essa é frequentemente a arquitetura mais interessante.

RAG e LoRA não são concorrentes porque atuam em eixos diferentes.

Podemos usar:

- RAG para fornecer fatos;
- LoRA para ensinar como usar esses fatos.

Exemplo:

```text
                     +----------------------+
documents ---------->| retrieval / Qdrant  |
                     +----------+-----------+
                                |
                                v
query -----------------> retrieved context
                                |
                                v
                     +----------------------+
                     | base LLM + LoRA      |
                     | incident-analysis    |
                     +----------+-----------+
                                |
                                v
                         structured answer
```

O adapter pode ensinar o modelo a:

- citar evidências;
- seguir um playbook;
- produzir determinado schema;
- distinguir fato recuperado de inferência;
- recusar conclusão quando a evidência é insuficiente.

Enquanto isso, o RAG mantém o conhecimento atualizado.

---

# 10. Quando combinar RAG e QLoRA

O princípio é o mesmo, mas o treinamento do adapter ocorre sobre o modelo quantizado.

Essa combinação é útil para laboratórios locais.

Imagine uma máquina com uma GPU de 24 GB:

1. escolhemos um modelo base compatível;
2. treinamos comportamento com QLoRA;
3. mantemos documentação em um vector store;
4. usamos retrieval durante inferência;
5. avaliamos separadamente retrieval e geração.

Isso permite construir sistemas especializados sem transformar cada atualização documental em um ciclo de treinamento.

---

# 11. O erro clássico: fine-tuning para memorizar documentação

Suponha que existam 20 mil páginas internas.

A primeira ideia pode ser:

> "Vou treinar o modelo com todos esses documentos."

Isso cria vários problemas.

### Atualização

Um documento muda. O que exatamente precisa ser retreinado?

### Deleção

Uma informação foi revogada. Como garantir que o modelo deixou de reproduzi-la?

### Provenance

Qual documento fundamentou a resposta?

### Controle de acesso

Usuários diferentes podem acessar subconjuntos diferentes da base.

Com RAG, ACL pode ser aplicada antes ou durante retrieval.

Com conhecimento incorporado aos pesos, a separação é muito mais difícil.

### Temporalidade

Podemos querer:

```text
policy_version = 2026-09
```

e não "qualquer coisa que o modelo lembra sobre a política".

RAG trata isso naturalmente com metadata.

---

# 12. O erro oposto: usar RAG para corrigir comportamento

Considere um modelo que recebe os documentos corretos, mas:

- ignora evidências;
- responde fora do schema;
- não usa ferramentas corretamente;
- produz explicações quando deveria classificar;
- mistura fato e inferência.

Adicionar mais chunks pode piorar.

O problema não é retrieval.

É comportamento.

Aqui, um dataset de exemplos de alta qualidade e LoRA/QLoRA pode ser muito mais eficiente que aumentar o banco vetorial.

---

# 13. Avaliação: não misture as métricas

Em sistemas RAG, devemos avaliar pelo menos duas camadas separadamente.

## Retrieval

- Recall@K;
- Precision@K;
- MRR;
- nDCG;
- hit rate;
- cobertura;
- qualidade de reranking.

## Generation

- factualidade;
- faithfulness;
- correção;
- completude;
- qualidade das citações;
- aderência ao formato.

Em fine-tuning:

- loss de validação;
- métricas específicas da tarefa;
- generalização fora do domínio;
- regressão em capacidades anteriores;
- robustez;
- comportamento adversarial.

Se retrieval está falhando, retreinar o gerador pode mascarar o problema sem corrigi-lo.

---

# 14. O papel da qualidade dos dados

A técnica não compensa um dataset ruim.

LoRA e QLoRA reduzem o custo de treinamento, mas continuam aprendendo aquilo que fornecemos.

Um dataset inconsistente ensina inconsistência.

Um dataset com respostas longas e vagas ensina respostas longas e vagas.

Um dataset contaminado por outputs incorretos pode reforçar exatamente os padrões que queremos remover.

Em adaptação de modelos, **qualidade de exemplos geralmente vale mais que volume bruto**.

Para RAG, o equivalente é a qualidade da ingestão:

```text
bad parsing
   -> bad chunks
      -> bad embeddings
         -> bad retrieval
            -> bad context
               -> bad answer
```

Por isso, ferramentas de parsing estruturado, chunking consciente do documento, metadata e avaliação do retriever são partes centrais do sistema — não detalhes de pré-processamento.

---

# 15. Relação com Docling + Qdrant

Em uma arquitetura baseada em Docling e Qdrant, a separação de responsabilidades pode ser bastante limpa.

```text
PDF / DOCX / HTML
        |
      Docling
        |
structured document
        |
chunking + metadata
        |
 embeddings / sparse representation
        |
      Qdrant
        |
 retrieval + filters + reranking
        |
      context
        |
 LLM + optional LoRA/QLoRA
```

Docling resolve a transformação documental.

Qdrant funciona como camada de recuperação vetorial/híbrida e filtragem.

O modelo gerativo resolve a resposta.

LoRA/QLoRA entram apenas se o comportamento do modelo precisar ser adaptado.

Essa decomposição torna o sistema observável e permite trocar uma camada sem reescrever todas as outras.

---

# 16. Recomendação operacional

Uma sequência de experimentação eficiente costuma ser:

### 1. Baseline

Teste o modelo base sem treinamento.

### 2. Prompt e schema

Descubra quanto do problema é resolvido com instrução e structured output.

### 3. RAG, se houver conhecimento externo

Construa primeiro um baseline de retrieval mensurável.

### 4. LoRA

Se o problema restante for comportamento, treine um adapter.

### 5. QLoRA

Use quando memória de treinamento for a restrição dominante.

### 6. Full fine-tuning

Só avance quando houver evidência de que PEFT não é suficiente e o ganho esperado justifica o custo.

Essa ordem reduz o espaço experimental.

---

# 17. Resumo em uma linha

```text
RAG       = dê ao modelo a informação certa agora.
LoRA      = ensine um comportamento sem retreinar tudo.
QLoRA     = faça LoRA caber em muito menos memória.
Full FT   = altere profundamente o modelo quando houver razão para isso.
```

---

## Conclusão

Fine-tuning, LoRA, QLoRA e RAG não formam uma escala linear de "técnicas mais avançadas".

Eles operam sobre mecanismos diferentes.

RAG modifica o **contexto**.

LoRA modifica um pequeno conjunto de **parâmetros adicionais** sobre um modelo congelado.

QLoRA mantém a lógica de LoRA, mas reduz a memória necessária ao quantizar o modelo base durante o treinamento.

Full fine-tuning modifica diretamente o **modelo inteiro ou grande parte dele**.

A escolha correta começa pela pergunta:

> **o que exatamente está errado no sistema atual?**

Se o problema é conhecimento mutável, recupere conhecimento.

Se o problema é comportamento, adapte comportamento.

Se o problema é VRAM, quantize o caminho de treinamento.

Se o problema exige alteração profunda dos pesos e há evidência experimental suficiente, então full fine-tuning passa a ser justificável.

Engenharia de IA melhora quando deixamos de procurar uma técnica universal e começamos a separar os problemas corretamente.

---

## Referências

1. Hu, E. J. et al. **LoRA: Low-Rank Adaptation of Large Language Models**. arXiv:2106.09685, 2021.  
   https://arxiv.org/abs/2106.09685

2. Dettmers, T. et al. **QLoRA: Efficient Finetuning of Quantized LLMs**. arXiv:2305.14314, 2023.  
   https://arxiv.org/abs/2305.14314

3. Lewis, P. et al. **Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks**. NeurIPS 2020 / arXiv:2005.11401.  
   https://arxiv.org/abs/2005.11401

4. Hugging Face. **Parameter-efficient fine-tuning — Transformers documentation**.  
   https://huggingface.co/docs/transformers/peft

5. Hugging Face. **PEFT — LoRA documentation**.  
   https://huggingface.co/docs/peft/package_reference/lora

---

## Sugestão de imagem

Diagrama em quatro colunas, estilo terminal:

```text
FULL FT        LoRA           QLoRA          RAG
████████       BASE           4-BIT BASE     BASE
████████       + ΔW           + ΔW           MODEL
████████       ADAPTER        ADAPTER          ^
all weights    low rank       low rank         |
modified       update         + quantized    RETRIEVAL
                                             |
                                          VECTOR DB
```

Use verde terminal para pesos congelados, magenta para parâmetros treináveis e cyan para contexto recuperado.
