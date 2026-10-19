import { Router } from 'express';
import { db } from '../db/index.js';
import { requireLogin } from '../middleware/auth.js';
import { page, escapeHtml } from '../lib/html.js';
import { positiveId } from '../lib/validation.js';

export const profile = Router();
profile.use(requireLogin);
profile.get('/me', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  res.send(page('My profile', `
    <h2>My profile</h2><p>Account #${user.id} · ${escapeHtml(user.role)}</p>
    <form method="post" action="/profile/me">
      <label>Display name<input name="display_name" value="${escapeHtml(user.display_name)}" required></label>
      <label>Phone<input name="phone" value="${escapeHtml(user.phone)}"></label>
      <label>Delivery note<textarea name="delivery_note">${escapeHtml(user.delivery_note)}</textarea></label>
      <button>Save profile</button></form>
    <p><a href="/profile/${user.id}/contact">Contact card JSON</a></p>
  `, req.user));
});
profile.post('/me', (req, res) => {
  const name = String(req.body.display_name ?? '').trim();
  const phone = String(req.body.phone ?? '').slice(0, 80);
  const note = String(req.body.delivery_note ?? '').slice(0, 1000);
  if (!name || name.length > 80) return res.status(400).send('Invalid display name.');
  db.prepare(`
    UPDATE users SET display_name = ?, phone = ?, delivery_note = ?
    WHERE id = ?
  `).run(name, phone, note, req.user.id);
  res.redirect('/profile/me');
});

profile.get('/:id/contact', (req, res) => {
  const id = positiveId(req.params.id);
  const contact = db.prepare(`
    SELECT id, email, display_name, phone, delivery_note FROM users WHERE id = ?
  `).get(id ?? 0);
  if (!contact) return res.status(404).send('Contact not found.');
  res.json(contact);
});
