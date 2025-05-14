
# Guia de Gerenciamento de Conteúdo - Overcyber Website

Este documento contém instruções detalhadas sobre como atualizar e gerenciar o conteúdo do blog e dos projetos no site Overcyber.

## 1. Estrutura do Projeto

O site é construído com:
- React + TypeScript
- Tailwind CSS para estilização
- Shadcn/UI para componentes de interface

Os arquivos principais para gerenciamento de conteúdo estão em:
- `src/pages/Blog.tsx` - Página principal do blog
- `src/pages/BlogPost.tsx` - Página individual de cada post
- `src/pages/Projects.tsx` - Página de projetos

## 2. Como Atualizar o Blog

### Estrutura dos Posts do Blog

Cada post do blog é definido com a seguinte estrutura no arquivo `src/pages/Blog.tsx`:

```typescript
{
  id: 1,
  title: "Título do Post",
  slug: "url-amigavel-do-post",
  excerpt: "Breve descrição do post...",
  date: "2025-04-15",
  readTime: "8 min read",
  tags: ["Tag1", "Tag2", "Tag3"],
  image: "URL_DA_IMAGEM",
}
```

### Para adicionar um novo post:

1. Abra o arquivo `src/pages/Blog.tsx`
2. Localize o array `blogPosts`
3. Adicione um novo objeto seguindo a estrutura acima
4. Atribua um ID único (número incremental)
5. Defina um slug único que será usado na URL
6. Para o conteúdo completo do post, atualize o arquivo `src/pages/BlogPost.tsx` para incluir o conteúdo do novo post baseado no slug

### Exemplo de adição de um novo post:

```typescript
// Em src/pages/Blog.tsx
const blogPosts = [
  // Posts existentes...
  {
    id: 5, // Novo ID
    title: "Novo Post de Blog",
    slug: "novo-post-blog",
    excerpt: "Este é um novo post sobre tecnologia...",
    date: "2025-06-10",
    readTime: "5 min read",
    tags: ["Novidade", "Tecnologia"],
    image: "https://exemplo.com/imagem.jpg",
  },
];
```

```typescript
// Em src/pages/BlogPost.tsx - adicionar dentro da função que retorna o conteúdo
if (slug === "novo-post-blog") {
  return {
    title: "Novo Post de Blog",
    date: "2025-06-10",
    readTime: "5 min read",
    tags: ["Novidade", "Tecnologia"],
    image: "https://exemplo.com/imagem.jpg",
    content: `
      # Título do Post
      
      Este é o conteúdo completo do post em formato Markdown.
      
      ## Subtítulo
      
      Mais conteúdo aqui...
    `
  };
}
```

## 3. Como Atualizar a Seção de Projetos

### Estrutura dos Projetos

Os projetos são definidos no arquivo `src/pages/Projects.tsx` com a seguinte estrutura:

```typescript
{
  id: 1,
  title: "Nome do Projeto",
  description: "Descrição do projeto...",
  tags: ["Tecnologia1", "Tecnologia2"],
  image: "URL_DA_IMAGEM",
  github: "URL_DO_GITHUB",
  live: "URL_DO_DEMO_LIVE", // ou null se não houver
  stars: 342,
  forks: 87,
  readme: `# Conteúdo do README em Markdown...`
}
```

### Para adicionar um novo projeto:

1. Abra o arquivo `src/pages/Projects.tsx`
2. Localize o array `projects`
3. Adicione um novo objeto seguindo a estrutura acima
4. Para o README, você pode copiar diretamente o conteúdo do arquivo README.md do projeto no GitHub

### Exemplo de adição de um novo projeto:

```typescript
// Em src/pages/Projects.tsx
const projects = [
  // Projetos existentes...
  {
    id: 4, // Novo ID
    title: "Novo Projeto",
    description: "Descrição detalhada do novo projeto...",
    tags: ["React", "TypeScript", "API"],
    image: "https://exemplo.com/imagem-projeto.jpg",
    github: "https://github.com/seunome/novoprojeto",
    live: "https://novoprojeto.com",
    stars: 45,
    forks: 12,
    readme: `# Novo Projeto
    
    ## Introdução
    Este é um projeto incrível que faz coisas incríveis.
    
    ## Características
    * Característica 1
    * Característica 2
    
    ## Como instalar
    \`\`\`
    npm install novoprojeto
    \`\`\`
    `
  }
];
```

## 4. Imagens e Recursos

### Como adicionar novas imagens:

1. **Opção 1 - URLs externas**: Use URLs de serviços de hospedagem de imagens, como Unsplash, Imgur ou seu próprio servidor
2. **Opção 2 - Imagens locais**: Adicione as imagens à pasta `public/images/` e referencie-as como `/images/nome-da-imagem.jpg`

### Recomendações para imagens:
- Use imagens otimizadas para web (formatos WebP ou JPEG otimizado)
- Dimensões recomendadas:
  - Posts do blog: 800x420px (proporção 16:9)
  - Projetos: 800x450px (proporção 16:9)
- Tamanho máximo recomendado: 200KB por imagem

## 5. Publicação das Alterações

Após fazer as alterações nos arquivos mencionados acima:

1. **Desenvolvimento local**:
   - Execute `npm run dev` para testar as mudanças localmente
   - Verifique se tudo está funcionando corretamente

2. **Publicação**:
   - Execute `npm run build` para gerar os arquivos estáticos na pasta `dist`
   - Execute `python server.py` para servir os arquivos localmente
   - Para publicação em produção, siga as instruções em `DEPLOY.md`

## 6. Dicas para o Conteúdo

### Blog:
- Mantenha o título conciso e atrativo
- Use tags relevantes para melhorar a descoberta
- Escreva um resumo (excerpt) que desperte interesse
- Organize o conteúdo completo com títulos e subtítulos claros

### Projetos:
- Inclua um README bem estruturado
- Destaque os aspectos técnicos no início da descrição
- Use badges no README para status do projeto
- Inclua instruções de instalação e uso claras

## 7. Suporte

Em caso de dúvidas ou problemas ao atualizar o conteúdo:
- Consulte a documentação do React e Tailwind CSS
- Verifique a estrutura dos arquivos para entender como o conteúdo é renderizado
- Faça backup antes de realizar grandes alterações
