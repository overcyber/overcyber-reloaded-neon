# GEMINI SUPERBRAIN MEMORY // PERSISTENT MEMORY EXTENSION

> STATUS: FUNCTIONAL EXTENSION  
> DOMAIN: AI DEVELOPER TOOLS / PERSISTENT MEMORY / MCP

## SYSTEM OVERVIEW

Gemini SuperBrain Memory é uma extensão para Gemini CLI que adiciona memória persistente entre sessões usando SuperBrain/OpenMemory como backend.

A ideia central é permitir que um agente recupere decisões, contexto de projeto e conhecimento anterior sem depender de reinserção manual a cada execução.

## CORE FEATURES

- **Persistent memory:** contexto salvo entre sessões.
- **Team memory:** conhecimento de projeto separado da memória pessoal.
- **Auto capture:** resumo/salvamento ao final da sessão.
- **Auto load:** recuperação de contexto no início.
- **Codebase indexing:** análise de arquitetura e padrões do repositório.
- **Per-project configuration:** backend e escopos específicos por repo.

## MCP INTERFACE

A extensão expõe três ferramentas MCP principais:

- `search_memory`
- `add_memory`
- `save_project_memory`

Além disso, hooks de `SessionStart` e `SessionEnd` automatizam recuperação e persistência.

## ARCHITECTURE

O projeto é implementado em JavaScript e organizado como uma extensão Gemini com manifest, hooks, comandos e um servidor MCP. A biblioteca interna cobre cliente do backend, classificação de memória, tags de container, configuração por projeto, formatação de contexto, integração Git e validação.

## USE CASE

O caso mais forte é desenvolvimento de software de longa duração: decisões arquiteturais, convenções e contexto podem sobreviver à troca de sessão e ser compartilhados por projeto.

## LICENSE

MIT.

## REPOSITORY

Primary: `overcyber/gemini-superbrain-memory`
