# CRYPTO MONITOR PLATFORM // STREAMING MARKET ANALYTICS

> STATUS: ACTIVE PLATFORM  
> DOMAIN: REAL-TIME DATA ENGINEERING / MARKET MICROSTRUCTURE

## SYSTEM OVERVIEW

Crypto Monitor Platform é uma arquitetura self-hosted para ingestão, persistência e análise de dados de mercado de criptomoedas. O sistema separa cuidadosamente o **hot path** operacional do armazenamento histórico e inclui mecanismos para reconstruir e auditar o fluxo de dados.

O projeto é um monitor analítico: **não executa ordens**.

## DATA PIPELINE

```text
Exchange WebSockets
      |
   Ingestors
      |
    Kafka
      |
     Flink
   /       \
Iceberg   Cleaned stream
(raw)          |
            ClickHouse
              |
      APIs / Workers / UI
```

- **Kafka:** desacoplamento e buffer de eventos.
- **Flink:** normalização, validação e processamento stream.
- **Iceberg + S3-compatible storage:** raw truth durável.
- **ClickHouse:** camada quente de consulta analítica.
- **Reconciler:** comparação periódica entre stream e batch.
- **Replay API:** reprodução determinística de eventos históricos.

## ANALYTICS

O sistema cobre candles, indicadores técnicos, volatilidade, correlação, detecção de regime e microestrutura baseada em livro de ofertas, incluindo métricas como order-book imbalance, OFI e microprice.

## OPERATIONS

A stack é dockerizada e inclui APIs separadas, workers especializados, Grafana, interface web e integração de alertas. O código e os volumes persistentes são organizados para permitir alteração de serviços sem rebuild desnecessário.

Existe também um modo operacional reduzido voltado apenas a monitoramento, útil quando a máquina não precisa subir toda a infraestrutura analítica.

## ENGINEERING VALUE

O aspecto mais relevante é a combinação de **stream processing + raw immutable truth + serving analítico + replay + reconciliação**. Isso permite investigar divergências, refazer cálculos e separar falhas de ingestão de falhas de processamento.

## REPOSITORY

Primary: `overcyber/crypto-monitor-platform`
