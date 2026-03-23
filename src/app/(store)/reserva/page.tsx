import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/queries/settings";
import { formatPriceFromDecimal } from "@/lib/utils";
import { ReservationClient } from "@/components/store/reservation-client";

interface Props {
  searchParams: Promise<{
    producto?: string;
    talle?: string;
    slug?: string;
  }>;
}

export default async function ReservaPage({ searchParams }: Props) {
  const params = await searchParams;
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

  const { map: settings } = await getSettings();

  const bankDetails = {
    bankName: settings.bank_name,
    holder: settings.bank_holder,
    cbu: settings.bank_cbu,
    alias: settings.bank_alias,
    accountType: settings.bank_account_type,
    instructions: settings.bank_instructions,
  };

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
      />
    </div>
  );
}
