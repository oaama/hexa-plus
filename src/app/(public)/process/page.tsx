import Link from "next/link";
import { publicData } from "@/lib/public-data";
export const metadata = { title: "Our process" };
export default async function Page() {
  const { settings } = await publicData();
  return (
    <main id="main" className="section-wrap page-main">
      <span className="eyebrow">OUR PROCESS</span>
      <h1 className="page-title">A clear path. Room for good ideas.</h1>
      <p className="page-intro">
        One shared plan, from the first conversation to launch and beyond.
      </p>
      {settings.page_process ? (
        <article className="prose-content">{settings.page_process}</article>
      ) : (
        <div className="editorial-grid">
          <section className="detail-panel">
            <h2>01 / Discover</h2>
            <p>
              We listen, map the challenge, understand the audience and agree
              what success should mean.
            </p>
          </section>
          <section className="detail-panel">
            <h2>02 / Define</h2>
            <p>
              We agree the scope, deliverables, responsibilities, timeline and
              commercial terms before production.
            </p>
          </section>
          <section className="detail-panel">
            <h2>03 / Create</h2>
            <p>
              Design and development move through visible milestones, with
              feedback built into the process.
            </p>
          </section>
          <section className="detail-panel">
            <h2>04 / Deliver & grow</h2>
            <p>
              We test, prepare the handover and launch carefully. Ongoing work
              is agreed separately and clearly.
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
