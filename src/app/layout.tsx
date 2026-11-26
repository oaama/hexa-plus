import { headers } from "next/headers";
import type { Metadata } from "next";
import "./globals.css";
const SITE = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://hexa-plus.onrender.com"
).replace(/\/$/, "");
export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const ar = h.get("x-site-locale") === "ar";
  const path = h.get("x-site-path") || "/";
  const enPath = ar ? path.replace(/^\/ar/, "") || "/" : path;
  const arPath = ar ? path : "/ar" + (path === "/" ? "" : path);
  const title = ar
    ? "شركة هيكسا بلس | حلول رقمية وتسويق"
    : "HEXA PLUS Company | Digital solutions & marketing";
  const description = ar
    ? "هيكسا بلس: حلول رقمية وتسويق من المنيا، مصر. مواقع وتطبيقات وأنظمة إدارة أعمال وهوية وتسويق."
    : "HEXA PLUS builds websites, apps, business systems and marketing for growing businesses. Digital solutions and marketing from Minya, Egypt.";
  return {
    metadataBase: new URL(SITE),
    title: {
      default: title,
      template: ar ? "%s | هيكسا بلس" : "%s | HEXA PLUS",
    },
    description,
    robots: { index: true, follow: true },
    verification: {
      google:
        process.env.GOOGLE_SITE_VERIFICATION ||
        "wHEPxAHe3MkYGXB4k4aGOltqJiHyGgnf9yvmsuXTRaY",
      other: process.env.BING_SITE_VERIFICATION
        ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION }
        : undefined,
    },
    alternates: {
      canonical: ar ? arPath : enPath,
      languages: { en: enPath, ar: arPath, "x-default": enPath },
    },
    openGraph: {
      type: "website",
      siteName: "HEXA PLUS",
      locale: ar ? "ar_EG" : "en_US",
      title,
      description,
      url: ar ? arPath : enPath,
      images: [
        { url: "/og-image.png", width: 1200, height: 630, alt: "HEXA PLUS" },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },
  };
}
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ar = (await headers()).get("x-site-locale") === "ar";
  return (
    <html
      lang={ar ? "ar" : "en"}
      dir={ar ? "rtl" : "ltr"}
      suppressHydrationWarning
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "HEXA PLUS",
                alternateName: "هيكسا بلس",
                url: SITE,
                logo: SITE + "/hexa-logo.png",
                image: SITE + "/og-image.png",
                description:
                  "Digital solutions and marketing from Minya, Egypt.",
                address: {
                  "@type": "PostalAddress",
                  addressLocality: "Minya",
                  addressCountry: "EG",
                },
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "HEXA PLUS",
                url: SITE,
                inLanguage: ["en", "ar"],
              },
            ]),
          }}
        />
        {children}
      </body>
    </html>
  );
}
