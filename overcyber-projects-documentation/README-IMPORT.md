# Integração com `overcyber.online/projects`

## Payload

Use `projects-overcyber-site-ready-ptbr.json` como fonte para o cadastro dos projetos. Ele segue os campos observados na implementação atual de `/projects`:

```json
{
  "title": "...",
  "description": "...",
  "tags": ["..."],
  "image": "/projects/slug.webp",
  "github": "https://github.com/...",
  "live": "",
  "stars": 0,
  "forks": 0,
  "readme": "...",
  "ord": 1
}
```

## Ordenação

A ordem foi deliberada para que as três primeiras tags únicas sejam:

1. `Cybersecurity`
2. `AI`
3. `Research`

Isso contorna o comportamento atual de `Projects.tsx`, que usa as três primeiras tags únicas como tabs.

## Imagens

Adicione 14 imagens em `public/projects/` com estes nomes:

```text
adversarial-cybersec.webp
neoalice-superbrain.webp
qsim.webp
crypto-monitor-platform.webp
docling-qdrant-rag-harness.webp
oscen.webp
red-mppo-evaluation.webp
ruadan.webp
aegis-architecture.webp
gemini-superbrain-memory.webp
artemis-netflow.webp
minicurso-multiagents.webp
cyberguardian.webp
unknown-so.webp
```

## Repositórios privados

Antes de publicar, decida como tratar o botão GitHub de projetos privados. O componente atual renderiza esse botão sem verificar visibilidade.

A solução mais limpa é tornar `github` opcional e renderizar o botão apenas quando houver URL pública. Uma alternativa é publicar um mirror de documentação.

## Stars e forks

Os valores incluídos refletem a consulta aos repositórios em **2026-10-01**. Para evitar números desatualizados, o ideal é buscar essas métricas dinamicamente no backend ou removê-las de projetos privados.

## Maturidade

Os READMEs foram escritos para não misturar:
- recursos implementados;
- recursos experimentais;
- roadmap;
- documentação histórica.

Não remova essas distinções ao resumir os cards.
