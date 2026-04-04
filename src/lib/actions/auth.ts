"use server";

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
  const password = (formData.get("password") as string) || "";

  if (!email || !password) {
    return { error: "Email y contraseña son obligatorios." };
  }

  const result = await signIn("credentials", {
    email,
    password,
    redirect: false,
    redirectTo: "/admin",
  });

  const resultUrl = new URL(result, "http://localhost:3000");
  const authError = resultUrl.searchParams.get("error");

  if (authError === "CredentialsSignin") {
    return { error: "Email o contraseña incorrectos." };
  }

  if (authError) {
    return { error: "Error al iniciar sesión." };
  }

  redirect("/admin");
}
