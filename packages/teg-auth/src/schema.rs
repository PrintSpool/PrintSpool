table! {
    invites (id) {
        id -> Int4,
        public_key -> Text,
        private_key -> Text,
        created_at -> Timestamp,
    }
}

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

allow_tables_to_appear_in_same_query!(
    invites,
    users,
);
