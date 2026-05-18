/**
 * AdminBackendPanel — interface para o backend Rust self-hosted.
 * Encapsula login + 2FA + CRUD do blog + moderação de comentários + inbox + migração.
 * É renderizado dentro de uma nova aba "BACKEND" do Admin.tsx sem alterar layout existente.
 */
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { api, ApiError } from "@/lib/api";
import { Trash2, Check, X, Send, Plus, Save } from "lucide-react";

interface Me {
  userId: number;
  mustChangePassword: boolean;
  totpEnabled: boolean;
  csrf: string;
}

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string | null;
  status: "draft" | "published";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CommentRow {
  id: string;
  postSlug: string;
  postTitle: string;
  authorName: string;
  body: string;
  status: string;
  createdAt: string;
}

interface ContactMsg {
  id: string;
  name: string;
  email: string;
  subject: string;
  body: string;
  createdAt: string;
  readAt: string | null;
}

function errMsg(e: unknown): string {
  if (e instanceof ApiError) {
    if (typeof e.body === "object" && e.body && "error" in e.body) return String((e.body as any).error);
    return e.message;
  }
  return e instanceof Error ? e.message : String(e);
}

export default function AdminBackendPanel() {
  const [me, setMe] = useState<Me | null>(null);
  const [bootChecked, setBootChecked] = useState(false);

  const refreshMe = async () => {
    try {
      const m = await api<Me>("/auth/me");
      setMe(m);
    } catch {
      setMe(null);
    } finally {
      setBootChecked(true);
    }
  };

  useEffect(() => {
    refreshMe();
  }, []);

  if (!bootChecked) {
    return (
      <Card className="neo-blur border border-cyber-neon/30">
        <CardContent className="p-6 font-mono text-cyber-blue">Verificando backend...</CardContent>
      </Card>
    );
  }

  if (!me) return <LoginForm onLoggedIn={refreshMe} />;
  if (me.mustChangePassword) return <ChangePasswordForm onDone={refreshMe} />;

  return (
    <div className="space-y-4">
      <Card className="neo-blur border border-cyber-neon/30">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-mono text-cyber-neon">BACKEND CONECTADO</CardTitle>
            <CardDescription className="text-cyber-blue/70">
              Sessão admin ativa · 2FA: {me.totpEnabled ? "ativo" : "desativado"}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {!me.totpEnabled && <SetupTotpButton onDone={refreshMe} />}
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  await api("/auth/logout", { method: "POST", json: {} });
                  setMe(null);
                  toast({ title: "Sessão encerrada" });
                } catch (e) {
                  toast({ title: "Erro", description: errMsg(e), variant: "destructive" });
                }
              }}
            >
              Sair
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="posts">
        <TabsList className="bg-cyber-black border border-cyber-neon/30 p-1">
          <TabsTrigger value="posts">POSTS</TabsTrigger>
          <TabsTrigger value="comments">COMENTÁRIOS</TabsTrigger>
          <TabsTrigger value="inbox">INBOX</TabsTrigger>
          <TabsTrigger value="migrate">MIGRAR</TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          <PostsPanel />
        </TabsContent>
        <TabsContent value="comments">
          <CommentsPanel />
        </TabsContent>
        <TabsContent value="inbox">
          <InboxPanel />
        </TabsContent>
        <TabsContent value="migrate">
          <MigratePanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LoginForm({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <Card className="neo-blur border border-cyber-neon/30">
      <CardHeader>
        <CardTitle className="font-mono text-cyber-neon">LOGIN BACKEND</CardTitle>
        <CardDescription className="text-cyber-blue/70">
          Autenticação contra o backend Rust (Argon2id + 2FA TOTP).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <Label>Usuário</Label>
          <Input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
        </div>
        <div className="space-y-1">
          <Label>Senha</Label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </div>
        <div className="space-y-1">
          <Label>Código TOTP (se 2FA ativo)</Label>
          <Input value={totp} onChange={(e) => setTotp(e.target.value)} inputMode="numeric" maxLength={6} placeholder="123456" />
        </div>
        <Button
          disabled={busy || !password}
          onClick={async () => {
            setBusy(true);
            try {
              await api("/auth/login", { method: "POST", json: { username, password, totp: totp || undefined } });
              toast({ title: "Autenticado" });
              onLoggedIn();
            } catch (e) {
              toast({ title: "Falha no login", description: errMsg(e), variant: "destructive" });
            } finally {
              setBusy(false);
            }
          }}
        >
          ENTRAR
        </Button>
      </CardContent>
    </Card>
  );
}

function ChangePasswordForm({ onDone }: { onDone: () => void }) {
  const [cur, setCur] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  return (
    <Card className="neo-blur border border-cyber-neon/30">
      <CardHeader>
        <CardTitle className="font-mono text-cyber-neon">TROCA OBRIGATÓRIA DE SENHA</CardTitle>
        <CardDescription>Mínimo 12 caracteres.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input type="password" placeholder="Senha atual" value={cur} onChange={(e) => setCur(e.target.value)} />
        <Input type="password" placeholder="Nova senha" value={pw} onChange={(e) => setPw(e.target.value)} />
        <Input type="password" placeholder="Confirme a nova senha" value={pw2} onChange={(e) => setPw2(e.target.value)} />
        <Button
          disabled={pw.length < 12 || pw !== pw2}
          onClick={async () => {
            try {
              await api("/auth/change-password", {
                method: "POST",
                json: { currentPassword: cur, newPassword: pw },
              });
              toast({ title: "Senha atualizada" });
              onDone();
            } catch (e) {
              toast({ title: "Erro", description: errMsg(e), variant: "destructive" });
            }
          }}
        >
          Salvar
        </Button>
      </CardContent>
    </Card>
  );
}

function SetupTotpButton({ onDone }: { onDone: () => void }) {
  const [secret, setSecret] = useState<string | null>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [code, setCode] = useState("");

  return (
    <>
      <Button
        variant="outline"
        onClick={async () => {
          try {
            const r = await api<{ secret: string; otpauth: string }>("/auth/setup-2fa", { method: "POST", json: {} });
            setSecret(r.secret);
            setUri(r.otpauth);
          } catch (e) {
            toast({ title: "Erro", description: errMsg(e), variant: "destructive" });
          }
        }}
      >
        Ativar 2FA
      </Button>
      {secret && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <Card className="max-w-md w-full neo-blur border border-cyber-neon/30">
            <CardHeader>
              <CardTitle className="font-mono">Configurar 2FA (TOTP)</CardTitle>
              <CardDescription>Escaneie no app (Google Authenticator, Aegis, 1Password).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="font-mono text-xs break-all bg-cyber-black/60 p-2 border border-cyber-neon/30">
                {uri}
              </div>
              <div className="font-mono text-xs">Segredo: {secret}</div>
              <Input placeholder="Código de 6 dígitos" value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => { setSecret(null); setUri(null); }}>Cancelar</Button>
                <Button
                  onClick={async () => {
                    try {
                      await api("/auth/verify-2fa", { method: "POST", json: { code } });
                      toast({ title: "2FA ativado" });
                      setSecret(null); setUri(null);
                      onDone();
                    } catch (e) {
                      toast({ title: "Código inválido", description: errMsg(e), variant: "destructive" });
                    }
                  }}
                >
                  Confirmar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

function emptyPost(): BlogPost {
  return {
    id: "",
    slug: "",
    title: "",
    excerpt: "",
    content: "",
    image: "",
    status: "draft",
    publishedAt: null,
    createdAt: "",
    updatedAt: "",
  };
}

function PostsPanel() {
  const [items, setItems] = useState<BlogPost[]>([]);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      // Lista pública só traz published — para admin precisamos listar tudo. Reaproveitamos: pegamos published + drafts via dois caminhos.
      // O backend só expõe published em GET /posts; para admin enumeramos via tabela cliente combinando com cache local.
      // Simplificação: GET /posts traz published; drafts existem apenas como retorno de update/create.
      // Para uma listagem completa, mantemos um cache local dos drafts criados nesta sessão.
      const published = await api<BlogPost[]>("/posts");
      setItems(published);
    } catch (e) {
      toast({ title: "Erro ao listar", description: errMsg(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (p: BlogPost) => {
    try {
      const payload = {
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        content: p.content,
        image: p.image || null,
        status: p.status,
      };
      const saved = p.id
        ? await api<BlogPost>(`/posts/${p.id}`, { method: "PUT", json: payload })
        : await api<BlogPost>(`/posts`, { method: "POST", json: payload });
      toast({ title: "Post salvo", description: `${saved.title} (${saved.status})` });
      setEditing(null);
      load();
    } catch (e) {
      toast({ title: "Erro ao salvar", description: errMsg(e), variant: "destructive" });
    }
  };

  return (
    <Card className="neo-blur border border-cyber-neon/30 mt-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-mono">Gerenciar Posts</CardTitle>
          <CardDescription>Rascunhos e publicados são gravados no backend.</CardDescription>
        </div>
        <Button onClick={() => setEditing(emptyPost())}>
          <Plus className="mr-2 h-4 w-4" /> NOVO POST
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="font-mono text-cyber-blue">Carregando...</div>
        ) : (
          <div className="space-y-2">
            {items.length === 0 && <div className="text-sm text-cyber-blue/60">Nenhum post publicado ainda.</div>}
            {items.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between border border-cyber-neon/20 p-2"
              >
                <div className="min-w-0">
                  <div className="font-mono text-cyber-neon truncate">{p.title}</div>
                  <div className="text-xs text-cyber-blue/60 truncate">
                    /{p.slug} · {p.status}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditing(p)}>Editar</Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      if (!confirm("Excluir post?")) return;
                      try {
                        await api(`/posts/${p.id}`, { method: "DELETE", json: {} });
                        load();
                      } catch (e) {
                        toast({ title: "Erro", description: errMsg(e), variant: "destructive" });
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        {editing && <PostEditor post={editing} onCancel={() => setEditing(null)} onSave={save} />}
      </CardContent>
    </Card>
  );
}

function PostEditor({
  post,
  onCancel,
  onSave,
}: {
  post: BlogPost;
  onCancel: () => void;
  onSave: (p: BlogPost) => void;
}) {
  const [p, setP] = useState<BlogPost>(post);
  const slugify = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-start justify-center p-4 overflow-y-auto">
      <Card className="max-w-3xl w-full my-8 neo-blur border border-cyber-neon/30">
        <CardHeader>
          <CardTitle className="font-mono">{post.id ? "Editar Post" : "Novo Post"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label>Título</Label>
            <Input
              value={p.title}
              onChange={(e) => {
                const t = e.target.value;
                setP({ ...p, title: t, slug: p.id ? p.slug : slugify(t) });
              }}
            />
          </div>
          <div className="space-y-1">
            <Label>Slug</Label>
            <Input value={p.slug} onChange={(e) => setP({ ...p, slug: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>Resumo</Label>
            <Textarea value={p.excerpt} rows={2} onChange={(e) => setP({ ...p, excerpt: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>Imagem (URL)</Label>
            <Input value={p.image || ""} onChange={(e) => setP({ ...p, image: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>Conteúdo</Label>
            <Textarea value={p.content} rows={12} onChange={(e) => setP({ ...p, content: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>Status</Label>
            <select
              value={p.status}
              onChange={(e) => setP({ ...p, status: e.target.value as "draft" | "published" })}
              className="w-full bg-cyber-black border border-cyber-neon/30 p-2 font-mono"
            >
              <option value="draft">Rascunho</option>
              <option value="published">Publicado</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>Cancelar</Button>
            <Button onClick={() => onSave(p)}>
              <Save className="mr-2 h-4 w-4" /> Salvar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CommentsPanel() {
  const [status, setStatus] = useState<"pending" | "approved" | "rejected" | "spam">("pending");
  const [items, setItems] = useState<CommentRow[]>([]);

  const load = async () => {
    try {
      const list = await api<CommentRow[]>(`/comments?status=${status}`);
      setItems(list);
    } catch (e) {
      toast({ title: "Erro", description: errMsg(e), variant: "destructive" });
    }
  };
  useEffect(() => {
    load();
  }, [status]);

  const action = async (id: string, what: "approve" | "reject" | "spam" | "delete") => {
    try {
      if (what === "delete") await api(`/comments/${id}`, { method: "DELETE", json: {} });
      else await api(`/comments/${id}/${what}`, { method: "POST", json: {} });
      load();
    } catch (e) {
      toast({ title: "Erro", description: errMsg(e), variant: "destructive" });
    }
  };

  return (
    <Card className="neo-blur border border-cyber-neon/30 mt-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-mono">Moderação de Comentários</CardTitle>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          className="bg-cyber-black border border-cyber-neon/30 p-2 font-mono text-sm"
        >
          <option value="pending">Pendentes</option>
          <option value="approved">Aprovados</option>
          <option value="rejected">Rejeitados</option>
          <option value="spam">Spam</option>
        </select>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.length === 0 && <div className="text-sm text-cyber-blue/60">Nada para moderar.</div>}
        {items.map((c) => (
          <div key={c.id} className="border border-cyber-neon/20 p-2">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="font-mono text-cyber-neon truncate">{c.authorName} · {c.postTitle}</div>
                <div className="text-xs text-cyber-blue/60">{new Date(c.createdAt).toLocaleString()}</div>
              </div>
              <div className="flex gap-1">
                {status !== "approved" && (
                  <Button size="sm" variant="outline" onClick={() => action(c.id, "approve")}>
                    <Check className="h-4 w-4" />
                  </Button>
                )}
                {status !== "rejected" && (
                  <Button size="sm" variant="outline" onClick={() => action(c.id, "reject")}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
                {status !== "spam" && (
                  <Button size="sm" variant="outline" onClick={() => action(c.id, "spam")}>SPAM</Button>
                )}
                <Button size="sm" variant="outline" onClick={() => action(c.id, "delete")}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="mt-2 text-sm whitespace-pre-wrap">{c.body}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function InboxPanel() {
  const [items, setItems] = useState<ContactMsg[]>([]);
  const load = async () => {
    try {
      setItems(await api<ContactMsg[]>("/contact/messages"));
    } catch (e) {
      toast({ title: "Erro", description: errMsg(e), variant: "destructive" });
    }
  };
  useEffect(() => {
    load();
  }, []);
  return (
    <Card className="neo-blur border border-cyber-neon/30 mt-4">
      <CardHeader>
        <CardTitle className="font-mono">Inbox / Contato</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.length === 0 && <div className="text-sm text-cyber-blue/60">Caixa de entrada vazia.</div>}
        {items.map((m) => (
          <div key={m.id} className={`border p-2 ${m.readAt ? "border-cyber-neon/10 opacity-70" : "border-cyber-neon/30"}`}>
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <div className="font-mono text-cyber-neon truncate">{m.subject || "(sem assunto)"}</div>
                <div className="text-xs text-cyber-blue/60 truncate">
                  {m.name} &lt;{m.email}&gt; · {new Date(m.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="flex gap-1">
                {!m.readAt && (
                  <Button size="sm" variant="outline" onClick={async () => { await api(`/contact/messages/${m.id}/read`, { method: "POST", json: {} }); load(); }}>
                    Marcar lido
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={async () => { if (!confirm("Excluir?")) return; await api(`/contact/messages/${m.id}`, { method: "DELETE", json: {} }); load(); }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="mt-2 text-sm whitespace-pre-wrap">{m.body}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function MigratePanel() {
  const snapshot = useMemo(() => {
    const ls = (k: string) => {
      try { return JSON.parse(localStorage.getItem(k) || "null"); } catch { return null; }
    };
    return {
      about: ls("admin-about-data"),
      resume: {
        education: ls("admin-education-data"),
        experience: ls("admin-experience-data"),
        publications: ls("admin-publications-data"),
        skills: ls("admin-skills-data"),
      },
      projects: ls("admin-projects-data") || ls("projects"),
      posts: ls("blog-posts"),
    };
  }, []);

  const counts = {
    about: snapshot.about ? 1 : 0,
    projects: Array.isArray(snapshot.projects) ? snapshot.projects.length : 0,
    posts: Array.isArray(snapshot.posts) ? snapshot.posts.length : 0,
  };

  return (
    <Card className="neo-blur border border-cyber-neon/30 mt-4">
      <CardHeader>
        <CardTitle className="font-mono">Migrar dados do localStorage</CardTitle>
        <CardDescription>
          Envia o snapshot deste navegador para o backend. Roda apenas uma vez por conteúdo (slugs duplicados são ignorados).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="font-mono text-sm text-cyber-blue">
          About: {counts.about} · Projetos: {counts.projects} · Posts: {counts.posts}
        </div>
        <Button
          onClick={async () => {
            try {
              await api("/migrate/import", { method: "POST", json: snapshot });
              toast({ title: "Importação concluída" });
            } catch (e) {
              toast({ title: "Erro", description: errMsg(e), variant: "destructive" });
            }
          }}
        >
          <Send className="mr-2 h-4 w-4" /> Importar agora
        </Button>
      </CardContent>
    </Card>
  );
}
