export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

export function page(title, content, user = null) {
  const identity = user
    ? `<span>${escapeHtml(user.display_name)}</span>
       <form method="post" action="/auth/logout"><button>Log out</button></form>`
    : '<a href="/auth/login">Log in</a><a href="/auth/register">Register</a>';
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(title)} — Corner Store</title>
  <link rel="stylesheet" href="/assets/style.css">
  <script src="/assets/upload.js" defer></script>
</head>
<body>
  <aside class="notice">Local benchmark only — fictional data; never deploy publicly.</aside>
  <header><h1>Corner Store</h1><nav>
    <a href="/products">Catalog</a><a href="/profile/me">My profile</a>
    <a href="/uploads">Files</a><a href="/documents">Shipping</a>
    <a href="/orders">Orders</a><a href="/admin">Administration</a>${identity}
  </nav></header>
  <main>${content}</main>
  <footer>Independent JavaScript source benchmark · no third-party runtime services</footer>
</body>
</html>`;
}

export function productFields(product = {}) {
  return `
    <label>Name<input name="name" required maxlength="100" value="${escapeHtml(product.name)}"></label>
    <label>Description<textarea name="description" required>${escapeHtml(product.description)}</textarea></label>
    <label>Category<select name="category">${['bags', 'stationery', 'home'].map(category =>
      `<option ${product.category === category ? 'selected' : ''}>${category}</option>`).join('')}</select></label>
    <label>Price in cents<input type="number" min="0" name="price_cents" required value="${escapeHtml(product.price_cents ?? 100)}"></label>
    <label>Stock<input type="number" min="0" name="stock" required value="${escapeHtml(product.stock ?? 1)}"></label>`;
}
