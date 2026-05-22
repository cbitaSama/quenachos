"use client";

import { AnimatePresence, motion, useScroll, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { whatsappLink, MENSAJES } from "@/lib/whatsapp";
import { trackEvent } from "@/lib/analytics";

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      width="28"
      height="28"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M16.003 3C9.376 3 4 8.376 4 15c0 2.354.681 4.547 1.854 6.4L4 29l7.795-1.812A11.93 11.93 0 0 0 16.003 28c6.627 0 12.003-5.376 12.003-12.003C28.006 8.376 22.63 3 16.003 3Zm.005 21.6c-1.92 0-3.78-.526-5.4-1.52l-.387-.232-4.617 1.073 1.097-4.495-.252-.413a9.546 9.546 0 0 1-1.466-5.094c0-5.288 4.3-9.588 9.59-9.588 5.288 0 9.587 4.3 9.587 9.588 0 5.29-4.3 9.681-9.589 9.681Zm5.53-7.182c-.302-.151-1.786-.882-2.063-.983-.276-.1-.477-.151-.678.151-.201.302-.778.983-.953 1.184-.176.201-.351.227-.653.076-.302-.151-1.275-.47-2.428-1.5-.898-.8-1.504-1.789-1.68-2.09-.176-.302-.019-.464.133-.616.137-.137.302-.351.453-.527.151-.176.201-.302.302-.503.1-.201.05-.377-.025-.527-.076-.151-.678-1.633-.93-2.236-.244-.586-.493-.507-.678-.516h-.578a1.106 1.106 0 0 0-.803.377c-.276.302-1.054 1.029-1.054 2.51 0 1.481 1.079 2.913 1.23 3.114.151.201 2.124 3.244 5.149 4.553.72.31 1.282.495 1.72.634.722.23 1.379.197 1.898.12.579-.086 1.786-.73 2.038-1.434.252-.704.252-1.308.176-1.434-.076-.126-.276-.201-.578-.352Z"/>
    </svg>
  );
}

export function WhatsAppFAB() {
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    return scrollY.on("change", (y) => setVisible(y > 220));
  }, [scrollY]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.a
          href={whatsappLink(MENSAJES.general)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Pedir por WhatsApp"
          onClick={() => trackEvent("whatsapp_click", { source: "fab" })}
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={
            shouldReduceMotion
              ? { opacity: 1, scale: 1, y: 0 }
              : {
                  opacity: 1,
                  scale: [1, 1.05, 1],
                  y: 0,
                  transition: {
                    opacity: { duration: 0.3 },
                    y: { duration: 0.3 },
                    scale: {
                      duration: 0.6,
                      repeat: Infinity,
                      repeatType: "loop",
                      repeatDelay: 5.5,
                      ease: "easeInOut",
                    },
                  },
                }
          }
          exit={{ opacity: 0, scale: 0.6, y: 20, transition: { duration: 0.2 } }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-6 right-6 z-50 inline-flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_18px_40px_-8px_rgba(37,211,102,0.55)] ring-4 ring-white/30 sm:bottom-8 sm:right-8 sm:size-16"
        >
          <WhatsAppIcon />
        </motion.a>
      )}
    </AnimatePresence>
  );
}
