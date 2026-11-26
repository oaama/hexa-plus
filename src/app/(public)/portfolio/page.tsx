import { publicData } from "@/lib/public-data";
import { ProjectGallery } from "@/components/project-gallery";
import { mediaSource } from "@/lib/media";
export const metadata = { title: "Our work" };
export default async function Portfolio() {
  const { portfolio } = await publicData();
  const shots = portfolio.filter((p) => p.thumbnail_url).slice(0, 5);
  return (
    <main id="main" className="section-wrap page-main">
      <section className="work-hero">
        <div className="work-hero-copy">
          <span className="eyebrow">OUR WORK</span>
          <h1 className="page-title">
            Every project.
            <br />
            <span>A different possibility.</span>
          </h1>
          <p className="page-intro">
            A closer look at the challenges, decisions and ideas behind our
            published work.
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
