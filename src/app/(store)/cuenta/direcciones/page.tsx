import { getCustomerFromSession } from "@/lib/customer-auth";
import { redirect } from "next/navigation";
import { AddressForm } from "@/components/store/address-form";
import { AddressCard } from "@/components/store/address-card";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function AddressesPage() {
  const customer = await getCustomerFromSession();
  if (!customer) redirect("/login-cliente");

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Link
        href="/cuenta"
        className="text-xs text-gray-text flex items-center gap-1 mb-4 hover:text-black transition-colors"
      >
        <ChevronLeft className="h-3 w-3" />
        Volver a mi cuenta
      </Link>

      <h1 className="font-heading text-2xl font-semibold mb-8">
        Mis direcciones
      </h1>

      {customer.addresses.length > 0 && (
        <div className="space-y-3 mb-8">
          {customer.addresses.map((address) => (
            <AddressCard key={address.id} address={address} />
          ))}
        </div>
      )}

      <div className="border border-border bg-white p-6">
        <h2 className="text-sm font-medium mb-4">Agregar dirección</h2>
        <AddressForm />
      </div>
    </div>
  );
}
