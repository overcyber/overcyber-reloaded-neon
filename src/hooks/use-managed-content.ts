/**
 * Hook to access content managed through the admin panel
 * This reads from localStorage if available, otherwise returns default values
 */

// Generic function to load data from localStorage
export const loadStoredContent = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (err) {
      console.error(`Error parsing ${key} from localStorage:`, err);
    }
  }
  return defaultValue;
};

// Function to get the about page content
export const getAboutContent = () => {
  const defaultAboutData = {
  "name": "Claudio Henrique Marques de Oliveira",
  "title": "Militar - Marinha do Brasil | Especialista em Defesa Cibernética | Mestrando em Computação Aplicada (UnB)",
  "bio": "Profissional com 19 anos de experiência em Segurança da Informação e Defesa Cibernética, atuando em projetos estratégicos para as Forças Armadas. Mestrando em Computação Aplicada pela UnB com pesquisa em Detecção de Tráfego Malicioso utilizando Vetorização e Aprendizagem de Máquina. Combino expertise em segurança cibernética ofensiva e defensiva com técnicas avançadas de Ciência de Dados e Inteligência Artificial, desenvolvendo soluções inovadoras para proteção de infraestruturas críticas.",
  "email": "unixsolution@gmail.com",
  "location": "Brasília, DF, Brasil",
  "lattes": "https://lattes.cnpq.br/2915812289846388",
  "profileImage": "https://avatars.githubusercontent.com/u/13219600?s=400&u=f39c54243239a31d120222c40a3939649e3ccbfd&v=4",
  "researchFocus": [
    "Defesa Cibernética",
    "Guerra Cibernética",
    "Segurança da Informação",
    "Ciência de Dados",
    "Inteligência Artificial",
    "Machine Learning"
  ],
  "languages": [
    {
      "language": "Português",
      "level": "Nativo",
      "proficiency": "Leitura, Fala, Escrita, Compreensão"
    },
    {
      "language": "Inglês",
      "level": "Intermediário",
      "proficiency": "Leitura (Razoável), Escrita (Razoável), Compreensão (Razoável), Fala (Pouco)"
    }
  ]
};
  
  return defaultAboutData;
};

// Function to get the projects content
export const getProjectsContent = () => {
  const defaultProjects = [
  {
    "id": 7,
    "slug": "adversarial-cybersec",
    "title": "Adversarial CyberSec — Coevolutionary Cyber MARL",
    "description": "Plataforma de pesquisa em cibersegurança autônoma com MADDPG Red vs. MAPPO Blue, self-play, curriculum learning, avaliação reproduzível e execução distribuída em edge.",
    "tags": [
      "Cybersecurity",
      "AI",
      "Research",
      "MARL",
      "Self-Play",
      "Edge AI"
    ],
    "image": "/projects/adversarial.png",
    "github": "https://github.com/overcyber/adve-c-sec-tese",
    "live": "",
    "stars": 0,
    "forks": 0,
    "visibility": "private",
    "status": "Pesquisa avançada / sistema funcional com componentes distribuídos experimentais",
    "source_repos": [
      "overcyber/adve-c-sec-tese"
    ],
    "readme": "# ADVERSARIAL CYBERSEC // COEVOLUTIONARY CYBER MARL\n\n> STATUS: ADVANCED RESEARCH  \n> DOMAIN: AUTONOMOUS CYBER DEFENSE / MULTI-AGENT REINFORCEMENT LEARNING\n\n## SYSTEM OVERVIEW\n\nAdversarial CyberSec é uma plataforma de pesquisa para estudar defesa cibernética autônoma como um problema adversarial multiagente. O núcleo coloca um **Red Team baseado em MADDPG** contra um **Blue Team baseado em MAPPO/CTDE** dentro de um ambiente CyberEnv, permitindo treinamento, self-play, avaliação congelada e coleta estruturada de métricas.\n\nA arquitetura atual não é apenas um experimento de notebook. O repositório descreve um pipeline centralizado funcional, exportação ONNX e uma segunda topologia distribuída para separar geração de experiência em edge devices e atualização dos modelos em servidores GPU.\n\n## CORE ARCHITECTURE\n\n- **Red Team:** MADDPG com Prioritized Experience Replay, HostEncoder/PointerHead e separação de gradientes entre actor e critic.\n- **Blue Team:** MAPPO com PopArt, política fatorada e GAE.\n- **Environment:** espaço de ação fatorado em `action_type × target_id`.\n- **Training:** self-play league, snapshots, matchmaking e curriculum learning.\n- **Evaluation:** políticas congeladas, seeds fixas e métricas separadas do treinamento.\n- **Distributed mode:** broker ZMQ, learner workers, edge actors e artifact registry com SHA-256.\n- **Inference:** ONNX CPU como backend principal; integrações RKNN e Hailo para cenários edge específicos.\n\n## OBSERVABILITY & VALIDATION\n\nO sistema registra métricas de classificação como TP/FP/TN/FN, entropia estratégica e assinaturas de caminho de ataque. O isolamento por `run_id`, validação de shape, TTL para runs órfãos e separação entre treino e avaliação reduzem contaminação experimental.\n\nO README atual reporta **70 testes** cobrindo pipeline de treinamento, espaço de ação fatorado, isolamento entre runs, exportação ONNX, backends de inferência e registro de artefatos.\n\n## EDGE / DISTRIBUTED RESEARCH\n\nA topologia distribuída foi desenhada para usar servidor GPU como learner e placas ARM como geradores de experiência/avaliação. O projeto registra suporte a Orange Pi com ONNX e experimentos com RKNN/Hailo. Alguns pontos permanecem explicitamente em desenvolvimento, como V-trace para MAPPO distribuído, integração CIX NOE e coordenação multiagente completa no edge.\n\n## WHY THIS PROJECT MATTERS\n\nO valor científico está em tratar **aprendizado coevolutivo, validade de avaliação, generalização e transferência de políticas** como problemas de engenharia mensuráveis. O projeto também funciona como base experimental para a tese de doutorado e para estudos de avaliação entre simuladores e hardware heterogêneo.\n\n## REPOSITORY\n\nPrimary: `overcyber/adve-c-sec-tese`\n\n> Nota de publicação: diferenciar sempre recursos funcionais, recursos experimentais e itens ainda não implementados.",
    "ord": 1
  },
  {
    "id": 8,
    "slug": "neoalice-superbrain",
    "title": "NeoAlice + SuperBrain — Persistent Cognitive Agent",
    "description": "Assistente modular de voz e agentes com memória cognitiva persistente, cinco setores de memória, busca semântica híbrida, MCP, automação e execução local.",
    "tags": [
      "AI",
      "Research",
      "Agents",
      "Memory",
      "MCP",
      "Local AI"
    ],
    "image": "/projects/neoalice_superbrain.png",
    "github": "https://github.com/overcyber/neoalice-superbrain",
    "live": "",
    "stars": 1,
    "forks": 0,
    "visibility": "private",
    "status": "Protótipo integrado / pesquisa aplicada",
    "source_repos": [
      "overcyber/neoalice-superbrain"
    ],
    "readme": "# NEOALICE + SUPERBRAIN // PERSISTENT COGNITIVE AGENT\n\n> STATUS: INTEGRATED RESEARCH PROTOTYPE  \n> DOMAIN: LOCAL AI / COGNITIVE MEMORY / VOICE AGENTS\n\n## SYSTEM OVERVIEW\n\nNeoAlice + SuperBrain combina um assistente de voz modular com uma camada persistente de memória para agentes de IA. A proposta é manter contexto entre sessões sem depender apenas da janela do modelo, separando memória por função cognitiva e expondo a recuperação tanto por API quanto por MCP.\n\nO **NeoAlice** fornece wake word, ASR, NLU, sistema multiagente, skills com hot-reload, personalidade RedQueen, automações e suporte a satélites de áudio. O **SuperBrain** fornece armazenamento, classificação, recuperação, decay e reflexão sobre memórias.\n\n## FIVE MEMORY SECTORS\n\nO modelo organiza memória em cinco setores com políticas distintas:\n\n- **Episodic:** eventos e experiências.\n- **Semantic:** fatos e conhecimento consolidado.\n- **Procedural:** procedimentos e padrões de execução.\n- **Emotional:** estado afetivo associado ao contexto.\n- **Reflective:** sínteses, aprendizados e insights derivados.\n\nA implementação documenta decay diferente por setor, busca semântica híbrida, ligação episodic–emotional e geração periódica de reflexões.\n\n## ARCHITECTURE\n\n```text\nVoice / Agents / Skills\n        |\n     NeoAlice\n        |\n Context Builder / Memory SDK\n        |\n  SuperBrain / OpenMemory\n   |       |        |\nPostgres Qdrant   Redis\n        |\n      Ollama\n```\n\nA stack descrita inclui Python/FastAPI no lado do agente e embeddings, Node.js/TypeScript no core de memória, PostgreSQL para metadados/grafo, Qdrant para vetores, Redis para cache, Ollama para inferência/embeddings e MCP para interoperabilidade.\n\n## AGENT INTEGRATION\n\nA integração oferece cliente de memória, construtor de contexto e SDK para skills. O objetivo é permitir que um agente recupere preferências, experiências e conhecimento relevante antes de responder e registre novas memórias após interações significativas.\n\n## SECURITY & OPERATIONS\n\nA documentação registra API keys, JWT, rate limiting, isolamento por usuário, soft delete e exposição seletiva de serviços. O ambiente é dockerizado e foi pensado para operação local/self-hosted.\n\n## RESEARCH VALUE\n\nO projeto é especialmente útil para estudar **memória de longo prazo, consolidação, esquecimento controlado, agentes persistentes e interação entre memória episódica, semântica e procedural** em sistemas locais.\n\n## REPOSITORY\n\nPrimary: `overcyber/neoalice-superbrain`\n\n> Os benchmarks presentes no repositório devem ser tratados como medições reportadas pelo projeto, não como benchmark independente.",
    "ord": 2
  },
  {
    "id": 9,
    "slug": "qsim",
    "title": "QSim — Distributed Quantum Simulation Platform",
    "description": "Simulador quântico distribuído de até 31 qubits com NATS/MessagePack, backends NumPy/CuPy/Qiskit Aer, scheduler, ruído, OpenQASM e observabilidade.",
    "tags": [
      "Research",
      "Systems",
      "Quantum",
      "Distributed Computing",
      "GPU",
      "Simulation"
    ],
    "image": "/projects/qsim.png",
    "github": "https://github.com/overcyber/qsim",
    "live": "",
    "stars": 0,
    "forks": 0,
    "visibility": "public",
    "status": "Pesquisa ativa; fases 1–4 reportadas como entregues, aceleradores em validação",
    "source_repos": [
      "overcyber/qsim"
    ],
    "readme": "# QSIM // DISTRIBUTED QUANTUM SIMULATION PLATFORM\n\n> STATUS: ACTIVE RESEARCH PLATFORM  \n> DOMAIN: QUANTUM SIMULATION / DISTRIBUTED SYSTEMS / GPU COMPUTE\n\n## SYSTEM OVERVIEW\n\nQSim é um simulador quântico teórico-empírico em microserviços, projetado para experimentação reprodutível e execução heterogênea em CPU/GPU. A comunicação interna usa **NATS + MessagePack**; HTTP fica restrito ao gateway e ao console web.\n\nO teto arquitetural atual é de **31 qubits** para o caminho de vetor de estado, com classificação de jobs por capacidade e roteamento para workers apropriados.\n\n## ARCHITECTURE\n\n```text\nBrowser -> FastAPI Gateway -> NATS -> Scheduler\n                              |\n                +-------------+-------------+\n                |             |             |\n             CPU worker    GPU worker   Large worker\n                |             |             |\n                +------ results via NATS ---+\n                              |\n                       SQLite / WebSocket\n```\n\nO scheduler administra prioridades, quotas, cancelamento e filas duráveis. A observabilidade usa Prometheus/Grafana e a execução pode ser distribuída entre diferentes GPUs.\n\n## SIMULATION BACKENDS\n\n- Implementação de referência em **NumPy/CuPy**.\n- Backend de produção opcional baseado em **Qiskit Aer**.\n- Caminhos experimentais com **cuStateVec/cuQuantum**.\n- Kernels Numba para operações específicas em CPU.\n\nA implementação de referência permanece útil como oráculo auditável para verificação cruzada.\n\n## RESEARCH FEATURES\n\n- OpenQASM 2.0/3.0 em subconjunto controlado.\n- Observáveis Pauli.\n- Esferas de Bloch e entropia de emaranhamento.\n- Ruído global, por porta e por qubit.\n- Comparação teórico × empírico.\n- Exportação JSON, CSV e LaTeX.\n- SDK Python síncrono/assíncrono.\n- Cancelamento cooperativo e sweeps de parâmetros.\n\n## VALIDATION\n\nO planejamento do projeto reporta suites física, metamórfica, diferencial, segurança, fuzzing, integração e comparação externa com Qiskit Aer. A fase de aceleradores GPU mais específicos está explicitamente marcada como **em validação no hardware**.\n\n## WHY THIS PROJECT MATTERS\n\nQSim trata simulação quântica como problema de sistemas: scheduling, heterogeneidade de hardware, reprodutibilidade, validação física e observabilidade fazem parte do produto experimental, não apenas o cálculo do vetor de estado.\n\n## REPOSITORY\n\nPrimary: `overcyber/qsim`",
    "ord": 3
  },
  {
    "id": 10,
    "slug": "crypto-monitor-platform",
    "title": "Crypto Monitor Platform — Streaming Market Analytics",
    "description": "Plataforma self-hosted de streaming e analytics para criptoativos com Kafka, Flink, ClickHouse, Iceberg, microestrutura, replay determinístico e reconciliação stream×batch.",
    "tags": [
      "Systems",
      "Data Engineering",
      "Streaming",
      "Analytics",
      "Kafka",
      "ClickHouse"
    ],
    "image": "/projects/cryptomonitorplatform.png",
    "github": "https://github.com/overcyber/crypto-monitor-platform",
    "live": "",
    "stars": 1,
    "forks": 0,
    "visibility": "public",
    "status": "Plataforma ativa / desenvolvimento avançado",
    "source_repos": [
      "overcyber/crypto-monitor-platform"
    ],
    "readme": "# CRYPTO MONITOR PLATFORM // STREAMING MARKET ANALYTICS\n\n> STATUS: ACTIVE PLATFORM  \n> DOMAIN: REAL-TIME DATA ENGINEERING / MARKET MICROSTRUCTURE\n\n## SYSTEM OVERVIEW\n\nCrypto Monitor Platform é uma arquitetura self-hosted para ingestão, persistência e análise de dados de mercado de criptomoedas. O sistema separa cuidadosamente o **hot path** operacional do armazenamento histórico e inclui mecanismos para reconstruir e auditar o fluxo de dados.\n\nO projeto é um monitor analítico: **não executa ordens**.\n\n## DATA PIPELINE\n\n```text\nExchange WebSockets\n      |\n   Ingestors\n      |\n    Kafka\n      |\n     Flink\n   /       \\\nIceberg   Cleaned stream\n(raw)          |\n            ClickHouse\n              |\n      APIs / Workers / UI\n```\n\n- **Kafka:** desacoplamento e buffer de eventos.\n- **Flink:** normalização, validação e processamento stream.\n- **Iceberg + S3-compatible storage:** raw truth durável.\n- **ClickHouse:** camada quente de consulta analítica.\n- **Reconciler:** comparação periódica entre stream e batch.\n- **Replay API:** reprodução determinística de eventos históricos.\n\n## ANALYTICS\n\nO sistema cobre candles, indicadores técnicos, volatilidade, correlação, detecção de regime e microestrutura baseada em livro de ofertas, incluindo métricas como order-book imbalance, OFI e microprice.\n\n## OPERATIONS\n\nA stack é dockerizada e inclui APIs separadas, workers especializados, Grafana, interface web e integração de alertas. O código e os volumes persistentes são organizados para permitir alteração de serviços sem rebuild desnecessário.\n\nExiste também um modo operacional reduzido voltado apenas a monitoramento, útil quando a máquina não precisa subir toda a infraestrutura analítica.\n\n## ENGINEERING VALUE\n\nO aspecto mais relevante é a combinação de **stream processing + raw immutable truth + serving analítico + replay + reconciliação**. Isso permite investigar divergências, refazer cálculos e separar falhas de ingestão de falhas de processamento.\n\n## REPOSITORY\n\nPrimary: `overcyber/crypto-monitor-platform`",
    "ord": 4
  },
  {
    "id": 11,
    "slug": "docling-qdrant-rag-harness",
    "title": "Docling Qdrant RAG Harness — Advanced Retrieval Infrastructure",
    "description": "Harness de microserviços para ingestão documental e RAG híbrido com Docling, Qdrant, FastAPI, Celery/Redis, control plane PostgreSQL e múltiplos LLM runtimes.",
    "tags": [
      "AI",
      "Systems",
      "RAG",
      "Vector Search",
      "Docling",
      "FastAPI"
    ],
    "image": "/projects/doclingqdranharness.png",
    "github": "https://github.com/overcyber/docling-qdrant-rag-harness",
    "live": "",
    "stars": 1,
    "forks": 2,
    "visibility": "public",
    "status": "Harness funcional e documentado",
    "source_repos": [
      "overcyber/docling-qdrant-rag-harness"
    ],
    "readme": "# DOCLING QDRANT RAG HARNESS // ADVANCED RETRIEVAL INFRASTRUCTURE\n\n> STATUS: FUNCTIONAL HARNESS  \n> DOMAIN: DOCUMENT AI / RAG / VECTOR SEARCH\n\n## SYSTEM OVERVIEW\n\nEste projeto fornece uma infraestrutura de RAG em microserviços para ingestão documental em volume, indexação vetorial e consulta multi-corpus. O pipeline usa **Docling** para parsing, **Qdrant** para recuperação vetorial e **FastAPI** como fronteira pública.\n\n## INGESTION PIPELINE\n\n- PDF, DOCX, TXT e Markdown.\n- Ingestão direta de texto via JSON.\n- Chunking `hybrid`, `hierarchical` ou `line_based`.\n- Jobs assíncronos via Celery/Redis.\n- Deduplicação por conteúdo, corpus, perfil de processamento e metadados.\n- Pre-check por SHA-256 para evitar upload/processamento redundante.\n- OCR opcional e suporte a aceleração NVIDIA.\n\n## RETRIEVAL\n\nA camada de consulta suporta embeddings dense + sparse, recuperação híbrida, fusão por RRF e reranking opcional. `corpus_id` atua como namespace lógico, evitando criar uma coleção Qdrant para cada chatbot.\n\nEndpoints separados cobrem busca, construção de contexto, chat e streaming SSE.\n\n## CONTROL PLANE\n\nPostgreSQL mantém corpora, templates de prompt e perfis de agente. Redis também suporta memória conversacional curta. NATS pode ser ativado como event bus sem substituir a fila de trabalho Celery.\n\n## LLM RUNTIMES\n\nO harness documenta integração explícita com:\n\n- OpenAI-compatible APIs\n- Ollama\n- llama.cpp server\n- vLLM\n\nIsso torna a camada de retrieval independente do runtime de geração.\n\n## OPERATIONS & VALIDATION\n\nA documentação inclui Swagger, ReDoc, MkDocs, scripts de smoke test e validação, além de um fluxo de ingestão de diretórios com concorrência e detecção de GPU. O README reporta uma suíte E2E dentro do processo de validação.\n\n## REPOSITORY\n\nPrimary: `overcyber/docling-qdrant-rag-harness`",
    "ord": 5
  },
  {
    "id": 12,
    "slug": "oscen",
    "title": "OSCEN — Open Source Cognitive Embodied Neuromorphic",
    "description": "Arquitetura experimental de inteligência incorporada baseada em SNN, sensores codificados em spikes, plasticidade contínua, controle motor e kernel físico de segurança.",
    "tags": [
      "AI",
      "Research",
      "Neuromorphic",
      "SNN",
      "Embodied AI",
      "Robotics"
    ],
    "image": "/projects/oscen.png",
    "github": "https://github.com/overcyber/OSCEN",
    "live": "",
    "stars": 0,
    "forks": 0,
    "visibility": "private",
    "status": "Pesquisa experimental / arquitetura em consolidação",
    "source_repos": [
      "overcyber/OSCEN"
    ],
    "readme": "# OSCEN // OPEN SOURCE COGNITIVE EMBODIED NEUROMORPHIC\n\n> STATUS: EXPERIMENTAL RESEARCH  \n> DOMAIN: NEUROMORPHIC COMPUTING / EMBODIED AI / ROBOTICS\n\n## SYSTEM OVERVIEW\n\nOSCEN explora uma arquitetura de inteligência incorporada em que percepção, memória, decisão e ação são modeladas em torno de **Spiking Neural Networks (SNNs)** e aprendizado contínuo.\n\nA cadeia conceitual conecta sensores físicos a codificação em spikes, um núcleo cognitivo distribuído em regiões funcionais, um kernel de segurança física, atuadores e feedback sensorimotor.\n\n## SENSORIMOTOR LOOP\n\n```text\nSensors\n  -> Spike Encoding\n  -> SNN Cognitive Core\n  -> Safety Kernel\n  -> Actuators\n  -> Feedback\n  -> SNN / Sensors\n```\n\nOs sensores previstos incluem visão, áudio, toque, IMU, encoders e força/torque. A saída cobre locomoção, manipulação, fala, expressão e ações cognitivas.\n\n## COGNITIVE CORE\n\nA documentação propõe regiões funcionais inspiradas em estruturas neurobiológicas, com módulos para processamento sensorial, features, associação, conceitos/padrões, memória, previsão, seleção de ação, controle motor e modulação.\n\nO plano de pesquisa também descreve seis famílias de plasticidade/aprendizado: STDP, eligibility traces, reforço dopaminérgico, homeostase, plasticidade estrutural e plasticidade inibitória.\n\n## SAFETY LAYER\n\nAntes da atuação física, o desenho prevê um kernel independente para limites de junta, força, torque, colisão e reflexos de retirada. Essa separação é importante para impedir que política cognitiva e segurança mecânica sejam tratadas como o mesmo problema.\n\n## IMPLEMENTATION STATUS\n\nO repositório já contém Dockerfiles, composes, scripts de sondagem NPU, modelos e áreas de implementação GPU. Porém, os objetivos de escala, desempenho e validação descritos nos documentos devem ser publicados como **targets de pesquisa**, não como resultados comprovados, até que benchmarks reproduzíveis estejam versionados.\n\n## RESEARCH TARGET\n\nA arquitetura de planejamento usa como referência uma SNN de grande escala, múltiplas regiões e hardware neuromórfico/GPU. O objetivo científico é estudar aprendizado contínuo e controle incorporado com baixa latência e plasticidade local.\n\n## REPOSITORY\n\nPrimary: `overcyber/OSCEN`",
    "ord": 6
  },
  {
    "id": 13,
    "slug": "red-mppo-evaluation",
    "title": "Red-MPPO Evaluation Harness — Auditable Autonomous Security Research",
    "description": "Harness de avaliação para políticas Red MPPO/MADDPG com orquestração LLM local, evidência criptograficamente rastreável, atribuição de efetividade e execução restrita a laboratórios autorizados.",
    "tags": [
      "Cybersecurity",
      "AI",
      "Research",
      "Evaluation",
      "LLM",
      "Auditability"
    ],
    "image": "/projects/red_mppo_evaluationharness.png",
    "github": "https://github.com/overcyber/red-MPPO-testing_full",
    "live": "",
    "stars": 0,
    "forks": 0,
    "visibility": "private",
    "status": "Pesquisa operacional / avaliação controlada",
    "source_repos": [
      "overcyber/red-MPPO-testing_full",
      "overcyber/red-MPPO-testing_model"
    ],
    "readme": "# RED-MPPO EVALUATION HARNESS // AUDITABLE AUTONOMOUS SECURITY RESEARCH\n\n> STATUS: CONTROLLED RESEARCH HARNESS  \n> SCOPE: AUTHORIZED / OWNED LAB ENVIRONMENTS ONLY\n\n## SYSTEM OVERVIEW\n\nRed-MPPO Evaluation Harness é o braço de avaliação operacional das políticas Red desenvolvidas no ecossistema de pesquisa adversarial. O foco não é apenas executar uma política, mas registrar **o que a política decidiu, como a ação foi concretizada, quais evidências foram obtidas e se o resultado pode ser revalidado posteriormente**.\n\nO conjunto combina política RL, orquestração por LLM local e uma camada de ferramentas controladas em ambiente de laboratório.\n\n## ARCHITECTURE\n\nA versão completa integra três blocos:\n\n- **Policy service:** expõe o checkpoint RL e retorna decisões de alto nível.\n- **Local LLM:** interpreta contexto e seleciona procedimentos/ferramentas dentro do ambiente autorizado.\n- **Ruadan/Kali execution layer:** realiza enumeração e ações de laboratório com registro de evidência.\n\nO repositório `red-MPPO-testing_model` concentra a avaliação do modelo e as métricas; `red-MPPO-testing_full` integra policy service, LLM, Ruadan e ambiente de execução.\n\n## AUDITABILITY\n\nO projeto registra eventos estruturados, transcrições do LLM, evidências e manifestos SHA-256. O critério de sucesso é desenhado para reduzir falsos positivos e permitir auditoria pós-run.\n\nA documentação também separa:\n\n- decisão da política RL;\n- contribuição do LLM;\n- resultado observável;\n- evidência coletada;\n- classificação da etapa de kill chain/TTP.\n\n## EVALUATION VALUE\n\nA principal contribuição para pesquisa é medir **efetividade real, atribuição causal e diferença entre uma política que escolhe uma ação adequada e um executor que consegue materializá-la**. Isso evita confundir decisão estratégica com sucesso operacional.\n\n## SAFETY / PUBLICATION NOTE\n\nEste projeto deve ser apresentado publicamente como **framework de avaliação de segurança em laboratório autorizado**. A página de portfólio não precisa expor procedimentos operacionais, payloads ou instruções ofensivas detalhadas.\n\n## REPOSITORIES\n\n- `overcyber/red-MPPO-testing_full`\n- `overcyber/red-MPPO-testing_model`",
    "ord": 7
  },
  {
    "id": 14,
    "slug": "ruadan",
    "title": "Ruadan — Adaptive Kali Enumeration Orchestrator",
    "description": "Orquestrador multiphase para ferramentas de enumeração do Kali Linux, com execução concorrente, planos configuráveis, reaproveitamento de achados e painel web experimental.",
    "tags": [
      "Cybersecurity",
      "Systems",
      "Enumeration",
      "Kali Linux",
      "Automation",
      "React"
    ],
    "image": "/projects/ruadan.png",
    "github": "https://github.com/overcyber/ruadan",
    "live": "",
    "stars": 2,
    "forks": 0,
    "visibility": "public + private companion",
    "status": "Ferramenta funcional + painel web experimental",
    "source_repos": [
      "overcyber/ruadan",
      "overcyber/ruadan-control-panel"
    ],
    "readme": "# RUADAN // ADAPTIVE KALI ENUMERATION ORCHESTRATOR\n\n> STATUS: FUNCTIONAL CLI + EXPERIMENTAL WEB CONTROL PANEL  \n> DOMAIN: SECURITY ENUMERATION / AUTOMATION\n\n## SYSTEM OVERVIEW\n\nRuadan é um orquestrador Python para ferramentas de enumeração do Kali Linux. Em vez de disparar uma lista fixa de comandos, organiza a investigação em **fases**, executa tarefas em paralelo e reaproveita descobertas anteriores para orientar fases posteriores.\n\n## CORE DESIGN\n\n- **Multi-threaded:** múltiplos comandos e hosts em paralelo.\n- **Configurable:** comandos e planos separados em arquivos de configuração.\n- **Multiphase:** tarefas rápidas são priorizadas para produzir contexto cedo.\n- **State-aware:** resultados já existentes podem ser reutilizados em modo resume.\n- **Modular:** attack plans podem ser adaptados por objetivo.\n\nA ferramenta funciona como uma camada de coordenação sobre utilitários consolidados do ecossistema Kali, preservando seus resultados em uma estrutura de saída organizada.\n\n## WEB CONTROL PANEL\n\nO repositório complementar `ruadan-control-panel` implementa uma interface React/TypeScript com:\n\n- seleção de alvo;\n- configuração das opções do Ruadan;\n- construção de comando;\n- console de execução;\n- dashboard, logs e status.\n\nO código atual deixa claro que parte do comportamento ainda é **simulado/mockado** quando o backend real não está disponível. Por isso, o painel deve ser descrito como protótipo de controle, não como frontend de produção concluído.\n\n## ENGINEERING VALUE\n\nRuadan é um exemplo de automação que mantém ferramentas especializadas independentes, mas adiciona composição, retomada de execução e encadeamento de resultados. Isso reduz trabalho manual repetitivo em ambientes de laboratório e avaliação autorizada.\n\n## SCOPE\n\nUso destinado a ativos próprios ou ambientes explicitamente autorizados.\n\n## REPOSITORIES\n\n- CLI/orchestrator: `overcyber/ruadan`\n- Control panel: `overcyber/ruadan-control-panel`",
    "ord": 8
  },
  {
    "id": 15,
    "slug": "aegis-architecture",
    "title": "AEGIS Architecture Viewer — Cyber Defense System Model",
    "description": "Viewer interativo e blueprint de uma arquitetura AEGIS em cinco camadas para telemetria, analytics, threat intelligence, compliance e visualização 3D de relações de rede.",
    "tags": [
      "Cybersecurity",
      "Systems",
      "Visualization",
      "XDR",
      "Three.js",
      "Architecture"
    ],
    "image": "/projects/aegis.png",
    "github": "https://github.com/overcyber/aegis-architecture",
    "live": "",
    "stars": 0,
    "forks": 0,
    "visibility": "private",
    "status": "Viewer funcional / blueprint de infraestrutura com módulos ainda em evolução",
    "source_repos": [
      "overcyber/aegis-architecture",
      "overcyber/aegis-architecture-viewer",
      "overcyber/aegis-refatora-o"
    ],
    "readme": "# AEGIS ARCHITECTURE VIEWER // CYBER DEFENSE SYSTEM MODEL\n\n> STATUS: INTERACTIVE VIEWER + EVOLVING ARCHITECTURE BLUEPRINT  \n> DOMAIN: CYBER DEFENSE ARCHITECTURE / NETWORK VISUALIZATION\n\n## SYSTEM OVERVIEW\n\nAEGIS Architecture Viewer modela visualmente uma plataforma de cibersegurança em camadas. O frontend usa uma estética de cyber command center e componentes 3D para representar módulos, fluxos e relações entre ativos.\n\nO projeto combina uma aplicação React/TypeScript com documentação de uma infraestrutura maior para ingestão, analytics, grafos, evidências e observabilidade.\n\n## FIVE-LAYER MODEL\n\nA documentação organiza a arquitetura em:\n\n1. **Sensors:** TAP, eBPF e agentes.\n2. **Ingestion:** streaming de eventos.\n3. **Processing:** validação, normalização e enriquecimento.\n4. **Persistence/Analytics:** bancos especializados por carga.\n5. **Application:** visualização, APIs e operações.\n\n## DATA & VISUALIZATION\n\nO blueprint prevê armazenamento e análise com tecnologias como ClickHouse, Elasticsearch, Neo4j, Redis, MinIO, Prometheus/Grafana e bancos relacionais.\n\nO módulo de visualização estuda grafos de fluxo de rede em 3D, classificação de ativos, relações entre endpoints e indicadores de risco. A aplicação usa React, tRPC, Drizzle, Three.js/React Three Fiber e vis-network.\n\n## IMPORTANT MATURITY NOTE\n\nParte da documentação contém **exemplos de módulos e integrações planejadas** — threat intelligence, compliance e APIs — que não devem ser descritos como totalmente implementados apenas porque aparecem no documento de infraestrutura.\n\nA apresentação pública deve distinguir:\n- viewer/UI já codificado;\n- infraestrutura dockerizada presente;\n- módulos descritos como blueprint/scaffolding;\n- recursos ainda planejados.\n\n## REPOSITORY LINEAGE\n\n- `overcyber/aegis-architecture`\n- `overcyber/aegis-architecture-viewer`\n- `overcyber/aegis-refatora-o` — atualmente vazio; tratar como placeholder de refatoração, não como versão funcional.\n\n## REPOSITORY\n\nPrimary: `overcyber/aegis-architecture`",
    "ord": 9
  },
  {
    "id": 16,
    "slug": "gemini-superbrain-memory",
    "title": "Gemini SuperBrain Memory — Persistent Memory Extension",
    "description": "Extensão para Gemini CLI que injeta memória persistente entre sessões via MCP, com auto-load, auto-capture, memória pessoal/equipe e indexação de codebase.",
    "tags": [
      "AI",
      "Systems",
      "Memory",
      "MCP",
      "Gemini CLI",
      "Developer Tools"
    ],
    "image": "/projects/gemini-superbrain-memory.png",
    "github": "https://github.com/overcyber/gemini-superbrain-memory",
    "live": "",
    "stars": 0,
    "forks": 0,
    "visibility": "public",
    "status": "Extensão funcional / open source",
    "source_repos": [
      "overcyber/gemini-superbrain-memory"
    ],
    "readme": "# GEMINI SUPERBRAIN MEMORY // PERSISTENT MEMORY EXTENSION\n\n> STATUS: FUNCTIONAL EXTENSION  \n> DOMAIN: AI DEVELOPER TOOLS / PERSISTENT MEMORY / MCP\n\n## SYSTEM OVERVIEW\n\nGemini SuperBrain Memory é uma extensão para Gemini CLI que adiciona memória persistente entre sessões usando SuperBrain/OpenMemory como backend.\n\nA ideia central é permitir que um agente recupere decisões, contexto de projeto e conhecimento anterior sem depender de reinserção manual a cada execução.\n\n## CORE FEATURES\n\n- **Persistent memory:** contexto salvo entre sessões.\n- **Team memory:** conhecimento de projeto separado da memória pessoal.\n- **Auto capture:** resumo/salvamento ao final da sessão.\n- **Auto load:** recuperação de contexto no início.\n- **Codebase indexing:** análise de arquitetura e padrões do repositório.\n- **Per-project configuration:** backend e escopos específicos por repo.\n\n## MCP INTERFACE\n\nA extensão expõe três ferramentas MCP principais:\n\n- `search_memory`\n- `add_memory`\n- `save_project_memory`\n\nAlém disso, hooks de `SessionStart` e `SessionEnd` automatizam recuperação e persistência.\n\n## ARCHITECTURE\n\nO projeto é implementado em JavaScript e organizado como uma extensão Gemini com manifest, hooks, comandos e um servidor MCP. A biblioteca interna cobre cliente do backend, classificação de memória, tags de container, configuração por projeto, formatação de contexto, integração Git e validação.\n\n## USE CASE\n\nO caso mais forte é desenvolvimento de software de longa duração: decisões arquiteturais, convenções e contexto podem sobreviver à troca de sessão e ser compartilhados por projeto.\n\n## LICENSE\n\nMIT.\n\n## REPOSITORY\n\nPrimary: `overcyber/gemini-superbrain-memory`",
    "ord": 10
  },
  {
    "id": 17,
    "slug": "artemis-netflow",
    "title": "Artemis NetFlow — Interactive Flow Analysis Workbench",
    "description": "Workbench em Dash para análise de grandes conjuntos de fluxos de rede, com filtros por campo, agregações temporais, estatísticas de IP e exportação para Excel.",
    "tags": [
      "Cybersecurity",
      "Data Engineering",
      "NetFlow",
      "Dash",
      "Pandas",
      "Visualization"
    ],
    "image": "/projects/artemis.png",
    "github": "https://github.com/overcyber/artemis-netflow",
    "live": "",
    "stars": 0,
    "forks": 0,
    "visibility": "private",
    "status": "Ferramenta funcional / utilitário analítico",
    "source_repos": [
      "overcyber/artemis-netflow"
    ],
    "readme": "# ARTEMIS NETFLOW // INTERACTIVE FLOW ANALYSIS WORKBENCH\n\n> STATUS: FUNCTIONAL ANALYTICAL TOOL  \n> DOMAIN: NETWORK TELEMETRY / DATA ANALYSIS\n\n## SYSTEM OVERVIEW\n\nArtemis NetFlow é uma aplicação Python/Dash voltada à exploração interativa de arquivos CSV contendo fluxos de rede. A ferramenta consolida múltiplos arquivos, gera agregações temporais, calcula estatísticas por IP e permite aplicar filtros sobre diversos campos de telemetria.\n\n## DATA PROCESSING\n\nO núcleo usa Pandas e NumPy com paralelização via Joblib/multiprocessing. O processamento produz visões diárias e semanais e mantém estatísticas de origem/destino baseadas em contagem de fluxos e volume de bytes.\n\n## INTERACTIVE ANALYSIS\n\nA interface Dash inclui:\n\n- upload de arquivos CSV;\n- filtros por endereço, país, protocolo, portas, flags, tags e categorias;\n- gráficos Plotly com série temporal e média móvel;\n- estatísticas de volume;\n- remoção/limpeza dos dados carregados;\n- exportação dos resultados filtrados para Excel.\n\n## STACK\n\n- Python\n- Dash\n- Pandas / NumPy\n- Plotly\n- Joblib / multiprocessing\n- OpenPyXL\n- Docker / Docker Compose\n\n## POSITION IN THE PORTFOLIO\n\nArtemis é uma ferramenta analítica mais concentrada que AEGIS. Enquanto AEGIS modela uma arquitetura ampla de defesa e visualização, Artemis resolve o problema direto de **carregar, filtrar, agregar e exportar telemetria de fluxo**.\n\n## MATURITY NOTE\n\nO repositório documenta uso e deploy, mas não apresenta no README uma suíte formal de validação. Na página pública, evite chamar o processamento de “10x mais rápido” sem benchmark reproduzível, mesmo que esse comentário exista no código.\n\n## REPOSITORY\n\nPrimary: `overcyber/artemis-netflow`",
    "ord": 11
  },
  {
    "id": 18,
    "slug": "minicurso-multiagents",
    "title": "NEXUS — Local Multi-Agent Systems Course & Lab",
    "description": "Curso intensivo de 40 horas sobre agentes e sistemas multiagente locais, com Ollama/llama.cpp/vLLM, RAG, LangGraph, HITL, avaliação e projeto NEXUS.",
    "tags": [
      "AI",
      "Research",
      "Education",
      "Multi-Agent",
      "Local LLM",
      "LangGraph"
    ],
    "image": "/projects/nexus-minicurso-mult-agents.png",
    "github": "https://github.com/overcyber/minicurso-mult-agents",
    "live": "",
    "stars": 0,
    "forks": 2,
    "visibility": "public",
    "status": "Material didático completo / laboratório reproduzível",
    "source_repos": [
      "overcyber/minicurso-mult-agents"
    ],
    "readme": "# NEXUS // LOCAL MULTI-AGENT SYSTEMS COURSE & LAB\n\n> STATUS: COMPLETE TRAINING PACKAGE  \n> DOMAIN: MULTI-AGENT SYSTEMS / LOCAL LLM / EDUCATION\n\n## SYSTEM OVERVIEW\n\nEste repositório contém o material do curso intensivo **Construindo Sistemas Multiagente com Modelos Locais**, estruturado em cinco encontros de oito horas. O projeto fio-condutor é o **NEXUS**, uma agência de pesquisa executada localmente.\n\nO curso evita dependência obrigatória de APIs pagas e trabalha com Ollama, llama.cpp, vLLM e Hugging Face Transformers.\n\n## CONTENT\n\nO pacote inclui:\n\n- apostila com 162 páginas;\n- cinco decks de apresentação;\n- notas de instrutor nos slides;\n- exercícios e anexos;\n- código progressivo do NEXUS;\n- notebooks e material de apoio;\n- testes automatizados.\n\n## FIVE-DAY PROGRESSION\n\n1. Harness de agente em Python.\n2. Ferramentas, LangChain e RAG.\n3. LangGraph, memória, hooks, HITL e steering.\n4. Equipe multiagente, memória semântica, interface Gradio e automação de e-mail de laboratório.\n5. Hugging Face, pipelines por papel, avaliação e packaging.\n\nCada diretório `diaN/` representa o estado do sistema ao final daquele encontro.\n\n## EVALUATION-FIRST DESIGN\n\nO laboratório inclui casos com gabarito, registro de acerto, citação de fonte, tokens e tempo por caso. Dois casos exigem recusa porque a resposta não existe nos documentos, o que ensina a medir confiabilidade e não apenas fluência.\n\nHooks de `PreToolUse` e mecanismos de steering são implementados como funções testáveis. O README do código reporta **55 testes** que rodam sem carregar LLM nem acessar rede.\n\n## REPOSITORY\n\nPrimary: `overcyber/minicurso-mult-agents`",
    "ord": 12
  },
  {
    "id": 19,
    "slug": "cyberguardian",
    "title": "CyberGuardian — Early Adversarial Cybersecurity Research",
    "description": "Primeira geração da linha de pesquisa de doutorado em Red-vs-Blue MARL, com arquitetura Docker, CybORG-inspired environment, MADDPG, MAPPO/CTDE e self-play.",
    "tags": [
      "Cybersecurity",
      "AI",
      "Research",
      "MARL",
      "Legacy",
      "CybORG"
    ],
    "image": "/projects/cyberguardian.png",
    "github": "https://github.com/overcyber/CyberGuardian",
    "live": "",
    "stars": 0,
    "forks": 0,
    "visibility": "private",
    "status": "Protótipo histórico / predecessor da arquitetura atual",
    "source_repos": [
      "overcyber/CyberGuardian"
    ],
    "readme": "# CYBERGUARDIAN // EARLY ADVERSARIAL CYBERSECURITY RESEARCH\n\n> STATUS: HISTORICAL RESEARCH PROTOTYPE  \n> LINEAGE: PREDECESSOR OF `adve-c-sec-tese`\n\n## SYSTEM OVERVIEW\n\nCyberGuardian preserva uma etapa anterior da pesquisa de doutorado sobre coevolução Red Team × Blue Team. O repositório contém versões iniciais da arquitetura que posteriormente evoluíram para `adve-c-sec-tese`.\n\nÉ útil no portfólio não como “produto atual”, mas como registro da evolução arquitetural e metodológica.\n\n## V1 ARCHITECTURE\n\nA versão inicial organiza o sistema em microserviços para:\n\n- API gateway;\n- orchestrator/self-play;\n- métricas;\n- ambiente de simulação CybORG/ns-3;\n- Red Team MADDPG;\n- Blue Team MAPPO/CTDE;\n- knowledge base com CVE/MITRE.\n\nA infraestrutura associa Redis, PostgreSQL, Prometheus e Grafana.\n\n## V2 EVOLUTION\n\nA segunda geração documenta mudanças como:\n\n- H-MARL;\n- graph encoding/GAT;\n- attention no critic;\n- PopArt;\n- Prioritized Experience Replay;\n- self-play league;\n- curriculum e baseline services.\n\n## RESEARCH LINEAGE\n\nO valor desta entrada é mostrar a progressão:\n\n```text\nCyberGuardian\n   -> adversarial-cybersec v1/v2\n   -> adve-c-sec-tese\n   -> red-MPPO evaluation harness\n```\n\nEssa genealogia evita duplicar alegações e deixa claro quais decisões pertencem à fase histórica e quais estão na plataforma atual.\n\n## PUBLICATION NOTE\n\nMarcar o projeto como **legacy/research lineage**. Para recursos atuais, direcionar a leitura para `adve-c-sec-tese`.\n\n## REPOSITORY\n\nPrimary: `overcyber/CyberGuardian`",
    "ord": 13
  },
  {
    "id": 20,
    "slug": "unknown-so",
    "title": "Unknown-SO — Linux Hardening & Privacy Research Archive",
    "description": "Arquivo experimental de hardening Linux, configurações defensivas, sandboxing, privacidade e anti-fingerprinting, com forte ênfase em threat modeling e curadoria técnica.",
    "tags": [
      "Cybersecurity",
      "Systems",
      "Linux",
      "Hardening",
      "Privacy",
      "Archive"
    ],
    "image": "/projects/unknown-so.png",
    "github": "https://github.com/overcyber/Unknown-SO",
    "live": "",
    "stars": 0,
    "forks": 0,
    "visibility": "private",
    "status": "Arquivo legado / curadoria experimental",
    "source_repos": [
      "overcyber/Unknown-SO"
    ],
    "readme": "# UNKNOWN-SO // LINUX HARDENING & PRIVACY RESEARCH ARCHIVE\n\n> STATUS: LEGACY / CURATED RESEARCH ARCHIVE  \n> DOMAIN: LINUX HARDENING / PRIVACY / THREAT MODELING\n\n## SYSTEM OVERVIEW\n\nUnknown-SO reúne configurações, referências, ferramentas e experimentos voltados a hardening de sistemas Unix-like, privacidade, sandboxing e redução de superfície de ataque.\n\nO próprio repositório deixa claro que **nem todo o conteúdo é autoria original**; parte importante do valor está na curadoria, integração e experimentação com materiais de terceiros.\n\n## THEMES\n\nO acervo cobre, entre outros assuntos:\n\n- threat modeling;\n- Secure Boot;\n- separação e opções de montagem de filesystem;\n- permissões e ownership;\n- endurecimento de serviços;\n- seccomp e sandboxing;\n- kernel/toolchain hardening;\n- firewall e redução de exposição;\n- anti-fingerprinting e privacidade;\n- referências históricas de segurança Linux.\n\n## POSITIONING\n\nA melhor forma de apresentar este projeto é como **laboratório/arquivo de pesquisa em hardening**, e não como uma distribuição pronta ou como autoria de todas as ferramentas incluídas.\n\nVárias recomendações são antigas, agressivas ou específicas de determinadas distribuições. Aplicá-las sem validação pode quebrar um sistema moderno.\n\n## PUBLICATION NOTE\n\nA página de portfólio deve manter três avisos:\n\n1. conteúdo avançado, não tutorial para iniciantes;\n2. configurações precisam ser revisadas para kernels/distribuições atuais;\n3. créditos e licenças dos componentes externos pertencem aos autores originais.\n\n## REPOSITORY\n\nPrimary: `overcyber/Unknown-SO`",
    "ord": 14
  }
];
  
  // Convert admin data format to the format expected by the Projects page
  const storedProjects = loadStoredContent('admin-projects-data', []);
  
  if (!storedProjects.length || storedProjects.some((p: any) => p.title === "NeuraScan" || p.title === "CyberShield")) {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('admin-projects-data');
      } catch {}
    }
    return defaultProjects;
  }
  
  return storedProjects.map((project: any) => ({
    ...project,
    tags: typeof project.tags === 'string' 
      ? project.tags.split(',').map((tag: string) => tag.trim())
      : project.tags,
  }));
};
