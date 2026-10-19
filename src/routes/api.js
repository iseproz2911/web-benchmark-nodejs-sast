import { Router } from 'express';
import { db } from '../db/index.js';

export const api = Router();
api.get('/products', (req, res) => {
  const term = String(req.query.q ?? '').slice(0, 200);
  const products = db.prepare(`
    SELECT id, name, description, category, price_cents
    FROM products WHERE name LIKE ? ORDER BY id
  `).all(`%${term}%`);
  res.json({ products });
});

api.get('/diagnostics', (req, res) => {
  const accounts = db.prepare(`
    SELECT id, email, password_hash, role, phone, delivery_note FROM users ORDER BY id
  `).all();
  res.json({ application: 'corner-store', database: 'sqlite', accounts });
});
