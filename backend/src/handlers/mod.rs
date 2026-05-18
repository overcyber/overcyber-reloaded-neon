pub mod auth;
pub mod about;
pub mod projects;
pub mod resume;
pub mod posts;
pub mod comments;
pub mod contact;
pub mod pow;
pub mod migrate;

use axum::routing::{delete, get, post, put};
use axum::Router;

use crate::middleware::require_auth;
use crate::security::headers::apply_security_headers;
use crate::AppState;

pub fn build_router(state: AppState) -> Router {
    // Rotas admin (exigem sessão + CSRF para mutações)
    let admin = Router::new()
        .route("/auth/me", get(auth::me))
        .route("/auth/logout", post(auth::logout))
        .route("/auth/change-password", post(auth::change_password))
        .route("/auth/setup-2fa", post(auth::setup_2fa))
        .route("/auth/verify-2fa", post(auth::verify_2fa_setup))
        .route("/auth/disable-2fa", post(auth::disable_2fa))
        .route("/about", put(about::update))
        .route("/projects", post(projects::create))
        .route("/projects/:id", put(projects::update).delete(projects::delete))
        .route("/resume/:section", put(resume::update))
        .route("/posts", post(posts::create))
        .route("/posts/:id", put(posts::update).delete(posts::delete))
        .route("/comments", get(comments::list_admin))
        .route("/comments/:id/approve", post(comments::approve))
        .route("/comments/:id/reject", post(comments::reject))
        .route("/comments/:id/spam", post(comments::mark_spam))
        .route("/comments/:id", delete(comments::delete))
        .route("/contact/messages", get(contact::list_admin))
        .route("/contact/messages/:id/read", post(contact::mark_read))
        .route("/contact/messages/:id", delete(contact::delete))
        .route("/migrate/import", post(migrate::import))
        .route_layer(axum::middleware::from_fn_with_state(
            state.clone(),
            require_auth,
        ));

    // Rotas públicas
    let public = Router::new()
        .route("/auth/login", post(auth::login))
        .route("/about", get(about::get))
        .route("/projects", get(projects::list))
        .route("/resume", get(resume::get_all))
        .route("/posts", get(posts::list_public))
        .route("/posts/:slug", get(posts::get_by_slug))
        .route("/posts/:slug/comments", get(comments::list_public))
        .route("/posts/:slug/comments", post(comments::create))
        .route("/contact", post(contact::create))
        .route("/pow/challenge", get(pow::challenge));

    let api = Router::new().merge(public).merge(admin);

    Router::new()
        .nest("/api", api)
        .route("/healthz", get(|| async { "ok" }))
        .layer(axum::middleware::from_fn(apply_security_headers))
        .with_state(state)
}
