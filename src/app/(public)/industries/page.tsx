import Link from "next/link";
import { publicData } from "@/lib/public-data";
export const metadata = { title: "Industries" };
export default async function Page() {
  const { settings } = await publicData();
  return (
    <main id="main" className="section-wrap page-main">
      <span className="eyebrow">INDUSTRIES</span>
      <h1 className="page-title">Built around your business.</h1>
      <p className="page-intro">
        Every business has a different set of challenges. We start by
        understanding yours, rather than forcing it into a template.
      </p>
      {settings.page_industries ? (
        <article className="prose-content">{settings.page_industries}</article>
      ) : (
        <div className="editorial-grid">
          <section className="detail-panel">
            <h2>Retail & commerce</h2>
            <p>
              Digital storefronts, customer journeys and marketing that connect
              discovery with purchase.
            </p>
          </section>
          <section className="detail-panel">
            <h2>Professional services</h2>
            <p>
              Clear positioning, credible digital presence and better inquiry
              management.
            </p>
          </section>
          <section className="detail-panel">
            <h2>Education & training</h2>
            <p>
              Accessible experiences, useful content and systems that support
              learning businesses.
            </p>
          </section>
          <section className="detail-panel">
            <h2>Growing businesses</h2>
            <p>
              Operational systems, brand foundations and practical plans for the
              next stage.
            </p>
          </section>
        </div>
      )}
      <Link href="/contact" className="primary-link">
        Start a conversation ↗
      </Link>
    </main>
  );
}
