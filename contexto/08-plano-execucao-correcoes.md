# Plano de Execução de Correções e Nova API Autônoma

## 1. Problemas Críticos Diagnosticados

- **Moldura sobrepondo conteúdo**: O CSS do site original `https://overcyber.online` usa estritamente `position: absolute` em `body:before`, `body:after` e `.corner-*:before`. Aqui no repositório havia sido colocado `position: fixed`, fazendo os cantos flutuarem no meio da tela ao rolar páginas longas. Além disso, o bundle `dist/` não havia sido recompilado.
- **Admin não carrega dados do banco**: O `dist/` servido pelo `server.py` estava desatualizado (build antigo de 12:12). O `Admin.tsx` precisava disparar a busca no SQLite e redefinir os formulários (`form.reset()`) com os dados reais ao efetuar login.
- **Tabela site_config ausente no banco SQLite**: O banco `data/overcyber.db` não possuía a tabela `site_config` criada, impedindo o endpoint de seções.
- **FastAPI deve ser backend autônomo**: A API para automação deve ser um serviço FastAPI independente (porta 8800) com acesso direto ao SQLite `data/overcyber.db`, autenticado por Bearer Token e com CORS, sem amarrações na página React.

## 2. Ações Planejadas

1. **CSS da Moldura**:
   - Atualizar `src/index.css` para `position: absolute` em todas as bordas e cantos conforme o original.
2. **Admin Data Loading**:
   - Atualizar `src/pages/Admin.tsx` para carregar dados do banco e chamar `reset()` em todos os forms ao autenticar.
   - Tornar todos os campos opcionais nos schemas Zod para permitir alterações parciais.
3. **Visibilidade de Seções**:
   - Criar tabela `site_config` no `data/overcyber.db`.
   - Adicionar interface com switches no Admin para as 7 seções: PERFIL, EDUCAÇÃO, EXPERIÊNCIA, PUBLICAÇÕES, HABILIDADES, PROJETOS, BLOG.
   - Ajustar páginas públicas para respeitarem as seções ativas.
4. **FastAPI Autônoma (porta 8800)**:
   - Criar `fastapi_service/` com endpoints dedicados para Blog, Projetos, Comentários, Mensagens e Seções, com Bearer Token e CORS.
   - Validar sintaxe Python com `py_compile`.
5. **Rebuild e Inicialização**:
   - Rodar `npm run build` para atualizar `dist/`.
   - Reiniciar binário Rust e iniciar serviço FastAPI.
   - Testes reais de execução.
