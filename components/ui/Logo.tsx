import Image from "next/image";
import { cn } from "@/lib/utils";

type Variant = "crema" | "negro" | "rojo";

type Props = {
  variant?: Variant;
  className?: string;
  priority?: boolean;
  withWordmark?: boolean;
};

const SRC: Record<Variant, string> = {
  // cream blob on transparent — use over dark or colored backgrounds
  crema: "/logos/logo-quenachos-blob.png",
  // dark blob on transparent — use over cream/light backgrounds
  negro: "/logos/logo-quenachos-negro.png",
  // cream blob inside red square — use as a contained badge
  rojo: "/logos/logo-quenachos-rojo.png",
};

export function Logo({
  variant = "crema",
  className,
  priority = false,
  withWordmark = false,
}: Props) {
  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      <Image
        src={SRC[variant]}
        alt="Que Nachos"
        width={400}
        height={400}
        priority={priority}
        sizes="(max-width: 640px) 36px, 56px"
        className="block size-full"
      />
      {withWordmark && (
        <span className="sr-only">Que Nachos</span>
      )}
    </div>
  );
}
