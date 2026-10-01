//! SEC-07: criptografia simétrica (AES-256-GCM) para PII em repouso.
//! O token inclui versão e nonce; a chave deriva diretamente do SESSION_SECRET.

use aes_gcm::aead::generic_array::GenericArray;
use aes_gcm::aead::{Aead, AeadCore, KeyInit, OsRng};
use aes_gcm::{Aes256Gcm, Key};
use base64::Engine;

const PREFIX: &str = "v1:gc1:";

fn b64(bytes: &[u8]) -> String {
    base64::engine::general_purpose::STANDARD.encode(bytes)
}

fn unb64(s: &str) -> Option<Vec<u8>> {
    base64::engine::general_purpose::STANDARD.decode(s).ok()
}

/// Cifra `plaintext` com AES-256-GCM usando chave derivada do segredo de sessão.
/// Formato: `v1:gc1:<b64(nonce)>.<b64(ciphertext+tag)>`
pub fn encrypt(plaintext: &str, secret: &[u8; 32]) -> String {
    let cipher = Aes256Gcm::new(Key::<Aes256Gcm>::from_slice(secret));
    let nonce = Aes256Gcm::generate_nonce(&mut OsRng);
    let ct = cipher
        .encrypt(&nonce, plaintext.as_bytes())
        .expect("aes-gcm encrypt");
    format!("{PREFIX}{}.{}", b64(nonce.as_slice()), b64(&ct))
}

/// Decifra um token produzido por `encrypt`. Retorna None para entradas
/// inválidas ou legadas (texto em claro), para o chamador tratar fallback.
pub fn decrypt(token: &str, secret: &[u8; 32]) -> Option<String> {
    let rest = token.strip_prefix(PREFIX)?;
    let (nonce_b64, ct_b64) = rest.split_once('.')?;
    let nonce_bytes = unb64(nonce_b64)?;
    let ct = unb64(ct_b64)?;
    if nonce_bytes.len() != 12 {
        return None;
    }
    let cipher = Aes256Gcm::new(Key::<Aes256Gcm>::from_slice(secret));
    let nonce = GenericArray::from_slice(&nonce_bytes); // 96 bits
    let pt = cipher.decrypt(nonce, ct.as_ref()).ok()?;
    String::from_utf8(pt).ok()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn roundtrip() {
        let secret = [7u8; 32];
        let token = encrypt("user@example.com", &secret);
        assert!(token.starts_with(PREFIX));
        assert_eq!(decrypt(&token, &secret).as_deref(), Some("user@example.com"));
        let other = [8u8; 32];
        assert!(decrypt(&token, &other).is_none());
        assert!(decrypt("texto-em-claro", &secret).is_none());
    }
}
