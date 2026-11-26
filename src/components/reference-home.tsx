import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  Code2,
  LayoutDashboard,
  Megaphone,
} from "lucide-react";
import { mediaSource } from "@/lib/media";

type Project = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  category?: string;
  thumbnail_url?: string;
};
type Service = { name: string; slug: string; division: string };

function Window({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="rh-window">
      <div className="rh-window-bar">
        <i />
        <i />
        <i />
      </div>
      <img src={src} width="1280" height="800" alt={alt} loading="lazy" decoding="async" />
    </div>
  );
}

function Chip({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="rh-float rh-chip" aria-hidden="true">
      <i />
      <div>
        <strong>{title}</strong>
        <small>{sub}</small>
      </div>
    </div>
  );
}

export function ReferenceHome({
  ar = false,
  portfolio,
  settings = {},
}: {
  ar?: boolean;
  portfolio: Project[];
  services?: Service[];
  settings?: Record<string, string>;
}) {
  const t = (en: string, arabic: string) => (ar ? arabic : en);
  const href = (path: string) => (ar ? "/ar" : "") + path;
  const customTitle =
    settings.hero_title && settings.hero_title !== "Your vision.\nOur digital\nexecution."
      ? settings.hero_title
      : "";
  const customDescription =
    settings.hero_description &&
    settings.hero_description !==
      "We combine technology, creativity, and strategy to build digital experiences that move businesses forward."
      ? settings.hero_description
      : "";
  const cards = [
    {
      icon: Code2,
      title: t("Websites & apps", "مواقع وتطبيقات"),
      body: t(
        "Fast, responsive websites, online stores and mobile apps designed around how your customers actually use them.",
        "مواقع سريعة ومتجاوبة ومتاجر إلكترونية وتطبيقات موبايل مصممة حول طريقة استخدام عملائك الفعلية.",
      ),
    },
    {
      icon: LayoutDashboard,
      title: t("Business systems", "أنظمة إدارة الأعمال"),
      body: t(
        "Dashboards, CRM and project tools that put clients, tasks and invoices in one place for your team.",
        "لوحات تحكم وأنظمة عملاء ومشاريع تجمع العملاء والمهام والفواتير في مكان واحد لفريقك.",
      ),
    },
    {
      icon: Megaphone,
      title: t("Brand & marketing", "الهوية والتسويق"),
      body: t(
        "Identity, content and campaigns that give your business a clear voice and bring in the right customers.",
        "هوية ومحتوى وحملات تعطي نشاطك صوتًا واضحًا وتجلب العملاء المناسبين.",
      ),
    },
  ];
  const checks = (items: [string, string][]) => (
    <ul className="rh-checks">
      {items.map(([e, a]) => (
        <li key={e}>
          <Check size={16} />
          {t(e, a)}
        </li>
      ))}
    </ul>
  );
  return (
    <main id="main" className="rh">
      <section className="rh-hero">
        <span className="rh-bubble rh-bubble-a" />
        <span className="rh-bubble rh-bubble-b" />
        <span className="rh-bubble rh-bubble-c" />
        <div className="rh-hero-copy">
          <h1>
            {customTitle || (
              <>
                {t("From Ideas", "من الفكرة")}
                <br />
                {t("to Impact", "إلى الأثر")}
              </>
            )}
          </h1>
          <p>
            {customDescription ||
              t(
                "Websites, business systems and marketing, built around your goals.",
                "مواقع وأنظمة أعمال وتسويق، مبنية حول أهدافك.",
              )}
          </p>
          <Link href={href("/contact")} className="rh-pill-white">
            {t("Start your project", "ابدأ مشروعك")}
          </Link>
        </div>
        <div className="rh-hero-stage">
          <div className="rh-laptop">
            <div className="rh-laptop-screen">
              <img
                src="/showcase/hero-collage.jpg"
                width="1600"
                height="1000"
                alt={t("A selection of websites and apps built by HEXA PLUS", "مجموعة من المواقع والتطبيقات التي نفذتها هيكسا بلس")}
                fetchPriority="high"
              />
            </div>
            <div className="rh-laptop-base" />
          </div>
          <div className="rh-phone" aria-hidden="true">
            <img src={t("/showcase/phone-hexa-en.jpg", "/showcase/phone-hexa-ar.jpg")} width="748" height="1535" alt="" />
          </div>
          <div className="rh-float rh-stat-card" aria-hidden="true">
            <i />
            <div>
              <strong>{t("Live projects", "مشاريع منشورة")}</strong>
              <small>{t("websites, apps and platforms", "مواقع وتطبيقات ومنصات")}</small>
            </div>
          </div>
        </div>
                <svg className="rh-wave" viewBox="0 0 1440 170" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 110 C220 10 520 10 760 80 C1000 150 1220 160 1440 60 L1440 170 L0 170Z" fill="#fff" />
        </svg>
      </section>

      <section className="rh-section rh-what">
        <div className="rh-head">
          <span className="rh-eyebrow">{t("What we do", "ماذا نقدم")}</span>
          <h2>{t("The complete digital solution", "الحل الرقمي المتكامل")}</h2>
        </div>
        <div className="rh-cards">
          {cards.map(({ icon: Icon, title, body }) => (
            <Link key={title} href={href("/services")} className="rh-card">
              <span className="rh-icon">
                <Icon size={24} strokeWidth={1.8} />
              </span>
              <h3>{title}</h3>
              <p>{body}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="rh-section rh-feature">
        <div className="rh-text">
          <span className="rh-eyebrow">{t("Websites", "المواقع")}</span>
          <h2>{t("Websites that look sharp and load fast", "مواقع بشكل احترافي وتحميل سريع")}</h2>
          <p>
            {t(
              "From a company site to an online store, we design around your customers and build it to work on every phone, in Arabic and English.",
              "من موقع الشركة إلى المتجر الإلكتروني، نصمم حول عملائك ونبني موقعًا يعمل على كل الموبايلات، بالعربية والإنجليزية.",
            )}
          </p>
          {checks([
            ["Mobile-first, responsive design", "تصميم متجاوب يبدأ من الموبايل"],
            ["Arabic and English, right-to-left ready", "عربي وإنجليزي مع دعم الاتجاه من اليمين لليسار"],
            ["Built to be found on search engines", "مجهز لظهور أفضل في محركات البحث"],
          ])}
          <Link href={href("/services")} className="rh-pill-outline">
            {t("Read more", "اعرف المزيد")}
          </Link>
        </div>
        <div className="rh-visual">
          <span className="rh-blob" />
          <Window
            src="/showcase/site-mraya.jpg"
            alt={t("Mraya Arts Center website, built by HEXA PLUS", "موقع مركز مرايا للفنون، من تنفيذ هيكسا بلس")}
          />
          <Chip title={t("Mraya Arts Center", "مركز مرايا للفنون")} sub={t("Live website", "موقع منشور")} />
        </div>
      </section>

      <section className="rh-section rh-feature rh-reverse">
        <div className="rh-text">
          <span className="rh-eyebrow">{t("Apps & systems", "التطبيقات والأنظمة")}</span>
          <h2>{t("Apps and systems that run your business", "تطبيقات وأنظمة تدير نشاطك")}</h2>
          <p>
            {t(
              "Ordering menus, booking apps, learning platforms and management dashboards, built around how your team and customers actually work.",
              "منيو للطلب، وتطبيقات حجز، ومنصات تعليمية، ولوحات إدارة، مبنية حول طريقة عمل فريقك وعملائك الفعلية.",
            )}
          </p>
          {checks([
            ["Booking, ordering and course platforms", "منصات حجز وطلب وكورسات"],
            ["Dashboards with roles for your team", "لوحات تحكم بصلاحيات لفريقك"],
            ["Invoices and reports in Arabic and English", "فواتير وتقارير بالعربية والإنجليزية"],
          ])}
          <Link href={href("/services")} className="rh-pill-outline">
            {t("Read more", "اعرف المزيد")}
          </Link>
        </div>
        <div className="rh-visual">
          <span className="rh-blob" />
          <Window
            src="/showcase/app-matcha.jpg"
            alt={t("Matcha Café menu app, built by HEXA PLUS", "تطبيق منيو ماتشا كافيه، من تنفيذ هيكسا بلس")}
          />
          <Chip title={t("Matcha Café", "ماتشا كافيه")} sub={t("Digital menu app", "تطبيق منيو رقمي")} />
        </div>
      </section>

      <section className="rh-section rh-work" id="selected-work">
        <div className="rh-head">
          <span className="rh-eyebrow">{t("Our work", "أعمالنا")}</span>
          <h2>{t("Projects we have built", "مشاريع نفذناها")}</h2>
        </div>
        <div className="rh-projects">
          {portfolio.map((p) => (
            <Link key={p.id} href={href("/portfolio/" + p.slug)} className="rh-project">
              <div className="rh-project-shot">
                {p.thumbnail_url ? (
                  <img
                    src={mediaSource(p.thumbnail_url)}
                    width="1280"
                    height="800"
                    alt={p.title}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <span>{p.title}</span>
                )}
              </div>
              <div className="rh-project-info">
                <div>
                  <h3>{p.title}</h3>
                  <small>{p.category || t("Digital experience", "تجربة رقمية")}</small>
                </div>
                <ArrowUpRight size={20} />
              </div>
            </Link>
          ))}
        </div>
        <div className="rh-center">
          <Link href={href("/portfolio")} className="rh-pill-outline">
            {t("View all projects", "عرض كل المشاريع")}
          </Link>
        </div>
      </section>

      <section className="rh-cta">
        <h2>{t("Have an idea? Let's make it real.", "عندك فكرة؟ خلّينا نحوّلها لواقع.")}</h2>
        <Link href={href("/contact")} className="rh-pill-white">
          {t("Talk to us", "تواصل معنا")}
        </Link>
      </section>
    </main>
  );
}
