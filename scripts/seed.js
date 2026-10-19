import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { DATA, DATABASE, DOCUMENTS, UPLOADS, ROOT } from '../src/config.js';
import { hashPassword } from '../src/lib/password.js';

for (const directory of [DATA, DOCUMENTS, UPLOADS, path.join(DATA, 'private')]) {
  fs.mkdirSync(directory, { recursive: true });
}
const db = new DatabaseSync(DATABASE);
db.exec(fs.readFileSync(path.join(ROOT, 'src/db/schema.sql'), 'utf8'));
db.exec('BEGIN IMMEDIATE');
try {
  // Reset only benchmark-owned rows, preserving the schema and filesystem.
  for (const table of ['orders', 'reviews', 'attachments', 'products', 'users']) {
    db.exec(`DELETE FROM ${table}`);
  }
  const insertUser = db.prepare(`
    INSERT INTO users (id, email, password_hash, display_name, role, phone, delivery_note)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertUser.run(1, 'admin@example.invalid', hashPassword('demo-admin-36'),
    'Morgan Admin', 'admin', '000-000-0001', 'Fictional benchmark account');
  insertUser.run(2, 'alice@example.invalid', hashPassword('demo-alice-36'),
    'Alice Sample', 'customer', '000-000-0002', 'Leave fictional parcel at desk A');
  insertUser.run(3, 'bob@example.invalid', hashPassword('demo-bob-36'),
    'Bob Sample', 'customer', '000-000-0003', 'Leave fictional parcel at desk B');
  const insertProduct = db.prepare(`
    INSERT INTO products (id, name, description, category, price_cents, stock)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertProduct.run(1, 'Canvas tote', 'Reusable cotton shopping bag.', 'bags', 1600, 24);
  insertProduct.run(2, 'Desk notebook', 'Plain paper notebook for local orders.', 'stationery', 900, 40);
  insertProduct.run(3, 'Ceramic mug', 'Blue ceramic mug.', 'home', 2200, 12);
  db.prepare('INSERT INTO reviews VALUES (?, ?, ?, ?, ?)')
    .run(1, 1, 2, 'Useful bag for a small grocery trip.', 4);
  db.prepare('INSERT INTO orders VALUES (?, ?, ?, ?, ?)').run(1, 2, 1, 1, 1600);
  db.exec('COMMIT');
} catch (error) {
  db.exec('ROLLBACK');
  throw error;
} finally {
  db.close();
}
fs.writeFileSync(path.join(DOCUMENTS, 'shipping.txt'),
  'Local sample shipping guide: fictional orders ship in two working days.\n');
fs.writeFileSync(path.join(DATA, 'private', 'supplier-pricing.txt'),
  'FICTIONAL INTERNAL DATA\nCanvas tote wholesale: 500 cents.\n');
console.log('Seeded three fictional users, three products, one review, and one order.');
