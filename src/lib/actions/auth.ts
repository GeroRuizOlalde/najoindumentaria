"use server";

import { redirect } from "next/navigation";
import { signIn, signOut } from "@/lib/auth";
import { AuthError } from "next-auth";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createCustomerSession } from "@/lib/customer-auth";

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = ((formData.get("email") as string) || "").trim().toLowerCase();
  const password = (formData.get("password") as string) || "";

  if (!email || !password) {
    return { error: "Email y contraseña son obligatorios." };
  }

  // Verificar si es admin
  const adminUser = await prisma.user.findUnique({ where: { email } });

  if (adminUser) {
    if (!adminUser.active) {
      return { error: "Tu cuenta está desactivada." };
    }

    try {
      await signIn("credentials", { email, password, redirect: false });
    } catch (error) {
      if (error instanceof AuthError) {
        return { error: "Email o contraseña incorrectos." };
      }
      throw error;
    }

    redirect("/admin");
  }

  // Verificar si es cliente
  const customer = await prisma.customer.findUnique({ where: { email } });

  if (!customer || !customer.password) {
    return { error: "Email o contraseña incorrectos." };
  }

  const valid = await compare(password, customer.password);
  if (!valid) {
    return { error: "Email o contraseña incorrectos." };
  }

  await createCustomerSession(customer.id);
  redirect("/cuenta");
}

export async function logoutAdminAction() {
  await signOut({ redirect: false });
  redirect("/login");
}
