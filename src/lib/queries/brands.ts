import { prisma } from "@/lib/prisma";

export async function getBrands() {
  return prisma.brand.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });
}

export async function getActiveBrands() {
  return prisma.brand.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getBrandById(id: string) {
  return prisma.brand.findUnique({ where: { id } });
}

export async function getBrandBySlug(slug: string) {
  return prisma.brand.findUnique({ where: { slug } });
}
