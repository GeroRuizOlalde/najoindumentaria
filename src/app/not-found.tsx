import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="font-heading text-6xl font-bold">404</h1>
      <p className="mt-4 text-gray-text">
        La página que buscás no existe.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-10 items-center justify-center border border-black px-6 text-xs font-medium uppercase tracking-wider transition-colors hover:bg-black hover:text-white"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
