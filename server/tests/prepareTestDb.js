import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import dotenv from 'dotenv';

const require = createRequire(import.meta.url);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const envPath = path.join(repoRoot, '.env.test');

try {
  dotenv.config({ path: envPath, override: true });
} catch {
  // ignore
}

if (!process.env.DATABASE_URL) {
  console.error(
    'Missing .env.test at the repository root. Copy .env.test.example to .env.test and point it at an empty PostgreSQL database.',
  );
  process.exit(1);
}

console.log('Applying Prisma migrations to the test database...');

// Invoking the Prisma CLI through Node avoids depending on a shell or on npx
// being on PATH, which is what makes this work on Windows as well.
execFileSync(
  process.execPath,
  [require.resolve('prisma/build/index.js'), 'migrate', 'deploy'],
  {
    cwd: repoRoot,
    env: { ...process.env },
    stdio: 'inherit',
  },
);