# QSIM // DISTRIBUTED QUANTUM SIMULATION PLATFORM

> STATUS: ACTIVE RESEARCH PLATFORM  
> DOMAIN: QUANTUM SIMULATION / DISTRIBUTED SYSTEMS / GPU COMPUTE

## SYSTEM OVERVIEW

QSim é um simulador quântico teórico-empírico em microserviços, projetado para experimentação reprodutível e execução heterogênea em CPU/GPU. A comunicação interna usa **NATS + MessagePack**; HTTP fica restrito ao gateway e ao console web.

O teto arquitetural atual é de **31 qubits** para o caminho de vetor de estado, com classificação de jobs por capacidade e roteamento para workers apropriados.

## ARCHITECTURE

```text
Browser -> FastAPI Gateway -> NATS -> Scheduler
                              |
                +-------------+-------------+
                |             |             |
             CPU worker    GPU worker   Large worker
                |             |             |
                +------ results via NATS ---+
                              |
                       SQLite / WebSocket
```

O scheduler administra prioridades, quotas, cancelamento e filas duráveis. A observabilidade usa Prometheus/Grafana e a execução pode ser distribuída entre diferentes GPUs.

## SIMULATION BACKENDS

- Implementação de referência em **NumPy/CuPy**.
- Backend de produção opcional baseado em **Qiskit Aer**.
- Caminhos experimentais com **cuStateVec/cuQuantum**.
- Kernels Numba para operações específicas em CPU.

A implementação de referência permanece útil como oráculo auditável para verificação cruzada.

## RESEARCH FEATURES

- OpenQASM 2.0/3.0 em subconjunto controlado.
- Observáveis Pauli.
- Esferas de Bloch e entropia de emaranhamento.
- Ruído global, por porta e por qubit.
- Comparação teórico × empírico.
- Exportação JSON, CSV e LaTeX.
- SDK Python síncrono/assíncrono.
- Cancelamento cooperativo e sweeps de parâmetros.

## VALIDATION

O planejamento do projeto reporta suites física, metamórfica, diferencial, segurança, fuzzing, integração e comparação externa com Qiskit Aer. A fase de aceleradores GPU mais específicos está explicitamente marcada como **em validação no hardware**.

## WHY THIS PROJECT MATTERS

QSim trata simulação quântica como problema de sistemas: scheduling, heterogeneidade de hardware, reprodutibilidade, validação física e observabilidade fazem parte do produto experimental, não apenas o cálculo do vetor de estado.

## REPOSITORY

Primary: `overcyber/qsim`
