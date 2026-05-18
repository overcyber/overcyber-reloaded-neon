use axum::extract::{Path, Query, State};
use axum::Json;
use chrono::Utc;
use rusqlite::params;
use serde::Deserialize;
use uuid::Uuid;

use crate::error::{AppError, AppResult};
use crate::models::{Post, PostInput};
use crate::AppState;

#[derive(Deserialize)]
pub struct ListQuery {
    #[serde(default)]
    pub status: Option<String>,
}

fn row_to_post(r: &rusqlite::Row) -> rusqlite::Result<Post> {
    Ok(Post {
        id: r.get(0)?,
        slug: r.get(1)?,
        title: r.get(2)?,
        excerpt: r.get(3)?,
        content: r.get(4)?,
        image: r.get(5)?,
        status: r.get(6)?,
        published_at: r.get(7)?,
        created_at: r.get(8)?,
        updated_at: r.get(9)?,
    })
}

pub async fn list_public(
    State(state): State<AppState>,
    Query(_q): Query<ListQuery>,
) -> AppResult<Json<Vec<Post>>> {
    let conn = state.db.get()?;
    let mut stmt = conn.prepare(
        "SELECT id,slug,title,excerpt,content,image,status,published_at,created_at,updated_at
         FROM posts WHERE status='published' ORDER BY COALESCE(published_at, created_at) DESC",
    )?;
    let rows = stmt.query_map([], row_to_post)?;
    Ok(Json(rows.collect::<Result<Vec<_>, _>>()?))
}

pub async fn get_by_slug(
    State(state): State<AppState>,
    Path(slug): Path<String>,
) -> AppResult<Json<Post>> {
    let conn = state.db.get()?;
    let post: Option<Post> = conn
        .query_row(
            "SELECT id,slug,title,excerpt,content,image,status,published_at,created_at,updated_at
             FROM posts WHERE slug=?1 AND status='published'",
            [&slug],
            row_to_post,
        )
        .ok();
    post.map(Json).ok_or(AppError::NotFound)
}

pub async fn create(
    State(state): State<AppState>,
    Json(p): Json<PostInput>,
) -> AppResult<Json<Post>> {
    validate(&p)?;
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    let published_at = if p.status == "published" { Some(now.clone()) } else { None };
    state.db.get()?.execute(
        "INSERT INTO posts(id,slug,title,excerpt,content,image,status,published_at,created_at,updated_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?9)",
        params![id, p.slug, p.title, p.excerpt, p.content, p.image, p.status, published_at, now],
    ).map_err(map_conflict)?;
    fetch(&state, &id).map(Json)
}

pub async fn update(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(p): Json<PostInput>,
) -> AppResult<Json<Post>> {
    validate(&p)?;
    let conn = state.db.get()?;
    let current: Option<(String, Option<String>)> = conn
        .query_row(
            "SELECT status, published_at FROM posts WHERE id=?1",
            [&id],
            |r| Ok((r.get(0)?, r.get(1)?)),
        )
        .ok();
    let (old_status, old_pub) = current.ok_or(AppError::NotFound)?;
    let published_at = if p.status == "published" {
        Some(old_pub.unwrap_or_else(|| Utc::now().to_rfc3339()))
    } else {
        None
    };
    let now = Utc::now().to_rfc3339();
    conn.execute(
        "UPDATE posts SET slug=?1,title=?2,excerpt=?3,content=?4,image=?5,status=?6,published_at=?7,updated_at=?8 WHERE id=?9",
        params![p.slug, p.title, p.excerpt, p.content, p.image, p.status, published_at, now, id],
    ).map_err(map_conflict)?;
    let _ = old_status;
    fetch(&state, &id).map(Json)
}

pub async fn delete(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> AppResult<Json<serde_json::Value>> {
    let n = state
        .db
        .get()?
        .execute("DELETE FROM posts WHERE id=?1", [&id])?;
    if n == 0 {
        return Err(AppError::NotFound);
    }
    Ok(Json(serde_json::json!({"ok":true})))
}

fn fetch(state: &AppState, id: &str) -> AppResult<Post> {
    let conn = state.db.get()?;
    conn.query_row(
        "SELECT id,slug,title,excerpt,content,image,status,published_at,created_at,updated_at FROM posts WHERE id=?1",
        [id],
        row_to_post,
    )
    .map_err(|_| AppError::NotFound)
}

fn validate(p: &PostInput) -> AppResult<()> {
    if p.title.len() < 3 || p.title.len() > 300 {
        return Err(AppError::BadRequest("title 3..300".into()));
    }
    if p.slug.len() < 3 || p.slug.len() > 200 {
        return Err(AppError::BadRequest("slug 3..200".into()));
    }
    if !p.slug.chars().all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '_') {
        return Err(AppError::BadRequest("slug inválido".into()));
    }
    if p.content.len() > 200_000 {
        return Err(AppError::BadRequest("conteúdo muito grande".into()));
    }
    if !matches!(p.status.as_str(), "draft" | "published") {
        return Err(AppError::BadRequest("status inválido".into()));
    }
    Ok(())
}

fn map_conflict(e: rusqlite::Error) -> AppError {
    let s = e.to_string();
    if s.contains("UNIQUE") {
        AppError::Conflict("slug em uso".into())
    } else {
        AppError::Sqlite(e)
    }
}
