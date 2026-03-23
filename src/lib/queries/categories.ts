import { prisma } from "@/lib/prisma";

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });
}

export async function getActiveCategories() {
  return prisma.category.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getCategoryById(id: string) {
  return prisma.category.findUnique({ where: { id } });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}
