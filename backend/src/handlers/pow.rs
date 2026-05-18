use axum::extract::State;
use axum::Json;
use chrono::Utc;
use rusqlite::params;

use crate::error::AppResult;
use crate::models::PowChallenge;
use crate::security::pow;
use crate::AppState;

pub async fn challenge(State(state): State<AppState>) -> AppResult<Json<PowChallenge>> {
    let nonce = pow::new_nonce();
    let conn = state.db.get()?;
    conn.execute(
        "INSERT INTO pow_challenges(nonce, difficulty, issued_at) VALUES (?1,?2,?3)",
        params![nonce, state.config.pow_difficulty_bits as i64, Utc::now().to_rfc3339()],
    )?;
    // GC simples: remove desafios mais velhos que 10 min
    let cutoff = (Utc::now() - chrono::Duration::minutes(10)).to_rfc3339();
    let _ = conn.execute("DELETE FROM pow_challenges WHERE issued_at < ?1", [cutoff]);
    Ok(Json(PowChallenge {
        nonce,
        difficulty: state.config.pow_difficulty_bits,
    }))
}
