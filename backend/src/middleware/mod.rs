use std::net::SocketAddr;

use axum::extract::{ConnectInfo, State};
use axum::http::{HeaderMap, Request};
use axum::middleware::Next;
use axum::response::Response;
use chrono::Utc;

use crate::error::AppError;
use crate::security::{csrf, hash_pii, session};
use crate::AppState;

#[derive(Clone, Debug)]
pub struct AuthUser {
    pub user_id: i64,
    pub session_id: String,
    pub csrf_token: String,
    pub must_change_pw: bool,
    pub totp_enabled: bool,
}

pub fn extract_cookie(headers: &HeaderMap, name: &str) -> Option<String> {
    let cookie = headers.get(axum::http::header::COOKIE)?.to_str().ok()?;
    for part in cookie.split(';') {
        let part = part.trim();
        if let Some(rest) = part.strip_prefix(&format!("{name}=")) {
            return Some(rest.to_string());
        }
    }
    None
}

pub fn client_ip(headers: &HeaderMap, fallback: SocketAddr) -> String {
    if let Some(v) = headers.get("x-forwarded-for").and_then(|h| h.to_str().ok()) {
        if let Some(first) = v.split(',').next() {
            return first.trim().to_string();
        }
    }
    fallback.ip().to_string()
}

pub async fn require_auth(
    State(state): State<AppState>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    mut req: Request<axum::body::Body>,
    next: Next,
) -> Result<Response, AppError> {
    let headers = req.headers().clone();
    let cookie = extract_cookie(&headers, session::SESSION_COOKIE).ok_or(AppError::Unauthorized)?;
    let sid = session::verify_cookie(&cookie, &state.config.session_secret)
        .ok_or(AppError::Unauthorized)?;

    let conn = state.db.get()?;
    let row: Option<(i64, String, String, i64, i64)> = conn
        .query_row(
            "SELECT s.user_id, s.csrf_token, s.expires_at, u.must_change_pw, u.totp_enabled
             FROM sessions s JOIN admin_user u ON u.id=s.user_id WHERE s.id=?1",
            [&sid],
            |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?, r.get(3)?, r.get(4)?)),
        )
        .ok();
    let (user_id, csrf_tok, expires_at, must_change_pw, totp_enabled) =
        row.ok_or(AppError::Unauthorized)?;
    if expires_at <= Utc::now().to_rfc3339() {
        return Err(AppError::Unauthorized);
    }

    // Rolling expiration (30 min)
    let new_expires = (Utc::now() + chrono::Duration::minutes(30)).to_rfc3339();
    conn.execute(
        "UPDATE sessions SET last_seen=?1, expires_at=?2 WHERE id=?3",
        rusqlite::params![Utc::now().to_rfc3339(), new_expires, sid],
    )?;

    // CSRF para métodos mutáveis
    let method = req.method().clone();
    if !matches!(method, axum::http::Method::GET | axum::http::Method::HEAD) {
        let hdr = headers
            .get(csrf::CSRF_HEADER)
            .and_then(|v| v.to_str().ok());
        if !csrf::matches(hdr, &csrf_tok) {
            return Err(AppError::Forbidden);
        }
    }

    let ip = client_ip(&headers, addr);
    let _ = ip; // disponível se quiser logar

    req.extensions_mut().insert(AuthUser {
        user_id,
        session_id: sid,
        csrf_token: csrf_tok,
        must_change_pw: must_change_pw != 0,
        totp_enabled: totp_enabled != 0,
    });

    Ok(next.run(req).await)
}

pub fn hash_ip(ip: &str, secret: &[u8; 32]) -> String {
    hash_pii(ip, secret)
}
