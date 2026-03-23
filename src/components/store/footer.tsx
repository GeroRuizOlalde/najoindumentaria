import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Instagram } from "lucide-react";

interface FooterProps {
  instagramUrl?: string;
  tiktokUrl?: string;
  whatsappNumber?: string;
  companyEmail?: string;
}

export function Footer({
  instagramUrl,
  tiktokUrl,
  whatsappNumber,
  companyEmail,
}: FooterProps) {
  return (
    <footer className="bg-black text-white mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Logo variant="light" href="/" />
            <p className="mt-4 text-sm text-gray-light leading-relaxed">
              Indumentaria y zapatillas streetwear premium. Estilo urbano con
              actitud.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wider mb-4">
              Tienda
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/shop"
                  className="text-sm text-gray-light hover:text-white transition-colors"
                >
                  Catálogo
                </Link>
              </li>
              <li>
                <Link
                  href="/como-comprar"
                  className="text-sm text-gray-light hover:text-white transition-colors"
                >
                  Cómo comprar
                </Link>
              </li>
              <li>
                <Link
                  href="/seguimiento"
                  className="text-sm text-gray-light hover:text-white transition-colors"
                >
                  Seguimiento de pedido
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-sm text-gray-light hover:text-white transition-colors"
                >
                  Preguntas frecuentes
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wider mb-4">
              Empresa
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/nosotros"
                  className="text-sm text-gray-light hover:text-white transition-colors"
                >
                  Nosotros
                </Link>
              </li>
              <li>
                <Link
                  href="/contacto"
                  className="text-sm text-gray-light hover:text-white transition-colors"
                >
                  Contacto
                </Link>
              </li>
              <li>
                <Link
                  href="/politicas"
                  className="text-sm text-gray-light hover:text-white transition-colors"
                >
                  Políticas
                </Link>
              </li>
            </ul>
          </div>

          {/* Social / Contact */}
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wider mb-4">
              Conectá
            </h3>
            <div className="flex items-center gap-3">
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center border border-white/20 text-gray-light hover:text-white hover:border-white/50 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {tiktokUrl && (
                <a
                  href={tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center border border-white/20 text-gray-light hover:text-white hover:border-white/50 transition-colors"
                  aria-label="TikTok"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.76a8.28 8.28 0 004.76 1.5v-3.4a4.85 4.85 0 01-1-.17z" />
                  </svg>
                </a>
              )}
            </div>
            {companyEmail && (
              <a
                href={`mailto:${companyEmail}`}
                className="mt-4 block text-sm text-gray-light hover:text-white transition-colors"
              >
                {companyEmail}
              </a>
            )}
            {whatsappNumber && (
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block text-sm text-gray-light hover:text-white transition-colors"
              >
                WhatsApp
              </a>
            )}
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 text-center">
          <p className="text-xs text-gray-light">
            © {new Date().getFullYear()} Najo Indumentaria. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
