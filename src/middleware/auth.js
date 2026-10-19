import { db } from '../db/index.js';

export function loadIdentity(req, res, next) {
  const cookies = Object.fromEntries((req.headers.cookie ?? '').split(';')
    .map(part => part.trim().split('=')));
  const userId = Number(cookies.bench_uid);
  req.user = Number.isSafeInteger(userId)
    ? db.prepare('SELECT id, email, display_name, role FROM users WHERE id = ?').get(userId)
    : null;
  next();
}

export function requireLogin(req, res, next) {
  if (!req.user) return res.status(401).send('Log in to continue.');
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).send('Log in to continue.');
  if (req.user.role !== 'admin') return res.status(403).send('Administrator role required.');
  next();
}
