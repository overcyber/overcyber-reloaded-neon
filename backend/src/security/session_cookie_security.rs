use axum::extract::{Request, State};
use axum::http::header::SET_COOKIE;
use axum::middleware::Next;
use axum::response::Response;

use crate::AppState;

/// SEC-05: acrescenta o atributo `Secure` a todos os cookies Set-Cookie
/// quando a origem pública é HTTPS. Centraliza a política sem espalhar
/// lógica pelos handlers.
pub async fn enforce_secure_cookies(State(state): State<AppState>, req: Request, next: Next) -> Response {
    let mut res = next.run(req).await;
    if state.https_public {
        let cookies: Vec<String> = res
            .headers()
            .get_all(SET_COOKIE)
            .iter()
            .filter_map(|v| v.to_str().ok().map(String::from))
            .collect();
        if !cookies.is_empty() {
            res.headers_mut().remove(SET_COOKIE);
            for c in cookies {
                let c = if c.to_ascii_lowercase().contains("secure") {
                    c
                } else {
                    format!("{c}; Secure")
                };
                if let Ok(hv) = axum::http::HeaderValue::from_str(&c) {
                    res.headers_mut().append(SET_COOKIE, hv);
                }
            }
        }
    }
    res
}
