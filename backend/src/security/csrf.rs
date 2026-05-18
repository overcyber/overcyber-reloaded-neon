use subtle::ConstantTimeEq;

pub const CSRF_HEADER: &str = "x-csrf-token";

pub fn matches(header_value: Option<&str>, cookie_value: &str) -> bool {
    let h = match header_value {
        Some(v) => v,
        None => return false,
    };
    h.as_bytes().ct_eq(cookie_value.as_bytes()).into()
}
