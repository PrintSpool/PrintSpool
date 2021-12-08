use openssl::{
    ec::{
        EcKey,
        EcGroup,
    },
    nid::Nid,
};
use eyre::{
    // eyre,
    Result,
    Context as _,
};
use async_std::{fs, io::prelude::WriteExt};

pub struct ServerKeys {
    pub identity_private_key: String,
    pub identity_public_key: String,
    pub b58_fingerprint: String,
}

impl ServerKeys {
    pub async fn load_or_create() -> Result<Self> {
        let private_key_path = crate::paths::etc().join("id_ecdsa");
        let public_key_path = crate::paths::etc().join("id_ecdsa.pub");

        let group = EcGroup::from_curve_name(Nid::X9_62_PRIME256V1)?;
        let mut ctx = openssl::bn::BigNumContext::new().unwrap();

        if !private_key_path.exists() {
            let key = EcKey::generate(&group)?;

            // write the private key
            let private_key = key.private_key_to_pem()?;
            let mut file = fs::File::create(&private_key_path).await?;
            file.write_all(&private_key[..]).await?;

            // write the public key
            let public_key = key.public_key_to_pem()?;
            let mut file = fs::File::create(&public_key_path).await?;
            file.write_all(&public_key[..]).await?;
        }

        let identity_private_key = fs::read_to_string(&private_key_path)
            .await
            .wrap_err_with(|| format!("Missing identity private key"))?;

        let identity_public_key = fs::read_to_string(&public_key_path)
            .await
            .wrap_err_with(|| format!("Missing identity public key"))?;


        let public_key_bytes: Vec<u8> = identity_public_key.bytes().collect();
        let key = EcKey::public_key_from_pem(&public_key_bytes[..])?;
        let compressed_public_key = key
            .public_key()
            .to_bytes(&group, openssl::ec::PointConversionForm::COMPRESSED, &mut ctx)?;
        let b58_fingerprint = bs58::encode(compressed_public_key).into_string();

        Ok(ServerKeys {
            identity_private_key,
            identity_public_key,
            b58_fingerprint,
        })
    }
}
