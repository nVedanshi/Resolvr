import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

// The root .env holds the shared Prisma connection string. During tests the
// test runner loads .env.test first, so it is applied here as well to keep the
// behaviour identical no matter which entry point boots the app.
dotenv.config({ path: path.join(repoRoot, '.env') });

if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: path.join(repoRoot, '.env.test'), override: true });
}

const port = Number(process.env.PORT ?? 4000);

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is missing. Copy .env.example to .env and point it at your local PostgreSQL database.',
  );
}

if (Number.isNaN(port)) {
  throw new Error('PORT must be a number.');
}

// Reads and validates the environment variables the server depends on.
export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port,
  databaseUrl: process.env.DATABASE_URL,
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
};