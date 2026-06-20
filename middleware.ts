import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Solo corre en rutas de app, no en estáticos ni en el OG dinámico.
  matcher: [
    "/((?!_next/static|_next/image|favicon|og|sabores|lifestyle|logos|decorativos|brand|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|pdf)$).*)",
  ],
};
