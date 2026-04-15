import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashSync } from "bcryptjs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "studiosnajo@gmail.com" },
    update: {
      role: "SUPER_ADMIN",
      active: true,
    },
    create: {
      name: "Studios Najo",
      email: "studiosnajo@gmail.com",
      password: hashSync("Najo2026", 12),
      role: "SUPER_ADMIN",
    },
  });

  console.log(`Super admin created/updated: ${user.email} (role: ${user.role})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
