export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://najoindumentaria.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, brands] = await Promise.all([
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      select: { slug: true, updatedAt: true },
    }),
    prisma.category.findMany({
      where: { active: true },
      select: { slug: true },
    }),
    prisma.brand.findMany({
      where: { active: true },
      select: { slug: true },
    }),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/como-comprar`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/nosotros`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/contacto`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/faq`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/politicas`, changeFrequency: "monthly", priority: 0.3 },
  ];

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE_URL}/producto/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${BASE_URL}/shop/categoria/${c.slug}`,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  const brandPages: MetadataRoute.Sitemap = brands.map((b) => ({
    url: `${BASE_URL}/shop/marca/${b.slug}`,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return [...staticPages, ...productPages, ...categoryPages, ...brandPages];
}
