import Link from "next/link";
import { Eye, Target, HeartHandshake, Compass, Layers3, Users } from "lucide-react";
import { publicData } from "@/lib/public-data";
export const metadata = { title: "About us" };
export default async function Page() {
  const { settings } = await publicData();
  return (
    <main id="main" className="section-wrap page-main">
      <span className="eyebrow">ABOUT US</span>
      <h1 className="page-title">Different skills. One shared direction.</h1>
      <p className="page-intro">
        HEXA PLUS brings digital solutions and marketing services together in
        Minya, Egypt. We connect technology, creativity and business thinking to
        turn ideas into useful digital experiences.
      </p>
      {settings.page_about ? (
        <article className="prose-content">{settings.page_about}</article>
      ) : (
        <div className="editorial-grid">
          <section className="detail-panel">
            <span className="panel-icon"><Eye size={22} /></span>
            <h2>Our vision</h2>
            <p>
              Help businesses move forward with technology and communication
              that work together.
            </p>
          </section>
          <section className="detail-panel">
            <span className="panel-icon"><Target size={22} /></span>
            <h2>Our mission</h2>
            <p>
              Build considered digital products, business solutions and brand
              experiences around clear goals.
            </p>
          </section>
          <section className="detail-panel">
            <span className="panel-icon"><HeartHandshake size={22} /></span>
            <h2>What matters to us</h2>
            <p>
              Clarity, thoughtful work, honest communication and long-term
              usefulness.
            </p>
          </section>
          <section className="detail-panel">
            <span className="panel-icon"><Compass size={22} /></span>
            <h2>How we think</h2>
            <p>
              Start with the business. Understand the people. Choose the right
              approach. Make every part connect.
            </p>
          </section>
          <section className="detail-panel">
            <span className="panel-icon"><Layers3 size={22} /></span>
            <h2>Our capabilities</h2>
            <p>
              Software development, digital transformation, business systems,
              digital marketing, creative production, branding and growth
              strategy.
            </p>
          </section>
          <section className="detail-panel">
            <span className="panel-icon"><Users size={22} /></span>
            <h2>Our team</h2>
            <p>
              A connected approach across development, design, marketing and
              strategy. Team profiles will be published when approved.
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
