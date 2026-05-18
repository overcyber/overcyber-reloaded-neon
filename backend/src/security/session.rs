use hmac::{Hmac, Mac};
use rand::RngCore;
use sha2::Sha256;
use subtle::ConstantTimeEq;

use crate::security::hex;

type HmacSha = Hmac<Sha256>;

pub fn new_session_id() -> String {
    let mut b = [0u8; 24];
    rand::thread_rng().fill_bytes(&mut b);
    hex(&b)
}

pub fn new_csrf_token() -> String {
    let mut b = [0u8; 24];
    rand::thread_rng().fill_bytes(&mut b);
    hex(&b)
}

/// Cookie value = `{sid}.{hex(hmac(sid))}`
pub fn sign_cookie(sid: &str, secret: &[u8; 32]) -> String {
    let mut m = HmacSha::new_from_slice(secret).expect("hmac key");
    m.update(sid.as_bytes());
    let tag = m.finalize().into_bytes();
    format!("{sid}.{}", hex(&tag))
}

pub fn verify_cookie(cookie_value: &str, secret: &[u8; 32]) -> Option<String> {
    let (sid, tag_hex) = cookie_value.split_once('.')?;
    let expected = {
        let mut m = HmacSha::new_from_slice(secret).ok()?;
        m.update(sid.as_bytes());
        hex(&m.finalize().into_bytes())
    };
    if expected.as_bytes().ct_eq(tag_hex.as_bytes()).into() {
        Some(sid.to_string())
    } else {
        None
    }
}

pub const SESSION_COOKIE: &str = "__Host-sid";
pub const CSRF_COOKIE: &str = "csrf";

pub fn build_session_cookie(value: &str, max_age_secs: i64) -> String {
    format!(
        "{SESSION_COOKIE}={value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age={max_age_secs}"
    )
}

pub fn build_csrf_cookie(value: &str, max_age_secs: i64) -> String {
    // Não-HttpOnly por design: o JS precisa lê-lo e ecoá-lo em X-CSRF-Token
    format!("{CSRF_COOKIE}={value}; Path=/; Secure; SameSite=Strict; Max-Age={max_age_secs}")
}

pub fn clear_cookie(name: &str) -> String {
    format!("{name}=; Path=/; Max-Age=0; Secure; SameSite=Strict")
}
