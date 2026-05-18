use axum::extract::{Path, State};
use axum::Json;
use chrono::Utc;
use rusqlite::params;

use crate::error::{AppError, AppResult};
use crate::models::{Project, ProjectInput};
use crate::AppState;

pub async fn list(State(state): State<AppState>) -> AppResult<Json<Vec<Project>>> {
    let conn = state.db.get()?;
    let mut stmt = conn.prepare(
        "SELECT id,title,description,tags,image,github,live,stars,forks,readme,ord FROM projects ORDER BY ord, id",
    )?;
    let rows = stmt.query_map([], |r| {
        Ok(Project {
            id: r.get(0)?,
            title: r.get(1)?,
            description: r.get(2)?,
            tags: r.get(3)?,
            image: r.get(4)?,
            github: r.get(5)?,
            live: r.get(6)?,
            stars: r.get(7)?,
            forks: r.get(8)?,
            readme: r.get(9)?,
            ord: r.get(10)?,
        })
    })?;
    Ok(Json(rows.collect::<Result<Vec<_>, _>>()?))
}

pub async fn create(
    State(state): State<AppState>,
    Json(p): Json<ProjectInput>,
) -> AppResult<Json<i64>> {
    let now = Utc::now().to_rfc3339();
    let conn = state.db.get()?;
    conn.execute(
        "INSERT INTO projects(title,description,tags,image,github,live,stars,forks,readme,ord,created_at,updated_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?11)",
        params![p.title, p.description, p.tags, p.image, p.github, p.live, p.stars, p.forks, p.readme, p.ord, now],
    )?;
    Ok(Json(conn.last_insert_rowid()))
}

pub async fn update(
    State(state): State<AppState>,
    Path(id): Path<i64>,
    Json(p): Json<ProjectInput>,
) -> AppResult<Json<serde_json::Value>> {
    let n = state.db.get()?.execute(
        "UPDATE projects SET title=?1,description=?2,tags=?3,image=?4,github=?5,live=?6,stars=?7,forks=?8,readme=?9,ord=?10,updated_at=?11 WHERE id=?12",
        params![p.title, p.description, p.tags, p.image, p.github, p.live, p.stars, p.forks, p.readme, p.ord, Utc::now().to_rfc3339(), id],
    )?;
    if n == 0 {
        return Err(AppError::NotFound);
    }
    Ok(Json(serde_json::json!({"ok":true})))
}

pub async fn delete(
    State(state): State<AppState>,
    Path(id): Path<i64>,
) -> AppResult<Json<serde_json::Value>> {
    let n = state
        .db
        .get()?
        .execute("DELETE FROM projects WHERE id=?1", [id])?;
    if n == 0 {
        return Err(AppError::NotFound);
    }
    Ok(Json(serde_json::json!({"ok":true})))
}
