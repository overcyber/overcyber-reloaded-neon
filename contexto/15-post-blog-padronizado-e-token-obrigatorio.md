# 15 - Publicação de Post Original Padronizado via API & Token Obrigatório em Todas as Rotas

## 1. Segurança Absoluta do Gateway FastAPI (:8800)
Conforme requisitado, **TODAS** as rotas da API agora exigem obrigatoriamente o Bearer Token, exceto a rota de healthcheck `/healthz`.

### Teste de Verificação Automatizado
```bash
# Healthcheck público (sem token)
GET http://192.168.10.14:8800/healthz -> HTTP 200 OK

# Raiz da API sem token -> HTTP 401 Unauthorized
# Raiz da API com Bearer token -> HTTP 200 OK

# Posts sem token -> HTTP 401 Unauthorized
# Posts com Bearer token -> HTTP 200 OK

# Projetos sem token -> HTTP 401 Unauthorized
# Projetos com Bearer token -> HTTP 200 OK

# Comentários sem token -> HTTP 401 Unauthorized
# Comentários com Bearer token -> HTTP 200 OK

# Mensagens de contato sem token -> HTTP 401 Unauthorized
# Mensagens de contato com Bearer token -> HTTP 200 OK

# Seções do site sem token -> HTTP 401 Unauthorized
# Seções do site com Bearer token -> HTTP 200 OK
```

---

## 2. Criação do Post de Blog Original Padrão Cyberpunk via API

O post de teste anterior (`post-via-api-automatizada`) foi deletado via `DELETE /api/posts/{id}`.

Foi criado e publicado via API um post completo, nos mesmos moldes técnicos, narrativos e visuais de `night-city-underground-tech`:

- **Título:** Autonomous Defense Grid: Mesh Protocols Under Cyber Siege
- **Slug:** `autonomous-defense-grid-mesh-protocols-under-cyber-siege`
- **Excerpt:** "How decentralized mesh networks and zero-knowledge telemetry are reshaping subterranean digital warfare."
- **Imagem de Capa (Unsplash High-Res):** `https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1374&auto=format&fit=crop`
- **Status:** `published`
- **ID Gerado:** `8855ebcc-ddec-46c5-9b12-25eac222d1b3`

### Comando de Publicação Utilizado:
```bash
curl -X POST http://192.168.10.14:8800/api/posts \
  -H "Authorization: Bearer $(cat data/.api_token)" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Autonomous Defense Grid: Mesh Protocols Under Cyber Siege",
    "slug": "autonomous-defense-grid-mesh-protocols-under-cyber-siege",
    "excerpt": "How decentralized mesh networks and zero-knowledge telemetry are reshaping subterranean digital warfare.",
    "image": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1374&auto=format&fit=crop",
    "content": "As megacorporate surveillance architectures expand across the global grid, traditional boundary defenses are failing under the weight of automated telemetry harvesting and state-level intercept nodes. In response, a distributed cadre of autonomous systems engineers and underground operators has deployed resilient, self-healing mesh protocols designed to operate completely off-grid.\n\nThese sovereign mesh topologies utilize localized radio-frequency ad-hoc arrays and peer-to-peer optical transceivers embedded into urban infrastructure. By ditching centralized DNS, IP registries, and cloud relays, data payloads are fragmented into encrypted micro-packets routed through dynamic hop paths that mutate every few milliseconds.\n\nAt the core of this defensive paradigm lies zero-knowledge cryptographic verification. Every handshake between transient nodes occurs without exposing network topology or node identities. Even when corporate intrusion countermeasures sever major arterial links, the mesh automatically converges, rerouting vital traffic through subterranean conduits and air-gapped relay points.\n\nThe line between enterprise network compliance and total digital sovereignty has dissolved. For those operating on the fringes of the modern net, decentralized mesh architecture is no longer an experimental hobby—it is the final bastion against absolute surveillance.",
    "status": "published"
  }'
```

---

## 3. URLs para Acesso e Validação

1. **Página do Artigo no Frontend (Navegador):**
   `http://192.168.10.14:8000/blog/autonomous-defense-grid-mesh-protocols-under-cyber-siege`

2. **Artigo de Referência no Frontend (Navegador):**
   `http://192.168.10.14:8000/blog/night-city-underground-tech`

3. **Arquivo de Posts no Frontend (Navegador):**
   `http://192.168.10.14:8000/blog`

4. **Endpoint do Post no FastAPI (:8800 com Token):**
   `curl -H "Authorization: Bearer <TOKEN>" http://192.168.10.14:8800/api/posts/autonomous-defense-grid-mesh-protocols-under-cyber-siege`

---

## 4. Otimização no Frontend (`BlogPost.tsx`)
Ajustada a ordem de carregamento em `src/pages/BlogPost.tsx` para buscar **primeiro o backend** (fonte da verdade no SQLite). Caso esteja offline ou retorne 404, cai no fallback de localStorage e dados padrão.
Build do frontend recompilado com sucesso via `npm run build`.
Validação estrita de sintaxe Python realizada em todos os arquivos (`server.py`, `fastapi_service/*.py`).
