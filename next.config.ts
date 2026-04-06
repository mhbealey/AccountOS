import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    DATABASE_URL: process.env.DATABASE_URL || "file:./dev.db",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "accountos-default-secret-change-in-production",
  },
  serverExternalPackages: ["@prisma/client"],
};

export default nextConfig;
