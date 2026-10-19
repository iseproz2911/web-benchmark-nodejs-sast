import express, { Router } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { UPLOADS } from '../config.js';
import { db } from '../db/index.js';
import { requireLogin } from '../middleware/auth.js';
import { page, escapeHtml } from '../lib/html.js';

export const uploads = Router();
uploads.get('/', requireLogin, (req, res) => {
  const files = db.prepare('SELECT * FROM attachments WHERE owner_id = ? ORDER BY id').all(req.user.id);
  res.send(page('Files', `
    <h2>Product support attachments</h2>
    <form id="upload-form"><label>Choose file<input type="file" name="attachment" required></label>
    <button>Upload</button></form><p id="upload-result"></p>
    <ul>${files.map(file => `<li><a href="/media/${escapeHtml(file.stored_name)}">${escapeHtml(file.original_name)}</a></li>`).join('')}</ul>
  `, req.user));
});

uploads.post('/', requireLogin, express.raw({ type: 'application/octet-stream', limit: '100kb' }), (req, res) => {
  const original = path.basename(String(req.headers['x-filename'] ?? 'attachment.bin'));
  if (!Buffer.isBuffer(req.body) || !req.body.length || original.length > 120) {
    return res.status(400).send('Supply a file up to 100 KiB.');
  }
  const extension = path.extname(original).toLowerCase();
  const stored = `${randomUUID()}${extension}`;
  fs.writeFileSync(path.join(UPLOADS, stored), req.body, { flag: 'wx' });
  db.prepare('INSERT INTO attachments (owner_id, stored_name, original_name) VALUES (?, ?, ?)')
    .run(req.user.id, stored, original);
  res.status(201).json({ url: `/media/${stored}` });
});
