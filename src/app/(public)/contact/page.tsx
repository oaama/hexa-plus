import { publicData } from "@/lib/public-data";
import { InquiryForm } from "@/components/inquiry-form";
import { MapPin, ArrowUpRight } from "lucide-react";
export const metadata = { title: "Start your project" };
export default async function Contact({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const { services, settings, connected } = await publicData();
  const { service } = await searchParams;
  return (
    <main id="main" className="section-wrap page-main contact-layout">
      <div className="contact-intro">
        <span className="eyebrow">LET'S START SOMETHING</span>
        <h1 className="page-title">
          Big idea?
          <br />
          First step?
          <br />
          <span>We're listening.</span>
        </h1>
        <p>
          Tell us where you are and where you want to go. We'll work out the
          right next step together.
        </p>
        <div className="contact-location">
          <MapPin size={18} />
          {settings.address || "Minya, Egypt"}
        </div>
        {settings.contact_email && (
          <a
            className="contact-method"
            href={"mailto:" + settings.contact_email}
          >
            {settings.contact_email}
            <ArrowUpRight size={16} />
          </a>
        )}
        {settings.contact_phone && (
          <a className="contact-method" href={"tel:" + settings.contact_phone}>
            {settings.contact_phone}
          </a>
        )}
      </div>
      <InquiryForm
        services={services.map((s) => s.name)}
        selected={service}
        connected={connected}
      />
    </main>
  );
}
