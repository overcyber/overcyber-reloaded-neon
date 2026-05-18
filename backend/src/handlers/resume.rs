use axum::extract::{Path, State};
use axum::Json;
use chrono::Utc;
use rusqlite::params;
use serde_json::Value;

use crate::error::{AppError, AppResult};
use crate::AppState;

const SECTIONS: &[&str] = &["education", "experience", "publications", "skills"];

pub async fn get_all(State(state): State<AppState>) -> AppResult<Json<Value>> {
    let conn = state.db.get()?;
    let mut out = serde_json::Map::new();
    for s in SECTIONS {
        let raw: Option<String> = conn
            .query_row(
                "SELECT data_json FROM resume WHERE section=?1",
                [s],
                |r| r.get(0),
            )
            .ok();
        let v: Value = raw
            .and_then(|r| serde_json::from_str(&r).ok())
            .unwrap_or(Value::Null);
        out.insert(s.to_string(), v);
    }
    Ok(Json(Value::Object(out)))
}

pub async fn update(
    State(state): State<AppState>,
    Path(section): Path<String>,
    Json(body): Json<Value>,
) -> AppResult<Json<Value>> {
    if !SECTIONS.contains(&section.as_str()) {
        return Err(AppError::BadRequest("seção inválida".into()));
    }
    let s = serde_json::to_string(&body).unwrap();
    state.db.get()?.execute(
        "INSERT INTO resume(section, data_json, updated_at) VALUES (?1, ?2, ?3)
         ON CONFLICT(section) DO UPDATE SET data_json=excluded.data_json, updated_at=excluded.updated_at",
        params![section, s, Utc::now().to_rfc3339()],
    )?;
    Ok(Json(body))
}
