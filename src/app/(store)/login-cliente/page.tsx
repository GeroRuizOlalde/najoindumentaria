import { getCustomerFromSession } from "@/lib/customer-auth";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/store/login-form";

export default async function LoginClientePage() {
  const customer = await getCustomerFromSession();
  if (customer) redirect("/cuenta");

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <h1 className="font-heading text-2xl font-semibold text-center mb-2">
          Iniciar sesión
        </h1>
        <p className="text-sm text-gray-text text-center mb-8">
          Accedé a tu cuenta para ver tus pedidos y direcciones.
        </p>
        <LoginForm />
        <p className="text-xs text-gray-text text-center mt-6">
          ¿No tenés cuenta?{" "}
          <a href="/registro" className="text-black underline">
            Registrate
          </a>
        </p>
      </div>
    </div>
  );
}
