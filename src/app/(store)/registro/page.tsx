import { getCustomerFromSession } from "@/lib/customer-auth";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/store/register-form";

export default async function RegisterPage() {
  const customer = await getCustomerFromSession();
  if (customer) redirect("/cuenta");

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <h1 className="font-heading text-2xl font-semibold text-center mb-2">
          Crear cuenta
        </h1>
        <p className="text-sm text-gray-text text-center mb-8">
          Registrate para guardar tus direcciones y hacer reservas más rápido.
        </p>
        <RegisterForm />
        <p className="text-xs text-gray-text text-center mt-6">
          ¿Ya tenés cuenta?{" "}
          <a href="/login-cliente" className="text-black underline">
            Iniciá sesión
          </a>
        </p>
      </div>
    </div>
  );
}
