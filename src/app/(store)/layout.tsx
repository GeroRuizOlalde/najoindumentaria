export const dynamic = "force-dynamic";

import { getActiveCategories } from "@/lib/queries/categories";
import { getActiveBrands } from "@/lib/queries/brands";
import { getSettings } from "@/lib/queries/settings";
import { Navbar } from "@/components/store/navbar";
import { getCustomerSession } from "@/lib/customer-auth";
import { CartProvider } from "@/components/store/cart-provider";
import { Footer } from "@/components/store/footer";
import { WhatsAppButton } from "@/components/store/whatsapp-button";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [categories, brands, { map: settings }, customerSession] = await Promise.all([
    getActiveCategories(),
    getActiveBrands(),
    getSettings(),
    getCustomerSession(),
  ]);

  const navCategories = categories.map((c) => ({
    name: c.name,
    slug: c.slug,
  }));
  const navBrands = brands.map((b) => ({ name: b.name, slug: b.slug }));

  return (
    <CartProvider>
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar categories={navCategories} brands={navBrands} isLoggedIn={!!customerSession} />
      <main className="flex-1">{children}</main>
      <Footer
        instagramUrl={settings.instagram_url}
        tiktokUrl={settings.tiktok_url}
        whatsappNumber={settings.whatsapp_number}
        companyEmail={settings.company_email}
      />
      {settings.whatsapp_number && (
        <WhatsAppButton phoneNumber={settings.whatsapp_number} />
      )}
    </div>
    </CartProvider>
  );
}
