use serde::{
    Serialize,
    de::DeserializeOwned,
};
use schemars::JsonSchema;

fn static_fields_or_default_fields<'a, I: Iterator<Item = &'a String>, F: Fn() -> I>(
    all_fields: &Vec<String>,
    static_fields: Option<Vec<&'static str>>,
    filter: F,
) -> Vec<String> {
    if let Some(static_fields) = static_fields {
        // The `advanced_form` is generated from a statically defined list of fields
        static_fields
            .into_iter()
            .map(Into::into)
            .collect::<Vec<_>>()
    } else {
        // Filtering out fields (eg. advanced_form filters out form fields)
        all_fields
            .into_iter()
            .filter(|k| filter().all(|k2| k2 != *k))
            .map(Into::into)
            .collect::<Vec<_>>()
    }
}

pub trait Model: JsonSchema + Serialize + DeserializeOwned {
    /// Returns the basic form settings as static strings if it is defined statically.
    /// Usually this is implemented by concrete types to return a ordered list of fields.
    fn static_form() -> Option<Vec<&'static str>> {
        None
    }

    fn form(all_fields: &Vec<String>) -> Vec<String> {
        static_fields_or_default_fields(
            all_fields,
            Self::static_form(),
            || { std::iter::empty() },
        )
    }

    fn advanced_form(
        all_fields: &Vec<String>,
        form: &Vec<String>,
    ) -> Vec<String> {
        static_fields_or_default_fields(
            all_fields,
            Self::static_advanced_form(),
            || { form.iter() }
        )
    }

    /// Returns the advanced form as static strings if it is defined statically.
    /// Usually this is implemented by concrete types to return a ordered list of fields.
    fn static_advanced_form() -> Option<Vec<&'static str>> {
        None
    }

    fn developer_form(
        all_fields: &Vec<String>,
        form: &Vec<String>,
        advanced_form: &Vec<String>,
    ) -> Vec<String> {
        let default_fields_filter = || {
            form
                .iter()
                .chain(advanced_form.iter())
        };

        static_fields_or_default_fields(
            all_fields,
            Self::static_developer_form(),
            default_fields_filter,
        )
    }

    /// Returns the developer mode form as static strings if it is defined statically.
    /// Usually this is implemented by concrete types to return a ordered list of fields.
    fn static_developer_form() -> Option<Vec<&'static str>> {
        None
    }
}
