# RUADAN // ADAPTIVE KALI ENUMERATION ORCHESTRATOR

> STATUS: FUNCTIONAL CLI + EXPERIMENTAL WEB CONTROL PANEL  
> DOMAIN: SECURITY ENUMERATION / AUTOMATION

## SYSTEM OVERVIEW

Ruadan é um orquestrador Python para ferramentas de enumeração do Kali Linux. Em vez de disparar uma lista fixa de comandos, organiza a investigação em **fases**, executa tarefas em paralelo e reaproveita descobertas anteriores para orientar fases posteriores.

## CORE DESIGN

- **Multi-threaded:** múltiplos comandos e hosts em paralelo.
- **Configurable:** comandos e planos separados em arquivos de configuração.
- **Multiphase:** tarefas rápidas são priorizadas para produzir contexto cedo.
- **State-aware:** resultados já existentes podem ser reutilizados em modo resume.
- **Modular:** attack plans podem ser adaptados por objetivo.

A ferramenta funciona como uma camada de coordenação sobre utilitários consolidados do ecossistema Kali, preservando seus resultados em uma estrutura de saída organizada.

## WEB CONTROL PANEL

O repositório complementar `ruadan-control-panel` implementa uma interface React/TypeScript com:

- seleção de alvo;
- configuração das opções do Ruadan;
- construção de comando;
- console de execução;
- dashboard, logs e status.

O código atual deixa claro que parte do comportamento ainda é **simulado/mockado** quando o backend real não está disponível. Por isso, o painel deve ser descrito como protótipo de controle, não como frontend de produção concluído.

## ENGINEERING VALUE

Ruadan é um exemplo de automação que mantém ferramentas especializadas independentes, mas adiciona composição, retomada de execução e encadeamento de resultados. Isso reduz trabalho manual repetitivo em ambientes de laboratório e avaliação autorizada.

## SCOPE

Uso destinado a ativos próprios ou ambientes explicitamente autorizados.

## REPOSITORIES

- CLI/orchestrator: `overcyber/ruadan`
- Control panel: `overcyber/ruadan-control-panel`
