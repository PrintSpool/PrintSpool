use proc_macro2::TokenStream;
use quote::quote;

pub fn inline_compile_error(msg: &str) -> TokenStream {
    quote! {
        compile_error!(#msg);
    }
}
