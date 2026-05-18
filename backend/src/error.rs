use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use serde_json::json;

#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("não autorizado")]
    Unauthorized,
    #[error("proibido")]
    Forbidden,
    #[error("não encontrado")]
    NotFound,
    #[error("requisição inválida: {0}")]
    BadRequest(String),
    #[error("conflito: {0}")]
    Conflict(String),
    #[error("muitas requisições")]
    TooMany,
    #[error("erro interno")]
    Internal(#[from] anyhow::Error),
    #[error("erro sqlite")]
    Sqlite(#[from] rusqlite::Error),
    #[error("erro pool")]
    Pool(#[from] r2d2::Error),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, msg) = match &self {
            AppError::Unauthorized => (StatusCode::UNAUTHORIZED, "unauthorized".to_string()),
            AppError::Forbidden => (StatusCode::FORBIDDEN, "forbidden".to_string()),
            AppError::NotFound => (StatusCode::NOT_FOUND, "not_found".to_string()),
            AppError::BadRequest(m) => (StatusCode::BAD_REQUEST, m.clone()),
            AppError::Conflict(m) => (StatusCode::CONFLICT, m.clone()),
            AppError::TooMany => (StatusCode::TOO_MANY_REQUESTS, "rate_limited".to_string()),
            _ => {
                tracing::error!(error=?self, "erro interno");
                (StatusCode::INTERNAL_SERVER_ERROR, "internal".to_string())
            }
        };
        (status, axum::Json(json!({"error": msg}))).into_response()
    }
}

pub type AppResult<T> = Result<T, AppError>;
