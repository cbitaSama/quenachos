"use client";

import { QRCodeSVG } from "qrcode.react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Share2 } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

export function QR() {
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(window.location.origin);
  }, []);

  return (
    <section
      id="qr"
      aria-labelledby="qr-title"
      className="relative bg-[var(--color-crema)] py-20 sm:py-28"
    >
      <div className="container-q">
        <div className="mx-auto grid max-w-4xl items-center gap-10 rounded-[2.5rem] bg-[var(--color-negro)] p-8 text-[var(--color-crema)] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.35)] sm:p-12 md:grid-cols-[1fr_auto] md:gap-16 md:p-14">
          {/* text */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 text-caption text-[var(--color-verde-lima)]">
              <Share2 className="size-3.5" strokeWidth={2.5} />
              Compartí la página
            </span>
            <h2
              id="qr-title"
              className="mt-4 font-display text-display-sm uppercase leading-[1.0]"
            >
              Escaneá. Mandá.
              <br />
              <span className="text-[var(--color-rojo-neon)]">Que la prueben.</span>
            </h2>
            <p className="mt-5 max-w-md text-body-lg text-[var(--color-crema)]/70">
              Ideal para flyers, eventos, o para mostrar en la pantalla del cel.
              El QR siempre apunta a esta página.
            </p>
          </motion.div>

          {/* QR */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -3 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
            onClick={() => trackEvent("qr_scan", { source: "qr_section" })}
            className="relative mx-auto rounded-[2rem] bg-[var(--color-crema)] p-5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]"
          >
            {url ? (
              <QRCodeSVG
                value={url}
                size={220}
                bgColor="#FAF7F2"
                fgColor="#0A0A0A"
                level="H"
                marginSize={0}
                imageSettings={{
                  src: "/logos/logo-quenachos-rojo.png",
                  height: 48,
                  width: 48,
                  excavate: true,
                }}
              />
            ) : (
              <div className="size-[220px] animate-pulse rounded-2xl bg-[var(--color-gris-100)]" />
            )}
            {/* sticker */}
            <div className="absolute -right-2 -top-2 rotate-[6deg] rounded-xl bg-[var(--color-rojo)] px-3 py-1 font-display text-xs text-[var(--color-crema)]">
              ESCANEAME
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
