use quote::*;

pub fn impl_model_try_from_ivec(meta: &crate::Meta) -> proc_macro2::TokenStream {
  let crate::Meta {
    entry_ident,
    model_type,
    ..
  } = meta;

  let error_msg = format!("Unable to deserialize versioned sled model {:}", entry_ident);

  let gen = quote! {
    impl std::convert::TryFrom<sled::IVec> for #model_type {
      type Error = anyhow::Error;

      fn try_from(iv_vec: sled::IVec) -> Result<Self> {
          serde_cbor::from_slice(iv_vec.as_ref())
              .with_context(|| #error_msg)
              .map(|entry: #entry_ident| entry.into())
      }
    }
  };

  gen
}
