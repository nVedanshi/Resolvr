import { createApp, closeDatabase } from './app.js';
import { env } from './config/env.js';

const app = createApp();

const server = app.listen(env.port, () => {
  console.log(`RESOLVR API listening on http://localhost:${env.port}`);
});

// Stops accepting connections and releases the database pool before exiting.
async function shutdown(signal) {
  console.log(`\n${signal} received, shutting down.`);
  server.close(async () => {
    await closeDatabase();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));