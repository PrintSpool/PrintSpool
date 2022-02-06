use std::path::PathBuf;

pub fn is_dev() -> bool {
    let is_dev = std::env::var("RUST_ENV")
        .map(|v| &v == "development")
        .unwrap_or(false);
}

pub fn dev_suffix() -> &'static str {
    if is_dev() { "-dev" } else { "" }
}

pub fn var() -> PathBuf {
    format!("/var/local/printspool{}", dev_suffix()).into()
}

pub fn etc() -> PathBuf {
    format!("/usr/local/etc/printspool{}/current", dev_suffix()).into()
}

pub fn etc_common() -> PathBuf {
    format!("/usr/local/etc/printspool{}/common", dev_suffix()).into()
}

pub fn pid_file(name: &str) -> PathBuf {
    format!("/var/tmp/printspool{}-{}.pid", dev_suffix(), name).into()
}
