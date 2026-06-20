import { SUPABASE_URL } from "@/lib/supabase/env";
import { isDbConfigured } from "@/lib/admin/db";
import { Card, EmptyState } from "@/components/admin/ui";
import { QrForm } from "./qr-form";

export const dynamic = "force-dynamic";

export default function AjustesPage() {
  // cache-bust para ver siempre el QR actual (recién subido)
  const qrUrl = `${SUPABASE_URL}/storage/v1/object/public/qn-assets/qr-pago.jpeg?cb=${Date.now()}`;

  return (
    <div className="space-y-7">
      <header>
        <h1 className="font-display text-display-md uppercase leading-none">
          Ajustes
        </h1>
        <p className="mt-1 text-body-sm text-[var(--color-gris-500)]">
          El QR de pago que Nachito le manda a cada cliente.
        </p>
      </header>

      <Card title="QR de pago — lo que manda el bot">
        {!isDbConfigured ? (
          <EmptyState>Conectá la base para administrar el QR.</EmptyState>
        ) : (
          <div className="grid gap-6 sm:grid-cols-[minmax(0,220px)_1fr] sm:items-start">
            <div>
              <p className="mb-1.5 text-caption text-[var(--color-gris-500)]">
                QR actual
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrUrl}
                alt="QR de pago actual"
                className="w-full max-w-[220px] rounded-xl border border-[var(--color-negro)]/10"
              />
            </div>
            <div>
              <p className="mb-3 text-body-sm text-[var(--color-gris-500)]">
                Subí una imagen nueva para reemplazarlo. El bot empieza a mandar
                el QR nuevo de inmediato.
              </p>
              <QrForm />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
