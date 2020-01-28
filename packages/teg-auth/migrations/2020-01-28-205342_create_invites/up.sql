CREATE TABLE invites (
    id SERIAL PRIMARY KEY,
    public_key TEXT UNIQUE NOT NULL,
    private_key TEXT NOT NULL,

    created_at TIMESTAMP NOT NULL
);
