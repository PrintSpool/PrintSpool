table! {
    users (id) {
        id -> Int4,
        user_profile_id -> Text,
        name -> Nullable<Text>,
        email -> Nullable<Text>,
        email_verified -> Bool,
        is_admin -> Bool,
        is_authorized -> Bool,
    }
}
