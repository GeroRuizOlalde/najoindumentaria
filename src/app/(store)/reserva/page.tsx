import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/queries/settings";
import { formatPriceFromDecimal } from "@/lib/utils";
import { ReservationClient } from "@/components/store/reservation-client";
import { CartReservationClient } from "@/components/store/cart-reservation-client";
import { getCustomerFromSession } from "@/lib/customer-auth";

interface Props {
  searchParams: Promise<{
    producto?: string;
    talle?: string;
    slug?: string;
    from?: string;
  }>;
}

export default async function ReservaPage({ searchParams }: Props) {
  const params = await searchParams;

  const [{ map: settings }, loggedCustomer] = await Promise.all([
    getSettings(),
    getCustomerFromSession(),
  ]);

  const customerData = loggedCustomer
    ? {
        name: loggedCustomer.name,
        email: loggedCustomer.email,
        phone: loggedCustomer.phone,
        province: loggedCustomer.province,
        city: loggedCustomer.city,
        defaultAddress: loggedCustomer.addresses.find((a) => a.isDefault)
          ? `${loggedCustomer.addresses.find((a) => a.isDefault)!.address}, ${loggedCustomer.addresses.find((a) => a.isDefault)!.city}`
          : undefined,
      }
    : null;

  const bankDetails = {
    bankName: settings.bank_name,
    holder: settings.bank_holder,
    cbu: settings.bank_cbu,
    alias: settings.bank_alias,
    accountType: settings.bank_account_type,
    instructions: settings.bank_instructions,
  };

  // Cart checkout mode
  if (params.from === "cart") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 lg:px-8">
        <CartReservationClient
          bankDetails={bankDetails}
          whatsappNumber={settings.whatsapp_number}
          customer={customerData}
        />
      </div>
    );
  }

  // Single product checkout (legacy)
  const { producto: productId, talle: sizeId } = params;
  if (!productId || !sizeId) notFound();

  const size = await prisma.productSize.findUnique({
    where: { id: sizeId },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          images: true,
          brand: { select: { name: true } },
        },
      },
    },
  });

  if (!size || size.productId !== productId) notFound();
  if (!size.isAvailable || size.stock <= 0) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 lg:px-8">
      <ReservationClient
        productId={size.product.id}
        productName={size.product.name}
        productSlug={size.product.slug}
        brandName={size.product.brand.name}
        sizeId={size.id}
        sizeLabel={size.sizeLabel}
        price={formatPriceFromDecimal(Number(size.product.price))}
        bankDetails={bankDetails}
        whatsappNumber={settings.whatsapp_number}
        customer={customerData}
      />
    </div>
  );
}
