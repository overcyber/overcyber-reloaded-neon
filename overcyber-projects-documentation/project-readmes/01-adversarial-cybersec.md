# ADVERSARIAL CYBERSEC // COEVOLUTIONARY CYBER MARL

> STATUS: ADVANCED RESEARCH  
> DOMAIN: AUTONOMOUS CYBER DEFENSE / MULTI-AGENT REINFORCEMENT LEARNING

## SYSTEM OVERVIEW

Adversarial CyberSec é uma plataforma de pesquisa para estudar defesa cibernética autônoma como um problema adversarial multiagente. O núcleo coloca um **Red Team baseado em MADDPG** contra um **Blue Team baseado em MAPPO/CTDE** dentro de um ambiente CyberEnv, permitindo treinamento, self-play, avaliação congelada e coleta estruturada de métricas.

A arquitetura atual não é apenas um experimento de notebook. O repositório descreve um pipeline centralizado funcional, exportação ONNX e uma segunda topologia distribuída para separar geração de experiência em edge devices e atualização dos modelos em servidores GPU.

## CORE ARCHITECTURE

- **Red Team:** MADDPG com Prioritized Experience Replay, HostEncoder/PointerHead e separação de gradientes entre actor e critic.
- **Blue Team:** MAPPO com PopArt, política fatorada e GAE.
- **Environment:** espaço de ação fatorado em `action_type × target_id`.
- **Training:** self-play league, snapshots, matchmaking e curriculum learning.
- **Evaluation:** políticas congeladas, seeds fixas e métricas separadas do treinamento.
- **Distributed mode:** broker ZMQ, learner workers, edge actors e artifact registry com SHA-256.
- **Inference:** ONNX CPU como backend principal; integrações RKNN e Hailo para cenários edge específicos.

## OBSERVABILITY & VALIDATION

O sistema registra métricas de classificação como TP/FP/TN/FN, entropia estratégica e assinaturas de caminho de ataque. O isolamento por `run_id`, validação de shape, TTL para runs órfãos e separação entre treino e avaliação reduzem contaminação experimental.

O README atual reporta **70 testes** cobrindo pipeline de treinamento, espaço de ação fatorado, isolamento entre runs, exportação ONNX, backends de inferência e registro de artefatos.

## EDGE / DISTRIBUTED RESEARCH

A topologia distribuída foi desenhada para usar servidor GPU como learner e placas ARM como geradores de experiência/avaliação. O projeto registra suporte a Orange Pi com ONNX e experimentos com RKNN/Hailo. Alguns pontos permanecem explicitamente em desenvolvimento, como V-trace para MAPPO distribuído, integração CIX NOE e coordenação multiagente completa no edge.

## WHY THIS PROJECT MATTERS

O valor científico está em tratar **aprendizado coevolutivo, validade de avaliação, generalização e transferência de políticas** como problemas de engenharia mensuráveis. O projeto também funciona como base experimental para a tese de doutorado e para estudos de avaliação entre simuladores e hardware heterogêneo.

## REPOSITORY

Primary: `overcyber/adve-c-sec-tese`

> Nota de publicação: diferenciar sempre recursos funcionais, recursos experimentais e itens ainda não implementados.
