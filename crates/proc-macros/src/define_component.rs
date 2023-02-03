use attribute_derive::Attribute;
use inflector::cases::screamingsnakecase::to_screaming_snake_case;
use inflector::cases::titlecase::to_title_case;
use quote::{format_ident, quote};
use syn::parse_macro_input;

#[derive(Attribute)]
#[attribute(ident = "define_component")]
#[attribute(
    invalid_field = r#"Only `id = false`, `name = "some_name"`, `views = [SomeView, AnotherView]`, and `sort_key = |u: &User| -> String u.username` are supported attributes"#
)]
struct DefineComponentAttribute {
    #[attribute(default)]
    #[attribute(expected = r#""#)]
    fixed_list: bool,
    #[attribute(default)]
    #[attribute(expected = r#""#)]
    override_model: bool,
}

pub fn impl_define_component(
    args: proc_macro::TokenStream,
    item: proc_macro::TokenStream,
) -> proc_macro::TokenStream {
    let args = parse_macro_input!(args as DefineComponentAttribute);
    let item_struct = parse_macro_input!(item as syn::ItemStruct);

    let DefineComponentAttribute {
        fixed_list,
        override_model,
    } = args;

    let struct_ident = item_struct.ident.clone();
    let def_name = to_screaming_snake_case(&struct_ident.to_string());
    let def_display_name = to_title_case(&struct_ident.to_string());

    let type_descriptor_ident =
        format_ident!("printspool_driver_interface::component::ComponentTypeDescriptor");

    let impl_model = if override_model {
        quote! {}
    } else {
        quote! {
            impl printspool_config_form::Model for #struct_ident {
                fn form(all_fields: &Vec<String>) -> Vec<String> {
                    all_fields.clone()
                }
            }
        }
    };

    quote! {
        #[derive(serde::Serialize, serde::Deserialize, schemars::JsonSchema, validator::Validate, Debug, Clone)]
        #[serde(deny_unknown_fields)]
        #item_struct

        impl #struct_ident {
            pub fn type_descriptor() -> #type_descriptor_ident {
                #type_descriptor_ident {
                    name: #def_name,
                    display_name: #def_display_name,
                    fixed_list: #fixed_list,
                }
            }
        }

        #impl_model
    }.into()
}
