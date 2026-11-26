import { publicData } from "@/lib/public-data-ar";
import { ProjectGallery } from "@/components/project-gallery-ar";
export const metadata = { title: "أعمالنا" };
export default async function Portfolio() {
  const { portfolio } = await publicData();
  return (
    <main id="main" className="section-wrap page-main">
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
      <ProjectGallery projects={portfolio} />
    </main>
  );
}
