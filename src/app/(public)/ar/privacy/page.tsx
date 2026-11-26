import Link from "next/link";
import { publicData } from "@/lib/public-data-ar";
export const metadata = { title: "سياسة الخصوصية" };
export default async function Page() {
  const { settings } = await publicData();
  return (
    <main id="main" className="section-wrap page-main">
      <span className="eyebrow"> سياسة الخصوصية </span>
      <h1 className="page-title"> بياناتك أمانة. </h1>
      <p className="page-intro">
        {" "}
        توضح هذه السياسة كيفية استخدام موقع هيكسا بلس للبيانات المرسلة من خلال
        نموذج الاستفسار عن المشاريع.{" "}
      </p>
      {settings.page_privacy ? (
        <article className="prose-content">{settings.page_privacy}</article>
      ) : (
        <div className="editorial-grid">
          <section className="detail-panel">
            <h2> البيانات التي نجمعها </h2>
            <p>
              {" "}
              الاسم والشركة والبريد الإلكتروني ورقم الهاتف أو واتساب والخدمة
              المطلوبة، والميزانية والموعد اختياريًا، ووصف المشروع وموافقتك على
              المتابعة.{" "}
            </p>
          </section>
          <section className="detail-panel">
            <h2> لماذا نستخدمها </h2>
            <p>
              {" "}
              لمراجعة استفسارك وفهم احتياجاتك والتواصل بشأن العمل المطلوب. إرسال
              النموذج لا يشترك بك في رسائل تسويقية.{" "}
            </p>
          </section>
          <section className="detail-panel">
            <h2> التخزين والوصول </h2>
            <p>
              {" "}
              تُخزن الاستفسارات في قاعدة بيانات Supabase في أوروبا، ويصل إليها
              موظفو هيكسا بلس المصرح لهم من خلال لوحة خاصة. يعالج مزودو
              الاستضافة والبنية التحتية البيانات اللازمة لتشغيل الموقع.{" "}
            </p>
          </section>
          <section className="detail-panel">
            <h2> خياراتك </h2>
            <p>
              {" "}
              لا تُرسل كلمات مرور أو بيانات مالية أو مستندات هوية أو معلومات
              حساسة. يمكنك طلب تصحيح استفسارك أو حذفه عبر نموذج التواصل باستخدام
              البريد الإلكتروني نفسه.{" "}
            </p>
          </section>
          <section className="detail-panel">
            <h2> ملفات الارتباط </h2>
            <p>
              {" "}
              لا يستخدم الموقع العام ملفات ارتباط إعلانية. تستخدم اللوحة الخاصة
              ملفات ضرورية لتسجيل الدخول، وقد تُحفظ تفضيلات اللغة والعرض محليًا في
              متصفحك.{" "}
            </p>
          </section>
          <section className="detail-panel">
            <h2> الاحتفاظ والتحديثات </h2>
            <p>
              {" "}
              يُحتفظ بالبيانات ما دامت لازمة للاستفسار أو لعلاقة عمل متفق عليها.
              قد تتغير السياسة مع تطور الخدمة. آخر تحديث: ٢١ نوفمبر ٢٠٢٦.{" "}
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
