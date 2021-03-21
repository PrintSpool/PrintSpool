#[macro_use] extern crate tracing;

use std::sync::Arc;
use std::env;
use eyre::{
    eyre,
    Result,
    // Context as _,
};
use dotenv::dotenv;
// use async_std::process::{Child, Command, ExitStatus};
use async_std::process::{ Command };
use notify::{Watcher, RecommendedWatcher, RecursiveMode};
use dashmap::DashMap;
use nix::unistd::Pid;
use nix::sys::signal::{self, Signal};

const CONFIG_DIR: &'static str = "/etc/teg/";

#[async_std::main]
async fn main() -> Result<()> {
    run().await
}

async fn run() -> Result<()> {
    dotenv().ok();
    tracing_subscriber::fmt::init();

    info!("Supervisor started");

    let drivers = Arc::new(DashMap::new());
    let drivers_clone = Arc::clone(&drivers);

    for entry in std::fs::read_dir(CONFIG_DIR)? {
        let entry = entry?;
        let file_name = entry.file_name().to_str()
            .ok_or_else(|| eyre!("Invalid file name in config dir"))?
            .to_string();

        if
            entry.file_type()?.is_file()
            && file_name.starts_with("machine-")
            && file_name.ends_with(".toml")
        {
            let config_file = format!("{}{}", CONFIG_DIR, file_name);
            start_driver_spawner(Arc::clone(&drivers), &config_file)?;
        }
    };

    let mut watcher: RecommendedWatcher = Watcher::new_immediate(move |res| {
        use notify::EventKind::{ Modify, Create, Remove };
        use notify::event::CreateKind;
        use notify::event::RemoveKind;
        use notify::event::ModifyKind::Name;
        use notify::event::RenameMode;

        let drivers = Arc::clone(&drivers_clone);
        match res {
            | Ok(notify::Event { kind: Create(CreateKind::File), paths, .. })
            | Ok(notify::Event { kind: Modify(Name(RenameMode::To)), paths, .. })
            => {
                let config_file = paths
                    .first()
                    .and_then(|f| {
                        if let Some(file_name) = f.file_name().and_then(|f| f.to_str()) {
                            if
                                file_name.starts_with("machine-")
                                && file_name.ends_with(".toml")
                            {
                                return Some(f)
                            }
                        };
                        None
                    })
                    .and_then(|f| f.to_str());

                if let Some(config_file) = config_file {
                    if let Err(err) = start_driver_spawner(drivers, &config_file) {
                        error!("Unable to spawn driver ({}): {}", config_file, err);
                        std::process::exit(1);
                    };
                };
            }
            | Ok(notify::Event { kind: Remove(RemoveKind::File), paths, .. })
            | Ok(notify::Event { kind: Modify(Name(RenameMode::From)), paths, .. })
            => {
                let config_file = paths
                    .first()
                    .and_then(|f| f.to_str());

                if let Some(config_file) = config_file {
                    if let Err(err) = kill(drivers, &config_file) {
                        warn!("Unable to kill driver ({}): {}", config_file, err);
                    };
                };
            }
            Err(e) =>{
               error!("watch error: {:?}", e);
               std::process::exit(1);
           }
           _ => (),
        }
    })?;

    watcher.watch(CONFIG_DIR, RecursiveMode::NonRecursive)?;

    std::thread::park();
    Ok(())
}

fn start_driver_spawner(drivers: Arc<DashMap<String, u32>>, config_file: &str) -> Result<()> {
    let config_file = config_file.to_string();
    info!("Starting driver spawner for {}", config_file);
    // Respawn
    async_std::task::spawn(async move {
        let drivers = Arc::clone(&drivers);
        loop {
            if !std::path::Path::new(&config_file).exists() {
                drivers.remove(&config_file);
                break;
            };
            if let Err(err) = spawn_driver(Arc::clone(&drivers), &config_file).await {
                error!("Error spawning driver ({}): {}", config_file, err);
                std::process::exit(1);
            };
       }
    });

    Ok(())
}

fn kill(drivers: Arc<DashMap<String, u32>>, config_file: &str) -> Result<()> {
    let config_file = config_file.to_string();
    info!("Killing driver for {}", config_file);
    if let Some(driver_pid) = drivers.get(&config_file) {
        let driver_pid = driver_pid.value();
        if let Err(err) = signal::kill(Pid::from_raw(*driver_pid as i32), Signal::SIGKILL) {
            warn!("Unable to kill driver process (PID: {}): {}", driver_pid, err)
        };
    };

    Ok(())
}

async fn spawn_driver(drivers: Arc<DashMap<String, u32>>, config_file: &str) -> Result<()> {
    let is_dev = env::var("RUST_ENV").ok() == Some("development".into());

    let cmd = if is_dev {
        let mut marlin = env::current_exe()?;
        marlin.pop();
        marlin.pop();
        marlin.pop();
        marlin.push("crates/marlin");

        let marlin = marlin.to_str()
            .ok_or_else(|| eyre!("Error loading file path to drivers"))?;

        let release_flag = if env::var("RUN_MARLIN_IN_RELEASE") == Ok("1".to_string()) {
            " --release"
        } else {
            ""
        };

        // format!("cd {} && cargo watch -s \"cargo run -- {}\"", marlin, config_file)
        format!("cd {} && cargo run{} -- {}", marlin, release_flag, config_file)
    } else {
        let mut marlin = env::current_exe()?;
        marlin.pop();
        marlin.push("teg-marlin");

        let marlin = marlin.to_str()
            .ok_or_else(|| eyre!("Error loading file path to drivers"))?;

        format!("{} {}", marlin, config_file)
    };

    info!("Spawning driver for {}: {}", config_file, cmd);
    let mut child = Command::new("sh")
        .arg("-c")
        .arg(cmd)
        .spawn()?;

    drivers.insert(config_file.to_string(), child.id());

    let status = child
        // .output()
        // .await?;
        .status()
        .await?;

    if !status.success() {
        async_std::task::sleep(std::time::Duration::from_secs(1)).await;
    };

    Ok(())
}
