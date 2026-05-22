"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

type Props = {
  fill?: string;
  flip?: boolean;
  className?: string;
};

// More dramatic wave — peaks near y=15 and valleys near y=140
// (was 80↔20, now 140↔15 = ~6× more amplitude).
const VARIANTS = [
  "M0,90 C200,20 380,160 600,80 C820,0 1020,150 1200,60 L1200,200 L0,200 Z",
  "M0,70 C180,150 400,15 600,95 C800,170 1040,30 1200,100 L1200,200 L0,200 Z",
  "M0,110 C220,40 400,170 620,60 C840,-5 1060,140 1200,75 L1200,200 L0,200 Z",
];

export function NubeDivider({
  fill = "var(--color-crema)",
  flip = false,
  className = "",
}: Props) {
  const pathRef = useRef<SVGPathElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) return;
    const path = pathRef.current;
    if (!path) return;
    let cancelled = false;
    let i = 0;

    const animate = async () => {
      const gsapMod = await import("gsap");
      const gsap = gsapMod.gsap ?? gsapMod.default;
      if (cancelled) return;
      const tick = () => {
        if (cancelled) return;
        i = (i + 1) % VARIANTS.length;
        gsap.to(path, {
          attr: { d: VARIANTS[i] },
          duration: 4,
          ease: "sine.inOut",
          onComplete: tick,
        });
      };
      tick();
    };
    animate();

    return () => {
      cancelled = true;
    };
  }, [shouldReduceMotion]);

  // The element overlaps the hero by ~half its height — this makes the
  // cream wave appear to "float" over the hero (and below the hero's CTA,
  // which sits in the hero's bottom grid row and is unaffected because
  // the wave element is in the next grid row anyway).
  return (
    <div
      aria-hidden="true"
      role="presentation"
      className={`pointer-events-none relative -mt-[7vw] block h-[18vw] min-h-[120px] w-full sm:-mt-[6vw] sm:h-[16vw] lg:-mt-[4vw] lg:h-[12vw] ${className}`}
      style={{ transform: flip ? "rotate(180deg)" : undefined }}
    >
      <svg
        viewBox="0 0 1200 200"
        preserveAspectRatio="none"
        className="absolute inset-0 size-full"
        style={{
          // upward shadow → cream wave looks elevated above the hero,
          // creating the "floating" feel.
          filter:
            "drop-shadow(0 -12px 24px rgba(0,0,0,0.22)) drop-shadow(0 -2px 6px rgba(0,0,0,0.12))",
        }}
      >
        <path ref={pathRef} d={VARIANTS[0]} fill={fill} />
      </svg>
    </div>
  );
}
