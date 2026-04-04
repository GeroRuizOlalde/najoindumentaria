"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/lib/auth";

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = ((formData.get("email") as string) || "").trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email y contraseña son obligatorios." };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/admin",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return { error: "Email o contraseña incorrectos." };
      }

      return { error: "Error al iniciar sesión." };
    }

    throw error;
  }

  redirect("/admin");
}
