# NEOALICE + SUPERBRAIN // PERSISTENT COGNITIVE AGENT

> STATUS: INTEGRATED RESEARCH PROTOTYPE  
> DOMAIN: LOCAL AI / COGNITIVE MEMORY / VOICE AGENTS

## SYSTEM OVERVIEW

NeoAlice + SuperBrain combina um assistente de voz modular com uma camada persistente de memória para agentes de IA. A proposta é manter contexto entre sessões sem depender apenas da janela do modelo, separando memória por função cognitiva e expondo a recuperação tanto por API quanto por MCP.

O **NeoAlice** fornece wake word, ASR, NLU, sistema multiagente, skills com hot-reload, personalidade RedQueen, automações e suporte a satélites de áudio. O **SuperBrain** fornece armazenamento, classificação, recuperação, decay e reflexão sobre memórias.

## FIVE MEMORY SECTORS

O modelo organiza memória em cinco setores com políticas distintas:

- **Episodic:** eventos e experiências.
- **Semantic:** fatos e conhecimento consolidado.
- **Procedural:** procedimentos e padrões de execução.
- **Emotional:** estado afetivo associado ao contexto.
- **Reflective:** sínteses, aprendizados e insights derivados.

A implementação documenta decay diferente por setor, busca semântica híbrida, ligação episodic–emotional e geração periódica de reflexões.

## ARCHITECTURE

```text
Voice / Agents / Skills
        |
     NeoAlice
        |
 Context Builder / Memory SDK
        |
  SuperBrain / OpenMemory
   |       |        |
Postgres Qdrant   Redis
        |
      Ollama
```

A stack descrita inclui Python/FastAPI no lado do agente e embeddings, Node.js/TypeScript no core de memória, PostgreSQL para metadados/grafo, Qdrant para vetores, Redis para cache, Ollama para inferência/embeddings e MCP para interoperabilidade.

## AGENT INTEGRATION

A integração oferece cliente de memória, construtor de contexto e SDK para skills. O objetivo é permitir que um agente recupere preferências, experiências e conhecimento relevante antes de responder e registre novas memórias após interações significativas.

## SECURITY & OPERATIONS

A documentação registra API keys, JWT, rate limiting, isolamento por usuário, soft delete e exposição seletiva de serviços. O ambiente é dockerizado e foi pensado para operação local/self-hosted.

## RESEARCH VALUE

O projeto é especialmente útil para estudar **memória de longo prazo, consolidação, esquecimento controlado, agentes persistentes e interação entre memória episódica, semântica e procedural** em sistemas locais.

## REPOSITORY

Primary: `overcyber/neoalice-superbrain`

> Os benchmarks presentes no repositório devem ser tratados como medições reportadas pelo projeto, não como benchmark independente.
