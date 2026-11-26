"use client";
import { useState, useEffect } from "react";
import { Pause, Play } from "lucide-react";
export function CapabilityTicker({ ar = false }: { ar?: boolean }) {
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion:reduce)");
    setPaused(media.matches);
  }, []);
  const words = ar
    ? ["فكر جريء", "تصميم هادف", "تقنية متقنة", "أثر حقيقي"]
    : [
        "BOLD THINKING",
        "PURPOSEFUL DESIGN",
        "PRECISE TECHNOLOGY",
        "REAL IMPACT",
      ];
  return (
    <div className={"capability-ticker " + (paused ? "ticker-paused" : "")}>
      <div className="ticker-window" aria-label={words.join("، ")}>
        <div className="ticker-track" aria-hidden="true">
          {[0, 1, 2, 3].map((n) => (
            <span key={n}>
              {words.map((w) => (
                <span key={w}>
                  {w}
                  <i>✳</i>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
      <button
        onClick={() => setPaused(!paused)}
        aria-label={
          paused
            ? ar
              ? "تشغيل شريط الخدمات"
              : "Play capabilities ticker"
            : ar
              ? "إيقاف شريط الخدمات"
              : "Pause capabilities ticker"
        }
      >
        {paused ? <Play size={13} /> : <Pause size={13} />}
      </button>
    </div>
  );
}
