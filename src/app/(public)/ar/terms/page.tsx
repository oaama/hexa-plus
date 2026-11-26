import Link from "next/link";
import { publicData } from "@/lib/public-data-ar";
export const metadata = { title: "الشروط والأحكام" };
export default async function Page() {
  const { settings } = await publicData();
  return (
    <main id="main" className="section-wrap page-main">
      <span className="eyebrow"> الشروط والأحكام </span>
      <h1 className="page-title"> بداية واضحة للتعاون. </h1>
      <p className="page-intro">
        {" "}
        تنظم هذه الشروط استخدام موقع هيكسا بلس. تُعتمد شروط كل مشروع بشكل
        منفصل.{" "}
      </p>
      {settings.page_terms ? (
        <article className="prose-content">{settings.page_terms}</article>
      ) : (
        <div className="editorial-grid">
          <section className="detail-panel">
            <h2> معلومات الموقع </h2>
            <p>
              {" "}
              توضح أوصاف الخدمات قدراتنا، ولا تمثل عرض سعر ملزمًا أو ضمانًا
              للنتائج أو التزامًا بموعد تسليم.{" "}
            </p>
          </section>
          <section className="detail-panel">
            <h2> استفسارات المشاريع </h2>
            <p>
              {" "}
              إرسال الاستفسار لا يُنشئ عقدًا أو التزامًا بالدفع. يُتفق على النطاق
              والرسوم والمواعيد والملكية والدعم في اتفاق مكتوب مستقل.{" "}
            </p>
          </section>
          <section className="detail-panel">
            <h2> المحتوى والملكية الفكرية </h2>
            <p>
              {" "}
              تظل هوية هيكسا بلس ومحتويات الموقع الأصلية ملكًا لأصحاب حقوقها. لا
              يجوز نسخها أو إساءة استخدامها دون إذن.{" "}
            </p>
          </section>
          <section className="detail-panel">
            <h2> الاستخدام المقبول </h2>
            <p>
              {" "}
              لا ترسل محتوى مخالفًا للقانون أو ملفات ضارة، ولا تحاول الوصول دون
              تصريح أو تعطيل الموقع.{" "}
            </p>
          </section>
          <section className="detail-panel">
            <h2> توفر الخدمة </h2>
            <p>
              {" "}
              نعمل على إتاحة الموقع، لكن لا نضمن استمرار الوصول دون انقطاع. قد
              تتوقف الاستضافة المجانية مؤقتًا عند عدم الاستخدام.{" "}
            </p>
          </section>
          <section className="detail-panel">
            <h2> استفسارات </h2>
            <p>
              {" "}
              استخدم نموذج التواصل لأي سؤال عن الموقع أو هذه الشروط. آخر تحديث:
              ٢١ نوفمبر ٢٠٢٦.{" "}
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
