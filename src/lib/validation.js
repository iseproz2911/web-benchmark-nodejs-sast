export function positiveId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export function readProduct(body) {
  const name = String(body.name ?? '').trim();
  const description = String(body.description ?? '').trim();
  const category = String(body.category ?? '');
  const price = Number(body.price_cents);
  const stock = Number(body.stock);
  if (!name || name.length > 100 || !description || description.length > 2000 ||
      !['bags', 'stationery', 'home'].includes(category) ||
      !Number.isSafeInteger(price) || price < 0 || price > 1000000 ||
      !Number.isSafeInteger(stock) || stock < 0 || stock > 10000) {
    return null;
  }
  return [name, description, category, price, stock];
}
