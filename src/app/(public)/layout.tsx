import { headers } from "next/headers";
import { SiteHeader as ArabicHeader } from "@/components/site-header-ar";
import { SiteFooter as ArabicFooter } from "@/components/site-footer-ar";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { publicData } from "@/lib/public-data";
import { ScrollReveal } from "@/components/scroll-reveal";
export const dynamic = "force-dynamic";
export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { settings } = await publicData();
  const ar = (await headers()).get("x-site-locale") === "ar";
  return (
    <div
      className="public-site"
      dir={ar ? "rtl" : "ltr"}
      lang={ar ? "ar" : "en"}
    >
      <ScrollReveal />
      <a className="skip-link" href="#main">
        {ar ? "انتقل إلى المحتوى" : "Skip to content"}
      </a>
      {ar ? <ArabicHeader /> : <SiteHeader />}
      {children}
      {ar ? (
        <ArabicFooter
          settings={{
            ...settings,
            footer_description: settings.footer_description_ar || "",
          }}
        />
      ) : (
        <SiteFooter settings={settings} />
      )}
    </div>
  );
}
