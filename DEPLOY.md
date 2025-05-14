
# Guia de Implantação - Overcyber Website

Este guia explica como implantar este site React em seu próprio servidor Python.

## Pré-requisitos

- Node.js e NPM instalados
- Python 3.6+ instalado

## Passos para Implantação

### 1. Construir o projeto

```bash
# Instalar dependências
npm install

# Construir o projeto (gera arquivos estáticos na pasta 'dist')
npm run build
```

### 2. Executar o servidor Python

```bash
# Inicie o servidor Python (por padrão na porta 8000)
python server.py

# Para especificar uma porta diferente
PORT=9000 python server.py
```

### 3. Acessar o site

Abra seu navegador e acesse `http://localhost:8000` (ou a porta que você configurou).

## Notas Adicionais

- O servidor Python cuida do roteamento do lado do cliente para o React Router, redirecionando solicitações não encontradas para index.html.
- Para implantação em produção, considere usar um servidor mais robusto como Gunicorn ou uWSGI junto com Nginx.
- Para HTTPS, considere usar um proxy reverso como Nginx junto com Let's Encrypt.

## Implantação em Produção

Para um ambiente de produção, recomenda-se:

1. Configurar um servidor web como Nginx como proxy reverso
2. Configurar HTTPS usando Let's Encrypt
3. Usar um gerenciador de processos como PM2 ou Supervisor para manter o servidor Python em execução

Exemplo de configuração Nginx:

```nginx
server {
    listen 80;
    server_name seudominio.com;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```
