import { PrismaClient } from '@prisma/client';
import { copyFileSync, existsSync } from 'fs';
import { join } from 'path';

function getDatabaseUrl(): string {
  if (process.env.VERCEL) {
    const tmpDb = '/tmp/dev.db';
    if (!existsSync(tmpDb)) {
      // On Vercel, the DB is bundled relative to the function
      // Try common locations where the build output places it
      const sources = [
        join(process.cwd(), 'prisma', 'dev.db'),
        join(process.cwd(), 'dev.db'),
        join(__dirname, '..', '..', 'prisma', 'dev.db'),
        join(__dirname, '..', '..', '..', 'prisma', 'dev.db'),
      ];
      for (const src of sources) {
        if (existsSync(src)) {
          copyFileSync(src, tmpDb);
          // Also copy WAL/SHM if they exist
          if (existsSync(src + '-wal')) copyFileSync(src + '-wal', tmpDb + '-wal');
          if (existsSync(src + '-shm')) copyFileSync(src + '-shm', tmpDb + '-shm');
          console.log(`[prisma] Copied database from ${src} to ${tmpDb}`);
          break;
        }
      }
    }
    if (existsSync(tmpDb)) {
      return `file:${tmpDb}`;
    }
    console.warn('[prisma] No database file found, falling back to default');
  }
  return process.env.DATABASE_URL || 'file:./dev.db';
}

const url = getDatabaseUrl();

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: { db: { url } },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
