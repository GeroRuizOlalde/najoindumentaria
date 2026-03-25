import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "customer_session";
const SECRET = new TextEncoder().encode(
  process.env.CUSTOMER_JWT_SECRET || process.env.NEXTAUTH_SECRET || "fallback-secret-change-me"
);

interface CustomerSession {
  customerId: string;
}

export async function createCustomerSession(customerId: string) {
  const token = await new SignJWT({ customerId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(SECRET);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: "/",
  });
}

export async function getCustomerSession(): Promise<CustomerSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET);
    return { customerId: payload.customerId as string };
  } catch {
    return null;
  }
}

export async function getCustomerFromSession() {
  const session = await getCustomerSession();
  if (!session) return null;

  return prisma.customer.findUnique({
    where: { id: session.customerId },
    include: {
      addresses: { orderBy: { isDefault: "desc" } },
    },
  });
}

export async function destroyCustomerSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
