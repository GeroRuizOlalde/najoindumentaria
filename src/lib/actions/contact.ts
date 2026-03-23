"use server";

type ContactResult = { success?: boolean; error?: string };

export async function sendContactMessage(
  _prev: ContactResult,
  formData: FormData
): Promise<ContactResult> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const message = formData.get("message") as string;

  if (!name || !email || !message) {
    return { error: "Completá todos los campos." };
  }

  // TODO: Send email via Resend
  return { success: true };
}
