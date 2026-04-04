"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { settingsUpdateSchema } from "@/lib/validations/settings";
import { getAdminActionSession } from "@/lib/admin-permissions";

export async function updateSettings(
  _prev: { success: boolean; error?: string },
  formData: FormData
) {
  const session = await getAdminActionSession("settings.manage");
  if (!session) return { success: false, error: "No autorizado." };

  const group = (formData.get("group") as string) || "general";
  const entries: Record<string, string> = {};

  for (const [key, value] of formData.entries()) {
    if (key.startsWith("setting_")) {
      entries[key.replace("setting_", "")] = value as string;
    }
  }

  const parsed = settingsUpdateSchema.safeParse(entries);
  if (!parsed.success) {
    return { success: false, error: "Datos invalidos." };
  }

  await Promise.all(
    Object.entries(parsed.data).map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key },
        update: { value, group: resolveGroupForKey(key, group) },
        create: {
          key,
          value,
          group: resolveGroupForKey(key, group),
        },
      })
    )
  );

  revalidatePath("/admin/configuracion");
  revalidatePath("/admin/contenido");
  revalidatePath("/");
  revalidatePath("/faq");
  revalidatePath("/nosotros");
  revalidatePath("/politicas");
  revalidatePath("/contacto");

  return { success: true };
}

function resolveGroupForKey(key: string, fallbackGroup: string) {
  if (key.startsWith("bank_")) return "bank";
  if (key.startsWith("company_")) return "company";
  if (key.startsWith("email_")) return "email";
  if (key.startsWith("content_")) return "content";
  if (key.includes("_url") || key === "whatsapp_number") return "social";
  return fallbackGroup;
}
