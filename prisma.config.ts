import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

// Load .env.local for local dev; on Vercel, env vars are injected by the platform
dotenv.config({ path: ".env.local", override: false });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
