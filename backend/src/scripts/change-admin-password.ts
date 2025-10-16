import dotenv from 'dotenv';
import { findAdminByUsername, updateAdminPassword, verifyAdminPassword } from '../db/admins';
import { closePool } from '../db/pool';

dotenv.config({ path: process.env.DOTENV_CONFIG ?? undefined });

type ParsedArgs = {
  username?: string;
  newPassword?: string;
  currentPassword?: string;
};

const parseArgs = (): ParsedArgs => {
  const args: ParsedArgs = {};

  for (const raw of process.argv.slice(2)) {
    const [key, value] = raw.split('=');
    if (!value) {
      continue;
    }
    switch (key) {
      case '--username':
      case '-u':
        args.username = value;
        break;
      case '--password':
      case '--new-password':
      case '-p':
        args.newPassword = value;
        break;
      case '--current-password':
      case '--old-password':
      case '-c':
        args.currentPassword = value;
        break;
      default:
        break;
    }
  }

  return args;
};

const printUsage = () => {
  console.info('Usage: node dist/scripts/change-admin-password.js --username=<username> --password=<newPassword> [--current-password=<currentPassword>]');
};

const main = async () => {
  const { username, newPassword, currentPassword } = parseArgs();

  if (!username || !newPassword) {
    printUsage();
    await closePool().catch(() => undefined);
    process.exit(1);
  }

  if (newPassword.length < 8) {
    console.error('New password must be at least 8 characters long.');
    await closePool().catch(() => undefined);
    process.exit(1);
  }

  try {
    const admin = await findAdminByUsername(username);
    if (!admin) {
      console.error(`Admin with username "${username}" was not found.`);
      await closePool().catch(() => undefined);
      process.exit(1);
    }

    if (currentPassword && !verifyAdminPassword(admin, currentPassword)) {
      console.error('Current password is incorrect.');
      await closePool().catch(() => undefined);
      process.exit(1);
    }

    await updateAdminPassword(admin.id, newPassword);
    console.info(`Password updated for admin "${username}".`);
  } catch (error) {
    console.error('Failed to update admin password:', error);
    await closePool().catch(() => undefined);
    process.exit(1);
  }

  await closePool().catch(() => undefined);
  process.exit(0);
};

void main();
