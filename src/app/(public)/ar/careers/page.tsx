import Link from "next/link";
import { publicData } from "@/lib/public-data-ar";
export const metadata = { title: "انضم إلينا" };
export default async function Page() {
  const { settings } = await publicData();
  return (
    <main id="main" className="section-wrap page-main">
      <span className="eyebrow"> انضم إلينا </span>
      <h1 className="page-title"> العمل المميز يبدأ بأشخاص مميزين. </h1>
      <p className="page-intro">
        {" "}
        هل ترغب في العمل في التقنية والتصميم والتسويق؟ نقدّر التفكير الواضح
        والاهتمام بالتفاصيل ومتعة العمل المشترك.{" "}
      </p>
      {settings.page_careers ? (
        <article className="prose-content">{settings.page_careers}</article>
      ) : (
        <div className="editorial-grid">
          <section className="detail-panel">
            <h2> الوظائف المتاحة </h2>
            <p>
              {" "}
              لا توجد وظائف منشورة حاليًا على الموقع، ولا نجمع طلبات توظيف عبر
              نماذج خارجية هنا.{" "}
            </p>
          </section>
          <section className="detail-panel">
            <h2> عرّفنا بنفسك </h2>
            <p>
              {" "}
              استخدم نموذج التواصل واختر «انضم إلينا / تعارف». أخبرنا بتخصصك
              وأرفق رابط أعمالك. لا ترسل مستندات هوية أو بيانات شخصية
              حساسة.{" "}
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
