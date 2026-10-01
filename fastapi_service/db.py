import sqlite3
import json
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import uuid
import hashlib

from .config import DB_PATH

def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH), timeout=10.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.execute("PRAGMA journal_mode = WAL;")
    conn.execute("PRAGMA synchronous = NORMAL;")
    return conn

def now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

# ─── POSTS ─────────────────────────────────────────────────────────

def list_posts(status: Optional[str] = None) -> List[Dict[str, Any]]:
    with get_connection() as conn:
        cursor = conn.cursor()
        if status:
            cursor.execute(
                "SELECT id, slug, title, excerpt, content, image, status, published_at, created_at, updated_at "
                "FROM posts WHERE status = ? ORDER BY COALESCE(published_at, created_at) DESC",
                (status,)
            )
        else:
            cursor.execute(
                "SELECT id, slug, title, excerpt, content, image, status, published_at, created_at, updated_at "
                "FROM posts ORDER BY COALESCE(published_at, created_at) DESC"
            )
        rows = cursor.fetchall()
        return [
            {
                "id": r["id"],
                "slug": r["slug"],
                "title": r["title"],
                "excerpt": r["excerpt"],
                "content": r["content"],
                "image": r["image"],
                "status": r["status"],
                "publishedAt": r["published_at"],
                "createdAt": r["created_at"],
                "updatedAt": r["updated_at"],
            }
            for r in rows
        ]

def get_post(slug_or_id: str) -> Optional[Dict[str, Any]]:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, slug, title, excerpt, content, image, status, published_at, created_at, updated_at "
            "FROM posts WHERE slug = ? OR id = ?",
            (slug_or_id, slug_or_id)
        )
        r = cursor.fetchone()
        if not r:
            return None
        return {
            "id": r["id"],
            "slug": r["slug"],
            "title": r["title"],
            "excerpt": r["excerpt"],
            "content": r["content"],
            "image": r["image"],
            "status": r["status"],
            "publishedAt": r["published_at"],
            "createdAt": r["created_at"],
            "updatedAt": r["updated_at"],
        }

def create_post(
    title: str,
    slug: str,
    content: str,
    excerpt: str = "",
    image: Optional[str] = None,
    status: str = "draft"
) -> Dict[str, Any]:
    post_id = str(uuid.uuid4())
    ts = now_iso()
    published_at = ts if status == "published" else None
    
    with get_connection() as conn:
        conn.execute(
            "INSERT INTO posts(id, slug, title, excerpt, content, image, status, published_at, created_at, updated_at) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (post_id, slug, title, excerpt, content, image, status, published_at, ts, ts)
        )
        conn.commit()
    return get_post(post_id)

def update_post(
    post_id: str,
    title: Optional[str] = None,
    slug: Optional[str] = None,
    content: Optional[str] = None,
    excerpt: Optional[str] = None,
    image: Optional[str] = None,
    status: Optional[str] = None
) -> Optional[Dict[str, Any]]:
    current = get_post(post_id)
    if not current:
        return None
    
    new_title = title if title is not None else current["title"]
    new_slug = slug if slug is not None else current["slug"]
    new_content = content if content is not None else current["content"]
    new_excerpt = excerpt if excerpt is not None else current["excerpt"]
    new_image = image if image is not None else current["image"]
    new_status = status if status is not None else current["status"]
    
    ts = now_iso()
    new_published_at = current["publishedAt"]
    if new_status == "published" and not new_published_at:
        new_published_at = ts
    elif new_status != "published":
        new_published_at = None

    with get_connection() as conn:
        conn.execute(
            "UPDATE posts SET title = ?, slug = ?, excerpt = ?, content = ?, image = ?, status = ?, published_at = ?, updated_at = ? "
            "WHERE id = ?",
            (new_title, new_slug, new_excerpt, new_content, new_image, new_status, new_published_at, ts, post_id)
        )
        conn.commit()
    return get_post(post_id)

def delete_post(post_id: str) -> bool:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM posts WHERE id = ?", (post_id,))
        conn.commit()
        return cursor.rowcount > 0

# ─── PROJECTS ──────────────────────────────────────────────────────

def list_projects() -> List[Dict[str, Any]]:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, title, description, tags, image, github, live, stars, forks, readme, ord, created_at, updated_at "
            "FROM projects ORDER BY ord ASC, id ASC"
        )
        rows = cursor.fetchall()
        return [
            {
                "id": r["id"],
                "title": r["title"],
                "description": r["description"],
                "tags": r["tags"],
                "image": r["image"],
                "github": r["github"],
                "live": r["live"],
                "stars": r["stars"],
                "forks": r["forks"],
                "readme": r["readme"],
                "ord": r["ord"],
                "createdAt": r["created_at"],
                "updatedAt": r["updated_at"],
            }
            for r in rows
        ]

def get_project(project_id: int) -> Optional[Dict[str, Any]]:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, title, description, tags, image, github, live, stars, forks, readme, ord, created_at, updated_at "
            "FROM projects WHERE id = ?",
            (project_id,)
        )
        r = cursor.fetchone()
        if not r:
            return None
        return {
            "id": r["id"],
            "title": r["title"],
            "description": r["description"],
            "tags": r["tags"],
            "image": r["image"],
            "github": r["github"],
            "live": r["live"],
            "stars": r["stars"],
            "forks": r["forks"],
            "readme": r["readme"],
            "ord": r["ord"],
            "createdAt": r["created_at"],
            "updatedAt": r["updated_at"],
        }

def create_project(
    title: str,
    description: str = "",
    tags: str = "",
    image: str = "",
    github: str = "",
    live: Optional[str] = None,
    readme: str = "",
    stars: int = 0,
    forks: int = 0,
    ord: int = 0
) -> Dict[str, Any]:
    ts = now_iso()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO projects(title, description, tags, image, github, live, stars, forks, readme, ord, created_at, updated_at) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (title, description, tags, image, github, live, stars, forks, readme, ord, ts, ts)
        )
        conn.commit()
        project_id = cursor.lastrowid
    return get_project(project_id)

def update_project(
    project_id: int,
    title: Optional[str] = None,
    description: Optional[str] = None,
    tags: Optional[str] = None,
    image: Optional[str] = None,
    github: Optional[str] = None,
    live: Optional[str] = None,
    readme: Optional[str] = None,
    stars: Optional[int] = None,
    forks: Optional[int] = None,
    ord: Optional[int] = None
) -> Optional[Dict[str, Any]]:
    current = get_project(project_id)
    if not current:
        return None
    
    new_title = title if title is not None else current["title"]
    new_description = description if description is not None else current["description"]
    new_tags = tags if tags is not None else current["tags"]
    new_image = image if image is not None else current["image"]
    new_github = github if github is not None else current["github"]
    new_live = live if live is not None else current["live"]
    new_readme = readme if readme is not None else current["readme"]
    new_stars = stars if stars is not None else current["stars"]
    new_forks = forks if forks is not None else current["forks"]
    new_ord = ord if ord is not None else current["ord"]
    
    ts = now_iso()
    with get_connection() as conn:
        conn.execute(
            "UPDATE projects SET title = ?, description = ?, tags = ?, image = ?, github = ?, live = ?, "
            "stars = ?, forks = ?, readme = ?, ord = ?, updated_at = ? WHERE id = ?",
            (new_title, new_description, new_tags, new_image, new_github, new_live,
             new_stars, new_forks, new_readme, new_ord, ts, project_id)
        )
        conn.commit()
    return get_project(project_id)

def delete_project(project_id: int) -> bool:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM projects WHERE id = ?", (project_id,))
        conn.commit()
        return cursor.rowcount > 0

# ─── COMMENTS ──────────────────────────────────────────────────────

def list_comments(status: Optional[str] = None) -> List[Dict[str, Any]]:
    with get_connection() as conn:
        cursor = conn.cursor()
        if status:
            cursor.execute(
                "SELECT c.id, c.post_id, p.slug as post_slug, p.title as post_title, c.author_name, c.body, c.status, c.created_at, c.moderated_at "
                "FROM comments c LEFT JOIN posts p ON p.id = c.post_id "
                "WHERE c.status = ? ORDER BY c.created_at DESC",
                (status,)
            )
        else:
            cursor.execute(
                "SELECT c.id, c.post_id, p.slug as post_slug, p.title as post_title, c.author_name, c.body, c.status, c.created_at, c.moderated_at "
                "FROM comments c LEFT JOIN posts p ON p.id = c.post_id "
                "ORDER BY c.created_at DESC"
            )
        rows = cursor.fetchall()
        return [
            {
                "id": r["id"],
                "postId": r["post_id"],
                "postSlug": r["post_slug"],
                "postTitle": r["post_title"],
                "authorName": r["author_name"],
                "body": r["body"],
                "status": r["status"],
                "createdAt": r["created_at"],
                "moderatedAt": r["moderated_at"],
            }
            for r in rows
        ]

def get_post_comments(slug_or_id: str, status: Optional[str] = None) -> List[Dict[str, Any]]:
    with get_connection() as conn:
        cursor = conn.cursor()
        query = (
            "SELECT c.id, c.post_id, p.slug as post_slug, p.title as post_title, c.author_name, c.body, c.status, c.created_at, c.moderated_at "
            "FROM comments c JOIN posts p ON p.id = c.post_id "
            "WHERE (p.slug = ? OR p.id = ?) "
        )
        params = [slug_or_id, slug_or_id]
        if status:
            query += " AND c.status = ?"
            params.append(status)
        query += " ORDER BY c.created_at ASC"
        cursor.execute(query, tuple(params))
        rows = cursor.fetchall()
        return [
            {
                "id": r["id"],
                "postId": r["post_id"],
                "postSlug": r["post_slug"],
                "postTitle": r["post_title"],
                "authorName": r["author_name"],
                "body": r["body"],
                "status": r["status"],
                "createdAt": r["created_at"],
                "moderatedAt": r["moderated_at"],
            }
            for r in rows
        ]

def create_comment(
    post_slug_or_id: str,
    author_name: str,
    body: str,
    author_email: Optional[str] = "",
    status: str = "approved"
) -> Dict[str, Any]:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, slug, title FROM posts WHERE slug = ? OR id = ?", (post_slug_or_id, post_slug_or_id))
        post = cursor.fetchone()
        if not post:
            raise ValueError(f"Post '{post_slug_or_id}' não encontrado")
        
        post_id = post["id"]
        post_slug = post["slug"]
        post_title = post["title"]
        comment_id = str(uuid.uuid4())
        ts = now_iso()
        email_hash = hashlib.sha256((author_email or "").encode()).hexdigest()
        
        cursor.execute(
            "INSERT INTO comments(id, post_id, author_name, author_email_hash, body, status, created_at, moderated_at) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (comment_id, post_id, author_name, email_hash, body, status, ts, ts if status == "approved" else None)
        )
        conn.commit()
        return {
            "id": comment_id,
            "postId": post_id,
            "postSlug": post_slug,
            "postTitle": post_title,
            "authorName": author_name,
            "body": body,
            "status": status,
            "createdAt": ts,
            "moderatedAt": ts if status == "approved" else None,
        }

def update_comment_status(comment_id: str, new_status: str) -> bool:
    ts = now_iso()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE comments SET status = ?, moderated_at = ? WHERE id = ?",
            (new_status, ts, comment_id)
        )
        conn.commit()
        return cursor.rowcount > 0

def delete_comment(comment_id: str) -> bool:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM comments WHERE id = ?", (comment_id,))
        conn.commit()
        return cursor.rowcount > 0

# ─── CONTACT MESSAGES ──────────────────────────────────────────────

def list_contact_messages() -> List[Dict[str, Any]]:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, name, email, subject, body, created_at, read_at "
            "FROM contact_messages ORDER BY created_at DESC"
        )
        rows = cursor.fetchall()
        return [
            {
                "id": r["id"],
                "name": r["name"],
                "email": r["email"],
                "subject": r["subject"],
                "body": r["body"],
                "createdAt": r["created_at"],
                "readAt": r["read_at"],
            }
            for r in rows
        ]

def mark_message_read(msg_id: str) -> bool:
    ts = now_iso()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE contact_messages SET read_at = ? WHERE id = ?", (ts, msg_id))
        conn.commit()
        return cursor.rowcount > 0

def delete_contact_message(msg_id: str) -> bool:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM contact_messages WHERE id = ?", (msg_id,))
        conn.commit()
        return cursor.rowcount > 0

# ─── SECTIONS CONFIG ───────────────────────────────────────────────

DEFAULT_SECTIONS = {
    "profile": True,
    "education": True,
    "experience": True,
    "publications": True,
    "skills": True,
    "projects": True,
    "blog": True,
    "contact": True,
}

def get_sections() -> Dict[str, bool]:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT value FROM site_config WHERE key = 'sections'")
        r = cursor.fetchone()
        if not r:
            return DEFAULT_SECTIONS.copy()
        try:
            return json.loads(r["value"])
        except Exception:
            return DEFAULT_SECTIONS.copy()

def update_sections(new_values: Dict[str, bool]) -> Dict[str, bool]:
    current = get_sections()
    current.update(new_values)
    val_json = json.dumps(current)
    with get_connection() as conn:
        conn.execute(
            "INSERT INTO site_config(key, value) VALUES ('sections', ?) "
            "ON CONFLICT(key) DO UPDATE SET value = excluded.value",
            (val_json,)
        )
        conn.commit()
    return current
