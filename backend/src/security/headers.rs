use axum::http::HeaderValue;
use axum::middleware::Next;
use axum::response::Response;

pub async fn apply_security_headers(req: axum::extract::Request, next: Next) -> Response {
    let mut res = next.run(req).await;
    let h = res.headers_mut();
    h.insert("X-Content-Type-Options", HeaderValue::from_static("nosniff"));
    h.insert("X-Frame-Options", HeaderValue::from_static("DENY"));
    h.insert("Referrer-Policy", HeaderValue::from_static("strict-origin-when-cross-origin"));
    h.insert(
        "Permissions-Policy",
        HeaderValue::from_static("geolocation=(), microphone=(), camera=()"),
    );
    h.insert(
        "Cross-Origin-Opener-Policy",
        HeaderValue::from_static("same-origin"),
    );
    h.insert(
        "Cross-Origin-Resource-Policy",
        HeaderValue::from_static("same-origin"),
    );
    h.insert(
        "Strict-Transport-Security",
        HeaderValue::from_static("max-age=31536000; includeSubDomains"),
    );
    // SEC-09: respostas de API não devem ser cacheadas (contêm dados sensíveis
    // de sessões autenticadas e inbox/moderação).
    h.insert(
        "Cache-Control",
        HeaderValue::from_static("no-store"),
    );
    h.insert(
        "Content-Security-Policy",
        HeaderValue::from_static("default-src 'self'; script-src 'none'; style-src 'none'; img-src 'none'; connect-src 'self'; form-action 'none'; base-uri 'none'"),
    );
    res
}
