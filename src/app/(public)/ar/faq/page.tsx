import Link from "next/link";
import { Sparkles, CheckCircle2, Lightbulb, Rocket, ShieldCheck, Star } from "lucide-react";
import { publicData } from "@/lib/public-data-ar";
export const metadata = { title: "الأسئلة الشائعة" };
export default async function Page() {
  const { settings } = await publicData();
  return (
    <main id="main" className="section-wrap page-main">
      <span className="eyebrow"> الأسئلة الشائعة </span>
      <h1 className="page-title"> إجابات واضحة قبل البداية. </h1>
      <p className="page-intro">
        {" "}
        إجابات عن الأسئلة التي تهمك قبل بدء التعاون.{" "}
      </p>
      {settings.page_faq ? (
        <article className="prose-content">{settings.page_faq}</article>
      ) : (
        <div className="editorial-grid">
          <section className="detail-panel">
            <span className="panel-icon"><Sparkles size={22} /></span>
            <h2> ماذا تقدم هيكسا بلس؟ </h2>
            <p>
              {" "}
              نجمع بين تطوير البرمجيات وأنظمة الأعمال والتحول الرقمي والتسويق
              والهوية البصرية والإنتاج الإبداعي.{" "}
            </p>
          </section>
          <section className="detail-panel">
            <span className="panel-icon"><CheckCircle2 size={22} /></span>
            <h2> هل يمكن طلب خدمة واحدة فقط؟ </h2>
            <p>
              {" "}
              نعم. قد يكون الأنسب خدمة محددة أو مجموعة خدمات مترابطة، ونحدد ذلك
              معًا.{" "}
            </p>
          </section>
          <section className="detail-panel">
            <span className="panel-icon"><Lightbulb size={22} /></span>
            <h2> كم تبلغ تكلفة مشروعي؟ </h2>
            <p>
              {" "}
              تعتمد التكلفة على نطاق العمل وتعقيده ومتطلبات التسليم والمدة. أرسل
              استفسارك لمناقشة مشروعك. الأسعار لا تُعتمد من خلال الموقع.{" "}
            </p>
          </section>
          <section className="detail-panel">
            <span className="panel-icon"><Rocket size={22} /></span>
            <h2> ما مدة تنفيذ المشروع؟ </h2>
            <p>
              {" "}
              نتفق على جدول واقعي بعد فهم المشروع، وفق النطاق والمراجعات
              والمتطلبات والمحتوى المتاح.{" "}
            </p>
          </section>
          <section className="detail-panel">
            <span className="panel-icon"><ShieldCheck size={22} /></span>
            <h2> أين مقر هيكسا بلس؟ </h2>
            <p>
              {" "}
              المنيا، مصر. استخدم نموذج التواصل لمناقشة مشروعك واحتياجات
              التعاون.{" "}
            </p>
          </section>
          <section className="detail-panel">
            <span className="panel-icon"><Star size={22} /></span>
            <h2> هل تُنشر المواد والإعلانات تلقائيًا؟ </h2>
            <p>
              {" "}
              لا. تسجل مساحة التسويق الداخلية الخطط والنتائج. النشر وتشغيل
              الإعلانات يحتاجان إلى أدوات منفصلة وموافقة صريحة.{" "}
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
