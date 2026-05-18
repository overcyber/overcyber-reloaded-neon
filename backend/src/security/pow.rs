use sha2::{Digest, Sha256};

use crate::security::hex;

/// SHA256(nonce || ":" || solution) deve ter `difficulty` bits zero no prefixo.
pub fn verify_solution(nonce: &str, solution: &str, difficulty: u32) -> bool {
    if solution.len() > 64 {
        return false;
    }
    let mut h = Sha256::new();
    h.update(nonce.as_bytes());
    h.update(b":");
    h.update(solution.as_bytes());
    let digest = h.finalize();
    leading_zero_bits(&digest) >= difficulty
}

fn leading_zero_bits(bytes: &[u8]) -> u32 {
    let mut n = 0u32;
    for b in bytes {
        if *b == 0 {
            n += 8;
        } else {
            n += b.leading_zeros();
            break;
        }
    }
    n
}

pub fn new_nonce() -> String {
    use rand::RngCore;
    let mut b = [0u8; 16];
    rand::thread_rng().fill_bytes(&mut b);
    hex(&b)
}
