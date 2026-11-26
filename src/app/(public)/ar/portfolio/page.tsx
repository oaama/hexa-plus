import { publicData } from "@/lib/public-data-ar";
import { ProjectGallery } from "@/components/project-gallery-ar";
import { mediaSource } from "@/lib/media";
export const metadata = { title: "أعمالنا" };
export default async function Portfolio() {
  const { portfolio } = await publicData();
  const shots = portfolio.filter((p) => p.thumbnail_url).slice(0, 5);
  return (
    <main id="main" className="section-wrap page-main">
      <section className="work-hero">
        <div className="work-hero-copy">
          <span className="eyebrow"> أعمالنا </span>
          <h1 className="page-title">
            {" "}
            لكل مشروع <br />
            <span> فرصة مختلفة. </span>
          </h1>
          <p className="page-intro">
            {" "}
            نظرة على التحديات والقرارات والأفكار وراء أعمالنا المنشورة.{" "}
          </p>
        </div>
        {shots.length > 0 && (
          <div className="work-hero-strip" aria-hidden="true">
            {shots.map((p) => (
              <img key={p.id} src={mediaSource(p.thumbnail_url)} alt="" loading="lazy" />
            ))}
          </div>
        )}
      </section>
      <ProjectGallery projects={portfolio} />
    </main>
  );
}
