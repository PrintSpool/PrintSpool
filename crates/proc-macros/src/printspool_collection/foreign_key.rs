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
    let loader_fn_ident = format_ident!("by_{}_loader", key_ident);

    let sort_type = if let Some(sort_key) = sort_key {
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

        Some(sort_type)
    } else {
        None
    };

    let load_fn_sort_arg_def = if let Some(sort_type) = sort_type {
        quote! {sort: #sort_type,}
    } else {
        quote! {}
    };

    let load_fn_sort_arg = if let Some(_) = sort_type {
        quote! {sort }
    } else {
        quote! {}
    };

    let not_found_error = format!("{} not found", struct_ident);

    let mut key_ty = &field.ty;

    let optional_inner_type = {
        use syn::{GenericArgument, Path, PathArguments, PathSegment};

        fn extract_type_path(ty: &syn::Type) -> Option<&Path> {
            match *ty {
                syn::Type::Path(ref typepath) if typepath.qself.is_none() => Some(&typepath.path),
                _ => None,
            }
        }

        // TODO store (with lazy static) the vec of string
        // TODO maybe optimization, reverse the order of segments
        fn extract_option_segment(path: &Path) -> Option<&PathSegment> {
            let idents_of_path =
                path.segments
                    .iter()
                    .into_iter()
                    .fold(String::new(), |mut acc, v| {
                        acc.push_str(&v.ident.to_string());
                        acc.push('|');
                        acc
                    });
            vec!["Option|", "std|option|Option|", "core|option|Option|"]
                .into_iter()
                .find(|s| &idents_of_path == *s)
                .and_then(|_| path.segments.last())
        }

        extract_type_path(key_ty)
            .and_then(|path| extract_option_segment(path))
            .and_then(|path_seg| {
                let type_params = &path_seg.arguments;
                // It should have only on angle-bracketed param ("<String>"):
                match *type_params {
                    PathArguments::AngleBracketed(ref params) => params.args.first(),
                    _ => None,
                }
            })
            .and_then(|generic_arg| match *generic_arg {
                GenericArgument::Type(ref ty) => Some(ty),
                _ => None,
            })
    };

    // Optional foreign keys only get entries added in the view if they are not None
    let get_key_ident = if let Some(optional_inner_type) = optional_inner_type {
        key_ty = optional_inner_type;
        quote! {
            use bonsaidb::core::schema::view::map::Mappings;

            if let Some(val) = c.#key_ident {
                val
            } else {
                return Mappings::none();
            }
        }
    } else {
        quote! { c.#key_ident }
    };

    let mut key_tuple = vec![quote! { crate::Deletion }, quote! { #key_ty}];

    if let Some(sort_type) = sort_type {
        key_tuple.push(quote! { #sort_type });
    }

    let key_tuple = quote! {
        (#(#key_tuple),*)
    };

    let loader_key = if let Some(sort_key) = sort_key {
        quote! {
            let sort_key = #sort_key;
            (c.deleted_at.into(), c.id, sort_key(c))
        }
    } else {
        quote! {
            (c.deleted_at.into(), c.id)
        }
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
                let #key_ident = {
                    #get_key_ident
                };

                document
                    .header
                    .emit_key((c.deleted_at.into(), #key_ident))
            }
        );

        impl #struct_ident {
            pub async fn #load_fn_ident(
                deletion: crate::Deletion,
                #key_ident: #key_ty,
                #load_fn_sort_arg_def
                ctx: &async_graphql::Context<'_>,
            ) -> eyre::Result<#struct_ident> {
                let loader = Self::#loader_fn_ident(ctx)?;
                let state = loader.load_one((deletion, #key_ident, #load_fn_sort_arg)).await?;

                state.ok_or_else(|| eyre::eyre!(#not_found_error))
            }

            pub fn #loader_fn_ident(
                ctx: &async_graphql::Context<'_>,
            ) -> eyre::Result<async_graphql::dataloader::DataLoader<#loader_ident>> {
                let loader = ctx.data_unchecked::<async_graphql::dataloader::DataLoader<#loader_ident>>();
                Ok(loader)
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
                let hash_table = #view_ident::entries(&self.db)
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

                Ok(hash_table)
            }
        }
    };

    (view_ident, output)
}
