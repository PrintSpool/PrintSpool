use quote::*;
// use anyhow::{anyhow, Context as _, Result};

// pub trait VersionedModel {
//   fn key(invite_id: &#id) -> String;
//   fn generate_id(db: &sled::Db) -> #result<ID>;
//   async fn get(invite_id: &#id, db: &sled::Db) -> #result<Self>;
//   async fn insert(self, db: &sled::Db) -> #result<Self>;
//   async fn scan(db: &sled::Db) -> impl Iterator<Item = #result<Self>>;
// }

pub fn impl_versioned_model(meta: &crate::Meta) -> proc_macro2::TokenStream {
  let crate::Meta {
    entry_ident,
    model_type,
    model_variant_ident,
    ..
  } = meta;

  let name = format!("{:}", model_variant_ident);

  let id = quote! { async_graphql::ID };
  let result = quote! { anyhow::Result };

  let gen = quote! {
    impl #model_type {
      pub fn key(id: &#id) -> String {
        format!("{}:{}", DB_PREFIX, id.to_string())
      }

      pub fn generate_id(db: &sled::Db) -> #result<#id> {
        use anyhow::{Context as _};

        db.generate_id()
            .map(|id| format!("{:64}", id).into())
            .with_context(|| format!("Error generating {} id", #name))
      }

      pub async fn get(id: &#id, db: &sled::Db) -> #result<Self> {
        use anyhow::{anyhow};

        Self::get_optional(id, db)
          .await?
          .ok_or(anyhow!("{} {:?} not found", #name, id))
      }

      pub async fn get_optional(id: &#id, db: &sled::Db) -> #result<Option<Self>> {
        use std::convert::TryInto;
        use anyhow::{Context as _};

        db.get(Self::key(id))
            .with_context(|| format!("Unable to get {}", #name))?
            .map(|iv_vec| iv_vec.try_into())
            .transpose()
      }

      pub async fn insert(self, db: &sled::Db) -> #result<Self> {
        use anyhow::{Context as _};

        let id = self.id.clone();
        let entry = #entry_ident::from(self);

        let bytes = serde_cbor::to_vec(&entry)
            .with_context(|| format!("Unable to serialize in {}::insert", #name))?;

        db.insert(Self::key(&id), bytes)
            .with_context(|| format!("Unable to insert {}", #name))?;

        Ok(entry.into())
      }

      pub async fn scan(db: &sled::Db) -> impl Iterator<Item = #result<Self>> {
        use std::convert::TryInto;
        use anyhow::{Context as _};

        db.scan_prefix(&DB_PREFIX)
            .values()
            .map(|iv_vec: sled::Result<sled::IVec>| {
                iv_vec
                    .with_context(|| format!("Error scanning {}", #name))
                    .and_then(|iv_vec| iv_vec.try_into())
            })
      }
    }
  };

  gen
}
