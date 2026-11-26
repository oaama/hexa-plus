import Link from "next/link";
import {
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Code2,
  PenTool,
  ArrowDown,
  Check,
} from "lucide-react";
import { CapabilityTicker } from "./capability-ticker";
import { HexaMotion } from "./hexa-motion";
import { AgencyReveal as Reveal } from "./agency-reveal";
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
export function AgencyHome({
  ar = false,
  portfolio,
  services,
  settings = {},
}: {
  ar?: boolean;
  portfolio: Project[];
  services: Service[];
  settings?: Record<string, string>;
}) {
  const t = (en: string, arabic: string) => (ar ? arabic : en);
  const href = (path: string) => (ar ? "/ar" : "") + path;
  const customTitle =
    settings.hero_title &&
    settings.hero_title !== "Your vision.\nOur digital\nexecution."
      ? settings.hero_title
      : "";
  const customDescription =
    settings.hero_description &&
    settings.hero_description !==
      "We combine technology, creativity, and strategy to build digital experiences that move businesses forward."
      ? settings.hero_description
      : "";
  return (
    <main id="main" className="agency-home">
      <section className="agency-hero">
        <div className="agency-frame">
          <div className="hero-kicker">
            <span>
              <i />
              {t(
                "INDEPENDENT THINKING. CONNECTED SOLUTIONS.",
                "فكر مستقل. حلول متكاملة.",
              )}
            </span>
            <span>
              {t("MINYA, EGYPT / BEYOND BORDERS", "المنيا، مصر / بلا حدود")}
            </span>
          </div>
          <div className="agency-hero-grid">
            <div className="agency-hero-copy">
              <h1 className={customTitle ? "custom-hero-title" : ""}>
                {customTitle ? (
                  customTitle.split("\n").map((line, i, lines) => (
                    <span
                      key={i}
                      className={i === lines.length - 1 ? "hero-outline" : ""}
                    >
                      {line}
                    </span>
                  ))
                ) : (
                  <>
                    <span>{t("Ambitious ideas.", "أفكار جريئة.")}</span>
                    <span className="hero-outline">
                      {t("Real impact.", "وأثر حقيقي.")}
                      <span className="headline-dot">•</span>
                    </span>
                  </>
                )}
              </h1>
              <div className="hero-intro-row">
                <span className="hero-small-index">(01—∞)</span>
                <p>
                  {customDescription ||
                    t(
                      "We turn what’s next into what’s real. Digital products, distinctive brands and marketing that moves your business forward.",
                      "نحوّل الأفكار إلى منتجات رقمية، وعلامات مميزة، وتسويق يدفع أعمالك للأمام. من أول فكرة إلى تجربة تستحق أن تُرى.",
                    )}
                </p>
              </div>
              <div className="agency-hero-actions">
                <Link href={href("/contact")} className="agency-button light">
                  {t("Let’s build something", "لنبنِ شيئًا مختلفًا")}
                  <span>
                    <ArrowUpRight size={21} />
                  </span>
                </Link>
                <Link href="#selected-work" className="hero-work-link">
                  {t("Explore our work", "استكشف أعمالنا")}
                  <ArrowDown size={17} />
                </Link>
              </div>
            </div>
            <HexaMotion ar={ar} />
          </div>
          <div className="hero-base">
            <span>
              HEXA PLUS{" "}
              <span>
                {t("DIGITAL SOLUTIONS & MARKETING", "الحلول الرقمية والتسويق")}
              </span>
            </span>
            <a href="#selected-work">
              {t("SCROLL TO DISCOVER", "اكتشف المزيد")}
              <ArrowDown size={14} />
            </a>
          </div>
        </div>
      </section>
      <CapabilityTicker ar={ar} />
      <section className="agency-work agency-frame" id="selected-work">
        <div className="agency-section-top">
          <span className="agency-label">
            {t("(01) SELECTED WORK", "(٠١) أعمال مختارة")}
          </span>
          <p>
            {t(
              "Different challenges. One approach: make it matter.",
              "تحديات مختلفة. نهج واحد: عمل يصنع الفرق.",
            )}
          </p>
        </div>
        <div className="agency-work-title">
          <Reveal>
            <h2>
              {t("Less talk.", "الكلام أقل.")}
              <br />
              <span>{t("More proof.", "والعمل يتحدث.")}</span>
            </h2>
          </Reveal>
          <Link href={href("/portfolio")} className="agency-round-link">
            {t("All projects", "كل المشاريع")}
            <span>
              <ArrowUpRight size={24} />
            </span>
          </Link>
        </div>
        <div className="agency-projects">
          {portfolio.slice(0, 2).map((p, i) => (
            <Reveal
              key={p.id}
              className={"agency-project project-" + i}
              delay={i * 0.12}
            >
              <Link href={href("/portfolio/" + p.slug)}>
                <div className="agency-project-image">
                  {p.thumbnail_url ? (
                    <>
                      <span className="project-stage-word" aria-hidden="true">
                        {i === 0 ? "MATCHA" : "BACKSTAGE"}
                      </span>
                      <div className="project-browser">
                        <div className="project-browser-chrome">
                          <span>
                            <i />
                            <i />
                            <i />
                          </span>
                          <span>
                            {i === 0
                              ? "matcha-cafe-two.vercel.app"
                              : "backstage-company-eight.vercel.app"}
                          </span>
                          <span>↗</span>
                        </div>
                        <img
                          src={mediaSource(p.thumbnail_url)}
                          alt={p.title}
                          loading="lazy"
                        />
                      </div>
                      <div className="project-stage-tag">
                        <span>{t("DIGITAL EXPERIENCE", "تجربة رقمية")}</span>
                        <strong>
                          {i === 0
                            ? t("Made for good taste.", "تجربة على مزاجك.")
                            : t("Setting the stage.", "كل حكاية لها مسرح.")}
                        </strong>
                      </div>
                    </>
                  ) : (
                    <div className="project-placeholder">{p.title}</div>
                  )}
                  <span className="project-image-index">
                    0{i + 1} / HEXA PLUS
                  </span>
                  <span className="project-hover-link">
                    <ArrowUpRight size={27} />
                  </span>
                </div>
                <div className="agency-project-info">
                  <div>
                    <h3>{p.title}</h3>
                    <p>{p.description}</p>
                  </div>
                  <span>
                    {p.category || t("Digital experience", "تجربة رقمية")}
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="agency-about">
        <div className="agency-frame agency-about-grid">
          <span className="agency-label">
            {t("(02) THE BIGGER PICTURE", "(٠٢) الصورة الكاملة")}
          </span>
          <div>
            <Reveal>
              <h2>
                {t("Good design gets noticed.", "التصميم الجيد يلفت النظر.")}
                <br />
                <span>
                  {t(
                    "Connected thinking goes further.",
                    "والفكر المتكامل يصنع الفارق.",
                  )}
                </span>
              </h2>
            </Reveal>
            <div className="agency-about-bottom">
              <p>
                {t(
                  "Your website, your systems, your brand. They shouldn’t live in separate worlds. We bring technology, creativity and strategy together, so every part of your business moves in the same direction.",
                  "موقعك وأنظمتك وعلامتك التجارية ليست جزرًا منفصلة. نجمع التقنية والإبداع والاستراتيجية في فريق واحد، حتى يتحرك كل جزء من أعمالك نحو الهدف نفسه.",
                )}
              </p>
              <Link href={href("/about")} className="agency-text-link">
                {t("Meet HEXA PLUS", "تعرّف على هيكسا بلس")}
                <ArrowUpRight size={19} />
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section className="agency-capabilities">
        <div className="agency-frame">
          <div className="agency-section-top">
            <span className="agency-label">
              {t("(03) WHAT WE BRING", "(٠٣) ما نقدمه")}
            </span>
            <span>
              {t("TWO DISCIPLINES. ZERO DISCONNECT.", "تخصصان. رؤية واحدة.")}
            </span>
          </div>
          <div className="agency-services-heading">
            <h2>
              {t("Built to work.", "نبني بإتقان.")}
              <br />
              <span>{t("Made to connect.", "ونربط كل التفاصيل.")}</span>
            </h2>
            <Link className="agency-button light" href={href("/services")}>
              {t("Explore our services", "استكشف خدماتنا")}
              <span>
                <ArrowUpRight size={21} />
              </span>
            </Link>
          </div>
          <div className="agency-division-grid">
            {[
              [
                "digital",
                t("Digital solutions", "الحلول الرقمية"),
                t(
                  "From idea to the everyday.",
                  "من الفكرة إلى الاستخدام اليومي.",
                ),
                Code2,
              ],
              [
                "marketing",
                t("Brand & marketing", "الهوية والتسويق"),
                t("A presence with a point of view.", "حضور له شخصية ورسالة."),
                PenTool,
              ],
            ].map(([id, title, sub, Icon]: any, i) => (
              <Reveal key={id} className="agency-division">
                <div className="agency-division-top">
                  <span>0{i + 1}</span>
                  <Icon size={27} strokeWidth={1.3} />
                </div>
                <h3>{title}</h3>
                <p>{sub}</p>
                <ul>
                  {services
                    .filter((s) => s.division === id)
                    .slice(0, 5)
                    .map((s) => (
                      <li key={s.slug}>
                        <Link href={href("/services/" + s.slug)}>
                          {s.name}
                          <ArrowUpRight size={15} />
                        </Link>
                      </li>
                    ))}
                </ul>
                <Link href={href("/services#" + id)} className="division-all">
                  {t("View all capabilities", "كل الخدمات")}
                  <Plus size={19} />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="agency-method agency-frame">
        <div className="agency-section-top">
          <span className="agency-label">
            {t("(04) HOW IT HAPPENS", "(٠٤) من الفكرة إلى التنفيذ")}
          </span>
          <Link href={href("/process")} className="agency-text-link">
            {t("Our process", "طريقة عملنا")}
            <ArrowUpRight size={18} />
          </Link>
        </div>
        <h2>
          {t("Clear thinking.", "تفكير واضح.")}
          <br />
          <span>{t("Better outcomes.", "ونتائج أفضل.")}</span>
        </h2>
        <div className="agency-steps">
          {[
            [
              t("Understand", "نفهم"),
              t(
                "The business. The people. The problem worth solving.",
                "ندرس نشاطك وجمهورك والتحدي الذي يستحق الحل.",
              ),
            ],
            [
              t("Shape", "نخطط"),
              t(
                "A shared direction, a defined scope and a plan you can follow.",
                "اتجاه مشترك ونطاق محدد وخطة واضحة لكل خطوة.",
              ),
            ],
            [
              t("Make", "ننَفّذ"),
              t(
                "Design, build and refine. With you in the loop.",
                "نصمم ونبني ونراجع، وأنت معنا في كل مرحلة.",
              ),
            ],
            [
              t("Move forward", "ننطلق"),
              t(
                "A considered launch. A practical handover. Your next chapter.",
                "إطلاق مدروس وتسليم عملي، وبداية لخطوتك القادمة.",
              ),
            ],
          ].map(([title, body], i) => (
            <Reveal key={title} delay={i * 0.06}>
              <div className="agency-step-index">
                <span>0{i + 1}</span>
                <Plus size={17} />
              </div>
              <h3>{title}</h3>
              <p>{body}</p>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="agency-finale">
        <div className="agency-frame">
          <div className="agency-section-top">
            <span className="agency-label">
              {t(
                "GOOD THINGS START WITH A CONVERSATION",
                "كل بداية مختلفة تبدأ بحوار",
              )}
            </span>
            <span>{t("YOUR NEXT CHAPTER", "خطوتك القادمة")}</span>
          </div>
          <Link href={href("/contact")} className="agency-contact-big">
            <span>{t("What’s next?", "ما خطوتك القادمة؟")}</span>
            <ArrowUpRight strokeWidth={1.1} />
          </Link>
          <div className="agency-finale-bottom">
            <p>
              {t(
                "A new idea. A complex challenge. A better way forward.",
                "فكرة جديدة. تحدٍ مختلف. أو طريق أفضل للنمو.",
              )}
            </p>
            <Link href={href("/contact")}>
              {t("Tell us about it", "حدثنا عنها")}
              <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
