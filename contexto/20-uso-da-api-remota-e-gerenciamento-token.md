# 20 - Uso da API Remota e Gerenciamento do Token de Acesso

## 1. Token Atual da API Remota

O token de autenticação atual configurado no host remoto (`168.75.94.233`) é:

```text
ovc_c5r_jMvyDuBRE48_kaFo1WtqeDiSZ14Mjy3RXFhNe88
```

Arquivo de persistência no host remoto:
`/var/www/overcyber-dev/data/.api_token`

---

## 2. Como Usar a API Remota

A API é acessada via HTTPS pelo proxy reverso Nginx no prefixo `/gateway`:
Base URL: `https://overcyber.online/gateway`

Todas as requisições autenticadas devem enviar o header:
`Authorization: Bearer <TOKEN>`

### 2.1. Healthcheck (Sem token)
```bash
curl -s https://overcyber.online/gateway/healthz
```

### 2.2. Informações e Endpoints Disponíveis
```bash
curl -s -H "Authorization: Bearer ovc_c5r_jMvyDuBRE48_kaFo1WtqeDiSZ14Mjy3RXFhNe88" \
  https://overcyber.online/gateway/
```

### 2.3. Blog: Listar Posts (Público e Rascunhos)
```bash
curl -s -H "Authorization: Bearer ovc_c5r_jMvyDuBRE48_kaFo1WtqeDiSZ14Mjy3RXFhNe88" \
  https://overcyber.online/gateway/api/posts
```

### 2.4. Blog: Criar / Publicar Nova Postagem
```bash
curl -s -X POST https://overcyber.online/gateway/api/posts \
  -H "Authorization: Bearer ovc_c5r_jMvyDuBRE48_kaFo1WtqeDiSZ14Mjy3RXFhNe88" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Novo Post via API",
    "slug": "novo-post-via-api",
    "excerpt": "Resumo do post enviado via automação",
    "content": "Conteúdo em markdown do post...",
    "image": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5",
    "status": "published"
  }'
```

### 2.5. Projetos: Listar e Criar Projetos
Listar:
```bash
curl -s -H "Authorization: Bearer ovc_c5r_jMvyDuBRE48_kaFo1WtqeDiSZ14Mjy3RXFhNe88" \
  https://overcyber.online/gateway/api/projects
```

Criar projeto:
```bash
curl -s -X POST https://overcyber.online/gateway/api/projects \
  -H "Authorization: Bearer ovc_c5r_jMvyDuBRE48_kaFo1WtqeDiSZ14Mjy3RXFhNe88" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Sentinela Mesh",
    "description": "Monitoramento de tráfego anômalo distribuído",
    "tags": "Python, Security, Network",
    "github": "https://github.com/overcyber/sentinela-mesh",
    "image": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b"
  }'
```

### 2.6. Comentários: Moderação
Listar comentários pendentes:
```bash
curl -s -H "Authorization: Bearer ovc_c5r_jMvyDuBRE48_kaFo1WtqeDiSZ14Mjy3RXFhNe88" \
  "https://overcyber.online/gateway/api/comments?status=pending"
```

Aprovar comentário:
```bash
curl -s -X POST "https://overcyber.online/gateway/api/comments/{COMMENT_ID}/approve" \
  -H "Authorization: Bearer ovc_c5r_jMvyDuBRE48_kaFo1WtqeDiSZ14Mjy3RXFhNe88"
```

---

## 3. Como Alterar o Token da API Remota

Existem duas formas diretas:

### Método 1: Alterando o arquivo do token (Recomendado)
Acesse a VM remota via SSH e substitua o conteúdo do arquivo `.api_token`:

```bash
ssh -i /home/usuario/.ssh/oracle ubuntu@168.75.94.233 "echo 'SEU_NOVO_TOKEN_AQUI' > /var/www/overcyber-dev/data/.api_token && sudo systemctl restart overcyber-fastapi.service"
```

### Método 2: Definindo via Variável de Ambiente no Systemd
Edite o serviço `/etc/systemd/system/overcyber-fastapi.service` no servidor remoto:

```ini
[Service]
Environment=OVERCYBER_API_TOKEN=SEU_NOVO_TOKEN_AQUI
```

Em seguida recarregue e reinicie:
```bash
sudo systemctl daemon-reload
sudo systemctl restart overcyber-fastapi.service
```
