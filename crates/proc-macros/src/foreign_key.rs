use crate::inline_compiler_error::inline_compile_error;
use inflector::cases::{classcase::to_class_case, kebabcase::to_kebab_case};
use proc_macro2::Ident;
use quote::{format_ident, quote};
use syn::{ExprClosure, ReturnType, Type};

pub fn foreign_key(
    struct_ident: &Ident,
    field: &syn::Field,
    sort_key: &Option<ExprClosure>,
) -> (Ident, proc_macro2::TokenStream) {
    let key_ident = field
        .ident
        .as_ref()
        .expect("foreign key must be a named field");

    let view_ident = format_ident!(
        "{}By{}",
        struct_ident,
        to_class_case(&key_ident.to_string())
    );
    let view_name_str = format!("by-{}", to_kebab_case(&key_ident.to_string()));

    let loader_ident = format_ident!("{}Loader", view_ident);
    let load_fn_ident = format_ident!("load_by_{}", key_ident);

    let not_found_error = format!("{} not found", struct_ident);

    let key_ty = &field.ty;

    let mut key_tuple = vec![quote! { crate::Deletion }, quote! { #key_ty}];

    let mut loader_key = quote! {
        (c.deleted_at.into(), c.id, sort_key(c))
    };

    if let Some(sort_key) = sort_key {
        let sort_type = match &sort_key.output {
            ReturnType::Type(_, ty) => match **ty {
                Type::Path(ref type_path) => type_path.path.get_ident(),
                _ => None,
            },
            _ => None,
        };

        let Some(sort_type) = sort_type else {
            return (
                view_ident,
                inline_compile_error("sort_key requires an explicit return type eg. `sort_key: |t: Task| -> u32 { 42 }`")
            );
        };

        key_tuple.push(quote! { #sort_type });

        loader_key = quote! {
            let sort_key = #sort_key;
            (c.deleted_at.into(), c.id, sort_key(c))
        };
    };

    let key_tuple = quote! {
        (#(#key_tuple),*)
    };

    let output = quote! {
        bonsaidb::core::define_basic_mapped_view!(
            #view_ident,
            #struct_ident,
            0,
            #view_name_str,
            #key_tuple,
            |document: bonsaidb::core::document::CollectionDocument<#struct_ident>| {
                let c = document.contents;
                document
                    .header
                    .emit_key((c.deleted_at.into(), c.#key_ident))
            }
        );

        impl #struct_ident {
            pub async fn #load_fn_ident(
                deletion: crate::Deletion,
                #key_ident: #key_ty,
                ctx: &async_graphql::Context<'_>,
            ) -> Result<#struct_ident> {
                let loader = ctx.data_unchecked::<async_graphql::dataloader::DataLoader<#loader_ident>>();
                let state = loader.load_one((deletion, #key_ident)).await?;

                state.ok_or_else(|| eyre::eyre!(#not_found_error))
            }
        }

        pub struct #loader_ident {
            pub db: crate::Db,
        }

        #[async_trait::async_trait]
        impl async_graphql::dataloader::Loader<#key_tuple> for #loader_ident {
            type Value = #struct_ident;
            type Error = std::sync::Arc<eyre::Error>;

            async fn load(
                &self,
                keys: &[#key_tuple],
            ) -> Result<std::collections::HashMap<#key_tuple, Self::Value>, Self::Error> {
                let components = #view_ident::entries(&self.db)
                    .with_keys(keys.clone())
                    .query_with_collection_docs()
                    .await?
                    .into_iter()
                    .map(|m| m.document.contents)
                    .map(|c| {
                        let key = { #loader_key };
                        (
                            // key
                            key,
                            // value
                            c,
                        )
                    })
                    .collect();

                Ok(components)
            }
        }
    };

    (view_ident, output)
}
