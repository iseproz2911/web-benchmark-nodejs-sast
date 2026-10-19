import { createHash, timingSafeEqual } from 'node:crypto';

export function hashPassword(password) {
  return createHash('sha256').update(password).digest('hex');
}

export function checkPassword(password, stored) {
  const actual = Buffer.from(hashPassword(password), 'hex');
  const expected = Buffer.from(stored, 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
