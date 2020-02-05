table! {
    invites (id) {
        id -> Int4,
        public_key -> Text,
        private_key -> Nullable<Text>,
        is_admin -> Bool,
        slug -> Nullable<Text>,
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
        created_at -> Timestamp,
        last_logged_in_at -> Nullable<Timestamp>,
    }
}

allow_tables_to_appear_in_same_query!(
    invites,
    users,
);
