import Link from "next/link";
import { publicData } from "@/lib/public-data-ar";
export const metadata = { title: "طريقة عملنا" };
export default async function Page() {
  const { settings } = await publicData();
  return (
    <main id="main" className="section-wrap page-main">
      <span className="eyebrow"> طريقة عملنا </span>
      <h1 className="page-title"> مسار واضح. ومساحة للأفكار. </h1>
      <p className="page-intro">
        {" "}
        خطة مشتركة من أول حوار حتى الإطلاق وما بعده.{" "}
      </p>
      {settings.page_process ? (
        <article className="prose-content">{settings.page_process}</article>
      ) : (
        <div className="editorial-grid">
          <section className="detail-panel">
            <h2> ٠١ / نفهم </h2>
            <p> نستمع ونحدد التحدي ونفهم الجمهور ونتفق على معايير النجاح. </p>
          </section>
          <section className="detail-panel">
            <h2> ٠٢ / نخطط </h2>
            <p>
              {" "}
              نتفق على نطاق العمل والمخرجات والمسؤوليات والجدول الزمني والشروط
              المالية قبل التنفيذ.{" "}
            </p>
          </section>
          <section className="detail-panel">
            <h2> ٠٣ / ننفّذ </h2>
            <p>
              {" "}
              يتقدم التصميم والتطوير عبر مراحل واضحة تتضمن المراجعة
              والملاحظات.{" "}
            </p>
          </section>
          <section className="detail-panel">
            <h2> ٠٤ / نسلّم وننمو </h2>
            <p>
              {" "}
              نختبر ونجهز التسليم ونطلق المشروع بعناية. يُتفق على أي عمل مستمر
              بشكل منفصل وواضح.{" "}
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
