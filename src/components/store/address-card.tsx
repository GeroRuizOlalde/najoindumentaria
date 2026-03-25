"use client";

import { useTransition } from "react";
import { deleteAddress, setDefaultAddress } from "@/lib/actions/customer-addresses";
import { MapPin, Trash2, Star } from "lucide-react";

interface AddressCardProps {
  address: {
    id: string;
    label: string;
    address: string;
    city: string;
    province: string;
    zipCode: string | null;
    isDefault: boolean;
  };
}

export function AddressCard({ address }: AddressCardProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(() => { deleteAddress(address.id); });
  };

  const handleSetDefault = () => {
    startTransition(() => { setDefaultAddress(address.id); });
  };

  return (
    <div className={`border bg-white p-4 flex items-start justify-between ${address.isDefault ? "border-black" : "border-border"}`}>
      <div className="flex gap-3">
        <MapPin className="h-4 w-4 text-gray-text mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium flex items-center gap-2">
            {address.label}
            {address.isDefault && (
              <span className="text-[10px] bg-black text-white px-1.5 py-0.5 uppercase tracking-wider">
                Por defecto
              </span>
            )}
          </p>
          <p className="text-xs text-gray-text mt-0.5">
            {address.address}, {address.city}, {address.province}
            {address.zipCode && ` (${address.zipCode})`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {!address.isDefault && (
          <button
            onClick={handleSetDefault}
            disabled={isPending}
            title="Hacer por defecto"
            className="text-gray-text hover:text-black transition-colors disabled:opacity-50"
          >
            <Star className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={handleDelete}
          disabled={isPending}
          title="Eliminar"
          className="text-gray-text hover:text-error transition-colors disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
