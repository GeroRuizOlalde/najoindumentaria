import { SignJWT, jwtVerify } from "jose";

const TRACKING_TOKEN_TTL = "30d";

interface OrderTrackingPayload {
  orderId: string;
  email: string;
}

function getTrackingSecret() {
  const secret = process.env.TRACKING_TOKEN_SECRET || process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error(
      "Missing TRACKING_TOKEN_SECRET or AUTH_SECRET for order tracking tokens."
    );
  }

  return new TextEncoder().encode(secret);
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function createOrderTrackingToken(payload: OrderTrackingPayload) {
  return new SignJWT({
    orderId: payload.orderId,
    email: normalizeEmail(payload.email),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(TRACKING_TOKEN_TTL)
    .sign(getTrackingSecret());
}

export async function verifyOrderTrackingToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getTrackingSecret());

    return {
      orderId: String(payload.orderId),
      email: normalizeEmail(String(payload.email)),
    };
  } catch {
    return null;
  }
}
