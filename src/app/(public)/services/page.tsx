import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { publicData } from "@/lib/public-data";
import { SdlcFlow } from "@/components/sdlc-flow";
export const metadata = { title: "Services" };
export default async function Services() {
  const { services } = await publicData();
  return (
    <main id="main" className="section-wrap page-main">
      <span className="eyebrow">WHAT WE DO</span>
      <h1 className="page-title">
        Two disciplines.
        <br />
        <span>One connected vision.</span>
      </h1>
      <p className="page-intro">
        From the systems that run your business to the stories that grow your
        brand.
      </p>
      {[
        ["digital", "Digital solutions", "Technology that moves you forward."],
        [
          "marketing",
          "Marketing & creative",
          "Make your presence mean something.",
        ],
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
                <Link href={"/services/" + s.slug} key={s.slug}>
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
    <SdlcFlow />
    </main>
  );
}
