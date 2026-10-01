
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { FileText, Archive } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image?: string;
  createdAt: string;
}

const FALLBACK_POSTS = [
  {
    id: "1",
    title: "Introdução à Segurança Cibernética",
    slug: "introducao-a-seguranca-cibernetica",
    excerpt: "Uma visão geral sobre os princípios fundamentais da segurança cibernética para iniciantes.",
    content: "Conteúdo completo disponível após configurar no painel Admin.",
    createdAt: "2025-01-15T10:30:00Z"
  },
  {
    id: "2",
    title: "Machine Learning Aplicado à Segurança de Redes",
    slug: "machine-learning-aplicado-a-seguranca-de-redes",
    excerpt: "Como algoritmos de aprendizado de máquina estão revolucionando a detecção de intrusões em redes.",
    content: "Conteúdo completo disponível após configurar no painel Admin.",
    createdAt: "2025-02-22T14:45:00Z"
  },
  {
    id: "3",
    title: "Defesa Cibernética nas Forças Armadas",
    slug: "defesa-cibernetica-forcas-armadas",
    excerpt: "O papel estratégico da defesa cibernética no contexto militar brasileiro.",
    content: "Conteúdo completo disponível após configurar no painel Admin.",
    createdAt: "2025-03-10T09:00:00Z"
  }
];

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionVisible, setSectionVisible] = useState(true);

  useEffect(() => {
    let cancelled = false;

    // Verificar visibilidade de seções
    fetch('/api/sections')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!cancelled && data && data.blog === false) {
          setSectionVisible(false);
        }
      })
      .catch(() => {});

    // Carregar posts: tenta do backend primeiro, com fallback para localStorage
    const loadPosts = async () => {
      try {
        const res = await fetch('/api/posts');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0 && !cancelled) {
            setPosts(data.map((p: any) => ({
              id: p.id,
              title: p.title,
              slug: p.slug,
              excerpt: p.excerpt || "",
              content: p.content || "",
              image: p.image || undefined,
              createdAt: p.createdAt || p.publishedAt || new Date().toISOString(),
            })));
            setLoading(false);
            return;
          }
        }
      } catch {
        // Fallback abaixo
      }

      try {
        const storedPosts = localStorage.getItem("blog-posts");
        if (storedPosts && !cancelled) {
          setPosts(JSON.parse(storedPosts));
        } else if (!cancelled) {
          setPosts(FALLBACK_POSTS);
        }
      } catch (error) {
        console.error("Failed to load blog posts:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadPosts();
    return () => {
      cancelled = true;
    };
  }, []);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (!sectionVisible) {
    return (
      <Layout title="DATALOG" showBackButton={true}>
        <div className="container mx-auto text-center py-16 font-mono">
          <p className="text-primary text-xl mb-2">&gt; SEÇÃO_DESATIVADA</p>
          <p className="text-muted-foreground">&gt; O blog está temporariamente desativado nas configurações.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="DATALOG" showBackButton={true}>
      <div className="container mx-auto">
        <div className="terminal-header mb-8">
          <Archive size={18} className="text-primary mr-2" />
          <span className="text-primary font-mono">ARCHIVE // ENTRIES: {posts.length}</span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="font-mono text-primary loading-dots">LOADING ENTRIES</div>
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <div key={post.id} className="cyber-terminal h-full flex flex-col">
                {post.image && (
                  <div 
                    className="h-48 w-full bg-cover bg-center border-b border-primary/20 relative overflow-hidden"
                    style={{ backgroundImage: `url(${post.image})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
                    <div className="absolute top-2 left-2 text-xs font-mono text-primary/70 bg-background/50 px-2 py-1 backdrop-blur-sm">
                      REF#{post.id.substring(0, 8)}
                    </div>
                  </div>
                )}
                <div className="p-4 flex flex-col flex-grow">
                  <h2 className="text-xl font-mono tracking-wide text-primary mb-2">
                    <Link 
                      to={`/blog/${post.slug}`}
                      className="hover:text-accent transition-colors"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-xs text-primary/70 font-mono mb-4">
                    {formatDate(post.createdAt)}
                  </p>
                  <p className="text-sm text-foreground/80 font-mono flex-grow">
                    {post.excerpt || post.content.substring(0, 100) + '...'}
                  </p>
                  <div className="mt-4 pt-4 border-t border-primary/20">
                    <Button variant="outline" asChild className="cyber-button w-full">
                      <Link to={`/blog/${post.slug}`}>
                        <FileText className="mr-2 h-4 w-4" />
                        <span className="font-mono text-xs">ACCESS DATA</span>
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="cyber-terminal p-6 text-center">
            <h3 className="text-xl font-mono mb-2 text-primary">NO ENTRIES FOUND</h3>
            <p className="text-sm text-foreground/80 font-mono mb-4">
              DATABASE EMPTY. ADMIN ACCESS REQUIRED TO CREATE ENTRIES.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
