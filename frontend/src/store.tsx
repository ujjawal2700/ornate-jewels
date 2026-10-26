import { createContext, useContext, useState, type ReactNode } from "react";
import { products, type Product } from "./data";
export type Line = { productId: string; variant: string; quantity: number };
export type Address = {
  name: string;
  email: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  pincode: string;
};
export type Order = {
  id: string;
  date: string;
  items: (Line & { name: string; price: number; image: string })[];
  address: Address;
  subtotal: number;
  shipping: number;
  total: number;
  status: string;
};
export const subtotal = (lines: Line[]) =>
  lines.reduce(
    (sum, line) =>
      sum +
      (products.find((p) => p.id === line.productId)?.price || 0) *
        line.quantity,
    0,
  );
export function addLine(
  lines: Line[],
  product: Product,
  variant: string,
): Line[] {
  if (
    !product.purchasable ||
    !product.stock ||
    !product.variants.includes(variant)
  )
    return lines;
  const match = lines.find(
    (l) => l.productId === product.id && l.variant === variant,
  );
  const total = lines
    .filter((l) => l.productId === product.id)
    .reduce((s, l) => s + l.quantity, 0);
  if (total >= product.stock) return lines;
  return match
    ? lines.map((l) => (l === match ? { ...l, quantity: l.quantity + 1 } : l))
    : [...lines, { productId: product.id, variant, quantity: 1 }];
}
function read<T>(
  key: string,
  fallback: T,
  validate: (v: unknown) => boolean,
): T {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return validate(value) ? value : fallback;
  } catch {
    return fallback;
  }
}
function useSaved<T>(
  key: string,
  fallback: T,
  validate: (v: unknown) => boolean,
) {
  const [value, setValue] = useState<T>(() => read(key, fallback, validate));
  const save = (v: T | ((old: T) => T)) =>
    setValue((old) => {
      const next = typeof v === "function" ? (v as (x: T) => T)(old) : v;
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* In-memory state remains usable when storage is unavailable. */
      }
      return next;
    });
  return [value, save] as const;
}
const validLines = (v: unknown) =>
  Array.isArray(v) &&
  v.every(
    (l) =>
      l &&
      typeof l.productId === "string" &&
      Number.isInteger(l.quantity) &&
      l.quantity > 0 &&
      l.quantity <= 5 &&
      products.some(
        (p) =>
          p.id === l.productId &&
          p.purchasable &&
          p.stock > 0 &&
          p.variants.includes(l.variant),
      ),
  );
const validOrders = (v: unknown) =>
  Array.isArray(v) &&
  v.every(
    (o) =>
      o &&
      typeof o.id === "string" &&
      typeof o.date === "string" &&
      Array.isArray(o.items) &&
      o.items.every(
        (i: Record<string, unknown>) =>
          typeof i.name === "string" &&
          typeof i.price === "number" &&
          typeof i.quantity === "number",
      ) &&
      o.address &&
      typeof o.address.name === "string" &&
      typeof o.total === "number",
  );
function useStoreValue() {
  const [cart, setCart] = useSaved<Line[]>("ornate:cart", [], validLines);
  const [wishlist, setWishlist] = useSaved<string[]>(
    "ornate:wishlist",
    [],
    (v) =>
      Array.isArray(v) &&
      v.every((x) => typeof x === "string" && products.some((p) => p.id === x)),
  );
  const [orders, setOrders] = useSaved<Order[]>(
    "ornate:orders",
    [],
    validOrders,
  );
  const [profile, setProfile] = useSaved<{
    name: string;
    email: string;
  } | null>(
    "ornate:profile",
    null,
    (v) =>
      v === null ||
      (!!v &&
        typeof v === "object" &&
        "name" in v &&
        typeof v.name === "string" &&
        "email" in v &&
        typeof v.email === "string"),
  );
  const [addresses, setAddresses] = useSaved<Address[]>(
    "ornate:addresses",
    [],
    (v) =>
      Array.isArray(v) &&
      v.every(
        (a) =>
          a && typeof a.line1 === "string" && typeof a.pincode === "string",
      ),
  );
  const [bagOpen, setBagOpen] = useState(false);
  const [toast, setToast] = useState("");
  function notify(message: string) {
    setToast(message);
    window.setTimeout(
      () => setToast((current) => (current === message ? "" : current)),
      3200,
    );
  }
  function add(product: Product, variant: string) {
    const next = addLine(cart, product, variant);
    if (next === cart) {
      notify(
        "This piece is unavailable or its quantity limit has been reached.",
      );
      return;
    }
    setCart(next);
    setBagOpen(true);
    notify("A beautiful choice. Added to your bag.");
  }
  function toggleWish(id: string) {
    setWishlist((old) =>
      old.includes(id) ? old.filter((x) => x !== id) : [...old, id],
    );
  }
  function updateQty(index: number, quantity: number) {
    const line = cart[index];
    if (!line) return;
    const p = products.find((p) => p.id === line.productId);
    if (!p) return;
    if (quantity < 1) {
      setCart(cart.filter((_, i) => i !== index));
      return;
    }
    const others = cart
      .filter((l, i) => i !== index && l.productId === line.productId)
      .reduce((s, l) => s + l.quantity, 0);
    if (others + quantity > p.stock) {
      notify("You have reached the available quantity for this piece.");
      return;
    }
    setCart(cart.map((l, i) => (i === index ? { ...l, quantity } : l)));
  }
  function placeOrder(address: Address, shipping: number) {
    const sum = subtotal(cart);
    const order: Order = {
      id: "ORN-" + crypto.randomUUID().slice(0, 8).toUpperCase(),
      date: new Date().toISOString(),
      items: cart.map((l) => {
        const p = products.find((p) => p.id === l.productId)!;
        return { ...l, name: p.name, price: p.price, image: p.image };
      }),
      address,
      subtotal: sum,
      shipping,
      total: sum + shipping,
      status: "Demo order placed",
    };
    setOrders((old) => [order, ...old]);
    setCart([]);
    setProfile({ name: address.name, email: address.email });
    setAddresses((old) =>
      old.some(
        (a) => a.line1 === address.line1 && a.pincode === address.pincode,
      )
        ? old
        : [address, ...old],
    );
    return order;
  }
  function reset() {
    setCart([]);
    setWishlist([]);
    setOrders([]);
    setProfile(null);
    setAddresses([]);
    notify("Your demo has been reset.");
  }
  return {
    cart,
    wishlist,
    orders,
    profile,
    setProfile,
    addresses,
    setAddresses,
    bagOpen,
    setBagOpen,
    toast,
    notify,
    add,
    toggleWish,
    updateQty,
    placeOrder,
    reset,
  };
}
type Store = ReturnType<typeof useStoreValue>;
const Context = createContext<Store | null>(null);
export function StoreProvider({ children }: { children: ReactNode }) {
  const store = useStoreValue();
  return <Context.Provider value={store}>{children}</Context.Provider>;
}
export function useStore() {
  const context = useContext(Context);
  if (!context) throw new Error("Store provider is missing");
  return context;
}
