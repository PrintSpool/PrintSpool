use std::path::PathBuf;

pub fn var() -> PathBuf {
    format!("/var/local/teg{}", dev_suffix()).into()
}

pub fn etc() -> PathBuf {
    format!("/usr/local/etc/teg{}", dev_suffix()).into()
}

pub fn dev_suffix() -> &'static str {
    let is_dev = std::env::var("RUST_ENV")
        .map(|v| &v == "development")
        .unwrap_or(false);

    if is_dev { "-dev" } else { "" }
}
