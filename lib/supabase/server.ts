import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./env";

const noStoreFetch: typeof fetch = (input, init) =>
  fetch(input, { ...init, cache: "no-store" });

// Cliente de AUTH/sesión del dueño (anon + cookies). Solo para login/logout/getUser.
// Los datos del negocio NO pasan por acá — van por conexión directa a Postgres
// (lib/admin/db.ts), porque el schema `quenachos` no está expuesto al API REST.
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(toSet) {
        try {
          for (const { name, value, options } of toSet)
            cookieStore.set(name, value, options);
        } catch {
          // Server Component (read-only): el middleware ya refresca la sesión.
        }
      },
    },
    global: { fetch: noStoreFetch },
  });
}
