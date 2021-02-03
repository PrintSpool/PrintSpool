use std::sync::Arc;
use eyre::{
    // eyre,
    Context as _,
    Result,
};
use teg_protobufs::{ InviteCode, Message };

use crate::ServerKeys;

use super::Invite;

impl Invite {
    pub fn generate_slug(server_keys: &Arc<ServerKeys>, secret: Vec<u8>) -> Result<String>  {
        // info!("PK length: {:?}", bs58::decode(&server_keys.b58_fingerprint).into_vec()?.len());
        // info!("SECRET length: {:?}", secret.len());

        let code = InviteCode {
            secret,
            host_public_key: bs58::decode(&server_keys.b58_fingerprint).into_vec()?,
        };

        let mut buf = Vec::new();
        code.encode(&mut buf)?;

        let slug = bs58::encode(&buf).into_string();

        Ok(slug)
    }

    pub fn print_welcome_text(&self, slug: String) -> Result<()> {
        let is_dev = std::env::var("RUST_ENV") == Ok("development".to_string());

        let web_app_domain = if is_dev {
            "http://localhost:1234"
        } else {
            "https://tegapp.io"
        };

        let invite_url = format!(
            "{}/i/{}",
            web_app_domain,
            slug,
        );

        let thick_line = std::iter::repeat("=").take(80).collect::<String>();

        eprintln!(
            "\
                \n\n\n\
                Invite Code\n\
                {line}\n\
            ",
            line = thick_line,
        );

        // let qr = QrCode::encode_text(&invite_url, QrCodeEcc::Low)?;
        // let qr = print_qr(&qr)?;
        qr2term::print_qr(&invite_url)
            .with_context(|| "Unable to print invite QR code")?;

        eprintln!(
            "\
                \n{line}\n\
                Your almost ready to start 3D Printing!\n\n\
                To finish setting up your 3D printer scan the QR Code above or go to:\n\n\
                {url}\n\n\
                {line}\n\
            ",
            line = thick_line,
            url = invite_url.to_string(),
        );

        Ok(())
    }
}
