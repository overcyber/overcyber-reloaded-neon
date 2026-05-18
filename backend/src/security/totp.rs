use hmac::{Hmac, Mac};
use sha1::Sha1;
use std::time::{SystemTime, UNIX_EPOCH};

type HmacSha1 = Hmac<Sha1>;

pub fn random_secret() -> Vec<u8> {
    use rand::RngCore;
    let mut b = [0u8; 20];
    rand::thread_rng().fill_bytes(&mut b);
    b.to_vec()
}

pub fn encode_secret_base32(secret: &[u8]) -> String {
    base32::encode(base32::Alphabet::Rfc4648 { padding: false }, secret)
}

pub fn decode_secret_base32(s: &str) -> Option<Vec<u8>> {
    base32::decode(base32::Alphabet::Rfc4648 { padding: false }, s)
}

pub fn otpauth_uri(label: &str, issuer: &str, secret_b32: &str) -> String {
    let l = urlenc(label);
    let i = urlenc(issuer);
    format!("otpauth://totp/{l}?secret={secret_b32}&issuer={i}&algorithm=SHA1&digits=6&period=30")
}

fn urlenc(s: &str) -> String {
    let mut out = String::new();
    for b in s.bytes() {
        match b {
            b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'-' | b'_' | b'.' | b'~' => {
                out.push(b as char)
            }
            _ => out.push_str(&format!("%{b:02X}")),
        }
    }
    out
}

fn hotp(secret: &[u8], counter: u64) -> u32 {
    let mut mac = HmacSha1::new_from_slice(secret).expect("hmac");
    mac.update(&counter.to_be_bytes());
    let hash = mac.finalize().into_bytes();
    let off = (hash[hash.len() - 1] & 0x0f) as usize;
    let bin = ((hash[off] as u32 & 0x7f) << 24)
        | ((hash[off + 1] as u32) << 16)
        | ((hash[off + 2] as u32) << 8)
        | (hash[off + 3] as u32);
    bin % 1_000_000
}

pub fn verify(secret_b32: &str, code: &str) -> bool {
    let secret = match decode_secret_base32(secret_b32) {
        Some(s) => s,
        None => return false,
    };
    let code: u32 = match code.trim().parse() {
        Ok(v) => v,
        Err(_) => return false,
    };
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs()
        / 30;
    use subtle::ConstantTimeEq;
    for &delta in &[-1i64, 0, 1] {
        let counter = (now as i64 + delta).max(0) as u64;
        let expected = hotp(&secret, counter);
        let a = format!("{:06}", expected);
        let b = format!("{:06}", code);
        if a.as_bytes().ct_eq(b.as_bytes()).into() {
            return true;
        }
    }
    false
}
