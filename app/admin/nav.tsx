"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Factory,
  Boxes,
  ClipboardList,
  Store,
  Wallet,
  QrCode,
  LifeBuoy,
} from "lucide-react";

const ITEMS = [
  { href: "/admin", label: "Resumen", icon: LayoutDashboard, exact: true },
  { href: "/admin/produccion", label: "Producción", icon: Factory },
  { href: "/admin/inventario", label: "Inventario", icon: Boxes },
  { href: "/admin/pedidos", label: "Pedidos", icon: ClipboardList },
  { href: "/admin/venta-fisica", label: "Venta física", icon: Store },
  { href: "/admin/atencion", label: "Atención", icon: LifeBuoy },
  { href: "/admin/cuentas", label: "Cuentas", icon: Wallet },
  { href: "/admin/ajustes", label: "Ajustes", icon: QrCode },
];

export function AdminNav({
  porConfirmar = 0,
  porAtender = 0,
}: {
  porConfirmar?: number;
  porAtender?: number;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:gap-0.5">
      {ITEMS.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        const Icon = item.icon;
        const count =
          item.href === "/admin/pedidos"
            ? porConfirmar
            : item.href === "/admin/atencion"
              ? porAtender
              : 0;
        const badge = count > 0;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`group flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-body-sm font-semibold transition-colors ${
              active
                ? "bg-[var(--color-rojo)] text-[var(--color-crema)]"
                : "text-[var(--color-gris-500)] hover:bg-[var(--color-negro)]/5 hover:text-[var(--color-negro)]"
            }`}
          >
            <Icon className="size-4.5" strokeWidth={2.25} />
            <span>{item.label}</span>
            {badge && (
              <span
                className={`ml-auto inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold ${
                  active
                    ? "bg-white/25 text-white"
                    : "bg-[var(--color-rojo)] text-white"
                }`}
              >
                {count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
