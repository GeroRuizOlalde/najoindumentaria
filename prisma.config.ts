import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

// Load shared env first and allow .env.local to override it in local dev.
dotenv.config({ path: ".env", override: false });
dotenv.config({ path: ".env.local", override: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    // Supabase often exposes a pooled runtime URL plus a direct URL for schema changes.
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
