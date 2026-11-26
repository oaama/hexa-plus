"use client";
import { useLayoutEffect, useRef } from "react";

/**
 * Entrance reveal that never hides content when JS is unavailable.
 * The server-rendered HTML is fully visible; on mount (before paint)
 * the element is hidden and then animated in when it scrolls into view.
 * If IntersectionObserver is missing or reduced motion is preferred,
 * the element simply stays visible.
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
  y = 26,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  id?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;
    el.style.opacity = "0";
    el.style.transform = `translateY(${y}px)`;
    const ease = "cubic-bezier(0.22, 1, 0.36, 1)";
    el.style.transition = `opacity 0.6s ${delay}s ${ease}, transform 0.6s ${delay}s ${ease}`;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
            io.disconnect();
          }
        }),
      { rootMargin: "0px 0px -40px 0px", threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay, y]);

  return (
    <div ref={ref} className={className} id={id}>
      {children}
    </div>
  );
}
