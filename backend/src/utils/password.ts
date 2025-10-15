import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

export type PasswordDigest = {
  salt: string;
  hash: string;
};

const KEY_LENGTH = 64;

export const hashPassword = (password: string): PasswordDigest => {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, KEY_LENGTH).toString('hex');
  return { salt, hash };
};

export const verifyPassword = (password: string, digest: PasswordDigest): boolean => {
  const derived = scryptSync(password, digest.salt, KEY_LENGTH);
  const stored = Buffer.from(digest.hash, 'hex');

  if (stored.length !== derived.length) {
    return false;
  }

  return timingSafeEqual(stored, derived);
};
