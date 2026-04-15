import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashSync } from "bcryptjs";

// Temporary endpoint - DELETE after use
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== "najo-setup-2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.upsert({
      where: { email: "studiosnajo@gmail.com" },
      update: {
        role: "SUPER_ADMIN",
        active: true,
      },
      create: {
        name: "Studios Najo",
        email: "studiosnajo@gmail.com",
        password: hashSync("Najo2026", 12),
        role: "SUPER_ADMIN",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Super admin created/updated: ${user.email}`,
      role: user.role,
    });
  } catch (error) {
    console.error("Error creating admin:", error);
    return NextResponse.json(
      { error: "Failed to create admin" },
      { status: 500 }
    );
  }
}
