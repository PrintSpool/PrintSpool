table! {
    users (id) {
        id -> Int4,
        user_profile_id -> Int4,
        name -> Nullable<Text>,
        email -> Nullable<Text>,
        email_verified -> Bool,
        phone_number -> Nullable<Text>,
        phone_number_verified -> Bool,
        is_admin -> Bool,
    }
}
