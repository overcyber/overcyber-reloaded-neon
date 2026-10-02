
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, FileText, Calendar, AlertTriangle, MessageSquare, Send } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { requestAndSolvePow } from "@/lib/pow";
import { toast } from "@/components/ui/use-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  image?: string;
  createdAt: string;
}

interface CommentRow {
  id: string;
  authorName: string;
  body: string;
  createdAt: string;
}

const FALLBACK_POSTS = [
  {
    id: "1",
    title: "Introdução à Segurança Cibernética",
    slug: "introducao-a-seguranca-cibernetica",
    excerpt: "Uma visão geral sobre os princípios fundamentais da segurança cibernética para iniciantes.",
    content: "Conteúdo completo disponível após configurar no painel Admin.\n\nEste é um placeholder do sistema de fallback.\n\nAcesse /admin para criar e gerenciar seus posts do blog.",
    createdAt: "2025-01-15T10:30:00Z"
  },
  {
    id: "2",
    title: "Machine Learning Aplicado à Segurança de Redes",
    slug: "machine-learning-aplicado-a-seguranca-de-redes",
    excerpt: "Como algoritmos de aprendizado de máquina estão revolucionando a detecção de intrusões em redes.",
    content: "Conteúdo completo disponível após configurar no painel Admin.\n\nEste é um placeholder do sistema de fallback.\n\nAcesse /admin para criar e gerenciar seus posts do blog.",
    createdAt: "2025-02-22T14:45:00Z"
  },
  {
    id: "3",
    title: "Defesa Cibernética nas Forças Armadas",
    slug: "defesa-cibernetica-forcas-armadas",
    excerpt: "O papel estratégico da defesa cibernética no contexto militar brasileiro.",
    content: "Conteúdo completo disponível após configurar no painel Admin.\n\nEste é um placeholder do sistema de fallback.\n\nAcesse /admin para criar e gerenciar seus posts do blog.",
    createdAt: "2025-03-10T09:00:00Z"
  }
];

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [backendOn, setBackendOn] = useState(false);
  const navigate = useNavigate();

  const findPostInList = (list: BlogPost[]): BlogPost | undefined =>
    list.find((p) => p.slug === slug);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      let postFound = false;

      // 1. Tenta o backend primeiro (fonte da verdade do SQLite / API)
      try {
        const remote = await api<any>(`/posts/${slug}`);
        if (!cancelled && remote && remote.id) {
          setPost({
            id: remote.id,
            title: remote.title,
            slug: remote.slug,
            excerpt: remote.excerpt,
            content: remote.content,
            image: remote.image || undefined,
            createdAt: remote.publishedAt || remote.createdAt,
          });
          postFound = true;
          setBackendOn(true);
        }
      } catch {
        // Backend indisponível ou 404
      }

      // 2. Se não encontrou no backend, tenta localStorage
      if (!postFound) {
        try {
          const stored = localStorage.getItem("blog-posts");
          if (stored) {
            const posts: BlogPost[] = JSON.parse(stored);
            const found = findPostInList(posts);
            if (found && !cancelled) {
              setPost(found);
              postFound = true;
            }
          }
        } catch (e) {
          console.error(e);
        }
      }

      // 3. Fallback: dados embutidos
      if (!postFound) {
        const fallbackFound = findPostInList(FALLBACK_POSTS);
        if (fallbackFound && !cancelled) {
          setPost(fallbackFound);
          postFound = true;
        }
      }

      if (!cancelled) {
        if (!postFound) {
          setError("DATA NOT FOUND");
          setTimeout(() => navigate("/blog"), 3000);
        }
        setLoading(false);
      }

      // Se o post foi encontrado e ainda precisamos buscar comentários
      if (postFound) {
        try {
          const cs = await api<CommentRow[]>(`/posts/${slug}/comments?status=approved`);
          if (!cancelled) {
            const approvedOnly = (Array.isArray(cs) ? cs : []).filter((c) => c.status === "approved");
            setComments(approvedOnly);
            setBackendOn(true);
          }
        } catch {
          // Sem comentários ou erro
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [slug, navigate]);

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString || "";
      return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
    } catch {
      return dateString || "";
    }
  };

  if (loading) {
    return (
      <Layout title="LOADING DATA">
        <div className="flex justify-center items-center h-60">
          <div className="font-mono text-primary loading-dots">ACCESSING DATABASE</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="ERROR">
        <div className="cyber-terminal p-6 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h3 className="text-xl font-mono mb-2 text-destructive">{error}</h3>
          <p className="text-sm text-foreground/80 font-mono mb-4">REDIRECTING TO ARCHIVE...</p>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout title="NOT FOUND">
        <div className="cyber-terminal p-6 text-center">
          <h3 className="text-xl font-mono mb-2 text-primary">DATA CORRUPTED OR DELETED</h3>
          <p className="text-sm text-foreground/80 font-mono mb-4">THE ENTRY YOU'RE LOOKING FOR DOESN'T EXIST.</p>
          <Button asChild variant="outline" className="cyber-button">
            <Link to="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="font-mono text-xs">RETURN TO ARCHIVE</span>
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={post.title.toUpperCase()}>
      <div className="container mx-auto max-w-4xl">
        <Button variant="outline" asChild className="cyber-button mb-6">
          <Link to="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="font-mono text-xs">RETURN TO ARCHIVE</span>
          </Link>
        </Button>

        <article className="cyber-terminal p-6">
          <div className="terminal-header mb-6">
            <FileText size={18} className="text-primary mr-2" />
            <span className="text-primary font-mono">DATA ENTRY</span>
            <div className="ml-auto flex items-center gap-2 text-xs font-mono text-primary/70">
              <Calendar size={14} />
              {formatDate(post.createdAt)}
            </div>
          </div>

          {post.image && (
            <div className="mb-8 relative">
              <img src={post.image} alt={post.title} className="w-full h-auto max-h-80 object-cover border border-primary/30" />
              <div className="absolute bottom-0 left-0 bg-background/70 backdrop-blur-sm p-2 text-xs font-mono text-primary">
                IMAGE_REF#{post.id.substring(0, 6)}
              </div>
            </div>
          )}

          <div className="font-mono leading-relaxed text-foreground/90">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ ...props }) => (
                  <h1 className="text-2xl sm:text-3xl font-bold font-mono text-cyber-neon border-b border-cyber-neon/30 pb-2 mt-8 mb-4 tracking-wide" {...props} />
                ),
                h2: ({ ...props }) => (
                  <h2 className="text-xl sm:text-2xl font-bold font-mono text-cyber-neon mt-8 mb-3 border-l-4 border-cyber-neon pl-3 bg-cyber-black/40 py-1" {...props} />
                ),
                h3: ({ ...props }) => (
                  <h3 className="text-lg sm:text-xl font-bold font-mono text-cyber-blue mt-6 mb-2" {...props} />
                ),
                h4: ({ ...props }) => (
                  <h4 className="text-base font-bold font-mono text-cyber-blue/90 mt-4 mb-1" {...props} />
                ),
                p: ({ ...props }) => (
                  <p className="font-mono text-foreground/90 mb-4 leading-relaxed text-sm sm:text-base text-justify sm:text-left" {...props} />
                ),
                blockquote: ({ ...props }) => (
                  <blockquote className="border-l-4 border-cyber-neon bg-cyber-black/70 p-4 my-5 font-mono text-sm text-cyber-blue/90 rounded-r shadow-[0_0_15px_rgba(0,255,157,0.06)] border-y border-r border-cyber-neon/20 not-italic" {...props} />
                ),
                code: ({ inline, className, children, ...props }: any) => {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline ? (
                    <div className="relative my-4 rounded-md overflow-hidden border border-cyber-neon/40 shadow-[0_0_20px_rgba(0,255,157,0.08)]">
                      <div className="bg-cyber-black/90 px-4 py-1.5 text-[11px] font-mono text-cyber-neon/70 border-b border-cyber-neon/20 flex justify-between items-center">
                        <span>{match ? match[1].toUpperCase() : "TERMINAL // CODE"}</span>
                        <span className="text-[10px] text-cyber-blue/50">OVERCYBER SYNAPSE</span>
                      </div>
                      <pre className="overflow-x-auto bg-cyber-black/95 p-4 text-xs sm:text-sm font-mono text-cyber-blue/95 leading-relaxed scrollbar-none">
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </pre>
                    </div>
                  ) : (
                    <code className="font-mono text-xs sm:text-sm bg-cyber-black/80 text-cyber-neon border border-cyber-neon/30 px-1.5 py-0.5 rounded font-semibold" {...props}>
                      {children}
                    </code>
                  );
                },
                ul: ({ ...props }) => (
                  <ul className="list-disc list-inside space-y-1.5 mb-4 font-mono text-sm sm:text-base text-foreground/90 pl-2 marker:text-cyber-neon" {...props} />
                ),
                ol: ({ ...props }) => (
                  <ol className="list-decimal list-inside space-y-1.5 mb-4 font-mono text-sm sm:text-base text-foreground/90 pl-2 marker:text-cyber-neon font-semibold" {...props} />
                ),
                li: ({ ...props }) => (
                  <li className="leading-relaxed text-foreground/90 font-mono" {...props} />
                ),
                table: ({ ...props }) => (
                  <div className="my-6 overflow-x-auto rounded border border-cyber-neon/30 shadow-[0_0_15px_rgba(0,255,157,0.05)]">
                    <table className="w-full border-collapse text-xs sm:text-sm font-mono" {...props} />
                  </div>
                ),
                th: ({ ...props }) => (
                  <th className="border-b border-cyber-neon/30 bg-cyber-neon/15 px-3 py-2 text-left font-mono font-bold text-cyber-neon uppercase tracking-wider" {...props} />
                ),
                td: ({ ...props }) => (
                  <td className="border-b border-cyber-neon/15 bg-cyber-black/40 px-3 py-2 font-mono text-foreground/90" {...props} />
                ),
                hr: ({ ...props }) => (
                  <hr className="border-t border-cyber-neon/30 my-8" {...props} />
                ),
                a: ({ ...props }) => (
                  <a className="text-cyber-neon underline underline-offset-4 hover:text-cyber-blue transition-colors font-mono font-semibold" target="_blank" rel="noopener noreferrer" {...props} />
                ),
                strong: ({ ...props }) => (
                  <strong className="font-bold text-cyber-neon font-mono" {...props} />
                ),
                em: ({ ...props }) => (
                  <em className="italic text-cyber-blue font-mono" {...props} />
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          <div className="mt-8 pt-4 border-t border-primary/20 flex justify-between">
            <div className="text-xs font-mono text-primary/50">REF_ID: {post.id}</div>
            <Button variant="outline" asChild className="cyber-button">
              <Link to="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                <span className="font-mono text-xs">ARCHIVE</span>
              </Link>
            </Button>
          </div>
        </article>

        {backendOn && (
          <section className="cyber-terminal p-6 mt-6">
            <div className="terminal-header mb-4">
              <MessageSquare size={18} className="text-primary mr-2" />
              <span className="text-primary font-mono">COMMENTS // {comments.length}</span>
            </div>

            <div className="space-y-3 mb-6">
              {comments.length === 0 && (
                <div className="text-sm font-mono text-primary/60">NO COMMENTS YET. BE THE FIRST.</div>
              )}
              {comments.map((c) => (
                <div key={c.id} className="border border-primary/20 p-3">
                  <div className="flex justify-between text-xs font-mono text-primary/70 mb-1">
                    <span>{c.authorName}</span>
                    <span>{new Date(c.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="text-sm font-mono whitespace-pre-wrap">{c.body}</div>
                </div>
              ))}
            </div>

            <CommentForm
              slug={slug!}
              onPosted={async () => {
                try {
                  const cs = await api<CommentRow[]>(`/posts/${slug}/comments?status=approved`);
                  const approvedOnly = (Array.isArray(cs) ? cs : []).filter((c) => c.status === "approved");
                  setComments(approvedOnly);
                } catch {}
              }}
            />
          </section>
        )}
      </div>
    </Layout>
  );
}

function CommentForm({ slug, onPosted }: { slug: string; onPosted: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (busy) return;
        setBusy(true);
        try {
          const pow = await requestAndSolvePow();
          await api(`/posts/${slug}/comments`, {
            method: "POST",
            json: { authorName: name, authorEmail: email, body, pow },
          });
          toast({ title: "Comentário enviado", description: "Aguardando moderação." });
          setName("");
          setEmail("");
          setBody("");
          onPosted();
        } catch (err: any) {
          console.error("ERRO COMPLETO:", err);
          let detail = err?.message || "Tente novamente.";
          if (err instanceof ApiError) {
            console.error("STATUS:", err.status, "BODY:", err.body);
            detail = `HTTP ${err.status}: ${err.body?.error || err.body || err.message}`;
          }
          toast({
            title: "Erro ao enviar",
            description: detail,
            variant: "destructive",
          });
        } finally {
          setBusy(false);
        }
      }}
      className="space-y-3"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label className="font-mono text-xs text-primary">NAME</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} />
        </div>
        <div>
          <Label className="font-mono text-xs text-primary">EMAIL</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={320} />
        </div>
      </div>
      <div>
        <Label className="font-mono text-xs text-primary">MESSAGE</Label>
        <Textarea value={body} onChange={(e) => setBody(e.target.value)} required minLength={2} maxLength={4000} rows={4} />
      </div>
      <Button type="submit" disabled={busy} className="cyber-button">
        <Send className="mr-2 h-4 w-4" />
        <span className="font-mono text-xs">{busy ? "COMPUTING POW..." : "TRANSMIT"}</span>
      </Button>
    </form>
  );
}
