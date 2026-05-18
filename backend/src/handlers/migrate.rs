use axum::extract::State;
use axum::Json;
use chrono::Utc;
use rusqlite::params;
use serde::Deserialize;
use serde_json::Value;
use uuid::Uuid;

use crate::error::AppResult;
use crate::AppState;

#[derive(Deserialize)]
pub struct ImportPayload {
    #[serde(default)]
    pub about: Option<Value>,
    #[serde(default)]
    pub resume: Option<ResumeBundle>,
    #[serde(default)]
    pub projects: Option<Vec<Value>>,
    #[serde(default)]
    pub posts: Option<Vec<Value>>,
}

#[derive(Deserialize)]
pub struct ResumeBundle {
    #[serde(default)]
    pub education: Option<Value>,
    #[serde(default)]
    pub experience: Option<Value>,
    #[serde(default)]
    pub publications: Option<Value>,
    #[serde(default)]
    pub skills: Option<Value>,
}

pub async fn import(
    State(state): State<AppState>,
    Json(p): Json<ImportPayload>,
) -> AppResult<Json<serde_json::Value>> {
    let conn = state.db.get()?;
    let now = Utc::now().to_rfc3339();

    if let Some(about) = p.about {
        conn.execute(
            "INSERT INTO about(id,data_json,updated_at) VALUES (1,?1,?2)
             ON CONFLICT(id) DO UPDATE SET data_json=excluded.data_json, updated_at=excluded.updated_at",
            params![serde_json::to_string(&about).unwrap(), now],
        )?;
    }
    if let Some(r) = p.resume {
        for (sec, v) in [
            ("education", r.education),
            ("experience", r.experience),
            ("publications", r.publications),
            ("skills", r.skills),
        ] {
            if let Some(v) = v {
                conn.execute(
                    "INSERT INTO resume(section,data_json,updated_at) VALUES (?1,?2,?3)
                     ON CONFLICT(section) DO UPDATE SET data_json=excluded.data_json, updated_at=excluded.updated_at",
                    params![sec, serde_json::to_string(&v).unwrap(), now],
                )?;
            }
        }
    }
    if let Some(projects) = p.projects {
        for (i, proj) in projects.iter().enumerate() {
            let title = proj.get("title").and_then(Value::as_str).unwrap_or("").to_string();
            if title.is_empty() { continue; }
            conn.execute(
                "INSERT INTO projects(title,description,tags,image,github,live,stars,forks,readme,ord,created_at,updated_at)
                 VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?11)",
                params![
                    title,
                    proj.get("description").and_then(Value::as_str).unwrap_or(""),
                    proj.get("tags").and_then(Value::as_str).unwrap_or(""),
                    proj.get("image").and_then(Value::as_str).unwrap_or(""),
                    proj.get("github").and_then(Value::as_str).unwrap_or(""),
                    proj.get("live").and_then(Value::as_str),
                    proj.get("stars").and_then(Value::as_i64).unwrap_or(0),
                    proj.get("forks").and_then(Value::as_i64).unwrap_or(0),
                    proj.get("readme").and_then(Value::as_str).unwrap_or(""),
                    i as i64,
                    now,
                ],
            )?;
        }
    }
    if let Some(posts) = p.posts {
        for post in posts {
            let slug = post.get("slug").and_then(Value::as_str).unwrap_or("").to_string();
            let title = post.get("title").and_then(Value::as_str).unwrap_or("").to_string();
            if slug.is_empty() || title.is_empty() { continue; }
            let id = post.get("id").and_then(Value::as_str).map(String::from)
                .unwrap_or_else(|| Uuid::new_v4().to_string());
            let created = post.get("createdAt").and_then(Value::as_str).unwrap_or(&now).to_string();
            conn.execute(
                "INSERT OR IGNORE INTO posts(id,slug,title,excerpt,content,image,status,published_at,created_at,updated_at)
                 VALUES (?1,?2,?3,?4,?5,?6,'published',?7,?7,?7)",
                params![
                    id,
                    slug,
                    title,
                    post.get("excerpt").and_then(Value::as_str).unwrap_or(""),
                    post.get("content").and_then(Value::as_str).unwrap_or(""),
                    post.get("image").and_then(Value::as_str),
                    created,
                ],
            )?;
        }
    }
    Ok(Json(serde_json::json!({"ok":true})))
}
