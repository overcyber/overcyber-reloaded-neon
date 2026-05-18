use std::net::SocketAddr;

use axum::extract::{ConnectInfo, Path, Query, State};
use axum::http::HeaderMap;
use axum::Json;
use chrono::Utc;
use rusqlite::params;
use serde::Deserialize;
use uuid::Uuid;

use crate::error::{AppError, AppResult};
use crate::middleware::{client_ip, hash_ip};
use crate::models::{Comment, CommentInput};
use crate::security::{hash_pii, pow};
use crate::AppState;

#[derive(Deserialize)]
pub struct AdminQuery {
    #[serde(default)]
    pub status: Option<String>,
}

pub async fn list_public(
    State(state): State<AppState>,
    Path(slug): Path<String>,
) -> AppResult<Json<Vec<Comment>>> {
    let conn = state.db.get()?;
    let mut stmt = conn.prepare(
        "SELECT c.id, c.post_id, c.author_name, c.body, c.status, c.created_at
         FROM comments c JOIN posts p ON p.id=c.post_id
         WHERE p.slug=?1 AND c.status='approved' ORDER BY c.created_at ASC",
    )?;
    let rows = stmt.query_map([&slug], |r| {
        Ok(Comment {
            id: r.get(0)?,
            post_id: r.get(1)?,
            author_name: r.get(2)?,
            body: r.get(3)?,
            status: r.get(4)?,
            created_at: r.get(5)?,
        })
    })?;
    Ok(Json(rows.collect::<Result<Vec<_>, _>>()?))
}

pub async fn create(
    State(state): State<AppState>,
    Path(slug): Path<String>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    headers: HeaderMap,
    Json(inp): Json<CommentInput>,
) -> AppResult<Json<serde_json::Value>> {
    if !inp.website.is_empty() {
        // Honeypot — finge sucesso para não dar pista ao bot.
        return Ok(Json(serde_json::json!({"ok":true,"status":"pending"})));
    }
    if inp.author_name.trim().is_empty() || inp.author_name.len() > 80 {
        return Err(AppError::BadRequest("nome inválido".into()));
    }
    if inp.body.trim().len() < 2 || inp.body.len() > 4000 {
        return Err(AppError::BadRequest("comentário inválido".into()));
    }
    if inp.author_email.len() > 320 || !inp.author_email.contains('@') {
        return Err(AppError::BadRequest("email inválido".into()));
    }
    let ip = client_ip(&headers, addr);
    if !state.rate.check(&format!("cmt:{ip}"), 1, std::time::Duration::from_secs(60)) {
        return Err(AppError::TooMany);
    }
    if !state.rate.check(&format!("cmt-day:{ip}"), 10, std::time::Duration::from_secs(86400)) {
        return Err(AppError::TooMany);
    }
    // Valida PoW
    if !pow::verify_solution(&inp.pow.nonce, &inp.pow.solution, state.config.pow_difficulty_bits) {
        return Err(AppError::BadRequest("pow inválido".into()));
    }
    let conn = state.db.get()?;
    let consumed = conn.execute(
        "UPDATE pow_challenges SET used_at=?1 WHERE nonce=?2 AND used_at IS NULL",
        params![Utc::now().to_rfc3339(), inp.pow.nonce],
    )?;
    if consumed == 0 {
        return Err(AppError::BadRequest("pow expirado".into()));
    }
    let post_id: String = conn
        .query_row("SELECT id FROM posts WHERE slug=?1 AND status='published'", [&slug], |r| r.get(0))
        .map_err(|_| AppError::NotFound)?;

    let id = Uuid::new_v4().to_string();
    let email_hash = hash_pii(&inp.author_email.to_lowercase(), &state.config.session_secret);
    let ip_hash = hash_ip(&ip, &state.config.session_secret);
    conn.execute(
        "INSERT INTO comments(id, post_id, author_name, author_email_hash, body, status, ip_hash)
         VALUES (?1,?2,?3,?4,?5,'pending',?6)",
        params![id, post_id, sanitize(&inp.author_name), email_hash, sanitize(&inp.body), ip_hash],
    )?;
    Ok(Json(serde_json::json!({"ok":true,"status":"pending"})))
}

pub async fn list_admin(
    State(state): State<AppState>,
    Query(q): Query<AdminQuery>,
) -> AppResult<Json<Vec<serde_json::Value>>> {
    let status = q.status.unwrap_or_else(|| "pending".into());
    let conn = state.db.get()?;
    let mut stmt = conn.prepare(
        "SELECT c.id, c.post_id, p.slug, p.title, c.author_name, c.body, c.status, c.created_at
         FROM comments c JOIN posts p ON p.id=c.post_id WHERE c.status=?1 ORDER BY c.created_at DESC",
    )?;
    let rows = stmt.query_map([&status], |r| {
        Ok(serde_json::json!({
            "id": r.get::<_,String>(0)?,
            "postId": r.get::<_,String>(1)?,
            "postSlug": r.get::<_,String>(2)?,
            "postTitle": r.get::<_,String>(3)?,
            "authorName": r.get::<_,String>(4)?,
            "body": r.get::<_,String>(5)?,
            "status": r.get::<_,String>(6)?,
            "createdAt": r.get::<_,String>(7)?,
        }))
    })?;
    Ok(Json(rows.collect::<Result<Vec<_>, _>>()?))
}

pub async fn approve(State(s): State<AppState>, Path(id): Path<String>) -> AppResult<Json<serde_json::Value>> {
    set_status(&s, &id, "approved")
}
pub async fn reject(State(s): State<AppState>, Path(id): Path<String>) -> AppResult<Json<serde_json::Value>> {
    set_status(&s, &id, "rejected")
}
pub async fn mark_spam(State(s): State<AppState>, Path(id): Path<String>) -> AppResult<Json<serde_json::Value>> {
    set_status(&s, &id, "spam")
}
pub async fn delete(State(s): State<AppState>, Path(id): Path<String>) -> AppResult<Json<serde_json::Value>> {
    let n = s.db.get()?.execute("DELETE FROM comments WHERE id=?1", [&id])?;
    if n == 0 { return Err(AppError::NotFound); }
    Ok(Json(serde_json::json!({"ok":true})))
}

fn set_status(s: &AppState, id: &str, status: &str) -> AppResult<Json<serde_json::Value>> {
    let n = s.db.get()?.execute(
        "UPDATE comments SET status=?1, moderated_at=?2 WHERE id=?3",
        params![status, Utc::now().to_rfc3339(), id],
    )?;
    if n == 0 { return Err(AppError::NotFound); }
    Ok(Json(serde_json::json!({"ok":true,"status":status})))
}

fn sanitize(s: &str) -> String {
    // strip total de HTML para evitar XSS; mantém texto cru
    let mut out = String::with_capacity(s.len());
    let mut in_tag = false;
    for c in s.chars() {
        match c {
            '<' => in_tag = true,
            '>' => in_tag = false,
            _ if !in_tag => out.push(c),
            _ => {}
        }
    }
    out
}
