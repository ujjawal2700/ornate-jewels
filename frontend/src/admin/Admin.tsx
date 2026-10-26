import { PageTransition } from "../PageTransition";
import { useAuth } from "../auth";
import { AdminLogin } from "../AuthScreens";
import { Logo, LogoSymbol } from "../Logo";
import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Gem,
  Layers3,
  Package,
  Users,
  CalendarDays,
  PanelTop,
  Image,
  TicketPercent,
  ChartNoAxesCombined,
  Settings as SettingsIcon,
  ArrowUpRight,
  Search,
  Bell,
  Menu,
  ChevronRight,
  CheckCircle2,
  LogOut,
} from "lucide-react";
import { AdminProvider, useAdmin } from "./context";
import { Dashboard } from "./Dashboard";
import { Products, Inventory, CollectionsManager } from "./Catalogue";
import { Orders, Customers, Consultations } from "./Operations";
import { Content, Discounts, Media, Settings } from "./Content";
import { Dialog, Empty, SearchField } from "./ui";
import "./admin.css";
const primary = [
  { path: "", label: "Overview", icon: LayoutDashboard },
  { path: "orders", label: "Orders", icon: ShoppingBag },
  { path: "products", label: "Products", icon: Gem },
  { path: "collections", label: "Collections", icon: Layers3 },
  { path: "inventory", label: "Inventory", icon: Package },
  { path: "customers", label: "Customers", icon: Users },
  { path: "consultations", label: "Consultations", icon: CalendarDays },
];
const experience = [
  { path: "content", label: "Storefront content", icon: PanelTop },
  { path: "media", label: "Media library", icon: Image },
  { path: "discounts", label: "Discounts", icon: TicketPercent },
  { path: "analytics", label: "Analytics", icon: ChartNoAxesCombined },
];
function Sidebar({ close }: { close?: () => void }) {
  const { state } = useAdmin();
  const auth = useAuth();
  const count = state.orders.filter((o) => o.status === "Unfulfilled").length;
  return (
    <>
      <Link to="/admin" className="a-brand" onClick={close}>
        <Logo />
        <small className="a-studio-caption">Studio</small>
      </Link>
      <p className="a-sidebar-label">Boutique management</p>
      <nav aria-label="Admin main navigation">
        {primary.map((n) => (
          <NavLink
            end
            key={n.path}
            to={`/admin${n.path ? "/" + n.path : ""}`}
            onClick={close}
            className={({ isActive }) => (isActive ? "is-active" : "")}
          >
            <n.icon size={18} />
            <span>{n.label}</span>
            {n.path === "orders" && count > 0 && <b>{count}</b>}
          </NavLink>
        ))}
      </nav>
      <p className="a-sidebar-label a-second-label">The experience</p>
      <nav aria-label="Admin experience navigation">
        {experience.map((n) => (
          <NavLink
            key={n.path}
            to={`/admin/${n.path}`}
            onClick={close}
            className={({ isActive }) => (isActive ? "is-active" : "")}
          >
            <n.icon size={18} />
            <span>{n.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="a-sidebar-bottom">
        <NavLink to="/admin/settings" onClick={close}>
          <SettingsIcon size={18} />
          Settings
        </NavLink>
        <Link to="/" onClick={close}>
          View storefront
          <ArrowUpRight size={17} />
        </Link>
        <button
          className="a-admin-signout"
          onClick={() => {
            close?.();
            auth.signOutAdmin();
          }}
        >
          <LogOut size={17} />
          Sign out
        </button>
        <div className="a-owner">
          <span>
            <LogoSymbol />
          </span>
          <div>
            <strong>Ornate Studio</strong>
            <small>Owner demo workspace</small>
          </div>
        </div>
      </div>
    </>
  );
}
function AdminLayout() {
  const { state, toast, storageWarning } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobile, setMobile] = useState(false);
  const [search, setSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [notifications, setNotifications] = useState(false);
  const current =
    [...primary, ...experience, { path: "settings", label: "Settings" }].find(
      (n) =>
        location.pathname.replace(/\/$/, "") ===
        `/admin${n.path ? "/" + n.path : ""}`,
    )?.label || "Studio";
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (document.querySelector("dialog[open]")) return;
        setMobile(false);
        setNotifications(false);
        setSearch((s) => !s);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  useEffect(() => {
    document.title = `${current} | Ornate Studio`;
    window.scrollTo({ top: 0, behavior: "instant" });
    return () => {
      document.title = "Ornate Jewels, Kota";
    };
  }, [location.pathname, current]);
  const q = query.trim().toLowerCase();
  const results = q
    ? [
        ...state.products
          .filter((p) => `${p.name} ${p.sku}`.toLowerCase().includes(q))
          .slice(0, 5)
          .map((p) => ({
            id: p.id,
            type: "Product",
            title: p.name,
            detail: p.sku,
            to: `/admin/products?search=${encodeURIComponent(p.sku)}`,
          })),
        ...state.orders
          .filter((o) => `${o.id} ${o.customer}`.toLowerCase().includes(q))
          .slice(0, 5)
          .map((o) => ({
            id: o.id,
            type: "Order",
            title: o.id,
            detail: o.customer,
            to: `/admin/orders?order=${o.id}`,
          })),
        ...state.customers
          .filter((c) => `${c.name} ${c.email}`.toLowerCase().includes(q))
          .slice(0, 4)
          .map((c) => ({
            id: c.id,
            type: "Customer",
            title: c.name,
            detail: c.email,
            to: `/admin/customers?search=${encodeURIComponent(c.email)}`,
          })),
      ]
    : [];
  const orderCount = state.settings.orderAlerts
    ? state.orders.filter((o) => o.status === "Unfulfilled").length
    : 0;
  const stockCount = state.settings.stockAlerts
    ? state.products.filter(
        (p) => p.status !== "Archived" && p.stock <= state.settings.lowStock,
      ).length
    : 0;
  return (
    <div className="admin-app">
      <a className="a-skip" href="#admin-main">
        Skip to workspace
      </a>
      <aside className="a-sidebar">
        <Sidebar />
      </aside>
      <div className="a-workspace">
        <header className="a-topbar">
          <div>
            <button
              className="a-icon a-mobile-menu"
              aria-label="Open admin navigation"
              onClick={() => setMobile(true)}
            >
              <Menu size={22} />
            </button>
            <span className="a-breadcrumb">
              Studio
              <ChevronRight size={13} />
              <strong>{current}</strong>
            </span>
          </div>
          <div className="a-topbar-actions">
            <button
              className="a-global-search"
              onClick={() => {
                setQuery("");
                setSearch(true);
              }}
            >
              <Search size={17} />
              <span>Search your studio</span>
              <kbd>⌘ K</kbd>
            </button>
            <Link className="a-store-link" to="/">
              Storefront
              <ArrowUpRight size={15} />
            </Link>
            <button
              className="a-icon a-bell"
              aria-label="Open studio notifications"
              onClick={() => setNotifications(true)}
            >
              <Bell size={19} />
              {orderCount + stockCount > 0 && <i />}
            </button>
            <span className="a-top-avatar" aria-label="Demo owner">
              <LogoSymbol />
            </span>
          </div>
        </header>
        <div className="a-demo-strip">
          <span>
            <i />
            Demo workspace
          </span>
          <p>Changes are saved in this browser. No live store actions.</p>
        </div>
        {storageWarning && (
          <div role="alert" className="a-storage-warning">
            Browser storage is full or unavailable. Your latest changes will be
            lost when this page is reloaded. Remove unused image uploads or
            allow site storage.
          </div>
        )}
        <main id="admin-main" className="a-main" tabIndex={-1}>
          <PageTransition>
            <Routes>
              <Route index element={<Dashboard />} />
              <Route path="orders" element={<Orders />} />
              <Route path="products" element={<Products />} />
              <Route path="collections" element={<CollectionsManager />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="customers" element={<Customers />} />
              <Route path="consultations" element={<Consultations />} />
              <Route path="content" element={<Content />} />
              <Route path="media" element={<Media />} />
              <Route path="discounts" element={<Discounts />} />
              <Route path="analytics" element={<Dashboard analytics />} />
              <Route path="settings" element={<Settings />} />
              <Route
                path="*"
                element={
                  <Empty
                    title="This desk is empty"
                    description="Choose a section from the studio navigation."
                  >
                    <Link className="a-button" to="/admin">
                      Back to overview
                    </Link>
                  </Empty>
                }
              />
            </Routes>
          </PageTransition>
          <footer className="a-workspace-footer">
            <span className="a-footer-logo">
              <Logo decorative />
              <small>Studio</small>
            </span>
            <span>Made for the details that matter.</span>
          </footer>
        </main>
      </div>
      {mobile && (
        <Dialog title="Explore the studio" onClose={() => setMobile(false)}>
          <div className="a-mobile-sidebar">
            <Sidebar close={() => setMobile(false)} />
          </div>
        </Dialog>
      )}
      {search && (
        <Dialog title="Search your studio" onClose={() => setSearch(false)}>
          <div className="a-dialog-body">
            <SearchField
              value={query}
              onChange={setQuery}
              placeholder="Find products, orders or customers…"
            />
            {q ? (
              results.length ? (
                <div className="a-search-results">
                  {results.map((r) => (
                    <button
                      key={r.type + r.id}
                      onClick={() => {
                        setSearch(false);
                        navigate(r.to);
                      }}
                    >
                      <span>
                        <small>{r.type}</small>
                        <strong>{r.title}</strong>
                        <span>{r.detail}</span>
                      </span>
                      <ArrowUpRight size={18} />
                    </button>
                  ))}
                </div>
              ) : (
                <Empty
                  title="Nothing found"
                  description="Try a product name, SKU, order number or customer name."
                />
              )
            ) : (
              <div className="a-search-hint">
                <Search size={26} />
                <p>
                  Your catalogue, orders and client book.
                  <br />
                  Start typing to find what you need.
                </p>
              </div>
            )}
          </div>
        </Dialog>
      )}
      {notifications && (
        <Dialog
          title="Studio notifications"
          onClose={() => setNotifications(false)}
        >
          <div className="a-dialog-body a-notification-list">
            {orderCount > 0 && (
              <Link
                onClick={() => setNotifications(false)}
                to="/admin/orders?status=Unfulfilled"
              >
                <ShoppingBag size={22} />
                <div>
                  <strong>{orderCount} unfulfilled orders</strong>
                  <p>Review the latest orders and begin fulfilment.</p>
                </div>
                <ChevronRight size={18} />
              </Link>
            )}
            {stockCount > 0 && (
              <Link
                onClick={() => setNotifications(false)}
                to="/admin/inventory"
              >
                <Package size={22} />
                <div>
                  <strong>
                    {stockCount} products at or below the stock threshold
                  </strong>
                  <p>Review availability and replenishment.</p>
                </div>
                <ChevronRight size={18} />
              </Link>
            )}
            {!orderCount && !stockCount && (
              <Empty
                title="You’re all caught up"
                description="No enabled attention items at the moment."
              />
            )}
            <Link
              className="a-text-link"
              onClick={() => setNotifications(false)}
              to="/admin/settings"
            >
              Manage notification preferences
              <ArrowUpRight size={15} />
            </Link>
          </div>
        </Dialog>
      )}
      {toast && (
        <div role="status" className="a-toast">
          <CheckCircle2 size={19} />
          {toast}
        </div>
      )}
    </div>
  );
}
export default function Admin() {
  const { admin } = useAuth();
  const location = useLocation();
  if (location.pathname.replace(/\/$/, "") === "/admin/login")
    return (
      <PageTransition>
        <AdminLogin />
      </PageTransition>
    );
  if (!admin)
    return (
      <Navigate
        to={
          "/admin/login?next=" +
          encodeURIComponent(location.pathname + location.search)
        }
        replace
      />
    );
  return (
    <AdminProvider>
      <AdminLayout />
    </AdminProvider>
  );
}
