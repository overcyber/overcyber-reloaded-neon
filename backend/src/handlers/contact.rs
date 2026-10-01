use std::net::SocketAddr;

use axum::extract::{ConnectInfo, Path, State};
use axum::http::HeaderMap;
use axum::Json;
use chrono::Utc;
use rusqlite::params;
use uuid::Uuid;

use crate::error::{AppError, AppResult};
use crate::middleware::{client_ip, hash_ip};
use crate::models::ContactInput;
use crate::security::pow;
use crate::AppState;

pub async fn create(
    State(state): State<AppState>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    headers: HeaderMap,
    Json(inp): Json<ContactInput>,
) -> AppResult<Json<serde_json::Value>> {
    if !inp.website.is_empty() {
        return Ok(Json(serde_json::json!({"ok":true})));
    }
    if inp.name.trim().is_empty() || inp.name.len() > 120 {
        return Err(AppError::BadRequest("nome inválido".into()));
    }
    if inp.email.len() > 320 || !inp.email.contains('@') {
        return Err(AppError::BadRequest("email inválido".into()));
    }
    if inp.body.trim().is_empty() || inp.body.len() > 8000 {
        return Err(AppError::BadRequest("mensagem inválida".into()));
    }
    if inp.subject.len() > 300 {
        return Err(AppError::BadRequest("assunto inválido".into()));
    }
    let ip = client_ip(&headers, addr);
    if !state.rate.check(&format!("contact:{ip}"), 3, std::time::Duration::from_secs(3600)) {
        return Err(AppError::TooMany);
    }
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
    let id = Uuid::new_v4().to_string();
    let ip_hash = hash_ip(&ip, &state.config.session_secret);
    // SEC-07: e-mail é armazenado cifrado (AES-256-GCM, chave derivada do
    // SESSION_SECRET) para não expor PII em caso de vazamento/backup do banco.
    let email_enc = crate::security::crypto::encrypt(&inp.email, &state.config.session_secret);
    conn.execute(
        "INSERT INTO contact_messages(id, name, email, subject, body, ip_hash) VALUES (?1,?2,?3,?4,?5,?6)",
        params![id, inp.name, email_enc, inp.subject, inp.body, ip_hash],
    )?;
    Ok(Json(serde_json::json!({"ok":true})))
}

pub async fn list_admin(State(state): State<AppState>) -> AppResult<Json<Vec<serde_json::Value>>> {
    let conn = state.db.get()?;
    let mut stmt = conn.prepare(
        "SELECT id, name, email, subject, body, created_at, read_at FROM contact_messages ORDER BY created_at DESC",
    )?;
    let secret = state.config.session_secret;
    let rows = stmt.query_map([], |r| {
        let email_stored: String = r.get(2)?;
        // SEC-07: decifra na leitura; e-mails legados em texto claro ainda
        // são exibidos corretamente.
        let email = crate::security::crypto::decrypt(&email_stored, &secret)
            .unwrap_or(email_stored);
        Ok(serde_json::json!({
            "id": r.get::<_,String>(0)?,
            "name": r.get::<_,String>(1)?,
            "email": email,
            "subject": r.get::<_,String>(3)?,
            "body": r.get::<_,String>(4)?,
            "createdAt": r.get::<_,String>(5)?,
            "readAt": r.get::<_,Option<String>>(6)?,
        }))
    })?;
    Ok(Json(rows.collect::<Result<Vec<_>, _>>()?))
}

pub async fn mark_read(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> AppResult<Json<serde_json::Value>> {
    let n = state.db.get()?.execute(
        "UPDATE contact_messages SET read_at=?1 WHERE id=?2",
        params![Utc::now().to_rfc3339(), id],
    )?;
    if n == 0 { return Err(AppError::NotFound); }
    Ok(Json(serde_json::json!({"ok":true})))
}

pub async fn delete(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> AppResult<Json<serde_json::Value>> {
    let n = state.db.get()?.execute("DELETE FROM contact_messages WHERE id=?1", [&id])?;
    if n == 0 { return Err(AppError::NotFound); }
    Ok(Json(serde_json::json!({"ok":true})))
}
