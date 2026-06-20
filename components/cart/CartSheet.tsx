"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "@/lib/cart/CartContext";
import { whatsappLink, MENSAJES } from "@/lib/whatsapp";
import { trackEvent } from "@/lib/analytics";

export function CartSheet() {
  const { items, total, count, isOpen, close, increment, decrement, remove, clear } =
    useCart();

  // Cerrar con Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  const onCheckout = () => {
    trackEvent("checkout_start", { items: count, total });
    const url = whatsappLink(MENSAJES.carrito(items, total));
    window.open(url, "_blank", "noopener,noreferrer");
    clear();
    close();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={close}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* panel */}
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Tu pedido"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            className="fixed inset-y-0 right-0 z-[61] flex w-full max-w-md flex-col bg-[var(--color-crema)] shadow-2xl"
          >
            {/* header */}
            <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
              <h2 className="flex items-center gap-2 font-display text-2xl uppercase">
                <ShoppingBag className="size-5" strokeWidth={2.5} />
                Tu pedido
              </h2>
              <button
                type="button"
                onClick={close}
                aria-label="Cerrar carrito"
                className="inline-flex size-9 items-center justify-center rounded-full text-[var(--color-gris-500)] transition-colors hover:bg-black/5 hover:text-[var(--color-negro)]"
              >
                <X className="size-5" strokeWidth={2.25} />
              </button>
            </div>

            {/* items */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <p className="mt-10 text-center text-body-md text-[var(--color-gris-500)]">
                  Tu pedido está vacío.
                </p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white/60 p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{item.nombre}</p>
                        <p className="text-body-sm text-[var(--color-gris-500)]">
                          {item.precio != null
                            ? `Bs ${item.precio} c/u`
                            : "Precio a coordinar"}
                        </p>
                      </div>

                      {/* stepper */}
                      <div className="flex items-center gap-1 rounded-full border border-black/10 bg-white p-1">
                        <button
                          type="button"
                          onClick={() => decrement(item.id)}
                          aria-label={`Quitar uno de ${item.nombre}`}
                          className="inline-flex size-8 items-center justify-center rounded-full transition-colors hover:bg-black/5"
                        >
                          <Minus className="size-4" strokeWidth={2.5} />
                        </button>
                        <span className="w-6 text-center text-sm font-bold tabular-nums">
                          {item.cantidad}
                        </span>
                        <button
                          type="button"
                          onClick={() => increment(item.id)}
                          aria-label={`Agregar uno de ${item.nombre}`}
                          className="inline-flex size-8 items-center justify-center rounded-full transition-colors hover:bg-black/5"
                        >
                          <Plus className="size-4" strokeWidth={2.5} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => remove(item.id)}
                        aria-label={`Eliminar ${item.nombre} del pedido`}
                        className="inline-flex size-8 items-center justify-center rounded-full text-[var(--color-gris-500)] transition-colors hover:bg-[var(--color-rojo)]/10 hover:text-[var(--color-rojo)]"
                      >
                        <Trash2 className="size-4" strokeWidth={2.25} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* footer */}
            {items.length > 0 && (
              <div className="border-t border-black/10 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-body-md text-[var(--color-gris-500)]">
                    Total
                  </span>
                  <span className="font-display text-3xl">
                    {total > 0 ? `Bs ${total}` : "A coordinar"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onCheckout}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-4 text-base font-bold text-white shadow-[0_14px_30px_-8px_rgba(37,211,102,0.6)] transition-transform hover:scale-[1.02] active:scale-[0.99]"
                >
                  Finalizar pedido por WhatsApp
                </button>
                <p className="mt-2.5 text-center text-body-sm text-[var(--color-gris-500)]">
                  Coordinás pago y recojo por chat. No se cobra acá.
                </p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
