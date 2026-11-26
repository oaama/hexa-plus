import Link from "next/link";
import { publicData } from "@/lib/public-data";
export const metadata = { title: "Terms & conditions" };
export default async function Page() {
  const { settings } = await publicData();
  return (
    <main id="main" className="section-wrap page-main">
      <span className="eyebrow">TERMS & CONDITIONS</span>
      <h1 className="page-title">A clear starting point.</h1>
      <p className="page-intro">
        These terms cover use of the HEXA PLUS website. Project-specific terms
        are agreed separately.
      </p>
      {settings.page_terms ? (
        <article className="prose-content">{settings.page_terms}</article>
      ) : (
        <div className="editorial-grid">
          <section className="detail-panel">
            <h2>Website information</h2>
            <p>
              Service descriptions introduce our capabilities. They are not a
              binding quote, guarantee of results or commitment to a delivery
              date.
            </p>
          </section>
          <section className="detail-panel">
            <h2>Project inquiries</h2>
            <p>
              Sending an inquiry does not create a contract or obligation to
              pay. Scope, fees, timing, ownership and support are agreed in a
              separate written project agreement.
            </p>
          </section>
          <section className="detail-panel">
            <h2>Content and intellectual property</h2>
            <p>
              HEXA PLUS branding and original website content remain the
              property of their respective rights holders. Do not copy or misuse
              them without permission.
            </p>
          </section>
          <section className="detail-panel">
            <h2>Acceptable use</h2>
            <p>
              Do not submit unlawful content, upload malicious files, attempt
              unauthorized access or interfere with the website.
            </p>
          </section>
          <section className="detail-panel">
            <h2>Availability</h2>
            <p>
              We aim to keep the website useful and available, but uninterrupted
              access is not guaranteed. Free-tier hosting may pause when idle.
            </p>
          </section>
          <section className="detail-panel">
            <h2>Questions</h2>
            <p>
              Use our contact form if you have a question about the website or
              these terms. Updated: 21 November 2026.
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
