use quote::*;

pub fn impl_entry_from_model(meta: &crate::Meta) -> proc_macro2::TokenStream {
  let crate::Meta {
    entry_ident,
    model_type,
    model_variant_ident,
    ..
  } = meta;

  let gen = quote! {
    impl From<#model_type> for #entry_ident {
        fn from(model: #model_type) -> Self {
            #entry_ident::#model_variant_ident(model)
        }
    }
  };

  gen
}
