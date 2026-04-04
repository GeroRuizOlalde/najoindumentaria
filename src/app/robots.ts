import type { MetadataRoute } from "next";
import { getAppBaseUrl } from "@/lib/app-config";

const BASE_URL = getAppBaseUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/login"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
