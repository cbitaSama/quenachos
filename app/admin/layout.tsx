import type { Metadata } from "next";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getAtencion, getPedidosPorConfirmar } from "@/lib/admin/queries";
import { Logo } from "@/components/ui/Logo";
import { AdminNav } from "./nav";
import { LiveRefresh } from "./live-refresh";
import { logout } from "./login/actions";

export const metadata: Metadata = {
  title: "Panel · Que Nachos",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Sin configurar → cartel claro (no rompe el sitio público).
  if (!isSupabaseConfigured) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--color-crema)] px-4 text-center">
        <div className="max-w-md">
          <h1 className="font-display text-display-md uppercase">Panel</h1>
          <p className="mt-3 text-body-md text-[var(--color-gris-500)]">
            Falta conectar Supabase. Configurá{" "}
            <code className="text-[var(--color-rojo)]">NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
            <code className="text-[var(--color-rojo)]">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
            y <code className="text-[var(--color-rojo)]">SUPABASE_SERVICE_ROLE_KEY</code>.
          </p>
        </div>
      </main>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Sin sesión: dejar pasar (la página de login renderiza su propio layout).
  if (!user) return <>{children}</>;

  const [porConfirmar, porAtender] = await Promise.all([
    getPedidosPorConfirmar().then((p) => p.length),
    getAtencion().then((a) => a.length),
  ]);

  return (
    <div className="min-h-screen bg-[var(--color-crema)] text-[var(--color-negro)] lg:grid lg:grid-cols-[260px_1fr]">
      {/* Sidebar / topbar */}
      <aside className="border-b border-[var(--color-negro)]/10 bg-white lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-2.5 px-4 py-4 lg:px-6">
          <Logo variant="negro" className="size-9" />
          <div className="leading-tight">
            <p className="font-display text-lg uppercase leading-none">Panel</p>
            <p className="text-[11px] text-[var(--color-gris-500)]">Que Nachos</p>
          </div>
        </div>

        <div className="px-3 pb-3 lg:px-4">
          <AdminNav porConfirmar={porConfirmar} porAtender={porAtender} />
        </div>

        <div className="hidden border-t border-[var(--color-negro)]/10 px-4 py-4 lg:block lg:absolute lg:bottom-0 lg:w-[260px]">
          <p className="truncate text-body-sm text-[var(--color-gris-500)]">
            {user.email}
          </p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <Link
              href="/"
              className="text-body-sm text-[var(--color-gris-500)] hover:text-[var(--color-negro)]"
            >
              ← Ver sitio
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-[var(--color-rojo)] hover:underline"
              >
                <LogOut className="size-4" strokeWidth={2.25} />
                Salir
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Contenido */}
      <div className="flex flex-col">
        {/* Topbar móvil con salir */}
        <div className="flex items-center justify-between border-b border-[var(--color-negro)]/10 bg-white px-4 py-2.5 lg:hidden">
          <span className="truncate text-body-sm text-[var(--color-gris-500)]">
            {user.email}
          </span>
          <form action={logout}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-[var(--color-rojo)]"
            >
              <LogOut className="size-4" strokeWidth={2.25} />
              Salir
            </button>
          </form>
        </div>

        {/* Notificaciones: algo necesita acción */}
        {(porConfirmar > 0 || porAtender > 0) && (
          <div className="border-b border-[var(--color-rojo)]/20 bg-[var(--color-rojo)]/[0.06] px-4 py-2.5 sm:px-6">
            <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-x-4 gap-y-1 text-body-sm">
              <span className="font-bold text-[var(--color-rojo)]">🔔 Atención:</span>
              {porConfirmar > 0 && (
                <Link
                  href="/admin/pedidos"
                  className="font-semibold text-[var(--color-negro)] underline decoration-[var(--color-rojo)]/40 underline-offset-2 hover:decoration-[var(--color-rojo)]"
                >
                  {porConfirmar} pago{porConfirmar > 1 ? "s" : ""} por confirmar
                </Link>
              )}
              {porConfirmar > 0 && porAtender > 0 && (
                <span className="text-[var(--color-gris-500)]">·</span>
              )}
              {porAtender > 0 && (
                <Link
                  href="/admin/atencion"
                  className="font-semibold text-[var(--color-negro)] underline decoration-[var(--color-rojo)]/40 underline-offset-2 hover:decoration-[var(--color-rojo)]"
                >
                  {porAtender} cliente{porAtender > 1 ? "s" : ""} esperando atención
                </Link>
              )}
            </div>
          </div>
        )}

        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
          <LiveRefresh seconds={20} />
          {children}
        </main>
      </div>
    </div>
  );
}
