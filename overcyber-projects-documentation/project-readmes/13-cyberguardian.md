# CYBERGUARDIAN // EARLY ADVERSARIAL CYBERSECURITY RESEARCH

> STATUS: HISTORICAL RESEARCH PROTOTYPE  
> LINEAGE: PREDECESSOR OF `adve-c-sec-tese`

## SYSTEM OVERVIEW

CyberGuardian preserva uma etapa anterior da pesquisa de doutorado sobre coevolução Red Team × Blue Team. O repositório contém versões iniciais da arquitetura que posteriormente evoluíram para `adve-c-sec-tese`.

É útil no portfólio não como “produto atual”, mas como registro da evolução arquitetural e metodológica.

## V1 ARCHITECTURE

A versão inicial organiza o sistema em microserviços para:

- API gateway;
- orchestrator/self-play;
- métricas;
- ambiente de simulação CybORG/ns-3;
- Red Team MADDPG;
- Blue Team MAPPO/CTDE;
- knowledge base com CVE/MITRE.

A infraestrutura associa Redis, PostgreSQL, Prometheus e Grafana.

## V2 EVOLUTION

A segunda geração documenta mudanças como:

- H-MARL;
- graph encoding/GAT;
- attention no critic;
- PopArt;
- Prioritized Experience Replay;
- self-play league;
- curriculum e baseline services.

## RESEARCH LINEAGE

O valor desta entrada é mostrar a progressão:

```text
CyberGuardian
   -> adversarial-cybersec v1/v2
   -> adve-c-sec-tese
   -> red-MPPO evaluation harness
```

Essa genealogia evita duplicar alegações e deixa claro quais decisões pertencem à fase histórica e quais estão na plataforma atual.

## PUBLICATION NOTE

Marcar o projeto como **legacy/research lineage**. Para recursos atuais, direcionar a leitura para `adve-c-sec-tese`.

## REPOSITORY

Primary: `overcyber/CyberGuardian`
