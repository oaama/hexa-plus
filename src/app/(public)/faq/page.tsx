import Link from "next/link";
import { publicData } from "@/lib/public-data";
export const metadata = { title: "FAQ" };
export default async function Page() {
  const { settings } = await publicData();
  return (
    <main id="main" className="section-wrap page-main">
      <span className="eyebrow">FAQ</span>
      <h1 className="page-title">A little clarity, before we start.</h1>
      <p className="page-intro">
        Answers to the questions that usually come first.
      </p>
      {settings.page_faq ? (
        <article className="prose-content">{settings.page_faq}</article>
      ) : (
        <div className="editorial-grid">
          <section className="detail-panel">
            <h2>What does HEXA PLUS do?</h2>
            <p>
              We combine software development, business systems, digital
              transformation, marketing, branding and creative production.
            </p>
          </section>
          <section className="detail-panel">
            <h2>Can we work on only one service?</h2>
            <p>
              Yes. The right scope might be a focused service or a connected
              group of services. We define it together.
            </p>
          </section>
          <section className="detail-panel">
            <h2>How much will my project cost?</h2>
            <p>
              Cost depends on scope, complexity, delivery requirements and
              timeline. Send an inquiry for a project-specific discussion. No
              price is promised by this website.
            </p>
          </section>
          <section className="detail-panel">
            <h2>How long does a project take?</h2>
            <p>
              We agree a realistic schedule after discovery. Timelines depend on
              scope, feedback, dependencies and available materials.
            </p>
          </section>
          <section className="detail-panel">
            <h2>Where are you based?</h2>
            <p>
              Minya, Egypt. Use the inquiry form to discuss your project and
              collaboration needs.
            </p>
          </section>
          <section className="detail-panel">
            <h2>Do you publish or run ads automatically?</h2>
            <p>
              No. Our internal marketing workspace records plans and results.
              Publishing and advertising require their own tools and explicit
              authorization.
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
