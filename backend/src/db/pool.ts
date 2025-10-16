import dotenv from 'dotenv';
import { Pool, PoolClient, QueryResult } from 'pg';

dotenv.config({ path: process.env.DOTENV_CONFIG ?? undefined });

const sslEnabled = (() => {
  if (process.env.ENABLE_DB_SSL) {
    return process.env.ENABLE_DB_SSL.toLowerCase() === 'true';
  }
  if (process.env.DATABASE_URL?.includes('render.com') || process.env.DATABASE_URL?.includes('supabase')) {
    return true;
  }
  return false;
})();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.PGHOST,
  port: process.env.PGPORT ? Number(process.env.PGPORT) : undefined,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: sslEnabled ? { rejectUnauthorized: false } : undefined
});

export const query = async <T>(sql: string, params: unknown[] = []): Promise<QueryResult<T>> => {
  return pool.query<T>(sql, params);
};

export const withTransaction = async <T>(handler: (client: PoolClient) => Promise<T>): Promise<T> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await handler(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const healthcheck = async (): Promise<boolean> => {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database healthcheck failed', error);
    return false;
  }
};

export const closePool = async (): Promise<void> => {
  await pool.end();
};

export type DbPrizeRow = {
  id: string;
  name: string;
  color: string;
  quota: number;
  won: number;
  win_percentage: number;
  image_url: string | null;
  sort_index: number;
  created_at: Date;
  updated_at: Date;
};

export const mapPrizeRow = (row: DbPrizeRow) => ({
  id: row.id,
  name: row.name,
  color: row.color,
  quota: row.quota,
  won: row.won,
  winPercentage: Number(row.win_percentage),
  image: row.image_url ?? undefined,
  sortIndex: row.sort_index
});
