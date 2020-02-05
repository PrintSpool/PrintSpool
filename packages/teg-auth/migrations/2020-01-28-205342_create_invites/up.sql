CREATE TABLE invites (
    id SERIAL PRIMARY KEY,
    public_key TEXT UNIQUE NOT NULL,
    private_key TEXT,
    is_admin BOOLEAN NOT NULL DEFAULT False,
    slug TEXT,

    created_at TIMESTAMP NOT NULL
);
