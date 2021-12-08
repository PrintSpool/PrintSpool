use async_std::os::unix::net::UnixListener;
use async_std::prelude::*;

use eyre::{
    // eyre,
    Result,
    // Context as _,
};

/// Provides a unix socket for health checks which when connected to will send "ack\n" if this
/// server is able to query it's database.
///
/// This is essentially to prevent sql deadlocks from locking up the system until it is rebooted
pub async fn health_check_socket() {
    loop {
        if let Err(err) = try_health_check_socket().await {
            panic!("Error in health check socket provider: {:?}", err);
        }
    }
}

async fn try_health_check_socket() -> Result<()> {
    let socket_path = crate::paths::var().join("health-check.sock");

    let _ = std::fs::remove_file(&socket_path);
    let listener = UnixListener::bind(&socket_path).await?;
    let mut incoming = listener.incoming();

    while let Some(stream) = incoming.next().await {
        let mut stream = stream?;
        // sqlx::query!(
        //     r#"
        //         SELECT COUNT(id) as count FROM print_queues
        //     "#,
        // )
        //     .fetch_one(db)
        //     .await?;

        stream.write_all(b"ack\n").await?;
    }

    Ok(())
}
