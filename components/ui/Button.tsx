import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "whatsapp" | "outline-light";
type Size = "md" | "lg" | "xl";

type Props = ComponentPropsWithoutRef<"a"> & {
  variant?: Variant;
  size?: Size;
  withArrow?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
  asButton?: boolean;
};

const base =
  "group relative inline-flex items-center justify-center gap-2 font-semibold tracking-tight transition-all duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--color-rojo)] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";

const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-[15px] rounded-full",
  lg: "h-13 px-7 text-base rounded-full sm:h-14",
  xl: "h-14 px-8 text-base rounded-full sm:h-16 sm:px-10 sm:text-lg",
};

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--color-rojo)] text-[var(--color-crema)] shadow-[0_10px_30px_-10px_rgba(217,40,47,0.6)] hover:bg-[var(--color-rojo-oscuro)] hover:shadow-[0_18px_40px_-12px_rgba(217,40,47,0.7)] hover:-translate-y-0.5 active:translate-y-0",
  secondary:
    "bg-[var(--color-negro)] text-[var(--color-crema)] hover:bg-[var(--color-gris-900)] hover:shadow-[0_0_40px_rgba(217,40,47,0.4)] hover:-translate-y-0.5",
  ghost:
    "bg-transparent border-2 border-current text-[var(--color-negro)] hover:bg-[var(--color-negro)] hover:text-[var(--color-crema)]",
  "outline-light":
    "bg-transparent border-2 border-[var(--color-crema)]/60 text-[var(--color-crema)] hover:bg-[var(--color-crema)]/10 hover:border-[var(--color-crema)]",
  whatsapp:
    "bg-[#25D366] text-white hover:bg-[#1FB855] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-12px_rgba(37,211,102,0.6)]",
};

export const Button = forwardRef<HTMLAnchorElement, Props>(function Button(
  {
    variant = "primary",
    size = "lg",
    withArrow = true,
    fullWidth = false,
    icon,
    className,
    children,
    ...rest
  },
  ref,
) {
  return (
    <a
      ref={ref}
      className={cn(
        base,
        sizes[size],
        variants[variant],
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    >
      {icon}
      <span>{children}</span>
      {withArrow && (
        <ArrowRight
          aria-hidden="true"
          className="size-[1.1em] transition-transform duration-200 ease-out group-hover:translate-x-1"
          strokeWidth={2.5}
        />
      )}
    </a>
  );
});
