// Config de Supabase para el panel /admin.
// Limpieza de espacios: Vercel a veces agrega saltos de línea al pegar las keys.
export const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
export const SUPABASE_ANON_KEY = (
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
).replace(/\s/g, "");
export const SUPABASE_SERVICE_ROLE_KEY = (
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
).replace(/\s/g, "");

// Auth del dueño (login/sesión).
export const isSupabaseConfigured =
  SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;

// Lectura/escritura de datos (service_role + funciones puente public.qn_*).
export const isAdminDataConfigured =
  SUPABASE_URL.length > 0 && SUPABASE_SERVICE_ROLE_KEY.length > 0;
