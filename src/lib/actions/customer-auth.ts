"use server";

import { prisma } from "@/lib/prisma";
import { hash, compare } from "bcryptjs";
import { createCustomerSession, destroyCustomerSession } from "@/lib/customer-auth";
import { redirect } from "next/navigation";
import { z } from "zod";

export type AuthResult = {
  success?: boolean;
  error?: string;
  errors?: Record<string, string>;
};

const registerSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(8, "Teléfono inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  province: z.string().min(1, "Seleccioná una provincia"),
  city: z.string().min(1, "La ciudad es obligatoria"),
});

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export async function registerCustomer(
  _prev: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    province: formData.get("province"),
    city: formData.get("city"),
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0]?.toString();
      if (field) fieldErrors[field] = issue.message;
    }
    return { errors: fieldErrors };
  }

  const data = parsed.data;

  try {
    const existing = await prisma.customer.findUnique({
      where: { email: data.email },
    });

    if (existing?.password) {
      return { error: "Ya existe una cuenta con este email. Iniciá sesión." };
    }

    const hashedPassword = await hash(data.password, 12);

    const customer = existing
      ? await prisma.customer.update({
          where: { email: data.email },
          data: { password: hashedPassword, name: data.name, phone: data.phone },
        })
      : await prisma.customer.create({
          data: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            password: hashedPassword,
            province: data.province,
            city: data.city,
          },
        });

    await createCustomerSession(customer.id);
  } catch {
    return { error: "Error al crear la cuenta. Intentá de nuevo." };
  }

  redirect("/cuenta");
}

export async function loginCustomer(
  _prev: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0]?.toString();
      if (field) fieldErrors[field] = issue.message;
    }
    return { errors: fieldErrors };
  }

  const data = parsed.data;

  try {
    const customer = await prisma.customer.findUnique({
      where: { email: data.email },
    });

    if (!customer || !customer.password) {
      return { error: "Email o contraseña incorrectos." };
    }

    const valid = await compare(data.password, customer.password);
    if (!valid) {
      return { error: "Email o contraseña incorrectos." };
    }

    await createCustomerSession(customer.id);
  } catch {
    return { error: "Error al iniciar sesión. Intentá de nuevo." };
  }

  redirect("/cuenta");
}

export async function logoutCustomer() {
  await destroyCustomerSession();
  redirect("/");
}
