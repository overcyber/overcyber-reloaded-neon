use std::collections::HashMap;
use std::sync::Mutex;
use std::time::{Duration, Instant};

pub struct RateLimiter {
    inner: Mutex<HashMap<String, Vec<Instant>>>,
}

impl RateLimiter {
    pub fn new() -> Self {
        Self {
            inner: Mutex::new(HashMap::new()),
        }
    }

    /// Permite no máximo `limit` eventos em `window` por chave.
    pub fn check(&self, key: &str, limit: usize, window: Duration) -> bool {
        let now = Instant::now();
        let mut g = self.inner.lock().unwrap();
        let entry = g.entry(key.to_string()).or_default();
        entry.retain(|t| now.duration_since(*t) < window);
        if entry.len() >= limit {
            return false;
        }
        entry.push(now);
        // GC ocasional
        if g.len() > 4096 {
            g.retain(|_, v| !v.is_empty());
        }
        true
    }
}
