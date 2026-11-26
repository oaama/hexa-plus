import { publicData } from "@/lib/public-data-ar";
import { InquiryForm } from "@/components/inquiry-form-ar";
import { MapPin, ArrowUpRight } from "lucide-react";
export const metadata = { title: "ابدأ مشروعك" };
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
        <span className="eyebrow"> لنبدأ معًا </span>
        <h1 className="page-title">
          {" "}
          لديك فكرة؟ <br /> تبحث عن البداية؟ <br />
          <span> نحن نستمع. </span>
        </h1>
        <p>
          {" "}
          أخبرنا أين أنت الآن وإلى أين تريد الوصول. نحدد معًا الخطوة
          المناسبة.{" "}
        </p>
        <div className="contact-location">
          <MapPin size={18} />
          {settings.address || "المنيا، مصر"}
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
