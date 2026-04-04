const DEFAULT_APP_URL = "https://najoindumentaria.vercel.app";

export function getAppBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL || DEFAULT_APP_URL;
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

export function absoluteAppUrl(path = "/"): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getAppBaseUrl()}${normalizedPath}`;
}
