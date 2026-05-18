pub struct Config {
    pub session_secret: [u8; 32],
    pub public_origin: String,
    pub pow_difficulty_bits: u32,
}
