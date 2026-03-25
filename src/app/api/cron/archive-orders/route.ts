import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_ARCHIVE_DAYS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get configurable archive days from settings
  const setting = await prisma.siteSetting.findUnique({
    where: { key: "archive_days_after_completion" },
  });
  const archiveDays = setting ? parseInt(setting.value) || DEFAULT_ARCHIVE_DAYS : DEFAULT_ARCHIVE_DAYS;

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - archiveDays);

  const result = await prisma.order.updateMany({
    where: {
      status: { in: ["DELIVERED", "CANCELLED", "EXPIRED"] },
      archivedAt: null,
      updatedAt: { lte: cutoffDate },
    },
    data: { archivedAt: new Date() },
  });

  return NextResponse.json({
    ok: true,
    archived: result.count,
    archiveDays,
    timestamp: new Date().toISOString(),
  });
}
