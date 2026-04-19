"use server";

import { v2 as cloudinary } from "cloudinary";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isSuperSuperAdminEmail } from "@/lib/admin-permissions";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/utils";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface BulkDraftInput {
  name: string;
  slug: string;
  brandId: string;
  categoryId: string;
  price: number;
  compareAtPrice: number | null;
  description: string;
  shortDescription: string | null;
  images: string[];
  sizes: {
    sizeLabel: string;
    isAvailable: boolean;
    stock: number;
  }[];
}

export interface BulkResult {
  created: string[];
  failed: { name: string; reason: string }[];
}

function normalizeDriveUrl(url: string): string {
  const match = url.match(/drive\.google\.com\/file\/d\/([^/?#]+)/);
  if (match) {
    return `https://drive.google.com/uc?export=download&id=${match[1]}`;
  }
  const openMatch = url.match(/drive\.google\.com\/open\?id=([^&]+)/);
  if (openMatch) {
    return `https://drive.google.com/uc?export=download&id=${openMatch[1]}`;
  }
  return url;
}

async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  const safeBase = baseSlug && baseSlug.length > 0 ? baseSlug : "producto";
  let slug = safeBase;
  let counter = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${safeBase}-${counter}`;
    counter += 1;
  }
  return slug;
}

async function uploadImages(urls: string[]): Promise<string[]> {
  const uploaded: string[] = [];
  for (const rawUrl of urls) {
    const trimmed = rawUrl.trim();
    if (!trimmed) continue;
    const url = normalizeDriveUrl(trimmed);
    try {
      const result = await cloudinary.uploader.upload(url, {
        folder: "najo/productos",
        resource_type: "image",
      });
      uploaded.push(result.secure_url);
    } catch {
      // URL inaccesible o no soportada por Cloudinary — seguimos con las demás
    }
  }
  return uploaded;
}

async function createSingle(draft: BulkDraftInput): Promise<void> {
  if (!draft.brandId) throw new Error("Marca no matcheada con admin");
  if (!draft.categoryId) throw new Error("Categoría no matcheada con admin");
  if (!draft.price || draft.price <= 0) throw new Error("Precio inválido");

  const validSizes = draft.sizes
    .filter((s) => s.sizeLabel && s.sizeLabel.trim().length > 0)
    .map((s) => ({
      sizeLabel: s.sizeLabel.trim().toUpperCase(),
      stock: Math.max(0, Math.floor(s.stock)),
      isAvailable: s.stock > 0,
    }));

  if (validSizes.length === 0) throw new Error("Sin talles");

  const images = await uploadImages(draft.images);
  if (images.length === 0) {
    throw new Error(
      "No se pudo subir ninguna imagen (verificá que las URLs sean públicas)"
    );
  }

  const description =
    draft.description && draft.description.trim().length >= 10
      ? draft.description.trim()
      : `${draft.name}. Disponible en talles ${validSizes
          .map((s) => s.sizeLabel)
          .join(", ")}. Consultanos por disponibilidad.`;

  const slug = await ensureUniqueSlug(
    draft.slug && draft.slug.length > 0 ? draft.slug : slugify(draft.name)
  );

  await prisma.product.create({
    data: {
      name: draft.name.trim(),
      slug,
      brandId: draft.brandId,
      categoryId: draft.categoryId,
      price: draft.price,
      compareAtPrice: draft.compareAtPrice,
      description,
      shortDescription:
        draft.shortDescription && draft.shortDescription.trim().length > 0
          ? draft.shortDescription.trim().slice(0, 300)
          : null,
      images,
      status: "DRAFT",
      featured: false,
      sortOrder: 0,
      sizes: {
        create: validSizes,
      },
    },
  });
}

export async function bulkCreateProducts(
  drafts: BulkDraftInput[]
): Promise<BulkResult> {
  const session = await auth();
  if (!session?.user || !isSuperSuperAdminEmail(session.user.email)) {
    return {
      created: [],
      failed: drafts.map((d) => ({ name: d.name, reason: "No autorizado" })),
    };
  }

  const result: BulkResult = { created: [], failed: [] };

  for (const draft of drafts) {
    try {
      await createSingle(draft);
      result.created.push(draft.name);
    } catch (err) {
      result.failed.push({
        name: draft.name,
        reason: err instanceof Error ? err.message : "Error desconocido",
      });
    }
  }

  if (result.created.length > 0) {
    revalidatePath("/admin/productos");
    revalidatePath("/shop");
  }

  return result;
}
