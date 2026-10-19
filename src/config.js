import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DATA = path.join(ROOT, 'data');
export const UPLOADS = path.join(DATA, 'uploads');
export const DOCUMENTS = path.join(DATA, 'documents');
export const DATABASE = path.join(DATA, 'catalog.sqlite');
export const HOST = '127.0.0.1';
export const PORT = 3036;
