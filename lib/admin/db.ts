import postgres from "postgres";

// Conexión DIRECTA a Postgres del proyecto "Vectoria Space" para leer/escribir
// el schema `quenachos` (que no está expuesto al API REST). Solo server-side.
// Usar el connection string del POOLER (Transaction, puerto 6543).
const url = (process.env.SUPABASE_DB_URL || "").trim();

export const isDbConfigured = url.length > 0;

// Singleton entre invocaciones (evita agotar conexiones en serverless).
const globalForSql = globalThis as unknown as {
  __qnSql?: ReturnType<typeof postgres>;
};

function makeClient() {
  return postgres(url, {
    prepare: false, // requerido por el pooler en modo transaction (pgbouncer)
    idle_timeout: 20,
    max: 5,
    connection: { application_name: "quenachos-admin" },
  });
}

export function getSql() {
  if (!isDbConfigured) {
    throw new Error(
      "SUPABASE_DB_URL no está configurada. Agregала en .env.local (connection string del pooler).",
    );
  }
  return (globalForSql.__qnSql ??= makeClient());
}
