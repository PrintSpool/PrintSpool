use serde::{Serialize, Deserialize};
use rmp_serde::Serializer;
use std::fs;
use std::env;
use eyre::{
    eyre,
    Context as _,
    Result,
};

use super::Invite;

impl Invite {
    pub fn generate_slug(private_key: String) -> Result<String>  {
        let config_path = env::var("COMBINATOR_CONFIG");
        let config_path = config_path.unwrap_or("/etc/teg/combinator.toml".to_string());
        let config_text = fs::read_to_string(&config_path)
            .with_context(|| format!("Unable to read combinator config (file: {:?})", config_path))?;

        let host_identity_public_key: String = config_text.parse::<toml::Value>()
            .with_context(|| format!("Unable to parse combinator config (file: {:?})", config_path))?
            .get("auth")
            .and_then(|v| v.get("hostIdentityKeys"))
            .and_then(|v| v.get("publicKey"))
            .and_then(|v| v.as_str())
            .ok_or_else(|| eyre!("auth.hostIdentityKeys.publicKey not found"))?
            .to_string();

        #[derive(Serialize, Deserialize, Debug)]
        #[allow(non_snake_case)]
        struct InviteJSON {
            peerIPK: String,
            isk: String,
        }

        let json = InviteJSON {
            peerIPK: host_identity_public_key,
            isk: private_key,
        };

        let mut buf = Vec::new();
        let mut serializer = Serializer::new(&mut buf).with_struct_map();
        json.serialize(&mut serializer)
            .with_context(|| "Unable to serialize invite JSON")?;

        let slug = data_encoding::BASE64URL.encode(&buf);

        Ok(slug)
    }

    pub fn print_welcome_text(&self) -> Result<()> {
        let is_dev = std::env::var("RUST_ENV") == Ok("development".to_string());

        let web_app_domain = if is_dev {
            "http://localhost:1234"
        } else {
            "https://tegapp.io"
        };

        let invite_url = format!(
            "{}/i/{}",
            web_app_domain,
            self.slug.as_ref().ok_or(eyre!("Invite Code slug not found"))?,
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
