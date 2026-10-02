# 25. Documentação Completa de Dependências da Hospedagem, Moderação de Comentários, Mensagens e Migração

## 1. Visão Geral da Infraestrutura e Hospedagem

- **Provedor Cloud:** Oracle Cloud Infrastructure (OCI)
- **Instância / Host:** `168.75.94.233`
- **Usuário SSH:** `ubuntu` (chave `/home/usuario/.ssh/oracle`)
- **Sistema Operacional:** Ubuntu 22.04 LTS (Jammy Jellyfish)
- **Kernel:** Linux `6.8.0-1062-oracle` (x86_64)
- **Diretório da Aplicação:** `/var/www/overcyber-dev`
- **Banco de Dados:** `/var/www/overcyber-dev/data/overcyber.db` (SQLite 3 em modo WAL com chaves estrangeiras ativas)
- **Servidor Web / Reverse Proxy:** Nginx 1.18.0 (com terminação SSL/TLS Let's Encrypt para `overcyber.online`)
- **Gateway de Aplicação (API):** FastAPI sobre Uvicorn na porta interna `8800`

---

## 2. Dependências do Sistema Operacional (Instaladas via `apt`)

Todas as dependências instaladas no nível do sistema operacional estão registradas nos logs de pacotes do servidor (`/var/log/dpkg.log` e `/var/log/apt/history.log`):

| Pacote APT | Versão | Origem / Comando | Finalidade |
| :--- | :--- | :--- | :--- |
| `python3-argon2` | `21.1.0-1` (amd64) | `sudo apt-get install -y python3-argon2` | Fornece as bindings de baixo nível (C/FFI) para verificação dos hashes de senha Argon2id (`$argon2id$v=19$m=65536,t=3,p=1$...`) no backend FastAPI, compatibilizando 100% com a base de usuários gerada pelo Rust backend. |
| `sqlite3` | `3.37.2-2ubuntu0.3` | `sudo apt-get install -y sqlite3` | CLI do banco de dados relacional em arquivo, suporte a WAL mode e migrações. |
| `nginx` | `1.18.0-6ubuntu14.5` | `sudo apt-get install -y nginx` | Servidor web HTTP/HTTPS reverso e entrega dos arquivos estáticos compilados do React (`dist/`). |
| `python3-pip` | `22.0.2-1ubuntu0.5` | `sudo apt-get install -y python3-pip` | Gerenciador de pacotes Python para bibliotecas de aplicação. |
| `nodejs` / `npm` | Node v20.x / npm v10.x | NodeSource repository | Execução do build do frontend React/Vite. |

---

## 3. Dependências Python do Gateway FastAPI

Arquivo de referência: `fastapi_service/requirements.txt`

```text
fastapi>=0.110.0
uvicorn[standard]>=0.25.0
pydantic>=2.7.0
httpx>=0.27.0
argon2-cffi>=21.1.0
```

### Pacotes Instalados no Ambiente Python:
- `fastapi` (`0.110.3`): Framework de alta performance para a API REST assíncrona.
- `uvicorn` (`0.25.0`): Servidor ASGI ASGI de nível de produção.
- `pydantic` (`2.7.1`): Validação de tipos e schemas de entrada/saída.
- `httpx` (`0.27.0`): Cliente HTTP assíncrono para testes e eventuais chamadas integradas.
- `argon2-cffi` (`21.1.0` / `25.1.0`): Wrapper Python sobre a lib argon2 do sistema para autenticação de administradores.

---

## 4. Configuração dos Serviços do Sistema

### 4.1. Serviço Systemd: `overcyber-fastapi.service`

Arquivo em `/etc/systemd/system/overcyber-fastapi.service`:

```ini
[Unit]
Description=Overcyber FastAPI API Gateway
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/var/www/overcyber-dev
ExecStart=/usr/bin/python3 -m uvicorn fastapi_service.main:app --host 127.0.0.1 --port 8800 --workers 2
Restart=always
RestartSec=3
Environment=PYTHONUNBUFFERED=1
Environment=FASTAPI_API_TOKEN=ovc_c5r_jMvyDuBRE48_kaFo1WtqeDiSZ14Mjy3RXFhNe88
Environment=API_PORT=8800

[Install]
WantedBy=multi-user.target
```

Comandos de controle do serviço:
```bash
sudo systemctl daemon-reload
sudo systemctl restart overcyber-fastapi.service
sudo systemctl status overcyber-fastapi.service
```

### 4.2. Configuração Nginx: `/etc/nginx/sites-available/overcyber`

```nginx
server {
    server_name overcyber.online www.overcyber.online;

    root /var/www/overcyber-dev/dist;
    index index.html;

    # Encaminhamento da API para o gateway FastAPI
    location /api/ {
        proxy_pass http://127.0.0.1:8800/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SPA Fallback para React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    listen 443 ssl;
    # Certificados SSL gerenciados pelo Certbot / Let's Encrypt
}
```

---

## 5. Correção e Solução dos Problemas Reportados

### 5.1. Comentários não apareciam para aprovação

- **Causa Raiz:** O endpoint público de submissão de comentários (`POST /api/posts/{slug}/comments`) definia por padrão `status = 'approved'` em vez de `status = 'pending'`. Com isso, quando um comentário era enviado, ele já caía como "aprovado" e nunca aparecia na fila de moderação de comentários pendentes. Além disso, no frontend, os comentários estavam escondidos dentro de uma sub-aba da aba "BACKEND".
- **Solução Implementada:**
  1. `fastapi_service/main.py`: Alterado `create_post_comment` para sempre gravar novos comentários públicos com `status="pending"`.
  2. `fastapi_service/db.py`: `create_comment` agora tem valor padrão `status="pending"`, e `list_comments` garante títulos e slugs consistentes para exibição.
  3. `src/pages/Admin.tsx`: Elevada a aba **COMENTÁRIOS** para o menu de navegação primário do painel administrativo, com ícone de mensagem e acesso instantâneo.
  4. `src/components/AdminBackendPanel.tsx`: Componente `CommentsPanel` aprimorado com contador de pendentes em tempo real, filtros visuais ("Pendentes", "Aprovados", "Rejeitados", "Spam"), botão de atualização e ações de aprovação direta.

### 5.2. Mensagens não apareciam na interface

- **Causa Raiz:** A caixa de entrada de mensagens de contato não possuía aba própria no menu principal do `Admin.tsx`. Estava inserida como uma sub-aba sob o nome em inglês "INBOX" dentro da aba técnica "BACKEND". Adicionalmente, mensagens anteriores continham emails cifrados pelo backend antigo (`v1:gc1:...`), o que exibia código ilegível na tela.
- **Solução Implementada:**
  1. `src/pages/Admin.tsx`: Adicionada a aba primária **MENSAGENS** no topo do painel admin.
  2. `src/components/AdminBackendPanel.tsx`: Componente `InboxPanel` exportado e reformulado:
     - Indicador destacado para mensagens não lidas ("NOVA").
     - Tratamento seguro de strings cifradas em repouso (`v1:gc1:...`) com texto explicativo amigável `(email protegido / criptografado em repouso)`.
     - Botão para marcar mensagens como lidas (`POST /api/contact/messages/{id}/read`).
     - Botão para exclusão com confirmação (`DELETE /api/contact/messages/{id}`).
     - Contador total e de não lidas.

### 5.3. Erro na Migração de Dados do localStorage

- **Causa Raiz:** O botão "Importar agora" do painel enviava uma requisição `POST /api/migrate/import` com o snapshot `{ about, resume, projects, posts }`. Esse endpoint não havia sido implementado no gateway FastAPI, retornando erro `404 Not Found`.
- **Solução Implementada:**
  1. `fastapi_service/db.py`: Criadas as funções `slugify(text)` e `import_migration_snapshot(snapshot)`:
     - Importa dados do perfil (`about`) preservando campos preenchidos.
     - Importa seções do currículo (`education`, `experience`, `publications`, `skills`).
     - Importa projetos (`projects`), atualizando dados existentes por slug/título ou inserindo novos com tags, repositórios, imagens e README.
     - Importa posts do blog (`posts`), atualizando ou inserindo com slug, título, resumo, imagem e conteúdo.
  2. `fastapi_service/main.py`: Adicionado endpoint protegido `@app.post("/api/migrate/import")` autenticado por Bearer token ou cookie de sessão do administrador.
  3. `src/components/AdminBackendPanel.tsx`: `MigratePanel` atualizado com estado de carregamento (`busy`), desativação de cliques duplos e notificação de toast com detalhamento das contagens importadas.

---

## 6. Procedimento de Validação e Testes em Produção

Todos os componentes foram submetidos a validação rigorosa com testes automatizados:

1. **Validação de Sintaxe Python:**
   `python3 -m py_compile fastapi_service/config.py fastapi_service/auth.py fastapi_service/db.py fastapi_service/main.py` -> 100% OK.
2. **Build do Frontend:**
   `npm run build` -> Compilação Vite bem-sucedida, gerando `dist/`.
3. **Autenticação Admin:**
   Validação do cookie `sid` e verificação da sessão em `/api/auth/me`.
4. **Ciclo de Comentários:**
   Submissão pública -> status `pending` -> listagem na fila -> aprovação pelo admin -> exibição pública com status `approved`.
5. **Ciclo de Mensagens:**
   Envio pelo formulário de contato -> listagem no painel -> marcação como lida -> exclusão.
6. **Migração:**
   `POST /api/migrate/import` validado com resposta `{ ok: true, counts: { ... } }`.
