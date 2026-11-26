"use client";
import Link from "next/link";
import { mediaSource } from "@/lib/media";
import { Reveal } from "@/components/reveal";
import { useState } from "react";
import { ArrowUpRight, Layers3 } from "lucide-react";
type Project = {
  id: string;
  title: string;
  slug: string;
  category?: string;
  industry?: string;
  description?: string;
  thumbnail_url?: string;
};
export function ProjectGallery({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState("الكل");
  const categories = [
    "الكل",
    ...new Set(projects.map((p) => p.category).filter(Boolean) as string[]),
  ];
  return (
    <>
      <div className="filter-row">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={filter === c ? "selected" : ""}
          >
            {c}
          </button>
        ))}
      </div>
      {projects.length === 0 ? (
        <div className="portfolio-empty">
          <Layers3 size={32} />
          <h3> كل عمل مميز يستحق أن يُروى. </h3>
          <p>
            {" "}
            ستظهر مشاريعنا المختارة هنا بعد نشرها. وحتى ذلك الحين، يسعدنا
            الاستماع إلى فكرتك.{" "}
          </p>
          <Link href="/ar/contact" className="text-link">
            {" "}
            لنتحدث عن مشروعك <ArrowUpRight size={17} />
          </Link>
        </div>
      ) : (
        <div className="project-grid">
          {projects
            .filter((p) => filter === "الكل" || p.category === filter)
            .map((p, i) => (
              <Reveal key={p.id} delay={Math.min(i * 0.07, 0.42)} y={30}>
              <Link
                className="project-card"
                href={"/ar/portfolio/" + p.slug}
              >
                <div className="project-visual">
                  {p.thumbnail_url ? (
                    <img
                      src={mediaSource(p.thumbnail_url)}
                      alt={p.title}
                      loading={i < 2 ? "eager" : "lazy"}
                      fetchPriority={i === 0 ? "high" : "auto"}
                      ref={(el) => {
                        if (el?.complete) el.classList.add("img-in");
                      }}
                      onLoad={(e) => e.currentTarget.classList.add("img-in")}
                    />
                  ) : (
                    <span className="project-monogram">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  )}
                  <span className="project-open">
                    <ArrowUpRight />
                  </span>
                </div>
                <span className="eyebrow">{p.category || "SELECTED WORK"}</span>
                <h3>{p.title}</h3>
                <p>{p.description}</p>
              </Link>
              </Reveal>
            ))}
        </div>
      )}
    </>
  );
}
