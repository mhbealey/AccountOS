import { PrismaClient } from '@prisma/client';
import { copyFileSync, existsSync } from 'fs';
import { join } from 'path';

function getDatabaseUrl(): string {
  if (process.env.VERCEL) {
    const tmpDb = '/tmp/accountos.db';
    if (!existsSync(tmpDb)) {
      const sources = [
        join(process.cwd(), 'prisma', 'dev.db'),
        join(process.cwd(), 'dev.db'),
      ];
      for (const src of sources) {
        if (existsSync(src)) {
          copyFileSync(src, tmpDb);
          if (existsSync(src + '-wal')) copyFileSync(src + '-wal', tmpDb + '-wal');
          if (existsSync(src + '-shm')) copyFileSync(src + '-shm', tmpDb + '-shm');
          break;
        }
      }
    }
    if (existsSync(tmpDb)) return `file:${tmpDb}`;
  }
  return process.env.DATABASE_URL || 'file:./dev.db';
}

const url = getDatabaseUrl();
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ datasources: { db: { url } } });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
export default prisma;
