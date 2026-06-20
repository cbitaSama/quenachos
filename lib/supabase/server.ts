import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_URL,
} from "./env";

const noStoreFetch: typeof fetch = (input, init) =>
  fetch(input, { ...init, cache: "no-store" });

// Cliente service_role (sin sesión) para los datos del negocio vía funciones
// puente public.qn_*. Bypassa RLS. SOLO server-side — nunca al cliente.
export function createAdminClient() {
  return createSupabaseClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: noStoreFetch },
  });
}

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
