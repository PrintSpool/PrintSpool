use proc_macro::TokenStream;
use quote::*;
use syn;

mod metadata;
use metadata::*;

mod entry_from_model;
use entry_from_model::*;

mod model_from_entry;
use model_from_entry::*;

mod model_try_from_ivec;
use model_try_from_ivec::*;

mod versioned_model;
use versioned_model::*;

#[proc_macro_derive(VersionedSledModel)]
pub fn versioned_sled_model_derive(input: TokenStream) -> TokenStream {
    // Parse the `TokenStream` into a syntax tree, specifically an `Item`. An `Item` is a
    // syntax item that can appear at the module level i.e. a function definition, a struct
    // or enum definition, etc.
    let ast: syn::DeriveInput = syn::parse(input).expect("failed to parse input");
  
    impl_versioned_sled_model(&ast)
}

fn impl_versioned_sled_model(ast: &syn::DeriveInput) -> TokenStream {
    let meta = Meta::new(&ast);

    let m_from_e = impl_model_from_entry(&meta);
    let e_from_m = impl_entry_from_model(&meta);
    let m_from_ivec = impl_model_try_from_ivec(&meta);
    let model_fns = impl_versioned_model(&meta);

    let gen = quote! {
        #m_from_e
        #e_from_m
        #m_from_ivec
        #model_fns
    };

    gen.into()
}

