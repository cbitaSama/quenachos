"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import type { CartItem, Sabor } from "@/lib/types";
import { trackEvent } from "@/lib/analytics";

type CartState = CartItem[];

type CartAction =
  | { type: "add"; sabor: Sabor }
  | { type: "increment"; id: CartItem["id"] }
  | { type: "decrement"; id: CartItem["id"] }
  | { type: "remove"; id: CartItem["id"] }
  | { type: "clear" };

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "add": {
      const existing = state.find((i) => i.id === action.sabor.id);
      if (existing) {
        return state.map((i) =>
          i.id === action.sabor.id ? { ...i, cantidad: i.cantidad + 1 } : i,
        );
      }
      return [
        ...state,
        {
          id: action.sabor.id,
          nombre: action.sabor.nombre,
          precio: action.sabor.precio ?? null,
          cantidad: 1,
        },
      ];
    }
    case "increment":
      return state.map((i) =>
        i.id === action.id ? { ...i, cantidad: i.cantidad + 1 } : i,
      );
    case "decrement":
      return state
        .map((i) =>
          i.id === action.id ? { ...i, cantidad: i.cantidad - 1 } : i,
        )
        .filter((i) => i.cantidad > 0);
    case "remove":
      return state.filter((i) => i.id !== action.id);
    case "clear":
      return [];
    default:
      return state;
  }
}

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  isOpen: boolean;
  add: (sabor: Sabor) => void;
  increment: (id: CartItem["id"]) => void;
  decrement: (id: CartItem["id"]) => void;
  remove: (id: CartItem["id"]) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(reducer, []);
  const [isOpen, setIsOpen] = useState(false);

  const add = useCallback((sabor: Sabor) => {
    dispatch({ type: "add", sabor });
    trackEvent("cart_add", { sabor: sabor.id });
  }, []);
  const increment = useCallback(
    (id: CartItem["id"]) => dispatch({ type: "increment", id }),
    [],
  );
  const decrement = useCallback(
    (id: CartItem["id"]) => dispatch({ type: "decrement", id }),
    [],
  );
  const remove = useCallback((id: CartItem["id"]) => {
    dispatch({ type: "remove", id });
    trackEvent("cart_remove", { sabor: id });
  }, []);
  const clear = useCallback(() => dispatch({ type: "clear" }), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const count = useMemo(
    () => items.reduce((s, i) => s + i.cantidad, 0),
    [items],
  );
  const total = useMemo(
    () => items.reduce((s, i) => s + (i.precio ?? 0) * i.cantidad, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      count,
      total,
      isOpen,
      add,
      increment,
      decrement,
      remove,
      clear,
      open,
      close,
    }),
    [items, count, total, isOpen, add, increment, decrement, remove, clear, open, close],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
