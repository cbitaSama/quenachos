import { createAdminClient } from "@/lib/supabase/server";
import { isAdminDataConfigured } from "@/lib/supabase/env";

// Datos del negocio: cliente service_role que llama a las funciones puente
// public.qn_* (que leen/escriben el schema `quenachos`). No expone el schema
// ni necesita connection string — solo la service_role key.
export const isDbConfigured = isAdminDataConfigured;

let cached: ReturnType<typeof createAdminClient> | null = null;

export function getAdmin() {
  if (!isAdminDataConfigured) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY no está configurada. Agregала en .env.local.",
    );
  }
  return (cached ??= createAdminClient());
}
