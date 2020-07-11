use proc_macro2::*;
use syn::*;

pub struct Meta {
  pub entry_ident: Ident,
  pub variants: Vec<Variant>,
  pub model_variant_ident: Ident,
  pub model_type: syn::Type,
}

impl Meta {
  pub fn new(ast: &syn::DeriveInput) -> Self {
    let entry_ident = ast.ident.clone();

    let variants = match ast.data {
        syn::Data::Enum(ref data_enum) => {
          data_enum.variants
            .iter()
            .map(|v| v.clone())
            .collect::<Vec<_>>()
        },
        _ => panic!("VersionedSledModel can only be used on enums"),
    };
  
    let model_variant = variants.iter()
      .last()
      .expect("VersionedSledModel requires at least one enum variant");
  
    let model_variant_ident = model_variant.ident.clone();
  
    let variant_fields = match model_variant.fields.clone() {
      syn::Fields::Unnamed(fields) => fields.unnamed,
      _ => panic!("A tuple-style field was expected on the variant eg. MyModelR1 (MyModelR1)")
    };
  
    let model_type = variant_fields
      .iter()
      .next()
      .expect("A tuple-style field was expected on the variant eg. MyModelR1 (MyModelR1)")
      .ty
      .clone();

      Self {
        entry_ident,
        variants,
        model_variant_ident,
        model_type,
      }
  }
}
