import { query } from './pool';
import { hashPassword, verifyPassword } from '../utils/password';

type DbAdminRow = {
  id: string;
  username: string;
  password_hash: string;
  password_salt: string;
  created_at: Date;
  updated_at: Date;
};

export type AdminRecord = {
  id: string;
  username: string;
  passwordHash: string;
  passwordSalt: string;
};

const mapAdminRow = (row: DbAdminRow): AdminRecord => ({
  id: row.id,
  username: row.username,
  passwordHash: row.password_hash,
  passwordSalt: row.password_salt
});

export const findAdminByUsername = async (username: string): Promise<AdminRecord | null> => {
  const result = await query<DbAdminRow>(
    'SELECT id, username, password_hash, password_salt, created_at, updated_at FROM admins WHERE username = $1 LIMIT 1',
    [username]
  );

  if (result.rowCount === 0) {
    return null;
  }

  return mapAdminRow(result.rows[0]);
};

export const createAdmin = async (username: string, password: string): Promise<AdminRecord> => {
  const digest = hashPassword(password);

  const result = await query<DbAdminRow>(
    `INSERT INTO admins (username, password_hash, password_salt)
     VALUES ($1, $2, $3)
     RETURNING id, username, password_hash, password_salt, created_at, updated_at`,
    [username, digest.hash, digest.salt]
  );

  return mapAdminRow(result.rows[0]);
};

export const ensureAdminExists = async (username: string, password: string): Promise<void> => {
  const admin = await findAdminByUsername(username);
  if (admin) {
    return;
  }

  await createAdmin(username, password);
  console.info(`Created default admin account with username "${username}". Please update the password immediately.`);
};

export const verifyAdminPassword = (admin: AdminRecord, password: string): boolean => {
  return verifyPassword(password, { hash: admin.passwordHash, salt: admin.passwordSalt });
};

export const updateAdminPassword = async (adminId: string, newPassword: string): Promise<void> => {
  const digest = hashPassword(newPassword);
  await query(
    'UPDATE admins SET password_hash = $1, password_salt = $2 WHERE id = $3',
    [digest.hash, digest.salt, adminId]
  );
};
