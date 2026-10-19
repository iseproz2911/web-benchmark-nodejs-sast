import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { DATABASE } from '../config.js';

if (!fs.existsSync(DATABASE)) {
  throw new Error('Local database missing. Run npm run seed first.');
}
export const db = new DatabaseSync(DATABASE);
db.exec('PRAGMA foreign_keys = ON');
