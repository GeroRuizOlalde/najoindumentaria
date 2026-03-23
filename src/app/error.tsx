"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="font-heading text-4xl font-bold">Error</h1>
      <p className="mt-4 text-gray-text">
        Algo salió mal. Intentá de nuevo.
      </p>
      <button
        onClick={reset}
        className="mt-8 inline-flex h-10 items-center justify-center border border-black px-6 text-xs font-medium uppercase tracking-wider transition-colors hover:bg-black hover:text-white"
      >
        Reintentar
      </button>
    </div>
  );
}
