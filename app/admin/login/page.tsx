import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { LoginForm } from "./login-form";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Panel · Que Nachos",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-crema)] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Logo variant="negro" className="size-16" />
          <div>
            <h1 className="font-display text-display-md uppercase leading-none">
              Panel
            </h1>
            <p className="mt-1 text-body-sm text-[var(--color-gris-500)]">
              Acceso del equipo · Nutravia SRL
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-[var(--color-negro)]/10 bg-white p-6 shadow-[0_12px_32px_-8px_rgba(10,10,10,0.12)] sm:p-8">
          {isSupabaseConfigured ? (
            <LoginForm />
          ) : (
            <p className="text-body-sm text-[var(--color-gris-500)]">
              El panel todavía no está conectado a la base de datos. Configurá
              las variables de Supabase para habilitar el acceso.
            </p>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-body-sm text-[var(--color-gris-500)] underline-offset-4 hover:underline"
          >
            ← Volver al sitio
          </Link>
        </div>
      </div>
    </main>
  );
}
