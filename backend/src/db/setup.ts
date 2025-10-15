import { query } from './pool';

const CREATE_EXTENSION_SQL = 'CREATE EXTENSION IF NOT EXISTS "pgcrypto"';

const CREATE_PRIZES_TABLE_SQL = `
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
)`;

const CREATE_PRIZES_INDEX_SQL = 'CREATE INDEX IF NOT EXISTS prizes_sort_index_idx ON prizes (sort_index)';

export const ensureDatabase = async (): Promise<void> => {
  try {
    await query(CREATE_EXTENSION_SQL);
  } catch (error) {
    console.warn('Unable to ensure pgcrypto extension; continuing without it.', error);
  }

  await query(CREATE_PRIZES_TABLE_SQL);
  await query(CREATE_PRIZES_INDEX_SQL);
};
