
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, FileText, Calendar, AlertTriangle, MessageSquare, Send } from "lucide-react";
import { api } from "@/lib/api";
import { requestAndSolvePow } from "@/lib/pow";
import { toast } from "@/components/ui/use-toast";

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

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [backendOn, setBackendOn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      // 1) tenta backend
      try {
        const remote = await api<any>(`/posts/${slug}`);
        if (cancelled) return;
        setPost({
          id: remote.id,
          title: remote.title,
          slug: remote.slug,
          excerpt: remote.excerpt,
          content: remote.content,
          image: remote.image || undefined,
          createdAt: remote.publishedAt || remote.createdAt,
        });
        setBackendOn(true);
        try {
          const cs = await api<CommentRow[]>(`/posts/${slug}/comments`);
          if (!cancelled) setComments(cs);
        } catch {}
        setLoading(false);
        return;
      } catch {}
      // 2) fallback localStorage
      try {
        const stored = localStorage.getItem("blog-posts");
        if (stored) {
          const posts: BlogPost[] = JSON.parse(stored);
          const found = posts.find((p) => p.slug === slug);
          if (found) setPost(found);
          else {
            setError("DATA NOT FOUND");
            setTimeout(() => navigate("/blog"), 3000);
          }
        } else {
          setError("DATABASE EMPTY");
          setTimeout(() => navigate("/blog"), 3000);
        }
      } catch (e) {
        console.error(e);
        setError("DATA CORRUPTED");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [slug, navigate]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

  const formatContent = (content: string) =>
    content.split("\n").map((line, index) => (
      <p key={index} className="mb-4 font-mono text-foreground/90">
        {line}
      </p>
    ));

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

          <div className="space-y-4 font-mono">{formatContent(post.content)}</div>

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
                  const cs = await api<CommentRow[]>(`/posts/${slug}/comments`);
                  setComments(cs);
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
  const [website, setWebsite] = useState(""); // honeypot
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
            json: { authorName: name, authorEmail: email, body, website, pow },
          });
          toast({ title: "Comentário enviado", description: "Aguardando moderação." });
          setName("");
          setEmail("");
          setBody("");
          onPosted();
        } catch (err: any) {
          toast({
            title: "Erro ao enviar",
            description: err?.message || "Tente novamente.",
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
      {/* honeypot — não exibir */}
      <input
        type="text"
        name="website"
        autoComplete="off"
        tabIndex={-1}
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        style={{ position: "absolute", left: "-10000px", width: 1, height: 1, opacity: 0 }}
      />
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
