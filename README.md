# Najo Indumentaria

E-commerce de indumentaria y zapatillas construido con Next.js 16, React 19, Prisma y PostgreSQL.

## Stack

- Next.js App Router
- React 19
- Prisma + PostgreSQL
- NextAuth para admin
- Sesion propia con JWT para clientes
- Cloudinary para imagenes
- Resend para emails transaccionales

## Estado funcional

Hoy el proyecto incluye:

- Tienda publica con home, catalogo, filtros, busqueda, producto, carrito, reserva y seguimiento.
- Flujo de reserva con transferencia bancaria, expiracion automatica y restauracion correcta de stock para pedidos multi-item.
- Cuenta cliente con login, direcciones, favoritos y resumen de reseñas.
- Panel admin con dashboard, productos, pedidos, clientes, marcas, categorias, cupones, contenido y moderacion de reseñas.
- CMS liviano basado en `site_settings` para hero, FAQ, nosotros, politicas, contacto y footer.
- Analytics comerciales basicos en dashboard: ticket promedio, cupones, descuentos, marcas y categorias mas vendidas.

## Variables de entorno

Tomar como base `.env.example`.

Variables principales:

- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_URL`
- `CUSTOMER_JWT_SECRET`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `CRON_SECRET`

## Desarrollo

Instalacion:

```bash
npm install
```

Generar cliente Prisma:

```bash
npx prisma generate
```

Aplicar esquema a la base:

```bash
npx prisma db push
```

Opcional, cargar datos iniciales:

```bash
npx prisma db seed
```

Levantar entorno local:

```bash
npm run dev
```

## Build

```bash
npm run build
```

El build ejecuta `prisma generate` antes de compilar.

## Tareas automaticas

En despliegue se usan cron jobs para:

- expirar reservas vencidas
- archivar pedidos cerrados

Las rutas estan protegidas con `CRON_SECRET`.

## Carpetas clave

- `src/app/(store)`: storefront
- `src/app/admin`: backoffice
- `src/lib/actions`: server actions
- `src/lib/queries`: consultas Prisma
- `src/components/store`: UI publica
- `src/components/admin`: UI interna
- `prisma/schema.prisma`: modelo de datos
