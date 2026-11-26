import type { MetadataRoute } from "next";
import { publicData } from "@/lib/public-data";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://hexa-plus.onrender.com"
  ).replace(/\/$/, "");
  const { services, portfolio } = await publicData();
  return [
    "",
    "/about",
    "/services",
    "/portfolio",
    "/contact",
    "/industries",
    "/process",
    "/careers",
    "/faq",
    "/privacy",
    "/terms",
    ...services.map((s) => "/services/" + s.slug),
    ...portfolio.map((p) => "/portfolio/" + p.slug),
  ].flatMap((path) => [
    {
      url: base + path,
      alternates: { languages: { en: base + path, ar: base + "/ar" + path } },
    },
    {
      url: base + "/ar" + path,
      alternates: { languages: { en: base + path, ar: base + "/ar" + path } },
    },
  ]);
}
