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

  // TODO: namespace configuration
  let gen = quote! {
    impl VersionedModel for #model_type {
      Entry: #entry_ident;
      const NAMESPACE: &'static str
    }
  };

  gen
}
