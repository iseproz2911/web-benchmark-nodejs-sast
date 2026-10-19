import { Router } from 'express';
import { db } from '../db/index.js';
import { requireLogin } from '../middleware/auth.js';
import { page, escapeHtml } from '../lib/html.js';
import { positiveId } from '../lib/validation.js';

export const orders = Router();
orders.use(requireLogin);
orders.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT orders.id, quantity, total_cents, products.name
    FROM orders JOIN products ON products.id = orders.product_id
    WHERE user_id = ? ORDER BY orders.id
  `).all(req.user.id);
  res.send(page('Orders', `<h2>My orders</h2><ul>${rows.map(order =>
    `<li>#${order.id}: ${escapeHtml(order.name)} × ${order.quantity} — $${(order.total_cents / 100).toFixed(2)}</li>`).join('')}</ul>`, req.user));
});
orders.post('/', (req, res) => {
  const productId = positiveId(req.body.product_id);
  const quantity = Number(req.body.quantity);
  if (!productId || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 10) {
    return res.status(400).send('Invalid order.');
  }
  db.exec('BEGIN IMMEDIATE');
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
    if (!product || product.stock < quantity) {
      db.exec('ROLLBACK');
      return res.status(409).send('Not enough stock.');
    }
    db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(quantity, productId);
    db.prepare(`
      INSERT INTO orders (user_id, product_id, quantity, total_cents) VALUES (?, ?, ?, ?)
    `).run(req.user.id, productId, quantity, product.price_cents * quantity);
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
  res.redirect('/orders');
});
