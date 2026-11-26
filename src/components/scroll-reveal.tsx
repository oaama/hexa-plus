"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
const SELECTORS = [
  ".page-main .section-heading",
  ".page-main .catalog-section",
  ".page-main .detail-panel",
  ".page-main .service-catalog > a",
  ".page-main .case-meta",
  ".page-main .prose-content",
  ".page-main .related-work",
  ".page-main .filter-row",
  ".page-main .work-hero-strip",
  ".page-main .primary-link",
  ".page-main .contact-method",
  ".page-main .contact-intro",
].join(", ");
export function ScrollReveal() {
  const pathname = usePathname();
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const items = Array.from(
      document.querySelectorAll<HTMLElement>(SELECTORS),
    ).filter((el) => !el.classList.contains("sr-item"));
    items.forEach((el, i) => {
      el.classList.add("sr-item");
      el.style.transitionDelay = `${Math.min(i * 60, 300)}ms`;
    });
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("sr-in");
            io.unobserve(entry.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);
  return null;
}
