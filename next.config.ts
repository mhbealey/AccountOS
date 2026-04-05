import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    DATABASE_URL: process.env.DATABASE_URL || "file:./dev.db",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "accountos-default-secret-change-in-production",
  },
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
