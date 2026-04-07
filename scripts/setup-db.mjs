#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, statSync } from 'fs';
import { join } from 'path';

process.env.DATABASE_URL = 'file:./dev.db';

function run(cmd) {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: 'inherit', env: process.env });
}

try {
  run('npx prisma generate');
  run('npx prisma db push --accept-data-loss');
  run('npx tsx prisma/seed.ts');

  // Prisma creates the DB relative to schema.prisma, so it's at prisma/dev.db
  const dbPath = join(process.cwd(), 'prisma', 'dev.db');
  if (existsSync(dbPath)) {
    const stats = statSync(dbPath);
    console.log(`\n✅ Database ready at ${dbPath} (${(stats.size / 1024).toFixed(1)} KB)`);
  }
} catch (err) {
  console.error('\n❌ Database setup failed:', err.message);
}
