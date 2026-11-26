import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/api/media"],
      disallow: ["/dashboard", "/login", "/auth", "/api/"],
    },
    sitemap: `${(process.env.NEXT_PUBLIC_SITE_URL || "https://hexa-plus.onrender.com").replace(/\/$/, "")}/sitemap.xml`,
  };
}
