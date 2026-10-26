import { INSTAGRAM_PROFILE } from "./instagram-data";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Instagram,
  ArrowRight,
  Search,
  ShoppingBag,
  UserRound,
  Heart,
  Plus,
  Minus,
  X,
} from "lucide-react";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import { Brand, Modal } from "./ui";
import { useStore } from "./store";
import { categories } from "./data";

function StudioMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const reduced = useReducedMotion();
  const bodyOverflow = useRef<string | null>(null);
  const [shopOpen, setShopOpen] = useState(false);
  const [preview, setPreview] = useState("/assets/spotlight-gold.jpg");
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const finishClose = () => {
      d.close();
      d.classList.remove("is-closing");
      if (bodyOverflow.current !== null) {
        document.body.style.overflow = bodyOverflow.current;
        bodyOverflow.current = null;
      }
    };
    if (open) {
      d.classList.remove("is-closing");
      if (!d.open) {
        d.showModal();
        d.querySelector<HTMLButtonElement>(".menu-close")?.focus();
      }
      if (bodyOverflow.current === null) {
        bodyOverflow.current = document.body.style.overflow;
        document.body.style.overflow = "hidden";
      }
    } else if (d.open) {
      if (reduced) finishClose();
      else {
        d.classList.add("is-closing");
        const timer = window.setTimeout(finishClose, 300);
        return () => window.clearTimeout(timer);
      }
    }
  }, [open, reduced]);
  useEffect(
    () => () => {
      ref.current?.close();
      if (bodyOverflow.current !== null) {
        document.body.style.overflow = bodyOverflow.current;
        bodyOverflow.current = null;
      }
    },
    [],
  );
  const links = [
    {
      name: "The collections",
      to: "/collections",
      image: "favourite-heritage-set.jpg",
    },
    {
      name: "The bridal room",
      to: "/bridal",
      image: "popup-jewellery-model.jpg",
    },
    {
      name: "Piyusha’s edit",
      to: "/piyushas-edit",
      image: "piyusha-nyati.jpg",
    },
    { name: "Our story", to: "/our-story", image: "personalised-heirloom.jpg" },
  ];
  return (
    <dialog
      ref={ref}
      id="studio-navigation"
      className="studio-menu"
      aria-label="Explore Ornate"
      data-lenis-prevent
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div className="studio-menu-surface">
        <div className="studio-menu-top">
          <Brand />
          <button
            className="menu-close"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <span>Close</span>
            <X size={22} />
          </button>
        </div>
        <div className="studio-menu-body">
          <div className="studio-menu-links">
            <span className="menu-intro">A world, waiting to be yours.</span>
            <nav aria-label="Main navigation">
              <div className="menu-shop-row">
                <Link to="/shop" onClick={onClose}>
                  The jewellery
                  <ArrowUpRight />
                </Link>
                <button
                  aria-label={
                    shopOpen
                      ? "Hide jewellery categories"
                      : "Show jewellery categories"
                  }
                  aria-expanded={shopOpen}
                  aria-controls="menu-categories"
                  onClick={() => setShopOpen((v) => !v)}
                >
                  {shopOpen ? <Minus /> : <Plus />}
                </button>
              </div>
              <AnimatePresence initial={false}>
                {shopOpen && (
                  <motion.div
                    id="menu-categories"
                    className="menu-categories"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: reduced ? 0 : 0.3 }}
                  >
                    {categories.map((c) => (
                      <Link
                        key={c.name}
                        to={"/shop/" + c.name.toLowerCase()}
                        onClick={onClose}
                      >
                        {c.name}
                      </Link>
                    ))}
                    <Link to="/shop?material=Gold" onClick={onClose}>
                      Gold
                    </Link>
                    <Link to="/shop?material=Diamond" onClick={onClose}>
                      Diamonds
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
              {links.map((l) => (
                <div key={l.to}>
                  <NavLink
                    to={l.to}
                    onClick={onClose}
                    onMouseEnter={() => setPreview("/assets/" + l.image)}
                    onFocus={() => setPreview("/assets/" + l.image)}
                  >
                    {l.name}
                    <ArrowUpRight />
                  </NavLink>
                </div>
              ))}
            </nav>
            <div className="menu-secondary">
              <Link to="/gifting" onClick={onClose}>
                Gifting
              </Link>
              <Link to="/visit-us" onClick={onClose}>
                Visit the boutique
              </Link>
              <Link to="/contact" onClick={onClose}>
                Contact
              </Link>
            </div>
            <div className="menu-personal">
              <Link to="/account" onClick={onClose}>
                <UserRound size={17} />
                Your account
              </Link>
              <Link to="/wishlist" onClick={onClose}>
                <Heart size={17} />
                Saved pieces
              </Link>
            </div>
          </div>
          <div className="menu-editorial">
            <AnimatePresence mode="wait">
              <motion.img
                key={preview}
                src={preview}
                alt="A glimpse into the world of Ornate"
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduced ? 0 : 0.35 }}
              />
            </AnimatePresence>
            <div>
              <span>Ornate, Kota</span>
              <p>
                Some things are
                <br />
                worth discovering.
              </p>
              <Link to="/consultation" onClick={onClose}>
                A personal consultation <ArrowUpRight size={17} />
              </Link>
            </div>
          </div>
        </div>
        <div className="studio-menu-bottom">
          <span>Jewellery with a life beyond the occasion.</span>
          <a
            className="menu-instagram"
            href={INSTAGRAM_PROFILE}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Instagram size={14} />
            @ornatejewels.kota
            <ArrowUpRight size={13} />
          </a>
        </div>
      </div>
    </dialog>
  );
}
export function Header() {
  const { cart, setBagOpen } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const home = location.pathname === "/";
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 60);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  useEffect(() => {
    setMenu(false);
    setSearch(false);
  }, [location]);
  const count = cart.reduce((s, l) => s + l.quantity, 0);
  return (
    <>
      <header
        className={`studio-header ${home ? "on-home" : ""} ${scrolled ? "is-scrolled" : ""}`}
      >
        <div className="studio-header-inner">
          <button
            className="studio-menu-toggle"
            onClick={() => setMenu(true)}
            aria-label="Open menu"
            aria-expanded={menu}
            aria-controls="studio-navigation"
          >
            <span className="menu-strokes" aria-hidden="true">
              <i />
              <i />
            </span>
            <span>Explore</span>
          </button>
          <Brand />
          <nav className="studio-desktop-nav" aria-label="Shopping navigation">
            <NavLink to="/shop">Jewellery</NavLink>
            <NavLink to="/collections">Collections</NavLink>
            <NavLink to="/bridal">Bridal</NavLink>
          </nav>
          <div className="studio-header-actions">
            <button
              aria-label="Search jewellery"
              className="icon-button"
              onClick={() => setSearch(true)}
            >
              <Search />
            </button>
            <Link
              to="/account"
              className="storefront-account-link"
              aria-label="Your account"
            >
              <UserRound />
            </Link>
            <button
              className="studio-bag"
              aria-label={`Open shopping bag, ${count} items`}
              onClick={() => setBagOpen(true)}
            >
              <ShoppingBag size={18} />
              <span className="bag-word">Bag</span>
              <span className="bag-count">
                {String(count).padStart(2, "0")}
              </span>
            </button>
          </div>
        </div>
      </header>
      <StudioMenu open={menu} onClose={() => setMenu(false)} />
      <Modal
        open={search}
        onClose={() => setSearch(false)}
        title="What catches your eye?"
      >
        <form
          className="search-form"
          onSubmit={(e) => {
            e.preventDefault();
            navigate("/search?q=" + encodeURIComponent(query));
            setSearch(false);
          }}
        >
          <Search size={19} />
          <input
            aria-label="Search for jewellery"
            placeholder="Try emerald, earrings, polki…"
            name="q"
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="icon-button" aria-label="Submit search">
            <ArrowRight />
          </button>
        </form>
        <p className="muted small">A few beautiful places to begin</p>
        <div className="chips">
          {["Necklaces", "Polki", "Diamond", "Gold"].map((q) => (
            <Link className="chip" to={"/search?q=" + q} key={q}>
              {q}
            </Link>
          ))}
        </div>
      </Modal>
    </>
  );
}
