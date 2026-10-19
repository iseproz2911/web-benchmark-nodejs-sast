import { Router } from 'express';
import { db } from '../db/index.js';
import { requireAdmin } from '../middleware/auth.js';
import { page, escapeHtml, productFields } from '../lib/html.js';
import { positiveId, readProduct } from '../lib/validation.js';

export const admin = Router();
admin.use(requireAdmin);
admin.get('/', (req, res) => {
  const products = db.prepare('SELECT * FROM products ORDER BY id').all();
  const users = db.prepare('SELECT id, email, role FROM users ORDER BY id').all();
  res.send(page('Administration', `
    <h2>Administration</h2><a href="/admin/products/new">Create product</a>
    <h3>Products</h3><ul>${products.map(product =>
      `<li><a href="/admin/products/${product.id}/edit">${escapeHtml(product.name)}</a></li>`).join('')}</ul>
    <h3>Accounts</h3><ul>${users.map(user =>
      `<li>${escapeHtml(user.email)} · ${escapeHtml(user.role)}</li>`).join('')}</ul>
    <p><a href="/api/diagnostics">Service diagnostics JSON</a></p>
  `, req.user));
});
admin.get('/products/new', (req, res) => res.send(page('Create product', `
  <h2>Create product</h2><form method="post" action="/admin/products">
  ${productFields()}<button>Create</button></form>
`, req.user)));
admin.post('/products', (req, res) => {
  const values = readProduct(req.body);
  if (!values) return res.status(400).send('Invalid product fields.');
  const result = db.prepare(`
    INSERT INTO products (name, description, category, price_cents, stock)
    VALUES (?, ?, ?, ?, ?)
  `).run(...values);
  res.redirect(`/products/${result.lastInsertRowid}`);
});
admin.get('/products/:id/edit', (req, res) => {
  const id = positiveId(req.params.id);
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id ?? 0);
  if (!product) return res.status(404).send('Product not found.');
  res.send(page('Edit product', `<h2>Edit product</h2>
    <form method="post" action="/admin/products/${id}">${productFields(product)}
    <button>Save</button></form>`, req.user));
});
admin.post('/products/:id', (req, res) => {
  const id = positiveId(req.params.id);
  const values = readProduct(req.body);
  if (!id || !values) return res.status(400).send('Invalid product fields.');
  const result = db.prepare(`
    UPDATE products SET name = ?, description = ?, category = ?, price_cents = ?, stock = ?
    WHERE id = ?
  `).run(...values, id);
  if (!result.changes) return res.status(404).send('Product not found.');
  res.redirect(`/products/${id}`);
});
