#!/usr/bin/env node

// Setup script for Vercel deployment
// Sets DATABASE_URL, generates Prisma client, creates DB, and seeds it

import { execSync } from 'child_process';

// Ensure DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db';
}

console.log('DATABASE_URL:', process.env.DATABASE_URL);

function run(cmd) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: 'inherit', env: process.env });
}

try {
  run('npx prisma generate');
  run('npx prisma db push --accept-data-loss');
  run('npx tsx prisma/seed.ts');
  console.log('\n✅ Database setup complete!');
} catch (err) {
  console.error('\n❌ Database setup failed:', err.message);
  // Don't fail the build - the app can still work without seed data
  // as long as prisma generate succeeded
}
