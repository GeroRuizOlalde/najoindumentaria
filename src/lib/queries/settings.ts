import { prisma } from "@/lib/prisma";

export async function getSettings() {
  const settings = await prisma.siteSetting.findMany({
    orderBy: [{ group: "asc" }, { key: "asc" }],
  });

  const map: Record<string, string> = {};
  for (const s of settings) {
    map[s.key] = s.value;
  }

  return { settings, map };
}

export async function getSetting(key: string) {
  const setting = await prisma.siteSetting.findUnique({ where: { key } });
  return setting?.value ?? null;
}

export async function getSettingsByGroup(group: string) {
  return prisma.siteSetting.findMany({
    where: { group },
    orderBy: { key: "asc" },
  });
}
