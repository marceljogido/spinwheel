import { query } from './pool';
import { ensureAdminExists } from './admins';

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

const CREATE_UPDATED_AT_TRIGGER_FUNC_SQL = `
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';
`;

const APPLY_TRIGGER_TO_PRIZES_SQL = `
DROP TRIGGER IF EXISTS update_prizes_updated_at ON prizes;
CREATE TRIGGER update_prizes_updated_at
BEFORE UPDATE ON prizes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
`;

const CREATE_ADMINS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
)`;

const APPLY_TRIGGER_TO_ADMINS_SQL = `
DROP TRIGGER IF EXISTS update_admins_updated_at ON admins;
CREATE TRIGGER update_admins_updated_at
BEFORE UPDATE ON admins
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
`;

const DEFAULT_ADMIN_USERNAME = 'admin';
const DEFAULT_ADMIN_PASSWORD = 'change-me';

export const ensureDatabase = async (): Promise<void> => {
  await query(CREATE_EXTENSION_SQL).catch(err => console.warn('Could not create pgcrypto extension. This might fail if you are not a superuser.', err));
  await query(CREATE_PRIZES_TABLE_SQL);
  await query(CREATE_PRIZES_INDEX_SQL);
  await query(CREATE_UPDATED_AT_TRIGGER_FUNC_SQL);
  await query(APPLY_TRIGGER_TO_PRIZES_SQL);
  await query(CREATE_ADMINS_TABLE_SQL);
  await query(APPLY_TRIGGER_TO_ADMINS_SQL);
  await ensureAdminExists(DEFAULT_ADMIN_USERNAME, DEFAULT_ADMIN_PASSWORD);
};
