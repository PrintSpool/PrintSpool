use quote::quote;

pub fn impl_define_component(
    _args: proc_macro::TokenStream,
    item: proc_macro::TokenStream,
) -> proc_macro::TokenStream {
    let item: proc_macro2::TokenStream = item.into();

    quote! {
        #[derive(serde::Serialize, serde::Deserialize, schemars::JsonSchema, validator::Validate, Debug, Clone)]
        #[serde(deny_unknown_fields)]
        #item
    }.into()
}
