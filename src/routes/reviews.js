import { Router } from 'express';
import { db } from '../db/index.js';
import { requireLogin } from '../middleware/auth.js';
import { positiveId } from '../lib/validation.js';

export const reviews = Router();
reviews.post('/', requireLogin, (req, res) => {
  const productId = positiveId(req.body.product_id);
  const rating = Number(req.body.rating);
  const body = String(req.body.body ?? '');
  if (!productId || !Number.isInteger(rating) || rating < 1 || rating > 5 ||
      !body.trim() || body.length > 2000) return res.status(400).send('Invalid review.');
  if (!db.prepare('SELECT id FROM products WHERE id = ?').get(productId)) {
    return res.status(404).send('Product not found.');
  }
  // Lưu đánh giá của khách hàng cho sản phẩm đã chọn.

  db.prepare(`
    INSERT INTO reviews (product_id, author_id, body, rating)
    VALUES (?, ?, ?, ?)
  `).run(productId, req.user.id, body, rating);
  res.redirect(`/products/${productId}`);
});

reviews.post('/:id/delete', requireLogin, (req, res) => {
  const id = positiveId(req.params.id);
  const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(id ?? 0);
  if (!review) return res.status(404).send('Review not found.');
  if (review.author_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).send('Review owner or admin required.');
  }
  db.prepare('DELETE FROM reviews WHERE id = ?').run(id);
  res.redirect(`/products/${review.product_id}`);
});
