import { mediaSource } from "@/lib/media";
import { notFound } from "next/navigation";
import Link from "next/link";
import { supabase, serviceClient } from "@/lib/supabase/server";
import { SdlcFlow } from "@/components/sdlc-flow";
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
  if (!p) return { title: "Project not found" };
  const title = p.title;
  const description = p.description;
  const url = "/portfolio/" + slug;
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
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const db = await supabase();
  let { data: p } = await db
    .from("published_portfolio")
    .select("*")
    .eq("slug", slug)
    .single();
  let mediaTable = "published_portfolio_media";
  if (!p && preview === "drafts") {
    const draft = await serviceClient()
      .from("portfolio_projects")
      .select("*")
      .eq("slug", slug)
      .single();
    p = draft.data;
    mediaTable = "portfolio_media";
  }
  if (!p) notFound();
  const { data: media } = await (mediaTable === "portfolio_media" ? serviceClient() : db)
    .from(mediaTable)
    .select("*")
    .eq("portfolio_project_id", p.id)
    .order("sort_order");
  return (
    <main id="main" className="section-wrap page-main">
      <Link href="/portfolio" className="eyebrow">
        OUR WORK / {p.category}
      </Link>
      <h1 className="page-title">{p.title}</h1>
      <p className="page-intro">{p.description}</p>
      <div className="case-meta">
        {p.client_name && (
          <span>
            Client<strong>{p.client_name}</strong>
          </span>
        )}
        <span>
          Industry<strong>{p.industry || "Not specified"}</strong>
        </span>
        {p.project_date && (
          <span>
            Date<strong>{p.project_date}</strong>
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
      <div className="detail-columns case-flow">
        {[
          ["The challenge", p.challenge],
          ["Our solution", p.solution],
          ["The outcome", p.results],
        ]
          .filter(([, v]) => v)
          .map(([k, v], i) => (
            <section className="detail-panel" key={k}>
              <span className="flow-num">{String(i + 1).padStart(2, "0")}</span>
              <h2>{k}</h2>
              <p>{v}</p>
            </section>
          ))}
      </div>
      <SdlcFlow compact />
      <div className="case-meta">
        {p.services_provided && (
          <span>
            Services<strong>{p.services_provided}</strong>
          </span>
        )}
        {p.technologies && (
          <span>
            Technology<strong>{p.technologies}</strong>
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
            Visit live project ↗
          </a>
        )}
        {p.video_url && /^https:\/\//.test(p.video_url) && (
          <a
            href={p.video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="secondary-link"
          >
            Watch project video ↗
          </a>
        )}
        <Link href="/contact" className="primary-link">
          Start your project ↗
        </Link>
      </div>
    </main>
  );
}
