"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { HexaScene } from "./hexa-scene";
import { Pause, Play, ArrowUpRight } from "lucide-react";
export function HexaMotion({ ar = false }: { ar?: boolean }) {
  const stage = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setPaused(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  return (
    <div
      className={
        "hexa-motion " +
        (paused ? "motion-paused" : "") +
        (ready ? " scene-ready" : "")
      }
      ref={stage}
      onPointerMove={(e) => {
        if (paused || e.pointerType === "touch") return;
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty(
          "--mx",
          ((e.clientX - r.left) / r.width - 0.5) * 18 + "deg",
        );
        e.currentTarget.style.setProperty(
          "--my",
          -((e.clientY - r.top) / r.height - 0.5) * 18 + "deg",
        );
      }}
      onPointerLeave={() => {
        stage.current?.style.setProperty("--mx", "0deg");
        stage.current?.style.setProperty("--my", "0deg");
      }}
    >
      <div className="motion-cross cross-a">+</div>
      <div className="motion-cross cross-b">+</div>
      <span className="motion-coordinate">H / 06</span>
      <div className="hex-orbit orbit-a" />
      <div className="hex-orbit orbit-b" />
      <HexaScene paused={paused} onReady={onReady} />
      <div className="hex-object">
        <svg viewBox="0 0 520 540" aria-hidden="true">
          <defs>
            <linearGradient id="hex-front" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#a489ff" />
              <stop offset=".43" stopColor="#6245e3" />
              <stop offset="1" stopColor="#134fe9" />
            </linearGradient>
            <linearGradient id="hex-side" x1="0" x2="1">
              <stop stopColor="#17359d" />
              <stop offset="1" stopColor="#020f3a" />
            </linearGradient>
            <linearGradient id="hex-top" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#bdabff" />
              <stop offset="1" stopColor="#7852ea" />
            </linearGradient>
          </defs>
          <g className="hex-depth">
            <path
              d="M260 46 446 154 446 370 260 478 74 370 74 154Z M260 145 160 202 160 320 260 379 360 320 360 202Z"
              fill="url(#hex-side)"
              fillRule="evenodd"
              transform="translate(19 25)"
            />
            <path
              d="m74 154 19 25v216l-19-25Zm372 0 19 25v216l-19-25Z"
              fill="#4933b9"
            />
            <path
              d="M260 46 446 154 446 370 260 478 74 370 74 154Z M260 145 160 202 160 320 260 379 360 320 360 202Z"
              fill="url(#hex-front)"
              fillRule="evenodd"
              stroke="#b3a0f6"
              strokeWidth="1"
            />
            <path
              d="m74 154 186-108 186 108-86 48-100-57-100 57Z"
              fill="url(#hex-top)"
              opacity=".82"
            />
            <path
              d="m260 379 100-59v-118l86-48v216L260 478Z"
              fill="#134fe9"
              opacity=".8"
            />
            <path d="m74 370 86-50 100 59v99Z" fill="#6845e2" />
            <path
              d="m260 46 186 108M74 154l86 48M260 379v99"
              fill="none"
              stroke="#e4ebff"
              strokeOpacity=".5"
            />
            <path
              d="m260 77 158 92v183l-158 92-158-92V169Z"
              fill="none"
              stroke="#d6e0ff"
              strokeOpacity=".24"
            />
          </g>
        </svg>
        <span className="floating-plus">+</span>
      </div>
      <div className="motion-caption">
        <span>
          {ar ? "تقنية × إبداع × أثر" : "TECHNOLOGY × CREATIVITY × IMPACT"}
        </span>
        <span className="motion-live">
          <i />
          {ar ? "في حركة مستمرة" : "ALWAYS IN MOTION"}
        </span>
      </div>
      <button
        className="motion-toggle"
        onClick={() => setPaused(!paused)}
        aria-label={
          paused
            ? ar
              ? "تشغيل الحركة"
              : "Play animation"
            : ar
              ? "إيقاف الحركة مؤقتًا"
              : "Pause animation"
        }
      >
        {paused ? <Play size={13} /> : <Pause size={13} />}
      </button>
    </div>
  );
}
