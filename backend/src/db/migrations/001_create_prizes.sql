CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS prizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    color VARCHAR(9) NOT NULL,
    quota INTEGER NOT NULL DEFAULT 0,
    won INTEGER NOT NULL DEFAULT 0,
    win_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
    image_url TEXT,
    sort_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS prizes_sort_index_idx ON prizes (sort_index);
