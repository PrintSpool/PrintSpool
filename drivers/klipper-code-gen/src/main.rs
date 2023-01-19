use colored::Colorize;
use inflector::cases::pascalcase::to_pascal_case;
use quote::{format_ident, quote};
use rust_format::{Formatter, PostProcess, RustFmt};
use std::collections::HashMap;
use std::path::PathBuf;

mod parser;

fn main() {
    let sections = parser::parse_config_reference();
    let mut mods = vec!["fan", "printer"]
        .into_iter()
        .map(|name| {
            let mod_name_ident = format_ident!("{}", name);

            quote! {
                pub mod #mod_name_ident;
            }
        })
        .collect::<Vec<_>>();

    let mut path_overrides = HashMap::<String, PathBuf>::new();
    path_overrides.insert("printer".to_string(), "printer/printer_baseline.rs".into());
    path_overrides.insert("fan".to_string(), "fan/fan.rs".into());
    path_overrides.insert("fan_generic".to_string(), "fan/fan_generic.rs".into());
    path_overrides.insert("heater_fan".to_string(), "fan/heater_fan.rs".into());
    path_overrides.insert("controller_fan".to_string(), "fan/controller_fan.rs".into());
    path_overrides.insert(
        "temperature_fan".to_string(),
        "fan/temperature_fan.rs".into(),
    );

    let config = rust_format::Config::new_str().post_proc(PostProcess::ReplaceMarkersAndDocBlocks);
    let rust_formatter = RustFmt::from_config(config);

    let mut klipper_src = std::env::current_dir().unwrap();
    klipper_src.pop();
    klipper_src.push("klipper-plugin");
    klipper_src.push("src");

    for (name, section) in sections {
        // Generate the component source code
        let mod_name_ident = format_ident!("{}", name);
        let struct_name_ident = format_ident!("{}", to_pascal_case(&name));

        let id_variable = if section.has_id {
            quote! { pub klipper_id: KlipperId, }
        } else {
            quote! {}
        };

        let variable_defs = section.variables.iter().map(|variable| {
            let variable_type = format_ident!("{}", variable.rust_type);

            let variable_type = if variable.optional {
                quote! { Option<#variable_type> }
            } else {
                quote! { #variable_type }
            };

            let name = format_ident!("{}", &variable.name);
            let docs = format!(" {}", variable.docs.join("\n "));

            quote! {
                #[doc = #docs]
                pub #name: #variable_type,
            }
        });

        let mut includes = vec![];

        if section.has_id {
            includes.push(quote! {
                use crate::KlipperId;
            });
        };

        if section.include_klipper_pin {
            includes.push(quote! {
                use crate::KlipperPin;
            });
        }

        let src = quote! {
            #(#includes)*
            use schemars::JsonSchema;
            use serde::{Deserialize, Serialize};
            use validator::Validate;

            #[derive(Serialize, Deserialize, JsonSchema, Validate, Debug, Clone)]
            pub struct #struct_name_ident {

                #id_variable
                #(#variable_defs)*
            }
        };

        // Write the component file
        let formatted_src = rust_formatter.format_tokens(src).unwrap();

        let mut file_path = klipper_src.clone();
        file_path.push("components");

        let file_name = if let Some(path_override) = path_overrides.get(&name) {
            file_path.push(path_override);
            file_path.file_name().unwrap().to_str().unwrap().to_string()
        } else {
            let file_name = format!("{}.rs", name);
            file_path.push(&file_name);
            file_name
        };

        let mut gen_file_path = file_path.clone();
        gen_file_path.pop();
        gen_file_path.push(&format!("_{}", file_name));

        if file_path.exists() {
            println!("Skip: {} already exists.", file_name);
        } else {
            std::fs::write(gen_file_path, &formatted_src).unwrap();
            println!("{} {}", "Generated".green().bold(), file_name);
        }

        if !path_overrides.contains_key(&name) {
            // Add the component to the generated.rs mod file
            mods.push(quote! {
                pub mod #mod_name_ident;
                pub use #mod_name_ident::*;
            })
        }
    }

    // Write the mod file
    let src = quote! {
        _comment_!("WARNING: The contents of this file are overwritten automatically.");

        #(#mods)*
    };

    let formatted_src = rust_formatter.format_tokens(src).unwrap();

    let mut file_path = klipper_src.clone();
    file_path.push("components.rs");
    std::fs::write(file_path, &formatted_src).unwrap();

    println!("\nCode generation completed!");
}
