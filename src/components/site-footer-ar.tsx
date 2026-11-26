import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
export function SiteFooter({
  settings = {},
}: {
  settings?: Record<string, string>;
}) {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div>
          <img className="footer-logo" src="/hexa-logo.png" width="150" height="126" alt="هيكسا بلس" />
          <div className="wordmark">
            HEXA<span>PLUS</span>
            <sup>+</sup>
          </div>
          <p>{settings.footer_description || "تقنية. إبداع. نمو للأعمال."}</p>
          <p> المنيا، مصر. نبني للخطوة القادمة. </p>
        </div>
        <div>
          <h3> استكشف </h3>
          <Link href="/ar/services"> الخدمات </Link>
          <Link href="/ar/portfolio"> أعمالنا </Link>
          <Link href="/ar/about"> من نحن </Link>
          <Link href="/ar/industries"> القطاعات </Link>
        </div>
        <div>
          <h3> معلومات تهمك </h3>
          <Link href="/ar/process"> طريقة عملنا </Link>
          <Link href="/ar/careers"> انضم إلينا </Link>
          <Link href="/ar/faq"> الأسئلة الشائعة </Link>
          <Link href="/ar/contact">
            {" "}
            ابدأ مشروعك <ArrowUpRight size={14} />
          </Link>
        </div>
        {Object.entries(settings).filter(
          ([k, v]) => k.startsWith("social_") && /^https:\/\//.test(v),
        ).length > 0 && (
          <div>
            <h3> تابعنا </h3>
            {Object.entries(settings)
              .filter(
                ([k, v]) => k.startsWith("social_") && /^https:\/\//.test(v),
              )
              .map(([k, v]) => (
                <a key={k} href={v} target="_blank" rel="noopener noreferrer">
                  {k.replace("social_", "")}
                </a>
              ))}
          </div>
        )}
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} HEXA PLUS</span>
        <div>
          <Link href="/ar/privacy"> الخصوصية </Link>
          <Link href="/ar/terms"> الشروط </Link>
          <Link href="/login"> دخول الفريق </Link>
        </div>
      </div>
    </footer>
  );
}
