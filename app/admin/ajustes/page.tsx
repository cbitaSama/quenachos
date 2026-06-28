import { SUPABASE_URL } from "@/lib/supabase/env";
import { isDbConfigured } from "@/lib/admin/db";
import { Card, EmptyState } from "@/components/admin/ui";
import { QrForm } from "./qr-form";

export const dynamic = "force-dynamic";

// cache-bust para ver siempre el QR recién subido
const cb = () => Date.now();
const qrSrc = (path: string) =>
  `${SUPABASE_URL}/storage/v1/object/public/qn-assets/${path}?cb=${cb()}`;

export default function AjustesPage() {
  return (
    <div className="space-y-7">
      <header>
        <h1 className="font-display text-display-md uppercase leading-none">
          Ajustes
        </h1>
        <p className="mt-1 text-body-sm text-[var(--color-gris-500)]">
          Los QR de pago que Nachito le manda a cada cliente.
        </p>
      </header>

      <Card title="QR normal — pedidos normales y proveedor con factura">
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
                src={qrSrc("qr-pago.jpeg")}
                alt="QR de pago normal actual"
                className="w-full max-w-[220px] rounded-xl border border-[var(--color-negro)]/10"
              />
            </div>
            <div>
              <p className="mb-3 text-body-sm text-[var(--color-gris-500)]">
                Es el QR que reciben los clientes normales y los proveedores que
                piden con factura. Subí una imagen para reemplazarlo; el bot lo
                manda de inmediato.
              </p>
              <QrForm tipo="normal" />
            </div>
          </div>
        )}
      </Card>

      <Card title="QR sin factura — solo proveedores sin factura">
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
                src={qrSrc("qr-pago-sin-factura.jpeg")}
                alt="QR de pago sin factura actual"
                className="w-full max-w-[220px] rounded-xl border border-[var(--color-negro)]/10"
              />
            </div>
            <div>
              <p className="mb-3 text-body-sm text-[var(--color-gris-500)]">
                Es el QR que reciben solo los proveedores que piden{" "}
                <strong>sin factura</strong> (la cuenta a otro destino). Mientras
                no subas uno propio, es una copia del QR normal. Subí la imagen de
                la cuenta sin factura para diferenciarlo.
              </p>
              <QrForm tipo="sin_factura" />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
