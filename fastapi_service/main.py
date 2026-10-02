import secrets
from contextlib import asynccontextmanager
from typing import Any, Dict, List, Optional, Union
from fastapi import FastAPI, Depends, HTTPException, Query, Request, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .config import API_TOKEN, CORS_ORIGINS, API_HOST, API_PORT
from .auth import verify_token, optional_verify_token
from . import db

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("=" * 60)
    print("OVERCYBER FASTAPI GATEWAY INICIADO")
    print(f"API Port: {API_PORT}")
    print(f"Token de Autenticação (Bearer) configurado: {'sim' if bool(API_TOKEN) else 'não'}")
    print(f"CORS Origins: {CORS_ORIGINS}")
    print("=" * 60)
    yield

app = FastAPI(
    title="Overcyber Management API",
    description="API REST autônoma para gerenciamento automatizado de Blog, Projetos, Comentários e Mensagens.",
    version="1.0.0",
    lifespan=lifespan,
)

# Configuração de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── PYDANTIC SCHEMAS ──────────────────────────────────────────────

class PostCreateInput(BaseModel):
    title: str = Field(..., min_length=1, description="Título do post")
    slug: str = Field(..., min_length=1, description="Slug amigável para URL")
    content: str = Field(..., description="Conteúdo em Markdown")
    excerpt: Optional[str] = Field("", description="Resumo do post")
    image: Optional[str] = Field(None, description="URL da imagem de capa")
    status: Optional[str] = Field("draft", description="draft ou published")

class PostUpdateInput(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    content: Optional[str] = None
    excerpt: Optional[str] = None
    image: Optional[str] = None
    status: Optional[str] = None

class ProjectCreateInput(BaseModel):
    title: str = Field(..., min_length=1)
    slug: Optional[str] = None
    description: Optional[str] = ""
    tags: Optional[Union[List[str], str]] = ""
    image: Optional[str] = ""
    github: Optional[str] = ""
    live: Optional[str] = None
    stars: Optional[int] = 0
    forks: Optional[int] = 0
    visibility: Optional[str] = "public"
    status: Optional[str] = ""
    source_repos: Optional[Union[List[str], str]] = []
    readme: Optional[str] = ""
    ord: Optional[int] = 0

class ProjectUpdateInput(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[Union[List[str], str]] = None
    image: Optional[str] = None
    github: Optional[str] = None
    live: Optional[str] = None
    stars: Optional[int] = None
    forks: Optional[int] = None
    visibility: Optional[str] = None
    status: Optional[str] = None
    source_repos: Optional[Union[List[str], str]] = None
    readme: Optional[str] = None
    ord: Optional[int] = None

class ProjectReadmeInput(BaseModel):
    readme: str = Field(..., description="Conteúdo do README em Markdown")

class CommentCreateInput(BaseModel):
    author_name: Optional[str] = Field(None, max_length=80, description="Nome do autor")
    authorName: Optional[str] = Field(None, max_length=80, description="Nome do autor (camelCase)")
    body: str = Field(..., min_length=2, max_length=4000, description="Texto do comentário")
    author_email: Optional[str] = Field("", description="Email do autor")
    authorEmail: Optional[str] = Field("", description="Email do autor (camelCase)")
    post_slug: Optional[str] = Field(None, description="Slug do post alvo")
    post_id: Optional[str] = Field(None, description="ID do post alvo")
    status: Optional[str] = Field("approved", description="pending, approved, rejected ou spam")
    website: Optional[str] = Field("", description="Honeypot")
    pow: Optional[Any] = Field(None, description="Proof of work")

    @property
    def resolved_name(self) -> str:
        return (self.author_name or self.authorName or "Anônimo").strip()

    @property
    def resolved_email(self) -> str:
        return (self.author_email or self.authorEmail or "").strip()

class ContactInput(BaseModel):
    name: str = Field(..., min_length=1, max_length=120, description="Nome do remetente")
    email: str = Field(..., min_length=3, max_length=320, description="Email de contato")
    subject: Optional[str] = Field("", max_length=200, description="Assunto")
    body: str = Field(..., min_length=2, max_length=5000, description="Mensagem")
    website: Optional[str] = Field("", description="Honeypot")
    pow: Optional[Any] = Field(None, description="Proof of work")



# ─── ROTAS GERAIS ──────────────────────────────────────────────────

@app.get("/")
def root(token: str = Depends(verify_token)):
    return {
        "service": "Overcyber FastAPI Gateway",
        "status": "online",
        "endpoints": {
            "posts": "/api/posts",
            "projects": "/api/projects",
            "comments": "/api/comments",
            "messages": "/api/contact/messages",
            "sections": "/api/sections",
            "docs": "/docs",
        },
    }

@app.get("/healthz")
def healthz():
    """Único endpoint público para probe e verificação de saúde da API."""
    return {"status": "ok"}

# ─── BLOG POSTS ────────────────────────────────────────────────────

@app.get("/api/posts")
def list_posts(
    status: Optional[str] = Query(None, description="Filtro por status: draft ou published"),
    token: Optional[str] = Depends(optional_verify_token)
):
    """Lista posts do blog (público para published; requer token para ver drafts)."""
    if not token and not status:
        status = "published"
    return db.list_posts(status)

@app.get("/api/posts/{slug_or_id}")
def get_post(slug_or_id: str):
    """Busca post por slug ou id (endpoint público)."""
    post = db.get_post(slug_or_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post não encontrado")
    return post

@app.post("/api/posts", status_code=status.HTTP_201_CREATED)
def create_post(payload: PostCreateInput, token: str = Depends(verify_token)):
    """Cria um novo post no blog (requer Bearer token)."""
    try:
        return db.create_post(
            title=payload.title,
            slug=payload.slug,
            content=payload.content,
            excerpt=payload.excerpt or "",
            image=payload.image,
            status=payload.status or "draft",
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao criar post: {str(e)}")

@app.put("/api/posts/{post_id}")
def update_post(post_id: str, payload: PostUpdateInput, token: str = Depends(verify_token)):
    """Atualiza um post existente no blog (requer Bearer token)."""
    updated = db.update_post(
        post_id=post_id,
        title=payload.title,
        slug=payload.slug,
        content=payload.content,
        excerpt=payload.excerpt,
        image=payload.image,
        status=payload.status,
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Post não encontrado")
    return updated

@app.delete("/api/posts/{post_id}")
def delete_post(post_id: str, token: str = Depends(verify_token)):
    """Remove um post do blog (requer Bearer token)."""
    ok = db.delete_post(post_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Post não encontrado")
    return {"ok": True, "deleted": post_id}

# ─── PROJETOS ──────────────────────────────────────────────────────

@app.get("/api/projects")
def list_projects(visibility: Optional[str] = Query(None)):
    """Lista todos os projetos do portfólio (endpoint público). Filtro opcional por visibility."""
    return db.list_projects(visibility=visibility)

@app.get("/api/projects/{project_id}")
def get_project(project_id: str):
    """Obtém detalhes de um projeto por ID numérico ou slug (endpoint público)."""
    p = db.get_project(project_id)
    if not p:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    return p

@app.post("/api/projects", status_code=status.HTTP_201_CREATED)
def create_project(payload: ProjectCreateInput, token: str = Depends(verify_token)):
    """Cria um novo projeto no portfólio (requer Bearer token)."""
    try:
        return db.create_project(
            title=payload.title,
            slug=payload.slug,
            description=payload.description or "",
            tags=payload.tags if payload.tags is not None else "",
            image=payload.image or "",
            github=payload.github or "",
            live=payload.live,
            stars=payload.stars or 0,
            forks=payload.forks or 0,
            visibility=payload.visibility or "public",
            status=payload.status or "",
            source_repos=payload.source_repos if payload.source_repos is not None else [],
            readme=payload.readme or "",
            ord=payload.ord or 0,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao criar projeto: {str(e)}")

@app.put("/api/projects/{project_id}")
def update_project(project_id: str, payload: ProjectUpdateInput, token: str = Depends(verify_token)):
    """Atualiza um projeto existente por ID ou slug (requer Bearer token)."""
    current = db.get_project(project_id)
    if not current:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    updated = db.update_project(
        project_id=current["id"],
        slug=payload.slug,
        title=payload.title,
        description=payload.description,
        tags=payload.tags,
        image=payload.image,
        github=payload.github,
        live=payload.live,
        stars=payload.stars,
        forks=payload.forks,
        visibility=payload.visibility,
        status=payload.status,
        source_repos=payload.source_repos,
        readme=payload.readme,
        ord=payload.ord,
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    return updated

@app.get("/api/projects/{project_id}/readme")
def get_project_readme(project_id: str):
    """Obtém o README de um projeto por ID ou slug (endpoint público)."""
    p = db.get_project(project_id)
    if not p:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    return {"id": p["id"], "slug": p["slug"], "title": p["title"], "readme": p["readme"]}

@app.put("/api/projects/{project_id}/readme")
@app.patch("/api/projects/{project_id}/readme")
async def update_project_readme_endpoint(
    project_id: str,
    request: Request,
    token: str = Depends(verify_token)
):
    """Atualiza o README.md de um projeto por ID ou slug.
    Aceita JSON ({"readme": "..."}) OU texto puro / markdown direto no body.
    """
    p = db.get_project(project_id)
    if not p:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")

    readme_content = ""
    content_type = request.headers.get("content-type", "")
    if "application/json" in content_type:
        try:
            data = await request.json()
            if isinstance(data, dict) and "readme" in data:
                readme_content = str(data["readme"])
            elif isinstance(data, str):
                readme_content = data
            else:
                raise HTTPException(status_code=422, detail="Campo 'readme' é obrigatório no JSON")
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"JSON inválido: {str(e)}")
    else:
        body_bytes = await request.body()
        readme_content = body_bytes.decode("utf-8", errors="replace")

    updated = db.update_project_readme(project_id=p["id"], readme=readme_content)
    if not updated:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    return {
        "ok": True,
        "id": updated["id"],
        "slug": updated["slug"],
        "title": updated["title"],
        "readme": updated["readme"],
        "updatedAt": updated["updatedAt"]
    }

@app.delete("/api/projects/{project_id}")
def delete_project(project_id: str, token: str = Depends(verify_token)):
    """Remove um projeto do portfólio por ID ou slug (requer Bearer token)."""
    p = db.get_project(project_id)
    if not p:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    ok = db.delete_project(p["id"])
    if not ok:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    return {"ok": True, "deleted": p["id"], "slug": p["slug"]}

# ─── COMENTÁRIOS (ADMINISTRAÇÃO & CRIAÇÃO) ─────────────────────────

@app.get("/api/posts/{slug_or_id}/comments")
def get_post_comments(
    slug_or_id: str,
    status: Optional[str] = Query(None),
    token: Optional[str] = Depends(optional_verify_token)
):
    """Lista comentários de um post (público para status=approved; requer token para ver outros status)."""
    if not token and not status:
        status = "approved"
    return db.get_post_comments(slug_or_id, status)

@app.post("/api/posts/{slug_or_id}/comments", status_code=status.HTTP_201_CREATED)
def create_post_comment(slug_or_id: str, payload: CommentCreateInput):
    """Cria um comentário em um post específico (endpoint público)."""
    if payload.website:
        return {"status": "ok", "detail": "Comentário processado"}
    try:
        return db.create_comment(
            post_slug_or_id=slug_or_id,
            author_name=payload.resolved_name,
            body=payload.body,
            author_email=payload.resolved_email,
            status=payload.status or "approved"
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/comments")
def list_comments(status: Optional[str] = Query(None, description="pending, approved, rejected ou spam"), token: str = Depends(verify_token)):
    """Lista comentários para moderação administrativa (requer Bearer token)."""
    return db.list_comments(status)

@app.post("/api/comments", status_code=status.HTTP_201_CREATED)
def create_comment_general(payload: CommentCreateInput, token: str = Depends(verify_token)):
    """Cria um comentário informando post_slug ou post_id (requer Bearer token)."""
    target = payload.post_slug or payload.post_id
    if not target:
        raise HTTPException(status_code=400, detail="É necessário informar 'post_slug' ou 'post_id'")
    try:
        return db.create_comment(
            post_slug_or_id=target,
            author_name=payload.author_name,
            body=payload.body,
            author_email=payload.author_email,
            status=payload.status or "approved"
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/comments/{comment_id}/approve")
def approve_comment(comment_id: str, token: str = Depends(verify_token)):
    """Aprova um comentário (requer Bearer token)."""
    ok = db.update_comment_status(comment_id, "approved")
    if not ok:
        raise HTTPException(status_code=404, detail="Comentário não encontrado")
    return {"ok": True, "id": comment_id, "status": "approved"}

@app.post("/api/comments/{comment_id}/reject")
def reject_comment(comment_id: str, token: str = Depends(verify_token)):
    """Rejeita um comentário (requer Bearer token)."""
    ok = db.update_comment_status(comment_id, "rejected")
    if not ok:
        raise HTTPException(status_code=404, detail="Comentário não encontrado")
    return {"ok": True, "id": comment_id, "status": "rejected"}

@app.post("/api/comments/{comment_id}/spam")
def mark_spam_comment(comment_id: str, token: str = Depends(verify_token)):
    """Marca um comentário como spam (requer Bearer token)."""
    ok = db.update_comment_status(comment_id, "spam")
    if not ok:
        raise HTTPException(status_code=404, detail="Comentário não encontrado")
    return {"ok": True, "id": comment_id, "status": "spam"}

@app.delete("/api/comments/{comment_id}")
def delete_comment(comment_id: str, token: str = Depends(verify_token)):
    """Exclui um comentário permanentemente (requer Bearer token)."""
    ok = db.delete_comment(comment_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Comentário não encontrado")
    return {"ok": True, "deleted": comment_id}

# ─── MENSAGENS DE CONTATO (ADMINISTRAÇÃO) ──────────────────────────

@app.get("/api/contact/messages")
def list_messages(token: str = Depends(verify_token)):
    """Lista mensagens recebidas pelo formulário de contato (requer Bearer token)."""
    return db.list_contact_messages()

@app.post("/api/contact/messages/{msg_id}/read")
def mark_message_read(msg_id: str, token: str = Depends(verify_token)):
    """Marca uma mensagem de contato como lida (requer Bearer token)."""
    ok = db.mark_message_read(msg_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Mensagem não encontrada")
    return {"ok": True, "id": msg_id, "read": True}

@app.delete("/api/contact/messages/{msg_id}")
def delete_message(msg_id: str, token: str = Depends(verify_token)):
    """Exclui uma mensagem de contato (requer Bearer token)."""
    ok = db.delete_contact_message(msg_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Mensagem não encontrada")
    return {"ok": True, "deleted": msg_id}

@app.post("/api/contact", status_code=status.HTTP_201_CREATED)
def submit_contact(payload: ContactInput):
    """Envia uma mensagem de contato pelo formulário público do site."""
    # Honeypot
    if payload.website:
        return {"status": "ok", "message": "Mensagem recebida"}
    try:
        return db.create_contact_message(
            name=payload.name,
            email=payload.email,
            subject=payload.subject or "",
            body=payload.body,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao salvar mensagem: {str(e)}")

# ─── PROOF OF WORK ─────────────────────────────────────────────────

@app.get("/api/pow/challenge")
def pow_challenge():
    """Gera desafio Proof-of-Work para formulários públicos (contato e comentários)."""
    nonce = secrets.token_hex(16)
    diff = 8
    ts = db.now_iso()
    try:
        with db.get_connection() as conn:
            conn.execute(
                "INSERT INTO pow_challenges(nonce, difficulty, issued_at) VALUES (?, ?, ?)",
                (nonce, diff, ts)
            )
            conn.commit()
    except Exception:
        pass
    return {"nonce": nonce, "difficulty": diff}

# ─── VISIBILIDADE DE SEÇÕES ────────────────────────────────────────

@app.get("/api/sections")
def get_sections():
    """Consulta a visibilidade de seções do site (endpoint público)."""
    return db.get_sections()

@app.put("/api/sections")
def update_sections(payload: Dict[str, bool], token: str = Depends(verify_token)):
    """Atualiza a visibilidade das seções do site (requer Bearer token)."""
    return db.update_sections(payload)

# ─── SOBRE & RESUMO (ABOUT / RESUME) ───────────────────────────────

@app.get("/api/about")
def get_about():
    """Consulta dados da seção Sobre/Perfil (endpoint público)."""
    data = db.get_about()
    if data is None:
        return {}
    return data

@app.put("/api/about")
def update_about(payload: Dict[str, Any], token: str = Depends(verify_token)):
    """Atualiza dados da seção Sobre/Perfil (requer Bearer token)."""
    return db.update_about(payload)

@app.get("/api/resume")
def get_resume():
    """Consulta dados de currículo: educação, experiência, publicações e skills (endpoint público)."""
    return db.get_resume()

@app.put("/api/resume/{section}")
def update_resume_section(section: str, payload: Any, token: str = Depends(verify_token)):
    """Atualiza uma seção do currículo (requer Bearer token)."""
    try:
        return db.update_resume_section(section, payload)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

