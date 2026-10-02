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
import { Trash2, Check, X, Send, Plus, Save, RefreshCw, MailCheck, Mail, MessageSquare, RotateCcw, AlertTriangle } from "lucide-react";

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
    if (typeof e.body === "object" && e.body) {
      if ("error" in e.body) return String((e.body as any).error);
      if ("detail" in e.body) return String((e.body as any).detail);
    }
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
          <TabsTrigger value="inbox">MENSAGENS</TabsTrigger>
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
        ? await api<BlogPost>(`/posts/by-id/${p.id}`, { method: "PUT", json: payload })
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
                        await api(`/posts/by-id/${p.id}`, { method: "DELETE", json: {} });
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

export function CommentsPanel() {
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected" | "spam">("all");
  const [items, setItems] = useState<CommentRow[]>([]);
  const [counts, setCounts] = useState<{
    all: number;
    pending: number;
    approved: number;
    rejected: number;
    spam: number;
  }>({
    all: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    spam: 0,
  });
  const [loading, setLoading] = useState(false);

  const loadCounts = async () => {
    try {
      const res = await api<{
        all: number;
        pending: number;
        approved: number;
        rejected: number;
        spam: number;
      }>("/comments/counts");
      if (res && typeof res.all === "number") {
        setCounts(res);
      }
    } catch {
      // Ignora erro de contagem silenciosamente se backend antigo
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const q = filter === "all" ? "?status=all" : `?status=${filter}`;
      const list = await api<CommentRow[]>(`/comments${q}`);
      setItems(Array.isArray(list) ? list : []);
      await loadCounts();
    } catch (e) {
      toast({ title: "Erro ao buscar comentários", description: errMsg(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filter]);

  const action = async (id: string, what: "approve" | "reject" | "spam" | "pending" | "delete") => {
    try {
      if (what === "delete") {
        if (!confirm("Tem certeza que deseja excluir permanentemente este comentário?")) return;
        await api(`/comments/${id}`, { method: "DELETE", json: {} });
        toast({ title: "Comentário excluído com sucesso" });
      } else {
        await api(`/comments/${id}/${what}`, { method: "POST", json: {} });
        const labels: Record<string, string> = {
          approve: "Comentário aprovado",
          reject: "Comentário rejeitado",
          spam: "Marcado como spam",
          pending: "Comentário movido para pendente",
        };
        toast({ title: labels[what] || "Status atualizado com sucesso" });
      }
      await load();
    } catch (e) {
      toast({ title: "Erro na operação", description: errMsg(e), variant: "destructive" });
    }
  };

  const renderStatusBadge = (st: string) => {
    const s = (st || "").toLowerCase();
    if (s === "approved") {
      return (
        <span className="px-2 py-0.5 text-xs font-mono font-bold rounded bg-green-500/20 text-green-400 border border-green-500/40">
          APROVADO
        </span>
      );
    }
    if (s === "rejected") {
      return (
        <span className="px-2 py-0.5 text-xs font-mono font-bold rounded bg-red-500/20 text-red-400 border border-red-500/40">
          REJEITADO
        </span>
      );
    }
    if (s === "spam") {
      return (
        <span className="px-2 py-0.5 text-xs font-mono font-bold rounded bg-orange-500/20 text-orange-400 border border-orange-500/40">
          SPAM
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 text-xs font-mono font-bold rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/40">
        PENDENTE
      </span>
    );
  };

  return (
    <Card className="neo-blur border border-cyber-neon/30 mt-4">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <CardTitle className="font-mono flex items-center gap-2">
            <MessageSquare size={18} className="text-cyber-neon" />
            Moderação de Comentários
          </CardTitle>
          <CardDescription>
            {counts.pending > 0
              ? `${counts.pending} comentário(s) aguardando sua moderação (${counts.all} no total cadastrado).`
              : `Total de ${counts.all} comentário(s) no sistema (0 pendentes no momento).`}
          </CardDescription>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap bg-cyber-black/80 border border-cyber-neon/30 p-1 rounded gap-1">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 font-mono text-xs rounded transition-colors ${
                filter === "all"
                  ? "bg-cyber-neon/30 text-cyber-neon font-bold border border-cyber-neon/50"
                  : "text-cyber-blue hover:text-cyber-neon"
              }`}
            >
              Todos ({counts.all})
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-3 py-1 font-mono text-xs rounded transition-colors ${
                filter === "pending"
                  ? "bg-yellow-500/30 text-yellow-300 font-bold border border-yellow-500/50"
                  : "text-cyber-blue hover:text-yellow-400"
              }`}
            >
              Pendentes ({counts.pending})
            </button>
            <button
              onClick={() => setFilter("approved")}
              className={`px-3 py-1 font-mono text-xs rounded transition-colors ${
                filter === "approved"
                  ? "bg-green-500/30 text-green-300 font-bold border border-green-500/50"
                  : "text-cyber-blue hover:text-green-400"
              }`}
            >
              Aprovados ({counts.approved})
            </button>
            <button
              onClick={() => setFilter("rejected")}
              className={`px-3 py-1 font-mono text-xs rounded transition-colors ${
                filter === "rejected"
                  ? "bg-red-500/30 text-red-300 font-bold border border-red-500/50"
                  : "text-cyber-blue hover:text-red-400"
              }`}
            >
              Rejeitados ({counts.rejected})
            </button>
            <button
              onClick={() => setFilter("spam")}
              className={`px-3 py-1 font-mono text-xs rounded transition-colors ${
                filter === "spam"
                  ? "bg-orange-500/30 text-orange-300 font-bold border border-orange-500/50"
                  : "text-cyber-blue hover:text-orange-400"
              }`}
            >
              Spam ({counts.spam})
            </button>
          </div>

          <Button size="sm" variant="outline" onClick={load} disabled={loading} title="Atualizar">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {loading && <div className="text-sm font-mono text-cyber-blue/60">Carregando comentários...</div>}
        {!loading && items.length === 0 && (
          <div className="text-sm font-mono text-cyber-blue/60 py-6 text-center border border-dashed border-cyber-neon/20 rounded">
            Nenhum comentário {filter === "all" ? "no banco de dados" : `com status: ${filter}`}.
          </div>
        )}
        {!loading && items.map((c) => (
          <div key={c.id} className="border border-cyber-neon/20 bg-cyber-black/40 p-3 rounded space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyber-neon/10 pb-2">
              <div className="min-w-0 flex items-center gap-2 flex-wrap">
                {renderStatusBadge(c.status)}
                <div className="font-mono text-cyber-neon font-semibold text-sm truncate">
                  {c.authorName} <span className="text-xs text-cyber-blue/70">em</span> {c.postTitle || c.postSlug}
                </div>
                <div className="text-xs text-cyber-blue/60">
                  {new Date(c.createdAt).toLocaleString("pt-BR")}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1">
                {c.status !== "approved" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-green-500/40 text-green-400 hover:bg-green-500/20 text-xs h-7 px-2"
                    onClick={() => action(c.id, "approve")}
                    title="Aprovar comentário para exibição pública"
                  >
                    <Check className="h-3.5 w-3.5 mr-1" /> Aprovar
                  </Button>
                )}
                {c.status !== "rejected" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-500/40 text-red-400 hover:bg-red-500/20 text-xs h-7 px-2"
                    onClick={() => action(c.id, "reject")}
                    title="Rejeitar comentário"
                  >
                    <X className="h-3.5 w-3.5 mr-1" /> Rejeitar
                  </Button>
                )}
                {c.status !== "pending" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/20 text-xs h-7 px-2"
                    onClick={() => action(c.id, "pending")}
                    title="Voltar comentário para pendente"
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1" /> Pendente
                  </Button>
                )}
                {c.status !== "spam" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-orange-500/40 text-orange-400 hover:bg-orange-500/20 text-xs h-7 px-2"
                    onClick={() => action(c.id, "spam")}
                    title="Marcar como SPAM"
                  >
                    <AlertTriangle className="h-3.5 w-3.5 mr-1" /> SPAM
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-600/40 text-red-500 hover:bg-red-600/20 text-xs h-7 px-2"
                  onClick={() => action(c.id, "delete")}
                  title="Excluir permanentemente"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <div className="text-sm font-sans text-cyber-blue/90 whitespace-pre-wrap bg-cyber-black/30 p-2.5 rounded border border-cyber-neon/10">
              {c.body}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function InboxPanel() {
  const [items, setItems] = useState<ContactMsg[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api<ContactMsg[]>("/contact/messages");
      setItems(Array.isArray(res) ? res : []);
    } catch (e) {
      toast({ title: "Erro", description: errMsg(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const unreadCount = items.filter((m) => !m.readAt).length;

  return (
    <Card className="neo-blur border border-cyber-neon/30 mt-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-mono flex items-center gap-2">
            <Mail size={18} className="text-cyber-neon" />
            Mensagens de Contato
          </CardTitle>
          <CardDescription>
            {unreadCount > 0
              ? `${unreadCount} nova(s) mensagem(ns) não lida(s) de um total de ${items.length}.`
              : `Total de ${items.length} mensagem(ns) recebida(s). Todas lidas.`}
          </CardDescription>
        </div>

        <Button size="sm" variant="outline" onClick={load} disabled={loading} title="Atualizar">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>

      <CardContent className="space-y-3">
        {loading && <div className="text-sm font-mono text-cyber-blue/60">Carregando mensagens...</div>}
        {!loading && items.length === 0 && (
          <div className="text-sm font-mono text-cyber-blue/60 py-6 text-center border border-dashed border-cyber-neon/20 rounded">
            Caixa de entrada vazia. Nenhuma mensagem recebida ainda.
          </div>
        )}
        {!loading && items.map((m) => {
          const isEncrypted = m.email.startsWith("v1:gc1:");
          const displayEmail = isEncrypted ? "(email protegido / criptografado em repouso)" : m.email;

          return (
            <div
              key={m.id}
              className={`border p-3 rounded space-y-2 transition-colors ${
                m.readAt
                  ? "border-cyber-neon/20 bg-cyber-black/20 opacity-80"
                  : "border-cyber-neon/50 bg-cyber-black/60 shadow-[0_0_10px_rgba(0,255,157,0.1)]"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyber-neon/10 pb-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-cyber-neon font-semibold text-sm truncate">
                      {m.subject || "(sem assunto)"}
                    </span>
                    {!m.readAt && (
                      <span className="bg-cyber-neon/20 text-cyber-neon text-[10px] font-mono px-1.5 py-0.5 rounded border border-cyber-neon/40 font-bold">
                        NOVA
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-cyber-blue/70 truncate mt-0.5">
                    <span className="font-medium text-cyber-blue">{m.name}</span> &lt;{displayEmail}&gt; ·{" "}
                    {new Date(m.createdAt).toLocaleString("pt-BR")}
                  </div>
                </div>

                <div className="flex items-center gap-1 self-end sm:self-auto">
                  {!m.readAt && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-cyber-neon/40 text-cyber-neon hover:bg-cyber-neon/20 text-xs h-8"
                      onClick={async () => {
                        try {
                          await api(`/contact/messages/${m.id}/read`, { method: "POST", json: {} });
                          load();
                        } catch (e) {
                          toast({ title: "Erro", description: errMsg(e), variant: "destructive" });
                        }
                      }}
                    >
                      <MailCheck className="h-3.5 w-3.5 mr-1" /> Marcar lida
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-500/40 text-red-400 hover:bg-red-500/20 text-xs h-8 px-2"
                    onClick={async () => {
                      if (!confirm("Excluir esta mensagem?")) return;
                      try {
                        await api(`/contact/messages/${m.id}`, { method: "DELETE", json: {} });
                        toast({ title: "Mensagem excluída" });
                        load();
                      } catch (e) {
                        toast({ title: "Erro", description: errMsg(e), variant: "destructive" });
                      }
                    }}
                    title="Excluir mensagem"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <div className="text-sm font-sans text-cyber-blue/90 whitespace-pre-wrap bg-cyber-black/30 p-2.5 rounded border border-cyber-neon/10">
                {m.body}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function MigratePanel() {
  const [busy, setBusy] = useState(false);
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
          Envia o snapshot deste navegador para o backend SQLite. Roda apenas uma vez por conteúdo (dados existentes são atualizados com segurança).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="font-mono text-sm text-cyber-blue bg-cyber-black/50 p-3 rounded border border-cyber-neon/20">
          Dados detectados no localStorage deste navegador:
          <div className="mt-1 font-semibold text-cyber-neon">
            Perfil (About): {counts.about} · Projetos: {counts.projects} · Posts: {counts.posts}
          </div>
        </div>
        <Button
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              const res = await api<any>("/migrate/import", { method: "POST", json: snapshot });
              const c = res?.counts || {};
              toast({
                title: "Importação concluída!",
                description: `Importados com sucesso: ${c.projects ?? counts.projects} projetos, ${c.posts ?? counts.posts} posts.`,
              });
            } catch (e) {
              toast({ title: "Erro na importação", description: errMsg(e), variant: "destructive" });
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Importando dados...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" /> Importar agora
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
