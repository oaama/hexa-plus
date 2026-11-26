import Link from "next/link";
import { publicData } from "@/lib/public-data-ar";
export const metadata = { title: "القطاعات" };
export default async function Page() {
  const { settings } = await publicData();
  return (
    <main id="main" className="section-wrap page-main">
      <span className="eyebrow"> القطاعات </span>
      <h1 className="page-title"> حلول تنطلق من طبيعة عملك. </h1>
      <p className="page-intro">
        {" "}
        لكل نشاط تحدياته. نبدأ بفهم تحدياتك بدلًا من فرض قالب جاهز عليها.{" "}
      </p>
      {settings.page_industries ? (
        <article className="prose-content">{settings.page_industries}</article>
      ) : (
        <div className="editorial-grid">
          <section className="detail-panel">
            <h2> التجزئة والتجارة </h2>
            <p>
              {" "}
              متاجر رقمية ورحلات عملاء وتسويق يربط بين اكتشاف المنتج
              وشرائه.{" "}
            </p>
          </section>
          <section className="detail-panel">
            <h2> الخدمات المهنية </h2>
            <p> تموضع واضح وحضور رقمي موثوق وإدارة أفضل للاستفسارات. </p>
          </section>
          <section className="detail-panel">
            <h2> التعليم والتدريب </h2>
            <p>
              {" "}
              تجارب سهلة الاستخدام ومحتوى مفيد وأنظمة تدعم مؤسسات التعليم
              والتدريب.{" "}
            </p>
          </section>
          <section className="detail-panel">
            <h2> الشركات النامية </h2>
            <p>
              {" "}
              أنظمة تشغيل وأسس للعلامة التجارية وخطط عملية للمرحلة المقبلة.{" "}
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
