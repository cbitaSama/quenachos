import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  color?: string;
  ariaHidden?: boolean;
};

export function GhostText({
  children,
  className,
  color,
  ariaHidden = true,
}: Props) {
  return (
    <span
      aria-hidden={ariaHidden ? "true" : undefined}
      className={cn(
        "pointer-events-none select-none font-display leading-[0.86] tracking-[-0.04em]",
        className,
      )}
      style={color ? { color } : undefined}
    >
      {children}
    </span>
  );
}
