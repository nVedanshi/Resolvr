import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

// Run before any application module is imported, because the Prisma client
// reads DATABASE_URL at construction time.
dotenv.config({ path: path.join(repoRoot, '.env.test'), override: true });
process.env.NODE_ENV = 'test';