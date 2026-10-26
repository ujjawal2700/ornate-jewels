import { products, collections, type Product } from "../data";
export type ProductRecord = Product & {
  status: "Active" | "Draft" | "Archived";
  sku: string;
};
export type OrderStatus =
  "Unfulfilled" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
export type AdminOrder = {
  id: string;
  date: string;
  customer: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  items: {
    productId: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    variant: string;
  }[];
  total: number;
  shipping: number;
  payment: "Paid" | "Pending";
  status: OrderStatus;
  note: string;
  tracking: string;
};
export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  note: string;
  segment: "Returning" | "New" | "VIP";
};
export type CollectionRecord = {
  id: string;
  name: string;
  description: string;
  image: string;
  status: "Active" | "Draft";
};
export type ConsultationRecord = {
  id: string;
  name: string;
  email: string;
  phone: string;
  interest: string;
  date: string;
  status: "New" | "Confirmed" | "Completed" | "Cancelled";
  note: string;
};
export type Discount = {
  id: string;
  code: string;
  type: "Percentage" | "Fixed amount";
  value: number;
  minimum: number;
  expiry: string;
  active: boolean;
  uses: number;
};
export type Banner = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  button: string;
  link: string;
  active: boolean;
};
export type PageRecord = {
  id: string;
  title: string;
  body: string;
  status: "Draft" | "Ready";
};
export type MediaRecord = {
  id: string;
  name: string;
  url: string;
  alt: string;
};
export type Activity = { id: string; text: string; date: string };
export type AdminState = {
  version: 1;
  products: ProductRecord[];
  orders: AdminOrder[];
  customers: Customer[];
  collections: CollectionRecord[];
  consultations: ConsultationRecord[];
  discounts: Discount[];
  banners: Banner[];
  pages: PageRecord[];
  media: MediaRecord[];
  settings: {
    name: string;
    email: string;
    phone: string;
    address: string;
    shipping: number;
    freeShipping: number;
    lowStock: number;
    orderAlerts: boolean;
    stockAlerts: boolean;
  };
  activity: Activity[];
};
export const demoDate = new Date("2026-10-25T18:00:00+05:30");
const names = [
  "Aditi Sharma",
  "Meera Jain",
  "Riya Agarwal",
  "Ananya Mehta",
  "Kavya Soni",
  "Ishita Gupta",
  "Naina Kapoor",
  "Priya Bansal",
];
export function seedAdmin(): AdminState {
  const customers: Customer[] = names.map((name, i) => ({
    id: `CUS-${101 + i}`,
    name,
    email: `client${i + 1}@example.com`,
    phone: `90000000${String(i + 10)}`,
    city: ["Kota", "Jaipur", "Udaipur", "Delhi"][i % 4],
    note:
      i === 0 ? "Prefers heritage pieces. Interested in the bridal edit." : "",
    segment: i < 2 ? "VIP" : i < 6 ? "Returning" : "New",
  }));
  const orders: AdminOrder[] = Array.from({ length: 36 }, (_, i) => {
    const customer = customers[i % customers.length];
    const p = products[i % products.length];
    const date = new Date(demoDate);
    date.setDate(date.getDate() - Math.floor(i * 0.83));
    date.setHours(10 + (i % 8), i % 60);
    return {
      id: `ORN-${1048 - i}`,
      date: date.toISOString(),
      customer: customer.name,
      email: customer.email,
      phone: customer.phone,
      city: customer.city,
      address: `12 Sample Lane, ${customer.city}, Rajasthan 324005`,
      items: [
        {
          productId: p.id,
          name: p.name,
          image: p.image,
          price: p.price,
          quantity: 1,
          variant: p.variants[0],
        },
      ],
      total: p.price,
      shipping: 0,
      payment: i % 9 === 4 ? "Pending" : "Paid",
      status:
        i < 4
          ? "Unfulfilled"
          : i < 7
            ? "Processing"
            : i < 11
              ? "Shipped"
              : i % 13 === 0
                ? "Cancelled"
                : "Delivered",
      note: i === 1 ? "Gift wrap requested. Include a blank gift card." : "",
      tracking: i >= 7 && i < 11 ? `DEMO${1048 - i}` : "",
    };
  });
  return {
    version: 1,
    products: products.map((p, i) => ({
      ...p,
      stock: [8, 3, 2, 6, 1, 4, 5, 7, 0, 3, 2, 4][i],
      sku: `ORN-${String(i + 1).padStart(3, "0")}`,
      status: p.id === "rose-drops" ? "Draft" : "Active",
    })),
    orders,
    customers,
    collections: collections.map((c) => ({
      id: c.slug,
      name: c.name,
      description: c.description,
      image: "/assets/" + c.image,
      status: "Active",
    })),
    consultations: customers.slice(0, 5).map((c, i) => ({
      id: `APT-${201 + i}`,
      name: c.name,
      email: c.email,
      phone: c.phone,
      interest: [
        "Bridal jewellery",
        "Polki collection",
        "Everyday diamonds",
        "Custom piece",
        "Gifting",
      ][i],
      date: `2026-10-${String(26 + i).padStart(2, "0")}T${i % 2 ? "16" : "11"}:00`,
      status: i < 2 ? "New" : "Confirmed",
      note:
        i === 0
          ? "Wedding in December. Looking for a complete heritage set."
          : "",
    })),
    discounts: [
      {
        id: "welcome",
        code: "WELCOME5",
        type: "Percentage",
        value: 5,
        minimum: 10000,
        expiry: "2026-12-31",
        active: true,
        uses: 12,
      },
      {
        id: "festive",
        code: "FESTIVE2000",
        type: "Fixed amount",
        value: 2000,
        minimum: 50000,
        expiry: "2026-11-15",
        active: true,
        uses: 8,
      },
    ],
    banners: [
      {
        id: "home",
        title: "More than meets the eye.",
        subtitle:
          "A little of where you come from. A little of who you’re becoming.",
        image: "/assets/campaign.webp",
        button: "Find your piece",
        link: "/shop",
        active: true,
      },
      {
        id: "bridal",
        title: "Your story. Beautifully adorned.",
        subtitle: "Begin your once-in-a-lifetime edit with Ornate.",
        image: "/assets/spotlight-gold.jpg",
        button: "Explore bridal",
        link: "/bridal",
        active: false,
      },
    ],
    pages: [
      {
        id: "story",
        title: "Our story",
        body: "In the heart of Kota, Ornate brings together expressive jewellery, considered curation and a personal approach to finding your piece.",
        status: "Ready",
      },
      {
        id: "care",
        title: "Jewellery care",
        body: "Store each piece separately in a soft pouch. Avoid contact with perfume, cosmetics and water. Visit the boutique for personal care guidance.",
        status: "Ready",
      },
      {
        id: "shipping",
        title: "Shipping & returns",
        body: "This is sample policy content. Confirm delivery coverage, timelines, insurance and return eligibility with Ornate before launch.",
        status: "Draft",
      },
    ],
    media: products
      .slice(0, 6)
      .map((p) => ({ id: p.id, name: p.name, url: p.image, alt: p.name })),
    settings: {
      name: "Ornate Jewels, Kota",
      email: "studio@ornate.example",
      phone: "9000000000",
      address: "Kota, Rajasthan",
      shipping: 250,
      freeShipping: 25000,
      lowStock: 3,
      orderAlerts: true,
      stockAlerts: true,
    },
    activity: [
      {
        id: "seed-1",
        text: "The Ornate Studio demo workspace is ready.",
        date: demoDate.toISOString(),
      },
    ],
  };
}
export const ADMIN_KEY = "ornate:admin:v1";
export function isAdminState(v: unknown): v is AdminState {
  if (!v || typeof v !== "object") return false;
  const s = v as AdminState;
  const strings = (value: unknown, keys: string[]) =>
    !!value &&
    typeof value === "object" &&
    keys.every(
      (k) => typeof (value as Record<string, unknown>)[k] === "string",
    );
  const date = (value: string) => Number.isFinite(new Date(value).getTime());
  const nonnegative = (value: number) => Number.isFinite(value) && value >= 0;
  return (
    s.version === 1 &&
    [
      s.products,
      s.orders,
      s.customers,
      s.collections,
      s.consultations,
      s.discounts,
      s.banners,
      s.pages,
      s.media,
      s.activity,
    ].every(Array.isArray) &&
    strings(s.settings, ["name", "email", "phone", "address"]) &&
    nonnegative(s.settings.shipping) &&
    nonnegative(s.settings.freeShipping) &&
    Number.isInteger(s.settings.lowStock) &&
    s.settings.lowStock >= 0 &&
    typeof s.settings.orderAlerts === "boolean" &&
    typeof s.settings.stockAlerts === "boolean" &&
    s.products.every(
      (p) =>
        strings(p, [
          "id",
          "slug",
          "name",
          "sku",
          "category",
          "material",
          "collection",
          "image",
          "description",
        ]) &&
        nonnegative(p.price) &&
        Number.isInteger(p.stock) &&
        p.stock >= 0 &&
        Array.isArray(p.variants) &&
        p.variants.every((x) => typeof x === "string") &&
        ["Active", "Draft", "Archived"].includes(p.status) &&
        typeof p.purchasable === "boolean",
    ) &&
    s.orders.every(
      (o) =>
        strings(o, [
          "id",
          "date",
          "customer",
          "email",
          "phone",
          "city",
          "address",
          "note",
          "tracking",
        ]) &&
        date(o.date) &&
        nonnegative(o.total) &&
        nonnegative(o.shipping) &&
        ["Paid", "Pending"].includes(o.payment) &&
        [
          "Unfulfilled",
          "Processing",
          "Shipped",
          "Delivered",
          "Cancelled",
        ].includes(o.status) &&
        Array.isArray(o.items) &&
        o.items.every(
          (i) =>
            strings(i, ["productId", "name", "image", "variant"]) &&
            nonnegative(i.price) &&
            Number.isInteger(i.quantity) &&
            i.quantity > 0,
        ),
    ) &&
    s.customers.every(
      (c) =>
        strings(c, ["id", "name", "email", "phone", "city", "note"]) &&
        ["New", "Returning", "VIP"].includes(c.segment),
    ) &&
    s.collections.every(
      (c) =>
        strings(c, ["id", "name", "description", "image"]) &&
        ["Active", "Draft"].includes(c.status),
    ) &&
    s.consultations.every(
      (c) =>
        strings(c, [
          "id",
          "name",
          "email",
          "phone",
          "interest",
          "date",
          "note",
        ]) &&
        date(c.date) &&
        ["New", "Confirmed", "Completed", "Cancelled"].includes(c.status),
    ) &&
    s.discounts.every(
      (d) =>
        strings(d, ["id", "code", "expiry"]) &&
        date(d.expiry) &&
        ["Percentage", "Fixed amount"].includes(d.type) &&
        nonnegative(d.value) &&
        nonnegative(d.minimum) &&
        nonnegative(d.uses) &&
        typeof d.active === "boolean",
    ) &&
    s.banners.every(
      (b) =>
        strings(b, ["id", "title", "subtitle", "image", "button", "link"]) &&
        typeof b.active === "boolean",
    ) &&
    s.pages.every(
      (p) =>
        strings(p, ["id", "title", "body"]) &&
        ["Ready", "Draft"].includes(p.status),
    ) &&
    s.media.every((m) => strings(m, ["id", "name", "url", "alt"])) &&
    s.activity.every((a) => strings(a, ["id", "text", "date"]) && date(a.date))
  );
}
export function loadAdmin(): AdminState {
  try {
    const saved = JSON.parse(localStorage.getItem(ADMIN_KEY) || "null");
    return isAdminState(saved) ? saved : seedAdmin();
  } catch {
    return seedAdmin();
  }
}
export const uid = () => crypto.randomUUID();
export const dateLabel = (date: string) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(date));
export function csvDownload(filename: string, rows: (string | number)[][]) {
  const csv = rows
    .map((row) =>
      row
        .map((value) => {
          const safe = String(value).replace(/^[=+@\-\t\r]/, "'$&");
          return '"' + safe.replaceAll('"', '""') + '"';
        })
        .join(","),
    )
    .join("\r\n");
  const url = URL.createObjectURL(
    new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
