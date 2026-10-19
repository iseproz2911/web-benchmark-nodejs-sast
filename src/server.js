import { app } from './app.js';
import { HOST, PORT } from './config.js';
import { db } from './db/index.js';

const server = app.listen(PORT, HOST, () => {
  console.log(`Local benchmark listening on http://${HOST}:${PORT}`);
});
server.on('error', error => {
  console.error(`Unable to bind local server: ${error.code}`);
  db.close();
  process.exitCode = 1;
});
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => {
    db.close();
    process.exit(0);
  }));
}
