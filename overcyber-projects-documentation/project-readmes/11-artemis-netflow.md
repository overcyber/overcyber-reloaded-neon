# ARTEMIS NETFLOW // INTERACTIVE FLOW ANALYSIS WORKBENCH

> STATUS: FUNCTIONAL ANALYTICAL TOOL  
> DOMAIN: NETWORK TELEMETRY / DATA ANALYSIS

## SYSTEM OVERVIEW

Artemis NetFlow é uma aplicação Python/Dash voltada à exploração interativa de arquivos CSV contendo fluxos de rede. A ferramenta consolida múltiplos arquivos, gera agregações temporais, calcula estatísticas por IP e permite aplicar filtros sobre diversos campos de telemetria.

## DATA PROCESSING

O núcleo usa Pandas e NumPy com paralelização via Joblib/multiprocessing. O processamento produz visões diárias e semanais e mantém estatísticas de origem/destino baseadas em contagem de fluxos e volume de bytes.

## INTERACTIVE ANALYSIS

A interface Dash inclui:

- upload de arquivos CSV;
- filtros por endereço, país, protocolo, portas, flags, tags e categorias;
- gráficos Plotly com série temporal e média móvel;
- estatísticas de volume;
- remoção/limpeza dos dados carregados;
- exportação dos resultados filtrados para Excel.

## STACK

- Python
- Dash
- Pandas / NumPy
- Plotly
- Joblib / multiprocessing
- OpenPyXL
- Docker / Docker Compose

## POSITION IN THE PORTFOLIO

Artemis é uma ferramenta analítica mais concentrada que AEGIS. Enquanto AEGIS modela uma arquitetura ampla de defesa e visualização, Artemis resolve o problema direto de **carregar, filtrar, agregar e exportar telemetria de fluxo**.

## MATURITY NOTE

O repositório documenta uso e deploy, mas não apresenta no README uma suíte formal de validação. Na página pública, evite chamar o processamento de “10x mais rápido” sem benchmark reproduzível, mesmo que esse comentário exista no código.

## REPOSITORY

Primary: `overcyber/artemis-netflow`
