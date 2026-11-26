import Link from "next/link";
import { publicData } from "@/lib/public-data";
export const metadata = { title: "Careers" };
export default async function Page() {
  const { settings } = await publicData();
  return (
    <main id="main" className="section-wrap page-main">
      <span className="eyebrow">CAREERS</span>
      <h1 className="page-title">Good work starts with good people.</h1>
      <p className="page-intro">
        Interested in working across technology, design and marketing? We value
        clear thinking, care for the details and people who enjoy making things
        together.
      </p>
      {settings.page_careers ? (
        <article className="prose-content">{settings.page_careers}</article>
      ) : (
        <div className="editorial-grid">
          <section className="detail-panel">
            <h2>Open roles</h2>
            <p>
              No open roles are currently listed on this website. We do not
              collect applications through third-party recruitment forms here.
            </p>
          </section>
          <section className="detail-panel">
            <h2>Introduce yourself</h2>
            <p>
              Use our contact form and select Careers / introduction. Tell us
              what you do and include a link to your work. Please do not send
              identity documents or sensitive personal details.
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
