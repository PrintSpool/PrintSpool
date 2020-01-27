CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    user_profile_id INT UNIQUE NOT NULL,
    name TEXT,
    email TEXT,
    email_verified BOOLEAN NOT NULL,
    phone_number TEXT,
    phone_number_verified BOOLEAN NOT NULL,
    is_admin BOOLEAN NOT NULL
);
