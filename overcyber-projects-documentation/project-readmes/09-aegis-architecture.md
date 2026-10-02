# AEGIS ARCHITECTURE VIEWER // CYBER DEFENSE SYSTEM MODEL

> STATUS: INTERACTIVE VIEWER + EVOLVING ARCHITECTURE BLUEPRINT  
> DOMAIN: CYBER DEFENSE ARCHITECTURE / NETWORK VISUALIZATION

## SYSTEM OVERVIEW

AEGIS Architecture Viewer modela visualmente uma plataforma de cibersegurança em camadas. O frontend usa uma estética de cyber command center e componentes 3D para representar módulos, fluxos e relações entre ativos.

O projeto combina uma aplicação React/TypeScript com documentação de uma infraestrutura maior para ingestão, analytics, grafos, evidências e observabilidade.

## FIVE-LAYER MODEL

A documentação organiza a arquitetura em:

1. **Sensors:** TAP, eBPF e agentes.
2. **Ingestion:** streaming de eventos.
3. **Processing:** validação, normalização e enriquecimento.
4. **Persistence/Analytics:** bancos especializados por carga.
5. **Application:** visualização, APIs e operações.

## DATA & VISUALIZATION

O blueprint prevê armazenamento e análise com tecnologias como ClickHouse, Elasticsearch, Neo4j, Redis, MinIO, Prometheus/Grafana e bancos relacionais.

O módulo de visualização estuda grafos de fluxo de rede em 3D, classificação de ativos, relações entre endpoints e indicadores de risco. A aplicação usa React, tRPC, Drizzle, Three.js/React Three Fiber e vis-network.

## IMPORTANT MATURITY NOTE

Parte da documentação contém **exemplos de módulos e integrações planejadas** — threat intelligence, compliance e APIs — que não devem ser descritos como totalmente implementados apenas porque aparecem no documento de infraestrutura.

A apresentação pública deve distinguir:
- viewer/UI já codificado;
- infraestrutura dockerizada presente;
- módulos descritos como blueprint/scaffolding;
- recursos ainda planejados.

## REPOSITORY LINEAGE

- `overcyber/aegis-architecture`
- `overcyber/aegis-architecture-viewer`
- `overcyber/aegis-refatora-o` — atualmente vazio; tratar como placeholder de refatoração, não como versão funcional.

## REPOSITORY

Primary: `overcyber/aegis-architecture`
