"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

const initial: LoginState = { error: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initial);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-caption text-[var(--color-gris-500)]">Correo</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="rounded-xl border border-[var(--color-negro)]/15 bg-white px-4 py-3 text-body-md outline-none transition-colors focus:border-[var(--color-rojo)]"
          placeholder="dueño@quenachos.bo"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-caption text-[var(--color-gris-500)]">
          Contraseña
        </span>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className="rounded-xl border border-[var(--color-negro)]/15 bg-white px-4 py-3 text-body-md outline-none transition-colors focus:border-[var(--color-rojo)]"
          placeholder="••••••••"
        />
      </label>

      {state.error && (
        <p className="rounded-xl bg-[var(--color-rojo)]/10 px-4 py-2.5 text-body-sm text-[var(--color-rojo)]">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 inline-flex items-center justify-center rounded-full bg-[var(--color-rojo)] px-6 py-3.5 text-base font-bold text-[var(--color-crema)] transition-all hover:bg-[var(--color-rojo-oscuro)] disabled:opacity-60"
      >
        {pending ? "Entrando…" : "Entrar al panel"}
      </button>
    </form>
  );
}
