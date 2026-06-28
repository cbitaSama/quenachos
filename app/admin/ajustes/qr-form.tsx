"use client";

import { useRef, useState, useTransition } from "react";
import { UploadCloud } from "lucide-react";
import { actualizarQrPago } from "@/lib/admin/actions";

export function QrForm({ tipo = "normal" }: { tipo?: "normal" | "sin_factura" }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const file = inputRef.current?.files?.[0];
        if (!file) {
          setMsg({ ok: false, text: "Elegí una imagen del QR." });
          return;
        }
        const fd = new FormData();
        fd.append("qr", file);
        fd.append("tipo", tipo);
        start(async () => {
          setMsg(null);
          const r = await actualizarQrPago(fd);
          setMsg(r.ok ? { ok: true, text: r.message ?? "Listo" } : { ok: false, text: r.error });
          if (r.ok) {
            if (inputRef.current) inputRef.current.value = "";
            setPreview(null);
          }
        });
      }}
      className="grid gap-4"
    >
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--color-negro)]/15 px-6 py-8 text-center transition-colors hover:border-[var(--color-rojo)]/40">
        <UploadCloud className="size-7 text-[var(--color-gris-500)]" strokeWidth={2} />
        <span className="text-body-sm text-[var(--color-gris-500)]">
          Tocá para elegir la imagen del QR (JPG, PNG o WebP)
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => {
            const f = e.target.files?.[0];
            setPreview(f ? URL.createObjectURL(f) : null);
            setMsg(null);
          }}
          className="hidden"
        />
      </label>

      {preview && (
        <div>
          <p className="mb-1.5 text-caption text-[var(--color-gris-500)]">Vista previa</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Vista previa del nuevo QR"
            className="max-h-64 w-auto rounded-xl border border-[var(--color-negro)]/10"
          />
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center rounded-full bg-[var(--color-rojo)] px-6 py-3 text-base font-bold text-[var(--color-crema)] transition-all hover:bg-[var(--color-rojo-oscuro)] disabled:opacity-60"
        >
          {pending ? "Subiendo…" : "Actualizar QR de pago"}
        </button>
        {msg && (
          <p
            className={`mt-3 text-body-sm ${msg.ok ? "text-[#16a34a]" : "text-[var(--color-rojo)]"}`}
          >
            {msg.text}
          </p>
        )}
      </div>
    </form>
  );
}
