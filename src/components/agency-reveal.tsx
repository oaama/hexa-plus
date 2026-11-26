"use client";
import { useRef } from "react";
import { useInView, useReducedMotion } from "framer-motion";
export function AgencyReveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-35px" });
  const reduced = useReducedMotion();
  return (
    <div
      ref={ref}
      className={
        className + (inView && !reduced ? " agency-reveal-visible" : "")
      }
      style={{ animationDelay: delay + "s" }}
    >
      {children}
    </div>
  );
}
