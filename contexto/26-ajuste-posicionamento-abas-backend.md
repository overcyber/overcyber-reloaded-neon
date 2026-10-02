# 26. Ajuste de Posicionamento: Comentários e Mensagens Integrados na Aba BACKEND

## 1. Demanda
- O usuário determinou que as abas de **Comentários** e **Mensagens** devem residir exclusivamente dentro da aba **BACKEND** do painel administrativo, mantendo a barra de navegação principal do `/admin` limpa e reservada às seções clássicas de conteúdo (`PERFIL`, `EDUCAÇÃO`, `EXPERIÊNCIA`, `PUBLICAÇÕES`, `HABILIDADES`, `PROJETOS`, `BLOG`, `BACKEND`, `CONFIGURAÇÕES`).

## 2. Alterações Realizadas

### 2.1. Frontend (`src/pages/Admin.tsx`)
- Removidos os triggers externos `COMENTÁRIOS` e `MENSAGENS` da barra principal `<TabsList>`.
- Removidos os conteúdos `<TabsContent value="comments">` e `<TabsContent value="messages">` do nível superior.
- A barra principal do `/admin` exibe:
  - `PERFIL`
  - `EDUCAÇÃO`
  - `EXPERIÊNCIA`
  - `PUBLICAÇÕES`
  - `HABILIDADES`
  - `PROJETOS`
  - `BLOG`
  - `BACKEND`
  - `CONFIGURAÇÕES`

### 2.2. Aba BACKEND (`src/components/AdminBackendPanel.tsx`)
- A aba `BACKEND` encapsula todas as funcionalidades dinâmicas do sistema em suas sub-abas:
  1. **POSTS:** CRUD completo de postagens do blog (criação, edição, status rascunho/publicado).
  2. **COMENTÁRIOS:** Moderação completa (`CommentsPanel`), com visualização de comentários pendentes, contagem em tempo real, aprovação (Check), rejeição (X), marcação como SPAM e exclusão permanente.
  3. **MENSAGENS:** Caixa de entrada de contato (`InboxPanel`), destacando mensagens novas (`NOVA`), tratamento seguro de emails criptografados em repouso, marcação como lida e exclusão.
  4. **MIGRAR:** Migração de dados do localStorage (`MigratePanel`), conectada ao endpoint `POST /api/migrate/import`.

## 3. Validação e Deploy
- Código compilado localmente com `npm run build` e validado com `python3 -m py_compile`.
- Commit e push para o repositório `origin/main`.
- Deploy no servidor Oracle Cloud (`/var/www/overcyber-dev`), com rebuild dos arquivos estáticos e reinício de serviço.
- Testes E2E validados em produção.
