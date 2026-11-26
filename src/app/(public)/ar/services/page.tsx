import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { publicData } from "@/lib/public-data-ar";
export const metadata = { title: "الخدمات" };
export default async function Services() {
  const { services } = await publicData();
  return (
    <main id="main" className="section-wrap page-main">
      <span className="eyebrow"> خدماتنا </span>
      <h1 className="page-title">
        {" "}
        تخصصان. <br />
        <span> رؤية متكاملة. </span>
      </h1>
      <p className="page-intro">
        {" "}
        من الأنظمة التي تدير أعمالك إلى القصص التي تبني علامتك التجارية.{" "}
      </p>
      {[
        ["digital", "الحلول الرقمية", "تقنية تدفعك إلى الأمام."],
        ["marketing", "التسويق والإبداع", "حضور يعبر عنك ويصنع أثرًا."],
      ].map(([id, title, sub]) => (
        <section id={id} key={id} className="catalog-section">
          <div className="section-heading">
            <h2>{title}</h2>
            <p>{sub}</p>
          </div>
          <div className="service-catalog">
            {services
              .filter((s) => s.division === id)
              .map((s, i) => (
                <Link href={"/ar/services/" + s.slug} key={s.slug}>
                  <span className="muted-number">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3>{s.name}</h3>
                  <p>{s.description}</p>
                  <ArrowUpRight size={22} />
                </Link>
              ))}
          </div>
        </section>
      ))}
    </main>
  );
}
