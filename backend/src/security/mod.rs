pub mod argon2id;
pub mod csrf;
pub mod headers;
pub mod pow;
pub mod ratelimit;
pub mod session;
pub mod totp;

use sha2::{Digest, Sha256};

pub fn hash_pii(input: &str, salt: &[u8]) -> String {
    let mut h = Sha256::new();
    h.update(salt);
    h.update(input.as_bytes());
    hex(&h.finalize())
}

pub fn hex(bytes: &[u8]) -> String {
    const HEX: &[u8] = b"0123456789abcdef";
    let mut out = String::with_capacity(bytes.len() * 2);
    for b in bytes {
        out.push(HEX[(b >> 4) as usize] as char);
        out.push(HEX[(b & 0xf) as usize] as char);
    }
    out
}
