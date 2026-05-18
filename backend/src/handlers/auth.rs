use std::net::SocketAddr;

use axum::extract::{ConnectInfo, State};
use axum::http::{header, HeaderMap, HeaderValue, StatusCode};
use axum::response::{IntoResponse, Response};
use axum::{Extension, Json};
use chrono::{Duration, Utc};
use rusqlite::params;
use serde::{Deserialize, Serialize};
use serde_json::json;

use crate::error::{AppError, AppResult};
use crate::middleware::{client_ip, hash_ip, AuthUser};
use crate::security::{argon2id, session, totp};
use crate::AppState;

#[derive(Deserialize)]
pub struct LoginInput {
    pub username: String,
    pub password: String,
    #[serde(default)]
    pub totp: Option<String>,
}

#[derive(Serialize)]
pub struct LoginOk {
    pub ok: bool,
    #[serde(rename = "mustChangePassword")]
    pub must_change_password: bool,
    #[serde(rename = "totpEnabled")]
    pub totp_enabled: bool,
    pub csrf: String,
}

pub async fn login(
    State(state): State<AppState>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    headers: HeaderMap,
    Json(input): Json<LoginInput>,
) -> AppResult<Response> {
    let ip = client_ip(&headers, addr);
    if !state.rate.check(&format!("login:{ip}"), 5, std::time::Duration::from_secs(900)) {
        return Err(AppError::TooMany);
    }
    if input.username.len() > 64 || input.password.len() > 512 {
        return Err(AppError::BadRequest("input muito grande".into()));
    }

    let conn = state.db.get()?;
    let row: Option<(i64, String, Option<String>, i64, i64)> = conn
        .query_row(
            "SELECT id, password_hash, totp_secret, totp_enabled, must_change_pw FROM admin_user WHERE username=?1",
            [&input.username],
            |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?, r.get(3)?, r.get(4)?)),
        )
        .ok();
    let Some((user_id, password_hash, totp_secret, totp_enabled, must_change_pw)) = row else {
        return Err(AppError::Unauthorized);
    };
    if !argon2id::verify(input.password.as_bytes(), &password_hash) {
        return Err(AppError::Unauthorized);
    }
    if totp_enabled != 0 {
        let code = input.totp.unwrap_or_default();
        let secret = totp_secret.unwrap_or_default();
        if !totp::verify(&secret, &code) {
            return Err(AppError::Unauthorized);
        }
    }

    // Cria sessão
    let sid = session::new_session_id();
    let csrf = session::new_csrf_token();
    let now = Utc::now();
    let expires = now + Duration::minutes(30);
    let ip_hash = hash_ip(&ip, &state.config.session_secret);
    let ua_hash = headers
        .get(header::USER_AGENT)
        .and_then(|v| v.to_str().ok())
        .map(|s| hash_ip(s, &state.config.session_secret));
    conn.execute(
        "INSERT INTO sessions(id, user_id, csrf_token, created_at, last_seen, expires_at, ip_hash, ua_hash)
         VALUES (?1,?2,?3,?4,?4,?5,?6,?7)",
        params![sid, user_id, csrf, now.to_rfc3339(), expires.to_rfc3339(), ip_hash, ua_hash],
    )?;

    let signed = session::sign_cookie(&sid, &state.config.session_secret);
    let mut h = HeaderMap::new();
    h.append(
        header::SET_COOKIE,
        HeaderValue::from_str(&session::build_session_cookie(&signed, 30 * 60)).unwrap(),
    );
    h.append(
        header::SET_COOKIE,
        HeaderValue::from_str(&session::build_csrf_cookie(&csrf, 30 * 60)).unwrap(),
    );
    audit(&state, "admin", "login", None, &ip)?;
    Ok((
        StatusCode::OK,
        h,
        Json(LoginOk {
            ok: true,
            must_change_password: must_change_pw != 0,
            totp_enabled: totp_enabled != 0,
            csrf,
        }),
    )
        .into_response())
}

pub async fn me(Extension(user): Extension<AuthUser>) -> Json<serde_json::Value> {
    Json(json!({
        "userId": user.user_id,
        "mustChangePassword": user.must_change_pw,
        "totpEnabled": user.totp_enabled,
        "csrf": user.csrf_token,
    }))
}

pub async fn logout(
    State(state): State<AppState>,
    Extension(user): Extension<AuthUser>,
) -> AppResult<Response> {
    state
        .db
        .get()?
        .execute("DELETE FROM sessions WHERE id=?1", [&user.session_id])?;
    let mut h = HeaderMap::new();
    h.append(
        header::SET_COOKIE,
        HeaderValue::from_str(&session::clear_cookie(session::SESSION_COOKIE)).unwrap(),
    );
    h.append(
        header::SET_COOKIE,
        HeaderValue::from_str(&session::clear_cookie(session::CSRF_COOKIE)).unwrap(),
    );
    Ok((StatusCode::OK, h, Json(json!({"ok":true}))).into_response())
}

#[derive(Deserialize)]
pub struct ChangePwInput {
    #[serde(rename = "currentPassword")]
    pub current_password: String,
    #[serde(rename = "newPassword")]
    pub new_password: String,
}

pub async fn change_password(
    State(state): State<AppState>,
    Extension(user): Extension<AuthUser>,
    Json(inp): Json<ChangePwInput>,
) -> AppResult<Json<serde_json::Value>> {
    if inp.new_password.len() < 12 || inp.new_password.len() > 256 {
        return Err(AppError::BadRequest("senha deve ter 12-256 caracteres".into()));
    }
    let conn = state.db.get()?;
    let hash: String = conn.query_row(
        "SELECT password_hash FROM admin_user WHERE id=?1",
        [user.user_id],
        |r| r.get(0),
    )?;
    if !argon2id::verify(inp.current_password.as_bytes(), &hash) {
        return Err(AppError::Unauthorized);
    }
    let new_hash = argon2id::hash(inp.new_password.as_bytes())?;
    conn.execute(
        "UPDATE admin_user SET password_hash=?1, must_change_pw=0, updated_at=?2 WHERE id=?3",
        params![new_hash, Utc::now().to_rfc3339(), user.user_id],
    )?;
    Ok(Json(json!({"ok": true})))
}

#[derive(Serialize)]
pub struct SetupOk {
    pub secret: String,
    #[serde(rename = "otpauth")]
    pub otpauth_uri: String,
}

pub async fn setup_2fa(
    State(state): State<AppState>,
    Extension(user): Extension<AuthUser>,
) -> AppResult<Json<SetupOk>> {
    let secret = totp::random_secret();
    let b32 = totp::encode_secret_base32(&secret);
    state.db.get()?.execute(
        "UPDATE admin_user SET totp_secret=?1, totp_enabled=0 WHERE id=?2",
        params![b32, user.user_id],
    )?;
    Ok(Json(SetupOk {
        otpauth_uri: totp::otpauth_uri("admin@overcyber", "Overcyber", &b32),
        secret: b32,
    }))
}

#[derive(Deserialize)]
pub struct VerifyTotpInput {
    pub code: String,
}

pub async fn verify_2fa_setup(
    State(state): State<AppState>,
    Extension(user): Extension<AuthUser>,
    Json(inp): Json<VerifyTotpInput>,
) -> AppResult<Json<serde_json::Value>> {
    let conn = state.db.get()?;
    let secret: Option<String> = conn
        .query_row(
            "SELECT totp_secret FROM admin_user WHERE id=?1",
            [user.user_id],
            |r| r.get(0),
        )
        .ok();
    let Some(secret) = secret else {
        return Err(AppError::BadRequest("inicie setup primeiro".into()));
    };
    if !totp::verify(&secret, &inp.code) {
        return Err(AppError::Unauthorized);
    }
    conn.execute(
        "UPDATE admin_user SET totp_enabled=1 WHERE id=?1",
        [user.user_id],
    )?;
    Ok(Json(json!({"ok":true})))
}

pub async fn disable_2fa(
    State(state): State<AppState>,
    Extension(user): Extension<AuthUser>,
    Json(inp): Json<VerifyTotpInput>,
) -> AppResult<Json<serde_json::Value>> {
    let conn = state.db.get()?;
    let secret: Option<String> = conn
        .query_row(
            "SELECT totp_secret FROM admin_user WHERE id=?1",
            [user.user_id],
            |r| r.get(0),
        )
        .ok();
    let Some(secret) = secret else {
        return Err(AppError::BadRequest("2FA não configurado".into()));
    };
    if !totp::verify(&secret, &inp.code) {
        return Err(AppError::Unauthorized);
    }
    conn.execute(
        "UPDATE admin_user SET totp_enabled=0, totp_secret=NULL WHERE id=?1",
        [user.user_id],
    )?;
    Ok(Json(json!({"ok":true})))
}

fn audit(
    state: &AppState,
    actor: &str,
    action: &str,
    target: Option<&str>,
    ip: &str,
) -> AppResult<()> {
    let conn = state.db.get()?;
    conn.execute(
        "INSERT INTO audit_log(actor, action, target, ip_hash) VALUES (?1,?2,?3,?4)",
        params![actor, action, target, hash_ip(ip, &state.config.session_secret)],
    )?;
    Ok(())
}
