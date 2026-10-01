use std::net::SocketAddr;
use std::path::PathBuf;
use std::sync::Arc;
use std::time::Duration;

use anyhow::Context;
use axum::Router;
use base64::Engine;
use rand::RngCore;

mod config;
mod db;
mod error;
mod handlers;
mod middleware;
mod models;
mod security;

use crate::config::Config;
use crate::db::Db;
use crate::security::ratelimit::RateLimiter;

#[derive(Clone)]
pub struct AppState {
    pub db: Db,
    pub config: Arc<Config>,
    pub rate: Arc<RateLimiter>,
    /// SEC-05: true quando PUBLIC_ORIGIN é https — cookies passam a levar `Secure`.
    pub https_public: bool,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::EnvFilter::from_default_env())
        .init();

    let bind: SocketAddr = std::env::var("BIND_ADDR")
        .unwrap_or_else(|_| "127.0.0.1:8787".into())
        .parse()
        .context("BIND_ADDR inválido")?;

    let db_path: PathBuf = std::env::var("DATABASE_PATH")
        .unwrap_or_else(|_| "./data/overcyber.db".into())
        .into();
    if let Some(parent) = db_path.parent() {
        std::fs::create_dir_all(parent).ok();
    }

    let session_secret = load_or_create_session_secret(&db_path)?;
    let admin_bootstrap_pw = std::env::var("ADMIN_BOOTSTRAP_PASSWORD").ok();
    let public_origin =
        std::env::var("PUBLIC_ORIGIN").unwrap_or_else(|_| "http://localhost:5173".into());
    // SEC-20: dificuldade do PoW configurável (padrão elevado de 14 para 18 bits).
    let pow_bits: u32 = std::env::var("POW_DIFFICULTY_BITS")
        .ok()
        .and_then(|v| v.parse().ok())
        .unwrap_or(18);

    let config = Arc::new(Config {
        session_secret,
        public_origin: public_origin.clone(),
        pow_difficulty_bits: pow_bits,
    });

    let db = Db::open(&db_path)?;
    db.run_migrations()?;
    db.bootstrap_admin(admin_bootstrap_pw.as_deref())?;

    let state = AppState {
        db,
        config,
        rate: Arc::new(RateLimiter::new()),
        https_public: public_origin.starts_with("https://"),
    };

    let cors = cors_for(&public_origin);
    let app: Router = handlers::build_router(state.clone())
        .layer(axum::middleware::from_fn_with_state(
            state.clone(),
            security::session_cookie_security::enforce_secure_cookies,
        ))
        .layer(tower_http::limit::RequestBodyLimitLayer::new(1024 * 1024))
        .layer(tower_http::trace::TraceLayer::new_for_http())
        .layer(cors);

    tracing::info!("overcyber-backend ouvindo em http://{bind}");
    let listener = tokio::net::TcpListener::bind(bind).await?;
    axum::serve(
        listener,
        app.into_make_service_with_connect_info::<SocketAddr>(),
    )
    .await?;
    Ok(())
}

/// SEC-14: CORS restrito à origem pública configurada.
/// Em produção same-origin o CORS é desnecessário, mas fica correto para
/// cenários de desenvolvimento com VITE_API_BASE_URL apontando direto ao backend.
fn cors_for(public_origin: &str) -> tower_http::cors::CorsLayer {
    let origin = public_origin
        .parse::<axum::http::HeaderValue>()
        .expect("PUBLIC_ORIGIN inválida para CORS");
    tower_http::cors::CorsLayer::new()
        .allow_origin(origin)
        .allow_methods([
            axum::http::Method::GET,
            axum::http::Method::POST,
            axum::http::Method::PUT,
            axum::http::Method::DELETE,
        ])
        .allow_headers([
            axum::http::header::CONTENT_TYPE,
            axum::http::HeaderName::from_static("x-csrf-token"),
        ])
        .allow_credentials(true)
        .max_age(Duration::from_secs(600))
}

fn load_or_create_session_secret(db_path: &std::path::Path) -> anyhow::Result<[u8; 32]> {
    if let Ok(b64) = std::env::var("SESSION_SECRET") {
        let raw = base64::engine::general_purpose::STANDARD
            .decode(b64.trim())
            .context("SESSION_SECRET deve ser base64")?;
        if raw.len() < 32 {
            anyhow::bail!("SESSION_SECRET muito curto (>=32 bytes)");
        }
        let mut out = [0u8; 32];
        out.copy_from_slice(&raw[..32]);
        return Ok(out);
    }
    let secret_file = db_path
        .parent()
        .unwrap_or(std::path::Path::new("."))
        .join(".session_secret");
    if let Ok(b) = std::fs::read(&secret_file) {
        if b.len() == 32 {
            let mut out = [0u8; 32];
            out.copy_from_slice(&b);
            tracing::warn!(
                "SESSION_SECRET ausente — usando segredo persistido em {}",
                secret_file.display()
            );
            return Ok(out);
        }
    }
    let mut out = [0u8; 32];
    rand::thread_rng().fill_bytes(&mut out);
    std::fs::write(&secret_file, out).context("falha ao gravar .session_secret")?;
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        std::fs::set_permissions(&secret_file, std::fs::Permissions::from_mode(0o600)).ok();
    }
    tracing::warn!(
        "Novo SESSION_SECRET gerado em {} — defina SESSION_SECRET via env em produção",
        secret_file.display()
    );
    Ok(out)
}
