import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
export function SiteFooter({
  settings = {},
}: {
  settings?: Record<string, string>;
}) {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div>
          <img className="footer-logo" src="/hexa-logo.png" width="150" height="126" alt="HEXA PLUS" />
          <div className="wordmark">
            HEXA<span>PLUS</span>
            <sup>+</sup>
          </div>
          <p>
            {settings.footer_description ||
              "Technology. Creativity. Business growth."}
          </p>
          <p>Minya, Egypt. Built for what comes next.</p>
        </div>
        <div>
          <h3>Explore</h3>
          <Link href="/services">Services</Link>
          <Link href="/portfolio">Our work</Link>
          <Link href="/about">About us</Link>
          <Link href="/industries">Industries</Link>
        </div>
        <div>
          <h3>Good to know</h3>
          <Link href="/process">Our process</Link>
          <Link href="/careers">Careers</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/contact">
            Start a project <ArrowUpRight size={14} />
          </Link>
        </div>
        {Object.entries(settings).filter(
          ([k, v]) => k.startsWith("social_") && /^https:\/\//.test(v),
        ).length > 0 && (
          <div>
            <h3>Follow us</h3>
            {Object.entries(settings)
              .filter(
                ([k, v]) => k.startsWith("social_") && /^https:\/\//.test(v),
              )
              .map(([k, v]) => (
                <a key={k} href={v} target="_blank" rel="noopener noreferrer">
                  {k.replace("social_", "")}
                </a>
              ))}
          </div>
        )}
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} HEXA PLUS</span>
        <div>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/login">Team login</Link>
        </div>
      </div>
    </footer>
  );
}
