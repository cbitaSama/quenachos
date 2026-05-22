import { Instagram } from "lucide-react";

const IG_URL =
  process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "https://www.instagram.com/quenachos.bo";
const TT_URL =
  process.env.NEXT_PUBLIC_TIKTOK_URL ?? "https://www.tiktok.com/@quenachos.bo";

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.85a8.16 8.16 0 0 0 4.77 1.52V6.92a4.85 4.85 0 0 1-1.84-.23Z"/>
    </svg>
  );
}

type Props = {
  className?: string;
  tone?: "crema" | "negro";
};

export function SocialIcons({ className = "", tone = "crema" }: Props) {
  const color = tone === "crema" ? "text-[var(--color-crema)]" : "text-[var(--color-negro)]";
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <a
        href={IG_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram @quenachos.bo"
        className={`inline-flex size-10 items-center justify-center rounded-full ${color} ring-1 ring-current/20 transition-all hover:scale-110 hover:ring-current/60`}
      >
        <Instagram className="size-5" strokeWidth={2} />
      </a>
      <a
        href={TT_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="TikTok @quenachos.bo"
        className={`inline-flex size-10 items-center justify-center rounded-full ${color} ring-1 ring-current/20 transition-all hover:scale-110 hover:ring-current/60`}
      >
        <TikTokIcon className="size-5" />
      </a>
    </div>
  );
}
