"use client";

import { AnimatePresence, motion } from "motion/react";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart/CartContext";

export function CartButton() {
  const { count, open } = useCart();

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.button
          type="button"
          onClick={open}
          aria-label={`Abrir carrito (${count} ${count === 1 ? "bolsa" : "bolsas"})`}
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20, transition: { duration: 0.2 } }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-6 left-6 z-50 inline-flex h-14 items-center gap-2.5 rounded-full bg-[var(--color-negro)] pl-5 pr-6 text-[var(--color-crema)] shadow-[0_18px_40px_-8px_rgba(0,0,0,0.5)] ring-4 ring-white/10 sm:bottom-8 sm:left-8 sm:h-16"
        >
          <span className="relative inline-flex">
            <ShoppingBag className="size-6" strokeWidth={2.25} />
            <span className="absolute -right-2.5 -top-2.5 inline-flex size-5 items-center justify-center rounded-full bg-[var(--color-rojo)] text-[11px] font-bold text-white">
              {count}
            </span>
          </span>
          <span className="text-sm font-bold">Ver pedido</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
