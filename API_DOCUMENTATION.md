# Documentação da API Autônoma (FastAPI Gateway)

> Documento completo salvo em [contexto/13-guia-seguranca-e-api.md](contexto/13-guia-seguranca-e-api.md).

### Acesso Rápido:
- **Host Interno:** `http://192.168.10.14:8800`
- **Documentação Interativa (Swagger UI):** [http://192.168.10.14:8800/docs](http://192.168.10.14:8800/docs)
- **Token de Acesso Bearer:** Armazenado em `data/.api_token`.

### Comandos de Teste Rápido:
```bash
TOKEN=$(cat /llm/overcyber-reloaded-neon/data/.api_token)

# Listar posts
curl -s http://192.168.10.14:8800/api/posts

# Moderação de comentários
curl -s "http://192.168.10.14:8800/api/comments?status=pending" -H "Authorization: Bearer $TOKEN"

# Mensagens recebidas
curl -s http://192.168.10.14:8800/api/contact/messages -H "Authorization: Bearer $TOKEN"
```
