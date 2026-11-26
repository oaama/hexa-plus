import Link from "next/link";
import { publicData } from "@/lib/public-data";
export const metadata = { title: "Privacy policy" };
export default async function Page() {
  const { settings } = await publicData();
  return (
    <main id="main" className="section-wrap page-main">
      <span className="eyebrow">PRIVACY POLICY</span>
      <h1 className="page-title">Your information, handled with care.</h1>
      <p className="page-intro">
        This policy explains how the HEXA PLUS website uses information
        submitted through its project inquiry form.
      </p>
      {settings.page_privacy ? (
        <article className="prose-content">{settings.page_privacy}</article>
      ) : (
        <div className="editorial-grid">
          <section className="detail-panel">
            <h2>What we collect</h2>
            <p>
              Your name, company, email, phone or WhatsApp number, requested
              service, optional budget and timeline, project description and
              your consent to follow up.
            </p>
          </section>
          <section className="detail-panel">
            <h2>Why we use it</h2>
            <p>
              To review your inquiry, understand your requirements and contact
              you about the work you asked about. Submitting this form does not
              subscribe you to marketing.
            </p>
          </section>
          <section className="detail-panel">
            <h2>Storage and access</h2>
            <p>
              Inquiries are stored in a Supabase database in Europe and are
              available to authorized HEXA PLUS staff through a private
              dashboard. Hosting and infrastructure providers process data as
              needed to operate the website.
            </p>
          </section>
          <section className="detail-panel">
            <h2>Your choices</h2>
            <p>
              Do not include passwords, financial credentials, identity
              documents or sensitive information. You can ask the team to
              correct or delete your inquiry through the contact form, using the
              same email address.
            </p>
          </section>
          <section className="detail-panel">
            <h2>Cookies</h2>
            <p>
              The public website does not use advertising cookies. The private
              dashboard uses necessary authentication cookies. Dashboard
              language and display preferences may be saved locally in your
              browser.
            </p>
          </section>
          <section className="detail-panel">
            <h2>Retention and updates</h2>
            <p>
              Information should be retained only while needed for the inquiry
              or an agreed business relationship. This policy may be updated as
              the service changes. Updated: 21 November 2026.
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
