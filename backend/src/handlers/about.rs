use axum::extract::State;
use axum::Json;
use chrono::Utc;
use rusqlite::params;
use serde_json::Value;

use crate::error::AppResult;
use crate::AppState;

pub async fn get(State(state): State<AppState>) -> AppResult<Json<Value>> {
    let conn = state.db.get()?;
    let data: String = conn.query_row(
        "SELECT data_json FROM about WHERE id=1",
        [],
        |r| r.get(0),
    )?;
    Ok(Json(serde_json::from_str(&data).unwrap_or(Value::Null)))
}

pub async fn update(
    State(state): State<AppState>,
    Json(body): Json<Value>,
) -> AppResult<Json<Value>> {
    let s = serde_json::to_string(&body).unwrap();
    state.db.get()?.execute(
        "INSERT INTO about(id, data_json, updated_at) VALUES (1, ?1, ?2)
         ON CONFLICT(id) DO UPDATE SET data_json=excluded.data_json, updated_at=excluded.updated_at",
        params![s, Utc::now().to_rfc3339()],
    )?;
    Ok(Json(body))
}
