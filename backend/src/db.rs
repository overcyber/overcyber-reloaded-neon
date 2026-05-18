use std::path::Path;

use anyhow::{Context, Result};
use r2d2::Pool;
use r2d2_sqlite::SqliteConnectionManager;
use rusqlite::params;

use crate::security::argon2id;

pub type Conn = r2d2::PooledConnection<SqliteConnectionManager>;

#[derive(Clone)]
pub struct Db {
    pool: Pool<SqliteConnectionManager>,
}

impl Db {
    pub fn open(path: &Path) -> Result<Self> {
        let manager = SqliteConnectionManager::file(path).with_init(|c| {
            c.execute_batch(
                "PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA synchronous=NORMAL;",
            )
        });
        let pool = Pool::builder()
            .max_size(8)
            .build(manager)
            .context("pool sqlite")?;
        Ok(Self { pool })
    }

    pub fn get(&self) -> Result<Conn> {
        Ok(self.pool.get()?)
    }

    pub fn run_migrations(&self) -> Result<()> {
        let conn = self.get()?;
        conn.execute_batch(include_str!("../migrations/0001_init.sql"))
            .context("migration 0001")?;
        conn.execute_batch(include_str!("../migrations/0002_seed.sql"))
            .context("migration 0002")?;
        Ok(())
    }

    pub fn bootstrap_admin(&self, password_override: Option<&str>) -> Result<()> {
        let conn = self.get()?;
        let exists: i64 = conn
            .query_row("SELECT COUNT(*) FROM admin_user WHERE id=1", [], |r| {
                r.get(0)
            })
            .unwrap_or(0);
        if exists > 0 {
            return Ok(());
        }
        let pw = match password_override {
            Some(s) if !s.is_empty() => s.to_string(),
            _ => {
                let p = random_password(20);
                tracing::warn!(
                    "ADMIN_BOOTSTRAP_PASSWORD não definido — senha gerada para 'admin': {}",
                    p
                );
                p
            }
        };
        let hash = argon2id::hash(pw.as_bytes())?;
        conn.execute(
            "INSERT INTO admin_user(id, username, password_hash, must_change_pw) VALUES (1, 'admin', ?1, 1)",
            params![hash],
        )?;
        Ok(())
    }
}

fn random_password(n: usize) -> String {
    use rand::Rng;
    let chars: &[u8] = b"ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#%+";
    let mut rng = rand::thread_rng();
    (0..n)
        .map(|_| chars[rng.gen_range(0..chars.len())] as char)
        .collect()
}
