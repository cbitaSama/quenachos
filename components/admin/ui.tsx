import type { ReactNode } from "react";

type Tone = "neutral" | "ok" | "info" | "warn" | "danger";

const TONE: Record<Tone, { value: string; chip: string }> = {
  neutral: { value: "text-[var(--color-negro)]", chip: "bg-[var(--color-negro)]/5 text-[var(--color-gris-500)]" },
  ok: { value: "text-[var(--color-negro)]", chip: "bg-[#16a34a]/10 text-[#16a34a]" },
  info: { value: "text-[var(--color-negro)]", chip: "bg-[var(--color-negro)]/5 text-[var(--color-negro)]" },
  warn: { value: "text-[#b45309]", chip: "bg-[#f59e0b]/15 text-[#b45309]" },
  danger: { value: "text-[var(--color-rojo)]", chip: "bg-[var(--color-rojo)]/10 text-[var(--color-rojo)]" },
};

export function KpiCard({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: Tone;
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-negro)]/10 bg-white p-4 sm:p-5">
      <p className="text-caption text-[var(--color-gris-500)]">{label}</p>
      <p className={`mt-2 font-display text-[clamp(26px,4vw,40px)] leading-none ${TONE[tone].value}`}>
        {value}
      </p>
      {hint && <p className="mt-1.5 text-body-sm text-[var(--color-gris-500)]">{hint}</p>}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-body-sm font-semibold ${TONE[tone].chip}`}>
      {children}
    </span>
  );
}

export function Card({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-[var(--color-negro)]/10 bg-white p-4 sm:p-5 ${className}`}>
      {title && <h2 className="mb-3 text-caption text-[var(--color-gris-500)]">{title}</h2>}
      {children}
    </section>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-caption text-[var(--color-gris-500)]">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "rounded-xl border border-[var(--color-negro)]/15 bg-white px-4 py-3 text-body-md outline-none transition-colors focus:border-[var(--color-rojo)]";

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-2xl border border-[var(--color-negro)]/10 bg-white px-4 py-8 text-center text-body-sm text-[var(--color-gris-500)]">
      {children}
    </p>
  );
}
