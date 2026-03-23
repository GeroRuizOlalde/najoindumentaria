import { prisma } from "@/lib/prisma";
import type { ProductStatus } from "@/generated/prisma/client";

interface ProductFilters {
  brandId?: string;
  categoryId?: string;
  status?: ProductStatus;
  featured?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getProducts(filters: ProductFilters = {}) {
  const { brandId, categoryId, status, featured, search, page = 1, limit = 12 } = filters;

  const where = {
    ...(brandId && { brandId }),
    ...(categoryId && { categoryId }),
    ...(status && { status }),
    ...(featured !== undefined && { featured }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { brand: { name: { contains: search, mode: "insensitive" as const } } },
      ],
    }),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        brand: { select: { name: true, slug: true } },
        category: { select: { name: true, slug: true } },
        sizes: { select: { sizeLabel: true, isAvailable: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      brand: true,
      category: true,
      sizes: { orderBy: { sizeLabel: "asc" } },
    },
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      brand: { select: { name: true, slug: true } },
      category: { select: { name: true, slug: true } },
      sizes: { orderBy: { sizeLabel: "asc" } },
    },
  });
}

export async function getFeaturedProducts(limit = 8) {
  return prisma.product.findMany({
    where: { status: "ACTIVE", featured: true },
    take: limit,
    orderBy: { sortOrder: "asc" },
    include: {
      brand: { select: { name: true, slug: true } },
      sizes: { where: { isAvailable: true }, select: { sizeLabel: true } },
    },
  });
}

export async function getRelatedProducts(
  productId: string,
  categoryId: string,
  limit = 4
) {
  return prisma.product.findMany({
    where: {
      id: { not: productId },
      categoryId,
      status: "ACTIVE",
    },
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      brand: { select: { name: true, slug: true } },
      sizes: { where: { isAvailable: true }, select: { sizeLabel: true } },
    },
  });
}

export async function getNewProducts(limit = 8) {
  return prisma.product.findMany({
    where: { status: "ACTIVE" },
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      brand: { select: { name: true, slug: true } },
      sizes: { where: { isAvailable: true }, select: { sizeLabel: true } },
    },
  });
}
