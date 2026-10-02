# OSCEN // OPEN SOURCE COGNITIVE EMBODIED NEUROMORPHIC

> STATUS: EXPERIMENTAL RESEARCH  
> DOMAIN: NEUROMORPHIC COMPUTING / EMBODIED AI / ROBOTICS

## SYSTEM OVERVIEW

OSCEN explora uma arquitetura de inteligência incorporada em que percepção, memória, decisão e ação são modeladas em torno de **Spiking Neural Networks (SNNs)** e aprendizado contínuo.

A cadeia conceitual conecta sensores físicos a codificação em spikes, um núcleo cognitivo distribuído em regiões funcionais, um kernel de segurança física, atuadores e feedback sensorimotor.

## SENSORIMOTOR LOOP

```text
Sensors
  -> Spike Encoding
  -> SNN Cognitive Core
  -> Safety Kernel
  -> Actuators
  -> Feedback
  -> SNN / Sensors
```

Os sensores previstos incluem visão, áudio, toque, IMU, encoders e força/torque. A saída cobre locomoção, manipulação, fala, expressão e ações cognitivas.

## COGNITIVE CORE

A documentação propõe regiões funcionais inspiradas em estruturas neurobiológicas, com módulos para processamento sensorial, features, associação, conceitos/padrões, memória, previsão, seleção de ação, controle motor e modulação.

O plano de pesquisa também descreve seis famílias de plasticidade/aprendizado: STDP, eligibility traces, reforço dopaminérgico, homeostase, plasticidade estrutural e plasticidade inibitória.

## SAFETY LAYER

Antes da atuação física, o desenho prevê um kernel independente para limites de junta, força, torque, colisão e reflexos de retirada. Essa separação é importante para impedir que política cognitiva e segurança mecânica sejam tratadas como o mesmo problema.

## IMPLEMENTATION STATUS

O repositório já contém Dockerfiles, composes, scripts de sondagem NPU, modelos e áreas de implementação GPU. Porém, os objetivos de escala, desempenho e validação descritos nos documentos devem ser publicados como **targets de pesquisa**, não como resultados comprovados, até que benchmarks reproduzíveis estejam versionados.

## RESEARCH TARGET

A arquitetura de planejamento usa como referência uma SNN de grande escala, múltiplas regiões e hardware neuromórfico/GPU. O objetivo científico é estudar aprendizado contínuo e controle incorporado com baixa latência e plasticidade local.

## REPOSITORY

Primary: `overcyber/OSCEN`
