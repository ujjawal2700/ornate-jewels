import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  type ReactNode,
} from "react";
import { ADMIN_KEY, loadAdmin, uid, seedAdmin, type AdminState } from "./model";
import { useStore } from "../store";
function useAdminValue() {
  const [state, setState] = useState(loadAdmin);
  const [toast, setToast] = useState("");
  const [storageWarning, setStorageWarning] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const { orders: storefrontOrders } = useStore();
  useEffect(() => () => clearTimeout(timer.current), []);
  const notify = (message: string) => {
    clearTimeout(timer.current);
    setToast(message);
    timer.current = setTimeout(() => setToast(""), 3500);
  };
  const update = (change: (s: AdminState) => AdminState, message?: string) => {
    setState((old) => {
      const next = change(old);
      return message
        ? {
            ...next,
            activity: [
              { id: uid(), text: message, date: new Date().toISOString() },
              ...next.activity,
            ].slice(0, 30),
          }
        : next;
    });
    if (message) notify(message);
  };
  useEffect(() => {
    try {
      localStorage.setItem(ADMIN_KEY, JSON.stringify(state));
      setStorageWarning(false);
    } catch {
      setStorageWarning(true);
    }
  }, [state]);
  useEffect(() => {
    if (!storefrontOrders.length) return;
    setState((old) => {
      const incoming = storefrontOrders.filter(
        (o) => !old.orders.some((a) => a.id === o.id),
      );
      if (!incoming.length) return old;
      return {
        ...old,
        orders: [
          ...incoming.map((o) => ({
            id: o.id,
            date: o.date,
            customer: o.address.name,
            email: o.address.email,
            phone: o.address.phone,
            city: o.address.city,
            address: [
              o.address.line1,
              o.address.city,
              o.address.state,
              o.address.pincode,
            ].join(", "),
            items: o.items,
            total: o.total,
            shipping: o.shipping,
            payment: "Pending" as const,
            status: "Unfulfilled" as const,
            note: "Imported from the customer demo. No payment collected.",
            tracking: "",
          })),
          ...old.orders,
        ],
      };
    });
  }, [storefrontOrders]);
  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(
        localStorage.getItem("ornate:consultations") || "[]",
      );
      if (!Array.isArray(saved)) return;
      const requests = saved.filter(
        (r): r is Record<string, string> =>
          !!r &&
          typeof r.id === "string" &&
          typeof r.name === "string" &&
          typeof r.email === "string" &&
          typeof r.date === "string" &&
          /^\d{4}-\d{2}-\d{2}$/.test(r.date),
      );
      setState((old) => {
        const incoming = requests.filter(
          (r) => !old.consultations.some((c) => c.id === r.id),
        );
        if (!incoming.length) return old;
        return {
          ...old,
          consultations: [
            ...incoming.map((r) => ({
              id: r.id,
              name: r.name,
              email: r.email,
              phone: r.phone || "",
              interest: r.occasion || "Personal curation",
              date: r.date + "T11:00",
              status: "New" as const,
              note: [
                r.message,
                r.budget,
                r.method ? "Preferred contact: " + r.method : "",
                "Imported demo request; 11:00 IST is a proposed time to confirm.",
              ]
                .filter(Boolean)
                .join("\n"),
            })),
            ...old.consultations,
          ],
        };
      });
    } catch {
      /* Malformed customer demo requests do not prevent admin access. */
    }
  }, []);
  const reset = () => {
    setState(seedAdmin());
    notify("Admin demo reset. Customer shopping data was kept.");
  };
  return { state, update, notify, toast, storageWarning, reset };
}
const Context = createContext<ReturnType<typeof useAdminValue> | null>(null);
export function AdminProvider({ children }: { children: ReactNode }) {
  const value = useAdminValue();
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useAdmin() {
  const v = useContext(Context);
  if (!v) throw new Error("Admin provider missing");
  return v;
}
