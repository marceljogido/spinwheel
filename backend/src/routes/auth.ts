import { Router, Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

type SessionRecord = {
  token: string;
  username: string;
  createdAt: number;
  expiresAt: number;
};

const router = Router();

const sessions = new Map<string, SessionRecord>();

const SESSION_TTL_MS = Number(process.env.SESSION_TTL_MS ?? 1000 * 60 * 60 * 8);

const getCredentials = () => {
  const username = process.env.ADMIN_USERNAME ?? 'admin';
  const password = process.env.ADMIN_PASSWORD ?? 'admin123';
  return { username, password };
};

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

router.post('/login', (req, res) => {
  const { username, password } = req.body ?? {};

  if (typeof username !== 'string' || typeof password !== 'string') {
    res.status(400).json({ message: 'Username and password are required' });
    return;
  }

  const expected = getCredentials();

  if (username !== expected.username || password !== expected.password) {
    res.status(401).json({ message: 'Invalid username or password' });
    return;
  }

  purgeExpiredSessions();

  const token = randomUUID();
  const now = Date.now();
  const expiresAt = now + SESSION_TTL_MS;

  const session: SessionRecord = {
    token,
    username,
    createdAt: now,
    expiresAt
  };

  sessions.set(token, session);

  res.json({ token, expiresAt });
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
