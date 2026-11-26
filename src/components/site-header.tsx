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
      <Link href="/" className="brand" aria-label="HEXA PLUS home">
        <img
          src="/hexa-mark.png"
          width="46"
          height="47"
          alt="HEXA PLUS"
        />
        <span>
          HEXA<span className="brand-plus">PLUS</span>
          <small>DIGITAL SOLUTIONS + MARKETING</small>
        </span>
      </Link>
      <nav
        aria-label="Main navigation"
        className={open ? "site-nav open" : "site-nav"}
      >
        <Link onClick={() => setOpen(false)} href="/services">
          What we do
        </Link>
        <Link onClick={() => setOpen(false)} href="/portfolio">
          Our work
        </Link>
        <Link onClick={() => setOpen(false)} href="/about">
          About us
        </Link>
        <Link
          onClick={() => setOpen(false)}
          href="/contact"
          className="nav-cta"
        >
          Let's talk <ArrowUpRight size={16} />
        </Link>
      </nav>
      <a
        className="language-switch"
        href={"/ar" + (pathname === "/" ? "" : pathname)}
        lang="ar"
        aria-label="عرض الموقع بالعربية"
      >
        العربية
      </a>
      <button
        className="mobile-menu"
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? <X /> : <Menu />}
      </button>
    </header>
  );
}
