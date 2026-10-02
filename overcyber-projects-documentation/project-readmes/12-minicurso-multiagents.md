# NEXUS // LOCAL MULTI-AGENT SYSTEMS COURSE & LAB

> STATUS: COMPLETE TRAINING PACKAGE  
> DOMAIN: MULTI-AGENT SYSTEMS / LOCAL LLM / EDUCATION

## SYSTEM OVERVIEW

Este repositório contém o material do curso intensivo **Construindo Sistemas Multiagente com Modelos Locais**, estruturado em cinco encontros de oito horas. O projeto fio-condutor é o **NEXUS**, uma agência de pesquisa executada localmente.

O curso evita dependência obrigatória de APIs pagas e trabalha com Ollama, llama.cpp, vLLM e Hugging Face Transformers.

## CONTENT

O pacote inclui:

- apostila com 162 páginas;
- cinco decks de apresentação;
- notas de instrutor nos slides;
- exercícios e anexos;
- código progressivo do NEXUS;
- notebooks e material de apoio;
- testes automatizados.

## FIVE-DAY PROGRESSION

1. Harness de agente em Python.
2. Ferramentas, LangChain e RAG.
3. LangGraph, memória, hooks, HITL e steering.
4. Equipe multiagente, memória semântica, interface Gradio e automação de e-mail de laboratório.
5. Hugging Face, pipelines por papel, avaliação e packaging.

Cada diretório `diaN/` representa o estado do sistema ao final daquele encontro.

## EVALUATION-FIRST DESIGN

O laboratório inclui casos com gabarito, registro de acerto, citação de fonte, tokens e tempo por caso. Dois casos exigem recusa porque a resposta não existe nos documentos, o que ensina a medir confiabilidade e não apenas fluência.

Hooks de `PreToolUse` e mecanismos de steering são implementados como funções testáveis. O README do código reporta **55 testes** que rodam sem carregar LLM nem acessar rede.

## REPOSITORY

Primary: `overcyber/minicurso-mult-agents`
