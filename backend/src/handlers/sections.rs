use axum::extract::State;
use axum::Json;
use rusqlite::params;
use serde_json::{json, Map, Value};

use crate::error::{AppError, AppResult};
use crate::AppState;

const VALID_SECTIONS: &[&str] = &[
    "profile",
    "education",
    "experience",
    "publications",
    "skills",
    "projects",
    "blog",
    "contact",
];

fn read_sections(conn: &rusqlite::Connection, state: &AppState) -> Value {
    let raw: Option<String> = conn
        .query_row("SELECT value FROM site_config WHERE key='sections'", [], |r| {
            r.get(0)
        })
        .ok();
    let mut v: Value = raw
        .and_then(|r| serde_json::from_str(&r).ok())
        .unwrap_or(Value::Null);
    if !v.is_object() {
        // fallback: defaults
        let mut m = Map::new();
        for s in VALID_SECTIONS {
            m.insert(s.to_string(), Value::Bool(true));
        }
        v = Value::Object(m);
    }
    let _ = state;
    v
}

/// GET /api/sections — público; controla visibilidade das seções na página.
pub async fn get_sections(State(state): State<AppState>) -> AppResult<Json<Value>> {
    let conn = state.db.get()?;
    Ok(Json(read_sections(&conn, &state)))
}

/// PUT /api/sections — admin; body parcial { "blog": false, ... }.
/// Chaves inválidas são rejeitadas; valores não-booleanos rejeitados.
pub async fn update_sections(
    State(state): State<AppState>,
    Json(body): Json<Value>,
) -> AppResult<Json<Value>> {
    let obj = body.as_object().ok_or_else(|| {
        AppError::BadRequest("body deve ser um objeto {secao: bool}".into())
    })?;
    for (k, v) in obj {
        if !VALID_SECTIONS.contains(&k.as_str()) {
            return Err(AppError::BadRequest(format!("seção inválida: {k}")));
        }
        if !v.is_boolean() {
            return Err(AppError::BadRequest(format!("valor de {k} deve ser booleano")));
        }
    }
    let conn = state.db.get()?;
    let mut current = read_sections(&conn, &state);
    if let Some(map) = current.as_object_mut() {
        for (k, v) in obj {
            map.insert(k.clone(), v.clone());
        }
    }
    conn.execute(
        "INSERT INTO site_config(key, value) VALUES ('sections', ?1)
         ON CONFLICT(key) DO UPDATE SET value=excluded.value",
        params![serde_json::to_string(&current).unwrap()],
    )?;
    Ok(Json(json!({"ok": true, "sections": current})))
}
