import Link from "next/link";
import { Eye, Target, HeartHandshake, Compass, Layers3, Users } from "lucide-react";
import { publicData } from "@/lib/public-data-ar";
export const metadata = { title: "من نحن" };
export default async function Page() {
  const { settings } = await publicData();
  return (
    <main id="main" className="section-wrap page-main">
      <span className="eyebrow"> من نحن </span>
      <h1 className="page-title"> خبرات متنوعة. رؤية واحدة. </h1>
      <p className="page-intro">
        {" "}
        تجمع هيكسا بلس بين الحلول الرقمية وخدمات التسويق من المنيا، مصر. نربط
        التقنية والإبداع وفهم الأعمال لتحويل الأفكار إلى تجارب رقمية مفيدة.{" "}
      </p>
      {settings.page_about ? (
        <article className="prose-content">{settings.page_about}</article>
      ) : (
        <div className="editorial-grid">
          <section className="detail-panel">
            <span className="panel-icon"><Eye size={22} /></span>
            <h2> رؤيتنا </h2>
            <p> نساعد الشركات على التقدم من خلال تقنية وتواصل يعملان معًا. </p>
          </section>
          <section className="detail-panel">
            <span className="panel-icon"><Target size={22} /></span>
            <h2> رسالتنا </h2>
            <p>
              {" "}
              نبني منتجات رقمية وحلول أعمال وتجارب للعلامات التجارية انطلاقًا من
              أهداف واضحة.{" "}
            </p>
          </section>
          <section className="detail-panel">
            <span className="panel-icon"><HeartHandshake size={22} /></span>
            <h2> قيمنا </h2>
            <p> الوضوح، وإتقان العمل، وصدق التواصل، والقيمة المستمرة. </p>
          </section>
          <section className="detail-panel">
            <span className="panel-icon"><Compass size={22} /></span>
            <h2> كيف نفكر </h2>
            <p>
              {" "}
              نبدأ بفهم النشاط والجمهور، ونختار النهج المناسب، ثم نربط كل جزء
              بالصورة الكاملة.{" "}
            </p>
          </section>
          <section className="detail-panel">
            <span className="panel-icon"><Layers3 size={22} /></span>
            <h2> خبراتنا </h2>
            <p>
              {" "}
              تطوير البرمجيات، والتحول الرقمي، وأنظمة الأعمال، والتسويق الرقمي،
              والإنتاج الإبداعي، والهوية البصرية، واستراتيجية النمو.{" "}
            </p>
          </section>
          <section className="detail-panel">
            <span className="panel-icon"><Users size={22} /></span>
            <h2> فريقنا </h2>
            <p>
              {" "}
              نتعاون في التطوير والتصميم والتسويق والاستراتيجية. تُنشر ملفات
              أعضاء الفريق بعد اعتمادها.{" "}
            </p>
          </section>
        </div>
      )}
      <Link href="/ar/contact" className="primary-link">
        {" "}
        لنتحدث عن مشروعك ↖{" "}
      </Link>
    </main>
  );
}
