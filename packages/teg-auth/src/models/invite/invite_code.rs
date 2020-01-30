use juniper::{
    FieldResult,
};
use serde::{Serialize, Deserialize};
use qrcodegen::{QrCode, QrCodeEcc};
use std::fs;

use super::Invite;

fn print_qr(qr: &QrCode) -> std::io::Result<String> {
    let mut text = "".to_string();

    for y in 0 .. qr.size() {
        for x in 0 .. qr.size() {
            text += if qr.get_module(x, y) {
                "██"
            } else {
                "  "
            };
        };
        text += "\n";
    };

    Ok(text)
}

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

    pub fn welcome_text(&self) -> FieldResult<String> {
        // TODO: production URLs
        // const webAppDomain = isDev ? 'http://localhost:1234' : 'https://tegapp.io'

        let web_app_domain = "http://localhost:1234";

        let invite_url = format!(
            "{}/i/{}",
            web_app_domain,
            self.slug,
        );

        let qr = QrCode::encode_text(&invite_url, QrCodeEcc::Medium)?;
        let qr = print_qr(&qr)?;

        let thick_line = std::iter::repeat("=").take(10).collect::<String>();

        let text = format!(
            "\
                \n\n\n\
                Invite Code\n\
                {line}\n\
                {qr}\n\
                {line}\n\
                Your almost ready to start 3D Printing!\n\n\
                To finish setting up your 3D printer go to:\n\n\
                {url}\n\n\
                {line}\n\
            ",
            line = thick_line,
            qr = qr,
            url = invite_url.to_string(),
        );

        Ok(text)
    }
}