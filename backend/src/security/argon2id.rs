use anyhow::Result;
use argon2::password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString};
use argon2::{Algorithm, Argon2, Params, Version};

fn argon() -> Argon2<'static> {
    // m=64 MiB, t=3, p=1 (RFC 9106 recomendado para servidores)
    Argon2::new(
        Algorithm::Argon2id,
        Version::V0x13,
        Params::new(64 * 1024, 3, 1, None).expect("argon2 params"),
    )
}

pub fn hash(password: &[u8]) -> Result<String> {
    let salt = SaltString::generate(&mut OsRng);
    let h = argon()
        .hash_password(password, &salt)
        .map_err(|e| anyhow::anyhow!("argon2 hash: {e}"))?;
    Ok(h.to_string())
}

pub fn verify(password: &[u8], stored: &str) -> bool {
    match PasswordHash::new(stored) {
        Ok(parsed) => argon().verify_password(password, &parsed).is_ok(),
        Err(_) => false,
    }
}
