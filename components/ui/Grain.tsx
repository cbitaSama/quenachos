type Props = {
  opacity?: number;
  blendMode?: "overlay" | "multiply" | "soft-light" | "normal";
  className?: string;
};

export function Grain({
  opacity = 0.12,
  blendMode = "overlay",
  className = "",
}: Props) {
  return (
    <svg
      aria-hidden="true"
      role="presentation"
      className={`pointer-events-none absolute inset-0 size-full ${className}`}
      style={{ mixBlendMode: blendMode, opacity }}
    >
      <filter id="qn-grain">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.9"
          numOctaves="3"
          stitchTiles="stitch"
        />
        <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#qn-grain)" />
    </svg>
  );
}
