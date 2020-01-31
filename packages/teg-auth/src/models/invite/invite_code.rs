use juniper::{
    FieldResult,
};
use serde::{Serialize, Deserialize};
use std::fs;

use super::Invite;

impl Invite {
    pub fn generate_slug(private_key: String) -> FieldResult<String>  {
        let config_path = "/etc/teg/combinator.toml";
        let config_text = fs::read_to_string(config_path)?;

        let host_identity_public_key: String = config_text.parse::<toml::Value>()?
            .get("auth")
            .and_then(|v| v.get("hostIdentityKeys"))
            .and_then(|v| v.get("publicKey"))
            .and_then(|v| v.as_str())
            .ok_or(std::io::Error::new(
                std::io::ErrorKind::NotFound,
                "auth.hostIdentityKeys.publicKey not found",
            ))?
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

        let buf = rmps::to_vec(&json)?;

        let slug = data_encoding::BASE64URL.encode(&buf);

        Ok(slug)
    }

    pub fn print_welcome_text(&self) -> FieldResult<()> {
        // TODO: production URLs
        // const webAppDomain = isDev ? 'http://localhost:1234' : 'https://tegapp.io'

        let web_app_domain = "http://localhost:1234";

        let invite_url = format!(
            "{}/i/{}",
            web_app_domain,
            self.slug,
        );

        let thick_line = std::iter::repeat("=").take(80).collect::<String>();

        println!(
            "\
                \n\n\n\
                Invite Code\n\
                {line}\n\
            ",
            line = thick_line,
        );

        // let qr = QrCode::encode_text(&invite_url, QrCodeEcc::Low)?;
        // let qr = print_qr(&qr)?;
        qr2term::print_qr(&invite_url)?;

        println!(
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