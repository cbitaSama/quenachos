"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Refresca el panel cada N segundos para que aparezcan nuevos pedidos /
// atenciones sin tener que recargar a mano.
export function LiveRefresh({ seconds = 20 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => {
      if (typeof document !== "undefined" && !document.hidden) router.refresh();
    }, seconds * 1000);
    return () => clearInterval(id);
  }, [router, seconds]);
  return null;
}
