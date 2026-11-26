import { publicData } from "@/lib/public-data";
import { ProjectGallery } from "@/components/project-gallery";
export const metadata = { title: "Our work" };
export default async function Portfolio() {
  const { portfolio } = await publicData();
  return (
    <main id="main" className="section-wrap page-main">
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
      <ProjectGallery projects={portfolio} />
    </main>
  );
}
