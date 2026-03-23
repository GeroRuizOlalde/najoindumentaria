"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { settingsUpdateSchema } from "@/lib/validations/settings";

export async function updateSettings(
  _prev: { success: boolean; error?: string },
  formData: FormData
) {
  const entries: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("setting_")) {
      entries[key.replace("setting_", "")] = value as string;
    }
  }

  const parsed = settingsUpdateSchema.safeParse(entries);
  if (!parsed.success) {
    return { success: false, error: "Datos inválidos" };
  }

  const updates = Object.entries(parsed.data).map(([key, value]) =>
    prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value, group: getGroupForKey(key) },
    })
  );

  await Promise.all(updates);

  revalidatePath("/admin/configuracion");
  return { success: true };
}

function getGroupForKey(key: string): string {
  if (key.startsWith("bank_")) return "bank";
  if (key.startsWith("company_")) return "company";
  if (key.startsWith("email_")) return "email";
  if (key.includes("_url") || key === "whatsapp_number") return "social";
  return "general";
}
