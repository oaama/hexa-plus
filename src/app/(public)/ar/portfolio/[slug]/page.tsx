import { mediaSource } from "@/lib/media";
import { notFound } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/server";
import type { Metadata } from "next";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const db = await supabase();
  const { data: p } = await db
    .from("published_portfolio")
    .select("title,title_ar,description,description_ar,thumbnail_url")
    .eq("slug", slug)
    .single();
  if (!p) return { title: "المشروع غير موجود" };
  const title = p.title_ar || p.title;
  const description = p.description_ar || p.description;
  const url = "/ar/portfolio/" + slug;
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: { en: "/portfolio/" + slug, ar: "/ar/portfolio/" + slug, "x-default": "/portfolio/" + slug },
    },
    openGraph: { title, description, url },
  };
}
export default async function CaseStudy({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const db = await supabase();
  const { data: raw } = await db
    .from("published_portfolio")
    .select("*")
    .eq("slug", slug)
    .single();
  if (!raw) notFound();
  const p = {
    ...raw,
    title: raw.title_ar || raw.title,
    description: raw.description_ar || raw.description,
    category: raw.category_ar || raw.category,
    industry: raw.industry_ar || raw.industry,
    challenge: raw.challenge_ar || raw.challenge,
    solution: raw.solution_ar || raw.solution,
    results: raw.results_ar || raw.results,
    services_provided: raw.services_provided_ar || raw.services_provided,
  };
  const { data: media } = await db
    .from("published_portfolio_media")
    .select("*")
    .eq("portfolio_project_id", p.id)
    .order("sort_order");
  return (
    <main id="main" className="section-wrap page-main">
      <Link href="/ar/portfolio" className="eyebrow">
        {" "}
        أعمالنا / {p.category}
      </Link>
      <h1 className="page-title">{p.title}</h1>
      <p className="page-intro">{p.description}</p>
      <div className="case-meta">
        {p.client_name && (
          <span>
            {" "}
            العميل <strong>{p.client_name}</strong>
          </span>
        )}
        <span>
          {" "}
          القطاع <strong>{p.industry || "غير محدد"}</strong>
        </span>
        {p.project_date && (
          <span>
            {" "}
            التاريخ <strong>{p.project_date}</strong>
          </span>
        )}
      </div>
      {p.thumbnail_url && (
        <img
          className="case-hero"
          src={mediaSource(p.thumbnail_url)}
          alt={p.title}
        />
      )}
      <div className="detail-columns">
        {[
          ["التحدي", p.challenge],
          ["الحل", p.solution],
          ["النتيجة", p.results],
        ]
          .filter(([, v]) => v)
          .map(([k, v]) => (
            <section className="detail-panel" key={k}>
              <h2>{k}</h2>
              <p>{v}</p>
            </section>
          ))}
      </div>
      <div className="case-meta">
        {p.services_provided && (
          <span>
            {" "}
            الخدمات <strong>{p.services_provided}</strong>
          </span>
        )}
        {p.technologies && (
          <span>
            {" "}
            التقنيات <strong>{p.technologies}</strong>
          </span>
        )}
      </div>
      {(media || []).map((m) => (
        <figure key={m.id}>
          <img
            className="case-hero"
            src={mediaSource(m.url)}
            alt={m.alt}
            loading="lazy"
          />
          <figcaption>{m.alt}</figcaption>
        </figure>
      ))}
      <div className="case-actions">
        {p.external_url && /^https:\/\//.test(p.external_url) && (
          <a
            href={p.external_url}
            target="_blank"
            rel="noopener noreferrer"
            className="primary-link"
          >
            {" "}
            زيارة المشروع ↖{" "}
          </a>
        )}
        {p.video_url && /^https:\/\//.test(p.video_url) && (
          <a
            href={p.video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="secondary-link"
          >
            {" "}
            شاهد فيديو المشروع ↖{" "}
          </a>
        )}
        <Link href="/ar/contact" className="primary-link">
          {" "}
          ابدأ مشروعك ↖{" "}
        </Link>
      </div>
    </main>
  );
}
