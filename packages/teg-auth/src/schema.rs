table! {
    invites (id) {
        id -> Int4,
        public_key -> Text,
        private_key -> Nullable<Text>,
        is_admin -> Bool,
        slug -> Nullable<Text>,
        created_at -> Timestamptz,
    }
}

table! {
    users (id) {
        id -> Int4,
        name -> Nullable<Text>,
        email -> Nullable<Text>,
        email_verified -> Bool,
        is_admin -> Bool,
        is_authorized -> Bool,
        created_at -> Timestamptz,
        last_logged_in_at -> Nullable<Timestamptz>,
        firebase_uid -> Text,
    }
}

allow_tables_to_appear_in_same_query!(
    invites,
    users,
);
