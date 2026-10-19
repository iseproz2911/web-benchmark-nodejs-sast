# Corner Store — local Node.js source benchmark

Intentionally vulnerable, independent training application. Run only on your own
machine against its fictional seeded data. Never publish a running instance,
forward its port, attach real data, or use it as production software. Do not put
secrets in its directory or upload private documents. It binds only to 127.0.0.1:3036.

## Prerequisites and setup

Use Node.js 24.x (including built-in `node:sqlite`) and npm 11.x. An experimental
SQLite warning may appear on Node 24; the application uses DatabaseSync.
Only Express is an npm dependency. No cloud accounts or external credentials are needed.
Dependency installation needs npm registry access; runtime uses no third-party services.

```sh
npm install --ignore-scripts --no-audit --no-fund
npm run seed
npm start
```

After a complete lockfile is available, use `npm ci --ignore-scripts --no-audit --no-fund`
in place of `npm install`. Open http://127.0.0.1:3036/products.

Stop the server before running `npm run seed` again. Seeding resets only this app's
SQLite rows and rewrites two sample text documents under `data/`. IDs and data are
deterministic. Existing upload bytes are left in place; do not share a used data directory.
`data/` and `node_modules/` are excluded from future source publishing.

## Fictional demo accounts

| Email | Password | Role |
| --- | --- | --- |
| admin@example.invalid | demo-admin-36 | admin |
| alice@example.invalid | demo-alice-36 | customer |
| bob@example.invalid | demo-bob-36 | customer |

These are public local fixtures, not credentials to any real service.

## Application modules

- `src/server.js`, `src/app.js`: loopback listener, middleware, router composition.
- `src/db/`, `scripts/seed.js`: schema, SQLite connection, deterministic fixture initialization.
- `src/routes/auth.js`: registration, login, logout.
- `src/routes/profile.js`: profile editing and contact cards.
- `src/routes/products.js`, `reviews.js`: catalog, details, filtering, reviews, deletion.
- `src/routes/admin.js`: administrator product creation and editing.
- `src/routes/orders.js`: owned order history, server-priced order creation and stock accounting.
- `src/routes/uploads.js`: bounded binary support attachments and browser upload UI.
- `src/routes/documents.js`: local shipping documentation.
- `src/routes/api.js`: catalog JSON and service diagnostics.
- `src/lib/`, `src/middleware/`, `public/`: rendering, validation, identity, styling.

Sign in to edit a profile, post reviews, order products, and upload attachments.
Sign in as the seeded administrator to create and edit catalog items. Browser forms
and the small upload helper access the same reachable routes that source analysis reviews.

## Benchmark use

The source contains deliberately mixed security quality; do not assume a dangerous
API proves exploitability or that every module is vulnerable. Assess concrete routes,
input handling, authorization boundaries, storage, and output together. The maintainer
answer key is kept outside this repository. There are no automated attack scripts,
tests, scanning integrations, shell execution features, or external runtime services.

Source contains multiline SQL and rendering, varied indentation, blank lines, and
non-English business comments for evidence matching. Preserve source files as supplied
when recording evidence and line ranges. Findings remain leads pending validation.
