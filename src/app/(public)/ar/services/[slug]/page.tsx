import Link from "next/link";
import { mediaSource } from "@/lib/media";
import { notFound } from "next/navigation";
import { ArrowUpRight, Check } from "lucide-react";
import { publicData } from "@/lib/public-data-ar";
import { SdlcFlow } from "@/components/sdlc-flow";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { services } = await publicData();
  const service = services.find((s) => s.slug === slug);
  return {
    title: service?.name || "الخدمات",
    description: service?.description,
  };
}
export default async function Service({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { services, portfolio } = await publicData();
  const s = services.find((v) => v.slug === slug);
  if (!s) notFound();
  return (
    <main id="main" className="section-wrap page-main">
      <Link className="eyebrow" href="/ar/services">
        {" "}
        الخدمات /{" "}
        {s.division === "digital" ? "الحلول الرقمية" : "التسويق والإبداع"}
      </Link>
      <h1 className="page-title">{s.name}</h1>
      <p className="page-intro">{s.description}</p>
      {s.image_url && (
        <img
          className="service-hero-image"
          src={mediaSource(s.image_url)}
          alt={s.name}
        />
      )}
      <Link
        href={"/ar/contact?service=" + encodeURIComponent(s.name)}
        className="primary-link"
      >
        {" "}
        ناقش مشروعك معنا <ArrowUpRight size={18} />
      </Link>
      <div className="detail-columns">
        {[
          ["القيمة التي نقدمها", s.benefits],
          ["ما ستحصل عليه", s.deliverables],
          ["مراحل التنفيذ", s.workflow],
        ].map(([title, body]) => (
          <section className="detail-panel" key={title}>
            <h2>{title}</h2>
            <ul>
              {String(body || "تُحدد التفاصيل معًا خلال دراسة المشروع.")
                .split("\n")
                .map((v) => (
                  <li key={v}>
                    <Check size={16} />
                    {v}
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
      {s.show_pricing && s.pricing && (
        <p className="pricing-note">{s.pricing}</p>
      )}
      <section className="related-work">
        <h2> أعمال ذات صلة </h2>
        {portfolio.filter((p) =>
          (p.category || "").toLowerCase().includes(s.division),
        ).length > 0 ? (
          portfolio
            .filter((p) =>
              (p.category || "").toLowerCase().includes(s.division),
            )
            .map((p) => (
              <Link key={p.id} href={"/ar/portfolio/" + p.slug}>
                {p.title} <ArrowUpRight size={16} />
              </Link>
            ))
        ) : (
          <p>
            {" "}
            تظهر دراسات المشاريع بعد نشرها في صفحة أعمالنا.{" "}
            <Link href="/ar/portfolio"> استكشف أعمالنا </Link>
          </p>
        )}
      </section>
    <SdlcFlow compact ar />
    </main>
  );
}
