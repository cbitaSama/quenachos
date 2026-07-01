import { getFinanzas } from "@/lib/admin/queries";
import { FinanzasView } from "./finanzas-view";

export const dynamic = "force-dynamic";

const MODOS = ["mensual", "trimestral", "semestral", "anual"];

export default async function FinanzasPage({
  searchParams,
}: {
  searchParams: Promise<{ modo?: string }>;
}) {
  const sp = await searchParams;
  const modo = MODOS.includes(sp.modo ?? "") ? (sp.modo as string) : "mensual";
  const data = await getFinanzas(modo, 6);

  return <FinanzasView data={data} modo={modo} />;
}
