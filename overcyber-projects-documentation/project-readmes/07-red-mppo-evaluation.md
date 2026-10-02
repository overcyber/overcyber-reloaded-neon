# RED-MPPO EVALUATION HARNESS // AUDITABLE AUTONOMOUS SECURITY RESEARCH

> STATUS: CONTROLLED RESEARCH HARNESS  
> SCOPE: AUTHORIZED / OWNED LAB ENVIRONMENTS ONLY

## SYSTEM OVERVIEW

Red-MPPO Evaluation Harness é o braço de avaliação operacional das políticas Red desenvolvidas no ecossistema de pesquisa adversarial. O foco não é apenas executar uma política, mas registrar **o que a política decidiu, como a ação foi concretizada, quais evidências foram obtidas e se o resultado pode ser revalidado posteriormente**.

O conjunto combina política RL, orquestração por LLM local e uma camada de ferramentas controladas em ambiente de laboratório.

## ARCHITECTURE

A versão completa integra três blocos:

- **Policy service:** expõe o checkpoint RL e retorna decisões de alto nível.
- **Local LLM:** interpreta contexto e seleciona procedimentos/ferramentas dentro do ambiente autorizado.
- **Ruadan/Kali execution layer:** realiza enumeração e ações de laboratório com registro de evidência.

O repositório `red-MPPO-testing_model` concentra a avaliação do modelo e as métricas; `red-MPPO-testing_full` integra policy service, LLM, Ruadan e ambiente de execução.

## AUDITABILITY

O projeto registra eventos estruturados, transcrições do LLM, evidências e manifestos SHA-256. O critério de sucesso é desenhado para reduzir falsos positivos e permitir auditoria pós-run.

A documentação também separa:

- decisão da política RL;
- contribuição do LLM;
- resultado observável;
- evidência coletada;
- classificação da etapa de kill chain/TTP.

## EVALUATION VALUE

A principal contribuição para pesquisa é medir **efetividade real, atribuição causal e diferença entre uma política que escolhe uma ação adequada e um executor que consegue materializá-la**. Isso evita confundir decisão estratégica com sucesso operacional.

## SAFETY / PUBLICATION NOTE

Este projeto deve ser apresentado publicamente como **framework de avaliação de segurança em laboratório autorizado**. A página de portfólio não precisa expor procedimentos operacionais, payloads ou instruções ofensivas detalhadas.

## REPOSITORIES

- `overcyber/red-MPPO-testing_full`
- `overcyber/red-MPPO-testing_model`
