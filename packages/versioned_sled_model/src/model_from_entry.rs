use quote::*;

pub fn impl_model_from_entry(meta: &crate::Meta) -> proc_macro2::TokenStream {
  let crate::Meta {
    entry_ident,
    variants,
    model_type,
    ..
  } = meta;

  let revisions_into_models = variants
      .iter()
      .map(|variant| {
          let variant_name = &variant.ident;
          quote! {
              #entry_ident::#variant_name(revision) => revision.into()
          }
      });

  let gen = quote! {
      impl From<#entry_ident> for #model_type {
          fn from(entry: #entry_ident) -> Self {
              match entry {
                  #(#revisions_into_models)*
              }
          }
      }
  };

  gen
}
