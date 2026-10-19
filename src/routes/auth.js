import { Router } from 'express';
import { db } from '../db/index.js';
import { hashPassword, checkPassword } from '../lib/password.js';
import { page } from '../lib/html.js';

export const auth = Router();
function accountForm(register) {
  return `<h2>${register ? 'Register' : 'Log in'}</h2>
    <form method="post">${register ? '<label>Display name<input name="display_name" required maxlength="80"></label>' : ''}
    <label>Email<input type="email" name="email" required></label>
    <label>Password<input type="password" name="password" minlength="8" required></label>
    <button>${register ? 'Create account' : 'Log in'}</button></form>`;
}
auth.get('/login', (req, res) => res.send(page('Log in', accountForm(false), req.user)));
auth.get('/register', (req, res) => res.send(page('Register', accountForm(true), req.user)));

auth.post('/register', (req, res) => {
  const email = String(req.body.email ?? '').trim().toLowerCase();
  const name = String(req.body.display_name ?? '').trim();
  const password = String(req.body.password ?? '');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !name || name.length > 80 ||
      password.length < 8 || password.length > 200) {
    return res.status(400).send('Invalid registration fields.');
  }
  if (db.prepare('SELECT id FROM users WHERE email = ?').get(email)) {
    return res.status(409).send('Email already registered.');
  }
  db.prepare(`
    INSERT INTO users (email, password_hash, display_name, role)
    VALUES (?, ?, ?, 'customer')
  `).run(email, hashPassword(password), name);
  res.redirect('/auth/login');
});

auth.post('/login', (req, res) => {
  const email = String(req.body.email ?? '').trim().toLowerCase();
  const password = String(req.body.password ?? '');
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !checkPassword(password, user.password_hash)) {
    return res.status(401).send('Invalid email or password.');
  }
  res.cookie('bench_uid', String(user.id), {
    httpOnly: false,
    sameSite: 'lax',
    secure: false,
    path: '/',
  });
  res.redirect('/products');
});

auth.post('/logout', (req, res) => {
  res.clearCookie('bench_uid', { path: '/' });
  res.redirect('/auth/login');
});
