import { INSTAGRAM_PROFILE } from "./instagram-data";
import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowUpRight,
  Instagram,
  ArrowRight,
  Heart,
  ShoppingBag,
  Plus,
  Minus,
  MapPin,
  Check,
  PackageCheck,
  HandHeart,
  Gem,
  Truck,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { products, money, type Product } from "./data";
import { useStore, subtotal } from "./store";
import { Header } from "./Navigation";
import { SmoothExperience, ScrollProgress } from "./experience";
import { Brand, Modal } from "./ui";
export { Brand, Modal } from "./ui";
export const IconArrow = ArrowUpRight;
export function ButtonLink({
  to,
  children,
  outline = false,
  className = "",
}: {
  to: string;
  children: ReactNode;
  outline?: boolean;
  className?: string;
}) {
  return (
    <Link
      to={to}
      className={`button ${outline ? "button-outline" : ""} ${className}`}
    >
      {children}
      <ArrowUpRight size={17} aria-hidden="true" />
    </Link>
  );
}
export function TextLink({
  to,
  children,
}: {
  to: string;
  children: ReactNode;
}) {
  return (
    <Link to={to} className="text-link">
      {children}
      <ArrowUpRight size={17} aria-hidden="true" />
    </Link>
  );
}
export function ProductCard({
  product: p,
  index = 0,
}: {
  product: Product;
  index?: number;
}) {
  const { wishlist, toggleWish } = useStore();
  return (
    <motion.article
      data-product-source={p.id}
      className="product-card"
      initial={false}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.35 }}
    >
      <div className="product-visual">
        <Link
          data-product-part="image"
          to={"/products/" + p.slug}
          aria-label={"Discover " + p.name}
        >
          <img
            src={p.image}
            width={600}
            height={750}
            alt={p.name}
            loading="lazy"
            style={{
              objectPosition:
                p.id === "noor-pendant" ? "center 35%" : undefined,
            }}
          />
        </Link>
        {p.tag && <span className="product-tag">{p.tag}</span>}
        <button
          className={`wish-button ${wishlist.includes(p.id) ? "is-saved" : ""}`}
          onClick={() => toggleWish(p.id)}
          aria-label={`${wishlist.includes(p.id) ? "Remove" : "Save"} ${p.name} ${wishlist.includes(p.id) ? "from" : "to"} wishlist`}
          aria-pressed={wishlist.includes(p.id)}
        >
          <Heart
            size={17}
            fill={wishlist.includes(p.id) ? "currentColor" : "none"}
          />
        </button>
        <Link className="card-discover" to={"/products/" + p.slug}>
          Discover the piece <ArrowUpRight size={16} />
        </Link>
      </div>
      <div className="product-meta">
        <span>{p.material} edit</span>
        <span className="product-number">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <h3 data-product-part="name">
        <Link to={"/products/" + p.slug}>{p.name}</Link>
      </h3>
      <p className="price" data-product-part="price">
        {p.purchasable ? money(p.price) : "Price on consultation"}
      </p>
    </motion.article>
  );
}
export function ProductGrid({
  items = products.slice(0, 4),
}: {
  items?: Product[];
}) {
  return (
    <div className="product-grid">
      {items.map((p, i) => (
        <ProductCard key={p.id} product={p} index={i} />
      ))}
    </div>
  );
}
export function PageIntro({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <section className="page-intro container">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1>{title}</h1>
      {description && <p className="intro-copy">{description}</p>}
      {children}
    </section>
  );
}
export function Breadcrumb({
  items,
}: {
  items: { label: string; to?: string }[];
}) {
  return (
    <nav className="breadcrumb container" aria-label="Breadcrumb">
      <Link to="/">Home</Link>
      {items.map((it, i) => (
        <span key={i}>
          <span aria-hidden="true">/</span>
          {it.to ? (
            <Link to={it.to}>{it.label}</Link>
          ) : (
            <span aria-current="page">{it.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
export function EmptyState({
  title,
  description,
  to = "/shop",
  action = "Explore jewellery",
  icon = "bag",
}: {
  title: string;
  description: string;
  to?: string;
  action?: string;
  icon?: string;
}) {
  return (
    <div className="empty-state">
      {icon === "heart" ? (
        <Heart size={40} strokeWidth={1} />
      ) : (
        <ShoppingBag size={40} strokeWidth={1} />
      )}
      <h2>{title}</h2>
      <p>{description}</p>
      <ButtonLink to={to}>{action}</ButtonLink>
    </div>
  );
}
export function CartLines({ compact = false }: { compact?: boolean }) {
  const { cart, updateQty } = useStore();
  return (
    <div className={`cart-lines ${compact ? "compact" : ""}`}>
      {cart.map((line, i) => {
        const p = products.find((p) => p.id === line.productId)!;
        return (
          <div className="cart-line" key={line.productId + line.variant}>
            <Link to={"/products/" + p.slug}>
              <img src={p.image} alt={p.name} width={180} height={220} />
            </Link>
            <div className="cart-line-info">
              <span className="small muted">{p.material} edit</span>
              <h3>
                <Link to={"/products/" + p.slug}>{p.name}</Link>
              </h3>
              <span className="small muted">{line.variant}</span>
              <div className="cart-line-bottom">
                <div className="quantity">
                  <button
                    aria-label={"Decrease quantity of " + p.name}
                    onClick={() => updateQty(i, line.quantity - 1)}
                  >
                    <Minus size={13} />
                  </button>
                  <span aria-label="Quantity">{line.quantity}</span>
                  <button
                    aria-label={"Increase quantity of " + p.name}
                    onClick={() => updateQty(i, line.quantity + 1)}
                  >
                    <Plus size={13} />
                  </button>
                </div>
                <span>{money(p.price * line.quantity)}</span>
              </div>
              <button className="remove-link" onClick={() => updateQty(i, 0)}>
                Remove
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
export function CartDrawer() {
  const { bagOpen, setBagOpen, cart } = useStore();
  return (
    <Modal
      open={bagOpen}
      onClose={() => setBagOpen(false)}
      title="Your jewellery bag"
      side
    >
      {cart.length ? (
        <>
          <CartLines compact />
          <div className="drawer-summary">
            <p>
              <span>Subtotal</span>
              <strong>{money(subtotal(cart))}</strong>
            </p>
            <span className="small muted">
              Demo prices. Delivery selected at checkout.
            </span>
            <Link
              to="/checkout"
              className="button"
              onClick={() => setBagOpen(false)}
            >
              Continue to checkout <ArrowRight size={17} />
            </Link>
            <Link
              className="text-link"
              to="/cart"
              onClick={() => setBagOpen(false)}
            >
              View your bag <ArrowUpRight size={16} />
            </Link>
          </div>
        </>
      ) : (
        <EmptyState
          title="A little room for something beautiful."
          description="Your next favourite is waiting to be discovered."
        />
      )}
    </Modal>
  );
}
export function ServiceStrip() {
  return (
    <div className="service-strip container">
      {[
        [Gem, "Considered craftsmanship", "Beauty in every detail"],
        [HandHeart, "Personally curated", "Chosen with you in mind"],
        [PackageCheck, "A thoughtful experience", "From discovery to unboxing"],
        [Truck, "Delivered with care", "Explore delivery at checkout"],
      ].map(([Icon, title, sub]) => {
        const I = Icon as typeof Gem;
        return (
          <div key={String(title)}>
            <I size={26} strokeWidth={1} />
            <div>
              <strong>{String(title)}</strong>
              <span>{String(sub)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
export function Footer() {
  const { notify } = useStore();
  const [email, setEmail] = useState("");
  return (
    <>
      <section className="newsletter">
        <div className="container newsletter-inner">
          <div>
            <p className="eyebrow">A note from Ornate</p>
            <h2>A little beauty in your inbox.</h2>
            <p>
              New collections, personal favourites, and stories worth keeping.
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              notify(
                "Thank you. Your interest has been saved for this demo; no email was sent.",
              );
              setEmail("");
            }}
          >
            <label className="sr-only" htmlFor="newsletter-email">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button aria-label="Join the Ornate mailing list">
              <ArrowRight size={22} />
            </button>
          </form>
        </div>
      </section>
      <footer className="footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <Brand />
            <p>
              Beautiful pieces.
              <br />
              Thoughtfully chosen.
              <br />
              Entirely you.
            </p>
            <Link to="/visit-us" className="footer-location">
              <MapPin size={15} /> Discover our Kota boutique
            </Link>
            <a
              className="footer-instagram"
              href={INSTAGRAM_PROFILE}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram size={17} />
              <span>@ornatejewels.kota</span>
              <ArrowUpRight size={14} />
            </a>
          </div>
          <div>
            <h3>Discover</h3>
            {[
              ["All jewellery", "/shop"],
              ["The heritage edit", "/collections/heritage"],
              ["The bridal room", "/bridal"],
              ["Piyusha’s edit", "/piyushas-edit"],
              ["Gifting", "/gifting"],
            ].map(([l, t]) => (
              <Link key={t} to={t}>
                {l}
              </Link>
            ))}
          </div>
          <div>
            <h3>We’re here for you</h3>
            {[
              ["Book a consultation", "/consultation"],
              ["Contact us", "/contact"],
              ["Jewellery care", "/care-guide"],
              ["Size guide", "/size-guide"],
              ["FAQs", "/faqs"],
            ].map(([l, t]) => (
              <Link key={t} to={t}>
                {l}
              </Link>
            ))}
          </div>
          <div>
            <h3>The finer details</h3>
            {[
              ["Our story", "/our-story"],
              ["Shipping & delivery", "/policies/shipping"],
              ["Returns & exchanges", "/policies/returns"],
              ["Privacy policy", "/policies/privacy"],
              ["Terms of service", "/policies/terms"],
            ].map(([l, t]) => (
              <Link key={t} to={t}>
                {l}
              </Link>
            ))}
          </div>
        </div>
        <div className="container footer-bottom">
          <span>© {new Date().getFullYear()} Ornate Jewels, Kota.</span>
          <span>Client presentation · Demo catalogue & prices</span>
          <Link to="/our-story">
            Made for moments that matter <span aria-hidden="true">✧</span>
          </Link>
        </div>
      </footer>
    </>
  );
}
export function Shell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { toast, setBagOpen } = useStore();
  useEffect(() => {
    setBagOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" });
    const name = location.pathname
      .split("/")
      .filter(Boolean)
      .join(" · ")
      .replaceAll("-", " ");
    document.title =
      (name ? name.charAt(0).toUpperCase() + name.slice(1) + " — " : "") +
      "Ornate Jewels, Kota";
  }, [location.pathname]);
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <SmoothExperience />
      <ScrollProgress />
      <Header />
      <main
        id="main"
        className={location.pathname === "/" ? "home-main" : "interior-main"}
      >
        {children}
      </main>
      <ServiceStrip />
      <Footer />
      <CartDrawer />
      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast"
            role="status"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Check size={17} />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
