import { Router } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { DATA, DOCUMENTS } from '../config.js';
import { requireLogin } from '../middleware/auth.js';
import { page } from '../lib/html.js';

export const documents = Router();
documents.get('/', (req, res) => res.send(page('Shipping', `
  <h2>Shipping documents</h2>
  <p><a href="/documents/download?file=shipping.txt">Download shipping guide</a></p>
  <p><a href="/documents/guide/shipping">Read named shipping guide</a></p>
`, req.user)));

documents.get('/download', requireLogin, (req, res) => {
  const filename = String(req.query.file ?? 'shipping.txt');
  const resolved = path.resolve(DOCUMENTS, filename);
  // Benchmark safety boundary: never read outside the local seeded data directory.
  const relative = path.relative(DATA, resolved);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    return res.status(403).send('Outside benchmark data directory.');
  }
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
    return res.status(404).send('Document not found.');
  }
  res.type('text/plain').send(fs.readFileSync(resolved, 'utf8'));
});

documents.get('/guide/:name', (req, res) => {
  const guides = { shipping: path.join(DOCUMENTS, 'shipping.txt') };
  const file = Object.hasOwn(guides, req.params.name) ? guides[req.params.name] : null;
  if (!file) return res.status(404).send('Unknown guide.');
  res.type('text/plain').send(fs.readFileSync(file, 'utf8'));
});
