import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashSync } from "bcryptjs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // ─── Admin User ────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: "admin@najoindumentaria.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@najoindumentaria.com",
      password: hashSync("admin123", 12),
      role: "SUPER_ADMIN",
    },
  });
  console.log(`  Admin user: ${admin.email}`);

  // ─── Brands ────────────────────────────────────────────
  const brandsData = [
    { name: "Nike", slug: "nike", sortOrder: 1 },
    { name: "Adidas", slug: "adidas", sortOrder: 2 },
    { name: "Jordan", slug: "jordan", sortOrder: 3 },
    { name: "New Balance", slug: "new-balance", sortOrder: 4 },
    { name: "Puma", slug: "puma", sortOrder: 5 },
    { name: "Converse", slug: "converse", sortOrder: 6 },
  ];

  const brands: Record<string, string> = {};
  for (const brand of brandsData) {
    const created = await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {},
      create: brand,
    });
    brands[brand.slug] = created.id;
  }
  console.log(`  Brands: ${Object.keys(brands).length} created`);

  // ─── Categories ────────────────────────────────────────
  const categoriesData = [
    { name: "Zapatillas", slug: "zapatillas", sortOrder: 1 },
    { name: "Remeras", slug: "remeras", sortOrder: 2 },
    { name: "Buzos", slug: "buzos", sortOrder: 3 },
    { name: "Pantalones", slug: "pantalones", sortOrder: 4 },
    { name: "Camperas", slug: "camperas", sortOrder: 5 },
    { name: "Accesorios", slug: "accesorios", sortOrder: 6 },
  ];

  const categories: Record<string, string> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categories[cat.slug] = created.id;
  }
  console.log(`  Categories: ${Object.keys(categories).length} created`);

  // ─── Products ──────────────────────────────────────────
  const productsData = [
    {
      name: "Air Force 1 '07 Triple White",
      slug: "nike-air-force-1-07-triple-white",
      brandSlug: "nike",
      categorySlug: "zapatillas",
      price: 89990,
      description:
        "Zapatilla clásica de cuero con suela Air visible, diseño atemporal y silueta low-top. El icónico Air Force 1 en su versión más limpia.",
      shortDescription: "Zapatilla clásica Nike Air Force 1 en blanco total.",
      status: "ACTIVE" as const,
      featured: true,
      sizes: ["38", "39", "40", "41", "42", "43", "44"],
    },
    {
      name: "Ultraboost 22",
      slug: "adidas-ultraboost-22",
      brandSlug: "adidas",
      categorySlug: "zapatillas",
      price: 109990,
      description:
        "La Ultraboost 22 combina la tecnología Boost con un upper Primeknit para la máxima comodidad y rendimiento. Ideal para correr o para el día a día.",
      shortDescription: "Running premium con tecnología Boost.",
      status: "ACTIVE" as const,
      featured: true,
      sizes: ["39", "40", "41", "42", "43"],
    },
    {
      name: "Air Jordan 1 Retro High OG",
      slug: "jordan-1-retro-high-og",
      brandSlug: "jordan",
      categorySlug: "zapatillas",
      price: 149990,
      description:
        "El Jordan 1 Retro High OG es una de las zapatillas más icónicas de la historia del streetwear. Cuero premium, colorway clásico y silueta high-top que nunca pasa de moda.",
      shortDescription: "El ícono del streetwear en su versión OG.",
      status: "ACTIVE" as const,
      featured: true,
      sizes: ["40", "41", "42", "43", "44"],
    },
    {
      name: "574 Classic",
      slug: "new-balance-574-classic",
      brandSlug: "new-balance",
      categorySlug: "zapatillas",
      price: 79990,
      description:
        "La New Balance 574 es sinónimo de estilo casual y comodidad. Gamuza y mesh con amortiguación ENCAP para un look retro que funciona todos los días.",
      shortDescription: "El clásico retro de New Balance.",
      status: "ACTIVE" as const,
      featured: false,
      sizes: ["38", "39", "40", "41", "42", "43"],
    },
    {
      name: "Tech Fleece Hoodie",
      slug: "nike-tech-fleece-hoodie",
      brandSlug: "nike",
      categorySlug: "buzos",
      price: 69990,
      description:
        "El buzo Tech Fleece de Nike combina calidez y ligereza con un diseño moderno. Tela de doble capa con bolsillos zippeados y capucha ajustable.",
      shortDescription: "Buzo liviano y cálido con tecnología Tech Fleece.",
      status: "ACTIVE" as const,
      featured: true,
      sizes: ["S", "M", "L", "XL"],
    },
    {
      name: "Trefoil Essentials Tee",
      slug: "adidas-trefoil-essentials-tee",
      brandSlug: "adidas",
      categorySlug: "remeras",
      price: 29990,
      description:
        "Remera esencial de algodón con el icónico logo Trefoil de Adidas. Corte regular, tela suave y diseño limpio para el día a día.",
      shortDescription: "Remera de algodón con logo Trefoil clásico.",
      status: "ACTIVE" as const,
      featured: false,
      sizes: ["S", "M", "L", "XL", "XXL"],
    },
    {
      name: "Jumpman Essential Jogger",
      slug: "jordan-jumpman-essential-jogger",
      brandSlug: "jordan",
      categorySlug: "pantalones",
      price: 54990,
      description:
        "Pantalón jogger de french terry con logo Jumpman bordado. Puños elásticos, cintura con cordón ajustable y bolsillos laterales.",
      shortDescription: "Jogger cómodo con estilo Jordan.",
      status: "ACTIVE" as const,
      featured: false,
      sizes: ["S", "M", "L", "XL"],
    },
    {
      name: "Suede Classic XXI",
      slug: "puma-suede-classic-xxi",
      brandSlug: "puma",
      categorySlug: "zapatillas",
      price: 64990,
      description:
        "La Puma Suede Classic es un ícono del street style desde los 60s. Upper de gamuza premium con la formstrip clásica y suela de goma.",
      shortDescription: "El clásico de gamuza de Puma reinventado.",
      status: "ACTIVE" as const,
      featured: false,
      sizes: ["39", "40", "41", "42", "43", "44"],
    },
    {
      name: "Chuck Taylor All Star",
      slug: "converse-chuck-taylor-all-star",
      brandSlug: "converse",
      categorySlug: "zapatillas",
      price: 49990,
      description:
        "Las Converse Chuck Taylor All Star son un básico absoluto. Canvas duradero, puntera de goma y la silueta que definió generaciones enteras.",
      shortDescription: "El básico absoluto del streetwear.",
      status: "ACTIVE" as const,
      featured: false,
      sizes: ["36", "37", "38", "39", "40", "41", "42", "43", "44"],
    },
    {
      name: "Windrunner Jacket",
      slug: "nike-windrunner-jacket",
      brandSlug: "nike",
      categorySlug: "camperas",
      price: 79990,
      description:
        "La campera Windrunner de Nike es un clásico cortaviento con diseño chevron icónico. Capucha ajustable, cierre completo y bolsillos laterales.",
      shortDescription: "Campera cortaviento icónica de Nike.",
      status: "ACTIVE" as const,
      featured: true,
      sizes: ["S", "M", "L", "XL"],
    },
  ];

  for (const product of productsData) {
    const { sizes, brandSlug, categorySlug, ...productData } = product;
    const created = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        ...productData,
        price: productData.price / 100,
        brandId: brands[brandSlug],
        categoryId: categories[categorySlug],
        images: [],
        sizes: {
          create: sizes.map((size) => ({
            sizeLabel: size,
            isAvailable: true,
            stock: 1,
          })),
        },
      },
    });
    console.log(`  Product: ${created.name}`);
  }

  // ─── Site Settings ─────────────────────────────────────
  const settingsData = [
    { key: "bank_name", value: "Banco Nación", group: "bank" },
    { key: "bank_holder", value: "NAJO Indumentaria", group: "bank" },
    { key: "bank_cbu", value: "0000000000000000000000", group: "bank" },
    { key: "bank_alias", value: "najo.indumentaria", group: "bank" },
    { key: "bank_account_type", value: "Cuenta corriente", group: "bank" },
    {
      key: "bank_instructions",
      value:
        "Realizá la transferencia por el monto exacto indicado. Luego enviá el comprobante por WhatsApp o email indicando tu código de reserva.",
      group: "bank",
    },
    { key: "company_name", value: "NAJO Indumentaria", group: "general" },
    {
      key: "company_email",
      value: "contacto@najoindumentaria.com",
      group: "general",
    },
    { key: "company_phone", value: "+54 11 0000-0000", group: "general" },
    { key: "company_address", value: "", group: "general" },
    { key: "company_cuit", value: "", group: "general" },
    { key: "instagram_url", value: "", group: "social" },
    { key: "tiktok_url", value: "", group: "social" },
    { key: "whatsapp_number", value: "", group: "social" },
    {
      key: "email_sender_name",
      value: "NAJO Indumentaria",
      group: "email",
    },
    {
      key: "email_sender_address",
      value: "noreply@najoindumentaria.com",
      group: "email",
    },
  ];

  for (const setting of settingsData) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log(`  Settings: ${settingsData.length} created`);

  // ─── Sample Customers ──────────────────────────────────
  const customer1 = await prisma.customer.upsert({
    where: { email: "juan.perez@email.com" },
    update: {},
    create: {
      name: "Juan Pérez",
      email: "juan.perez@email.com",
      phone: "+54 11 2345-6789",
      province: "Buenos Aires",
      city: "CABA",
      preferredContact: "WHATSAPP",
    },
  });

  const customer2 = await prisma.customer.upsert({
    where: { email: "maria.garcia@email.com" },
    update: {},
    create: {
      name: "María García",
      email: "maria.garcia@email.com",
      phone: "+54 351 987-6543",
      province: "Córdoba",
      city: "Córdoba Capital",
      preferredContact: "EMAIL",
    },
  });
  console.log("  Customers: 2 created");

  // ─── Sample Orders ─────────────────────────────────────
  const products = await prisma.product.findMany({ take: 3 });
  if (products.length >= 3) {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    await prisma.order.upsert({
      where: { orderCode: "NAJO-A1B2C3" },
      update: {},
      create: {
        orderCode: "NAJO-A1B2C3",
        customerId: customer1.id,
        productId: products[0].id,
        sizeLabel: "42",
        amount: products[0].price,
        status: "PENDING",
        deliveryMethod: "SHIPPING",
        shippingAddress: "Av. Corrientes 1234, CABA",
        expiresAt,
        statusHistory: {
          create: {
            fromStatus: null,
            toStatus: "PENDING",
            note: "Reserva creada",
            changedBy: "system",
          },
        },
      },
    });

    await prisma.order.upsert({
      where: { orderCode: "NAJO-D4E5F6" },
      update: {},
      create: {
        orderCode: "NAJO-D4E5F6",
        customerId: customer2.id,
        productId: products[1].id,
        sizeLabel: "40",
        amount: products[1].price,
        status: "CONFIRMED",
        deliveryMethod: "PICKUP",
        paidAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        confirmedAt: now,
        expiresAt,
        statusHistory: {
          create: [
            {
              fromStatus: null,
              toStatus: "PENDING",
              note: "Reserva creada",
              changedBy: "system",
              createdAt: new Date(now.getTime() - 48 * 60 * 60 * 1000),
            },
            {
              fromStatus: "PENDING",
              toStatus: "PAYMENT_RECEIVED",
              note: "Comprobante recibido por WhatsApp",
              changedBy: "system",
              createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
            },
            {
              fromStatus: "PAYMENT_RECEIVED",
              toStatus: "CONFIRMED",
              note: "Pago verificado",
              changedBy: admin.id,
              createdAt: now,
            },
          ],
        },
      },
    });

    await prisma.order.upsert({
      where: { orderCode: "NAJO-G7H8J9" },
      update: {},
      create: {
        orderCode: "NAJO-G7H8J9",
        customerId: customer1.id,
        productId: products[2].id,
        sizeLabel: "41",
        amount: products[2].price,
        status: "DELIVERED",
        deliveryMethod: "SHIPPING",
        shippingAddress: "Av. Corrientes 1234, CABA",
        trackingNumber: "AR123456789",
        paidAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        confirmedAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
        shippedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
        deliveredAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        expiresAt,
        statusHistory: {
          create: [
            {
              fromStatus: null,
              toStatus: "PENDING",
              note: "Reserva creada",
              changedBy: "system",
              createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
            },
            {
              fromStatus: "PENDING",
              toStatus: "PAYMENT_RECEIVED",
              changedBy: "system",
              createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
            },
            {
              fromStatus: "PAYMENT_RECEIVED",
              toStatus: "CONFIRMED",
              changedBy: admin.id,
              createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
            },
            {
              fromStatus: "CONFIRMED",
              toStatus: "PREPARING",
              changedBy: admin.id,
              createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
            },
            {
              fromStatus: "PREPARING",
              toStatus: "SHIPPED",
              note: "Código de seguimiento: AR123456789",
              changedBy: admin.id,
              createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
            },
            {
              fromStatus: "SHIPPED",
              toStatus: "DELIVERED",
              note: "Entregado exitosamente",
              changedBy: "system",
              createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
            },
          ],
        },
      },
    });

    console.log("  Orders: 3 created");
  }

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
