# DOCLING QDRANT RAG HARNESS // ADVANCED RETRIEVAL INFRASTRUCTURE

> STATUS: FUNCTIONAL HARNESS  
> DOMAIN: DOCUMENT AI / RAG / VECTOR SEARCH

## SYSTEM OVERVIEW

Este projeto fornece uma infraestrutura de RAG em microserviços para ingestão documental em volume, indexação vetorial e consulta multi-corpus. O pipeline usa **Docling** para parsing, **Qdrant** para recuperação vetorial e **FastAPI** como fronteira pública.

## INGESTION PIPELINE

- PDF, DOCX, TXT e Markdown.
- Ingestão direta de texto via JSON.
- Chunking `hybrid`, `hierarchical` ou `line_based`.
- Jobs assíncronos via Celery/Redis.
- Deduplicação por conteúdo, corpus, perfil de processamento e metadados.
- Pre-check por SHA-256 para evitar upload/processamento redundante.
- OCR opcional e suporte a aceleração NVIDIA.

## RETRIEVAL

A camada de consulta suporta embeddings dense + sparse, recuperação híbrida, fusão por RRF e reranking opcional. `corpus_id` atua como namespace lógico, evitando criar uma coleção Qdrant para cada chatbot.

Endpoints separados cobrem busca, construção de contexto, chat e streaming SSE.

## CONTROL PLANE

PostgreSQL mantém corpora, templates de prompt e perfis de agente. Redis também suporta memória conversacional curta. NATS pode ser ativado como event bus sem substituir a fila de trabalho Celery.

## LLM RUNTIMES

O harness documenta integração explícita com:

- OpenAI-compatible APIs
- Ollama
- llama.cpp server
- vLLM

Isso torna a camada de retrieval independente do runtime de geração.

## OPERATIONS & VALIDATION

A documentação inclui Swagger, ReDoc, MkDocs, scripts de smoke test e validação, além de um fluxo de ingestão de diretórios com concorrência e detecção de GPU. O README reporta uma suíte E2E dentro do processo de validação.

## REPOSITORY

Primary: `overcyber/docling-qdrant-rag-harness`
