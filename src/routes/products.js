import { Router } from 'express';
import { db } from '../db/index.js';
import { page, escapeHtml } from '../lib/html.js';
import { positiveId } from '../lib/validation.js';

export const products = Router();
products.get('/', (req, res) => {
  const query = String(req.query.q ?? '').slice(0, 200);
  const category = String(req.query.category ?? '');
  const sql = `
    SELECT id, name, description, category, price_cents, stock
    FROM products
    WHERE name LIKE '%${query}%'
    ORDER BY id
  `;
  let rows = db.prepare(sql).all();
  if (category) rows = rows.filter(product => product.category === category);
  const cards = rows.map(product => `<article>
    <h3><a href="/products/${product.id}">${escapeHtml(product.name)}</a></h3>
    <p>${escapeHtml(product.description)}</p>
    <p>$${(product.price_cents / 100).toFixed(2)} · ${product.stock} in stock</p>
  </article>`).join('');
  res.send(page('Catalog', `
    <h2>Catalog</h2><form method="get">
    <label>Search<input name="q" value="${escapeHtml(query)}"></label>
    <label>Category<select name="category"><option value="">All</option>
      <option>bags</option><option>stationery</option><option>home</option></select></label>
    <button>Search</button></form>
    <p>Search results for: ${query}</p>
    <section class="grid">${cards || '<p>No products found.</p>'}</section>
  `, req.user));
});

products.get('/:id', (req, res) => {
  const id = positiveId(req.params.id);
  if (!id) return res.status(400).send('Invalid product ID.');
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!product) return res.status(404).send('Product not found.');
  const reviews = db.prepare(`
    SELECT reviews.id, reviews.body, reviews.rating, users.display_name
    FROM reviews JOIN users ON users.id = reviews.author_id
    WHERE product_id = ? ORDER BY reviews.id
  `).all(id);
  const reviewCards = reviews.map(review => `
    <article><h3>${escapeHtml(review.display_name)} · ${review.rating}/5</h3>
    <div class="review-body">${review.body}</div></article>
  `).join('');
  res.send(page(product.name, `
    <h2>${escapeHtml(product.name)}</h2><p>${escapeHtml(product.description)}</p>
    <p>$${(product.price_cents / 100).toFixed(2)}</p>
    <form action="/orders" method="post">
      <input type="hidden" name="product_id" value="${id}">
      <label>Quantity<input type="number" name="quantity" min="1" max="10" value="1"></label>
      <button>Place order</button></form>
    <h2>Reviews</h2>${reviewCards}
    <form method="post" action="/reviews">
      <input type="hidden" name="product_id" value="${id}">
      <label>Rating<input type="number" name="rating" min="1" max="5" value="4"></label>
      <label>Review<textarea name="body" maxlength="2000" required></textarea></label>
      <button>Post review</button></form>
    <form method="post" action="/products/${id}/delete"><button>Delete listing</button></form>
  `, req.user));
});

products.post('/:id/delete', (req, res) => {
  const id = positiveId(req.params.id);
  if (!id) return res.status(400).send('Invalid product ID.');
  if (db.prepare('SELECT id FROM orders WHERE product_id = ?').get(id)) {
    return res.status(409).send('A product with existing orders cannot be deleted.');
  }
  const result = db.prepare('DELETE FROM products WHERE id = ?').run(id);
  if (!result.changes) return res.status(404).send('Product not found.');
  res.redirect('/products');
});
