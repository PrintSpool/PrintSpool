mod foreign_key;

use crate::inline_compiler_error::inline_compile_error;
use attribute_derive::Attribute;
use foreign_key::foreign_key;
use inflector::cases::snakecase::to_snake_case;
use inflector::string::pluralize::to_plural;
use proc_macro::{self, TokenStream};
use proc_macro2::Ident;
use quote::quote;
use syn::{parse_macro_input, ExprClosure, Fields, Meta, MetaList, NestedMeta};

#[derive(Attribute)]
#[attribute(ident = "collection")]
#[attribute(
    invalid_field = r#"Only `id = false`, `name = "some_name"`, `views = [SomeView, AnotherView]`, and `sort_key = |u: &User| -> String u.username` are supported attributes"#
)]
struct CollectionAttribute {
    #[attribute(
        missing = r#"An id field is added by default, you can override this with `#[printspool_collection(id = false)]`"#
    )]
    id: Option<bool>,
    #[attribute(
        missing = r#"You can override the default collection name with `#[printspool_collection(name = "some_name")]`"#
    )]
    name: Option<String>,
    #[attribute(default)]
    #[attribute(expected = r#"Specify the `views` like so: `view = [SomeView, AnotherView]`"#)]
    views: Vec<Ident>,
    #[attribute(
        missing = r#"Specify the sort key to append an additional compound key to the primary and foreign key views`"#
    )]
    sort_key: Option<ExprClosure>,
}

pub fn impl_printspool_collection(args: TokenStream, item: TokenStream) -> TokenStream {
    let args = parse_macro_input!(args as CollectionAttribute);
    let mut item_struct = parse_macro_input!(item as syn::ItemStruct);

    let struct_ident = item_struct.ident.clone();

    let Fields::Named(fields) = &mut item_struct.fields else {
        return inline_compile_error("#[printspool_collection] struct must contain named fields").into();
    };

    // Parse args
    let include_id = args.id.unwrap_or(true);
    let mut view_idents = args.views;

    let collection_name = if let Some(name) = args.name {
        name
    } else {
        to_plural(&to_snake_case(&struct_ident.to_string()))
    };

    // Add extra fields to the struct
    {
        // TODO: allow for structs which don't have a primary key
        let id_field = if include_id {
            quote! {
                #[printspool(foreign_key)]
                #[new(default)]
                pub id: crate::DbId<Self>,
            }
        } else {
            quote! {}
        };

        let extra_fields = quote! {
            struct ExtraFields {
                #id_field
                #[new(value = "chrono::Utc::now()")]
                pub created_at: chrono::DateTime<chrono::Utc>,
                #[new(default)]
                pub deleted_at: Option<chrono::DateTime<chrono::Utc>>,
            }
        }
        .into();
        let extra_fields = parse_macro_input!(extra_fields as syn::ItemStruct);
        let Fields::Named(extra_fields) = extra_fields.fields else {
            return inline_compile_error(
                "Extra fields did not contain fields. This is most likely a programming mistake in the macro itself."
            ).into();
        };

        for (index, field) in extra_fields.named.into_iter().enumerate() {
            fields.named.insert(index, field);
        }
    }

    // apply the printspool attributes
    let output: proc_macro2::TokenStream = fields
        .named
        .iter_mut()
        .filter_map(|field| {
            // Find the #[printspool] attr
            let attr_index = field
                .attrs
                .iter()
                .position(|attr| attr.path.is_ident("printspool"));

            let Some(attr_index) = attr_index else {
                return None;
            };

            // Remove the #[printspool] attr
            let attr = field.attrs.remove(attr_index);

            // Generate the #[printspool] attr's tokenstream additions
            let attr_meta = attr.parse_meta().expect("Parsing printspool attr");

            let nested_attrs = match attr_meta {
                Meta::List(MetaList { path, nested, .. }) if path.is_ident("printspool") => nested,
                meta => {
                    return Some(
                        inline_compile_error(&format!("Invalid #[printspool] attrs: {:?}", meta))
                            .into(),
                    )
                }
            };

            let attr_out: proc_macro2::TokenStream = nested_attrs
                .iter()
                .map(|nested_attr| match nested_attr {
                    NestedMeta::Meta(Meta::Path(path)) if path.is_ident("foreign_key") => {
                        let (view_ident, output) =
                            foreign_key(&struct_ident, field, &args.sort_key);
                        view_idents.push(view_ident);

                        output
                    }
                    NestedMeta::Meta(Meta::Path(path)) => {
                        return inline_compile_error(&format!(
                            "Invalid printspool attrs: {:?}",
                            path.get_ident()
                                .map(|ident| ident.to_string())
                                .unwrap_or("Unknown Attr".to_string()),
                        ))
                    }
                    _ => inline_compile_error("printspool attr should be a path"),
                })
                .collect();

            Some(attr_out)
        })
        .collect();

    let output = {
        let natural_id = if include_id {
            quote! {
                , natural_id = |entry: Self| entry.id
            }
        } else {
            quote! {}
        };

        quote! {
            #[derive(
                Debug,
                serde::Serialize,
                serde::Deserialize,
                bonsaidb::core::schema::Collection,
                printspool_proc_macros::PrintSpoolCollection,
                Clone,
                derive_new::new
            )]
            #[collection(name = #collection_name, views = [#(#view_idents),*] #natural_id)]
            #item_struct

            #output
        }
    };

    output.into()
}
