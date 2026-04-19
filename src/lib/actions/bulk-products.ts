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
  createdWithoutImages: string[];
  failed: { name: string; reason: string }[];
}

function extractDriveFileId(url: string): string | null {
  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([^/?#]+)/);
  if (fileMatch) return fileMatch[1];
  const openMatch = url.match(/drive\.google\.com\/open\?id=([^&]+)/);
  if (openMatch) return openMatch[1];
  const ucMatch = url.match(/drive\.google\.com\/uc\?[^#]*id=([^&]+)/);
  if (ucMatch) return ucMatch[1];
  return null;
}

function buildCandidateUrls(url: string): string[] {
  const trimmed = url.trim();
  const driveId = extractDriveFileId(trimmed);
  if (driveId) {
    return [
      `https://lh3.googleusercontent.com/d/${driveId}=s2048`,
      `https://drive.usercontent.google.com/download?id=${driveId}&export=view`,
      `https://drive.google.com/uc?export=view&id=${driveId}`,
    ];
  }
  return [trimmed];
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
    if (!rawUrl || !rawUrl.trim()) continue;
    const candidates = buildCandidateUrls(rawUrl);
    for (const candidate of candidates) {
      try {
        const result = await cloudinary.uploader.upload(candidate, {
          folder: "najo/productos",
          resource_type: "image",
        });
        uploaded.push(result.secure_url);
        break;
      } catch {
        // probamos el próximo formato
      }
    }
  }
  return uploaded;
}

async function createSingle(
  draft: BulkDraftInput
): Promise<{ uploadedImageCount: number }> {
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

  return { uploadedImageCount: images.length };
}

export async function bulkCreateProducts(
  drafts: BulkDraftInput[]
): Promise<BulkResult> {
  const session = await auth();
  if (!session?.user || !isSuperSuperAdminEmail(session.user.email)) {
    return {
      created: [],
      createdWithoutImages: [],
      failed: drafts.map((d) => ({ name: d.name, reason: "No autorizado" })),
    };
  }

  const result: BulkResult = {
    created: [],
    createdWithoutImages: [],
    failed: [],
  };

  for (const draft of drafts) {
    try {
      const { uploadedImageCount } = await createSingle(draft);
      result.created.push(draft.name);
      if (uploadedImageCount === 0) {
        result.createdWithoutImages.push(draft.name);
      }
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
