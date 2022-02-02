use std::path::PathBuf;

pub fn dev_suffix() -> &'static str {
    let is_dev = std::env::var("RUST_ENV")
        .map(|v| &v == "development")
        .unwrap_or(false);

    if is_dev { "-dev" } else { "" }
}

pub fn var() -> PathBuf {
    format!("/var/local/printspool{}", dev_suffix()).into()
}

pub fn etc() -> PathBuf {
    format!("/usr/local/etc/printspool{}", dev_suffix()).into()
}

pub fn pid_file(name: &str) -> PathBuf {
    format!("/var/tmp/printspool{}-{}.pid", dev_suffix(), name).into()
}
