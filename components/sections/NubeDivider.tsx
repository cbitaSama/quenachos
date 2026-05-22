"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

type Props = {
  fill?: string;
  flip?: boolean;
  className?: string;
};

const VARIANTS = [
  "M0,80 C200,20 360,140 600,60 C840,-10 1000,110 1200,40 L1200,200 L0,200 Z",
  "M0,70 C180,140 380,10 600,80 C820,150 1020,30 1200,90 L1200,200 L0,200 Z",
  "M0,90 C220,40 400,130 620,50 C800,-15 1040,120 1200,60 L1200,200 L0,200 Z",
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

  return (
    <div
      aria-hidden="true"
      role="presentation"
      className={`pointer-events-none relative -mt-px block h-[10vw] min-h-[70px] w-full sm:h-[11vw] lg:h-[8vw] ${className}`}
      style={{ transform: flip ? "rotate(180deg)" : undefined }}
    >
      <svg
        viewBox="0 0 1200 200"
        preserveAspectRatio="none"
        className="absolute inset-0 size-full"
        style={{ filter: "drop-shadow(0 -10px 30px rgba(0,0,0,0.08))" }}
      >
        <path ref={pathRef} d={VARIANTS[0]} fill={fill} />
      </svg>
    </div>
  );
}
