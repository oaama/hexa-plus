"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return (
    <header className="site-header">
      <Link href="/ar" className="brand" aria-label="هيكسا بلس، الرئيسية">
        <img
          src="/hexa-mark.png"
          width="46"
          height="47"
          alt="هيكسا بلس"
        />
        <span>
          HEXA<span className="brand-plus">PLUS</span>
          <small> الحلول الرقمية والتسويق </small>
        </span>
      </Link>
      <nav
        aria-label="القائمة الرئيسية"
        className={open ? "site-nav open" : "site-nav"}
      >
        <Link onClick={() => setOpen(false)} href="/ar/services">
          {" "}
          خدماتنا{" "}
        </Link>
        <Link onClick={() => setOpen(false)} href="/ar/portfolio">
          {" "}
          أعمالنا{" "}
        </Link>
        <Link onClick={() => setOpen(false)} href="/ar/about">
          {" "}
          من نحن{" "}
        </Link>
        <Link
          onClick={() => setOpen(false)}
          href="/ar/contact"
          className="nav-cta"
        >
          {" "}
          لنتحدث <ArrowUpRight size={16} />
        </Link>
      </nav>
      <a
        className="language-switch"
        href={pathname.replace(/^\/ar(?=\/|$)/, "") || "/"}
        lang="en"
        aria-label="View in English"
      >
        English
      </a>
      <button
        className="mobile-menu"
        aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? <X /> : <Menu />}
      </button>
    </header>
  );
}
