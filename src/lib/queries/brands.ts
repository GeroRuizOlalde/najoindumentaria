import { prisma } from "@/lib/prisma";

interface BrandFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export async function getBrands(filters: BrandFilters = {}) {
  const { search, page = 1, limit = 20 } = filters;

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { slug: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [brands, total] = await Promise.all([
    prisma.brand.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
      include: { _count: { select: { products: true } } },
    }),
    prisma.brand.count({ where }),
  ]);

  return {
    brands,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };
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
