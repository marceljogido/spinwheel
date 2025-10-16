import { Router, Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { findAdminByUsername, verifyAdminPassword, updateAdminPassword, AdminRecord } from '../db/admins';

type SessionRecord = {
  token: string;
  adminId: string;
  username: string;
  createdAt: number;
  expiresAt: number;
};

const router = Router();

const sessions = new Map<string, SessionRecord>();

const SESSION_TTL_MS = Number(process.env.SESSION_TTL_MS ?? 1000 * 60 * 60 * 8);

const getTokenFromHeader = (req: Request): string | null => {
  const header = req.headers.authorization;
  if (!header || typeof header !== 'string') {
    return null;
  }
  const [scheme, value] = header.split(' ');
  if (scheme !== 'Bearer' || !value) {
    return null;
  }
  return value.trim();
};

const purgeExpiredSessions = () => {
  const now = Date.now();
  for (const [token, session] of sessions) {
    if (session.expiresAt <= now) {
      sessions.delete(token);
    }
  }
};

const removeSessionsForAdmin = (adminId: string, exceptToken?: string) => {
  for (const [token, session] of sessions) {
    if (session.adminId === adminId && token !== exceptToken) {
      sessions.delete(token);
    }
  }
};

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  purgeExpiredSessions();
  const token = getTokenFromHeader(req);
  if (!token) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  const session = sessions.get(token);
  if (!session) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  if (session.expiresAt <= Date.now()) {
    sessions.delete(token);
    res.status(401).json({ message: 'Session expired' });
    return;
  }

  res.locals.session = session;
  next();
};

router.post('/login', async (req, res) => {
  const { username, password } = req.body ?? {};

  if (typeof username !== 'string' || typeof password !== 'string') {
    res.status(400).json({ message: 'Username and password are required' });
    return;
  }

  let admin: AdminRecord | null = null;

  try {
    admin = await findAdminByUsername(username);
    if (!admin || !verifyAdminPassword(admin, password)) {
      res.status(401).json({ message: 'Invalid username or password' });
      return;
    }
  } catch (error) {
    console.error('Failed to authenticate admin', error);
    res.status(500).json({ message: 'Failed to authenticate' });
    return;
  }

  purgeExpiredSessions();

  if (!admin) {
    res.status(500).json({ message: 'Failed to authenticate' });
    return;
  }

  const token = randomUUID();
  const now = Date.now();
  const expiresAt = now + SESSION_TTL_MS;

  const session: SessionRecord = {
    token,
    adminId: admin.id,
    username: admin.username,
    createdAt: now,
    expiresAt
  };

  sessions.set(token, session);

  res.json({ token, expiresAt });
});

router.post('/change-password', requireAuth, async (req, res) => {
  const session: SessionRecord | undefined = res.locals.session;

  if (!session) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { currentPassword, newPassword } = req.body ?? {};

  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
    res.status(400).json({ message: 'Current password and new password are required' });
    return;
  }

  if (newPassword.length < 8) {
    res.status(400).json({ message: 'New password must be at least 8 characters long' });
    return;
  }

  try {
    const admin = await findAdminByUsername(session.username);
    if (!admin) {
      res.status(404).json({ message: 'Admin not found' });
      return;
    }

    if (!verifyAdminPassword(admin, currentPassword)) {
      res.status(401).json({ message: 'Current password is incorrect' });
      return;
    }

    if (currentPassword === newPassword) {
      res.status(400).json({ message: 'New password must be different from the current password' });
      return;
    }

    await updateAdminPassword(admin.id, newPassword);
    removeSessionsForAdmin(admin.id, session.token);
  } catch (error) {
    console.error('Failed to update admin password', error);
    res.status(500).json({ message: 'Failed to update password' });
    return;
  }

  res.status(204).send();
});

router.post('/logout', requireAuth, (req, res) => {
  const session: SessionRecord | undefined = res.locals.session;
  if (session) {
    sessions.delete(session.token);
  }
  res.status(204).send();
});

router.get('/me', requireAuth, (_req, res) => {
  const session: SessionRecord | undefined = res.locals.session;
  if (!session) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  res.json({ username: session.username, expiresAt: session.expiresAt });
});

export const authRouter = router;
