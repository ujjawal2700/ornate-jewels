import { useProductArrival } from "./ProductTransition";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Heart,
  ArrowRight,
  ArrowUpRight,
  Truck,
  ShieldCheck,
  ZoomIn,
  Check,
  Gift,
  ChevronDown,
} from "lucide-react";
import { Reveal } from "./experience";
import { products, money } from "./data";
import { useStore } from "./store";
import {
  Breadcrumb,
  ProductGrid,
  ButtonLink,
  Modal,
  EmptyState,
  TextLink,
} from "./components";
export default function ProductPage() {
  const { slug } = useParams();
  const product = products.find((p) => p.slug === slug);
  return product ? (
    <ProductDetail key={product.id} productId={product.id} />
  ) : (
    <EmptyState
      title="This piece has slipped out of the edit."
      description="There are still so many beautiful discoveries waiting for you."
    />
  );
}
function ProductDetail({ productId }: { productId: string }) {
  const p = products.find((x) => x.id === productId)!;
  const arrival = useProductArrival(productId);
  const { add, wishlist, toggleWish } = useStore();
  const [variant, setVariant] = useState(
    p.variants.length === 1 ? p.variants[0] : "",
  );
  const [error, setError] = useState("");
  const [zoom, setZoom] = useState(false);
  const [detail, setDetail] = useState(false);
  const [sizeGuide, setSizeGuide] = useState(false);
  const [pin, setPin] = useState("");
  const [delivery, setDelivery] = useState("");
  function addToBag() {
    if (!variant) {
      setError(
        "Please choose a " +
          (p.category === "Bangles" ? "size" : "length") +
          " first.",
      );
      return;
    }
    setError("");
    add(p, variant);
  }
  return (
    <>
      <Breadcrumb
        items={[
          { label: "Jewellery", to: "/shop" },
          { label: p.category, to: "/shop/" + p.category.toLowerCase() },
          { label: p.name },
        ]}
      />
      <section ref={arrival} className="container product-detail">
        <div className="product-gallery">
          <button
            data-product-target="image"
            className={"main-product-image " + (detail ? "detail-view" : "")}
            onClick={() => setZoom(true)}
            aria-label={"Enlarge " + p.name}
          >
            <img src={p.image} alt={p.name} />
            <span className="zoom-label">
              <ZoomIn size={18} /> A closer look
            </span>
          </button>
          <div className="thumbnails">
            <button
              className={!detail ? "selected" : ""}
              onClick={() => setDetail(false)}
              aria-label="View full piece"
            >
              <img src={p.image} alt="Full piece" />
            </button>
            <button
              className={detail ? "selected" : ""}
              onClick={() => setDetail(true)}
              aria-label="View close-up detail"
            >
              <img
                className="detail-thumb"
                src={p.image}
                alt="Jewellery detail"
              />
            </button>
            <span>
              Beauty is in the details.
              <br />
              Take a closer look.
            </span>
          </div>
        </div>
        <div className="product-copy">
          <div className="product-topline">
            <Link
              to={
                "/collections/" +
                (p.collection === "The Modern Muse"
                  ? "modern-muse"
                  : p.collection === "The Bridal Room"
                    ? "bridal"
                    : "heritage")
              }
            >
              {p.collection}
            </Link>
            <button
              className="icon-button"
              aria-pressed={wishlist.includes(p.id)}
              aria-label={
                wishlist.includes(p.id)
                  ? "Remove from wishlist"
                  : "Save to wishlist"
              }
              onClick={() => toggleWish(p.id)}
            >
              <Heart
                size={21}
                fill={wishlist.includes(p.id) ? "currentColor" : "none"}
              />
            </button>
          </div>
          <h1 data-product-target="name">{p.name}</h1>
          <p className="product-description" data-product-target="description">
            {p.description}
          </p>
          <p className="product-price" data-product-target="price">
            {p.purchasable ? money(p.price) : "Let’s find your perfect piece."}
          </p>
          <span className="small muted">
            {p.purchasable
              ? "Illustrative demo price · Not a live commercial offer"
              : "Explore this statement piece in a personal consultation."}
          </span>
          <div className="product-rule" />
          {p.purchasable && (
            <>
              <div className="variant-label">
                <span>
                  {p.category === "Bangles"
                    ? "Choose your size"
                    : "Choose your length / fit"}
                </span>
                <button
                  onClick={() => setSizeGuide(true)}
                  className="underlined"
                >
                  Size guide
                </button>
              </div>
              <div className="variant-options">
                {p.variants.map((v) => (
                  <button
                    key={v}
                    className={variant === v ? "selected" : ""}
                    onClick={() => {
                      setVariant(v);
                      setError("");
                    }}
                  >
                    {v}
                  </button>
                ))}
              </div>
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <div className="purchase-actions">
                <button
                  className="button full"
                  disabled={!p.stock}
                  onClick={addToBag}
                >
                  {p.stock ? "Add to your bag" : "Currently unavailable"}
                  <ShoppingIcon />
                </button>
              </div>
            </>
          )}
          {(!p.purchasable || !p.stock) && (
            <ButtonLink
              to={"/consultation?piece=" + encodeURIComponent(p.name)}
            >
              {p.stock ? "Discover it with Piyusha" : "Ask about this piece"}
            </ButtonLink>
          )}
          <div className="product-benefits">
            <span>
              <Gift size={18} /> A meaningful gift
            </span>
            <span>
              <ShieldCheck size={18} /> Personal guidance
            </span>
          </div>
          <form
            className="delivery-check"
            onSubmit={(e) => {
              e.preventDefault();
              setDelivery(
                /^\d{6}$/.test(pin)
                  ? "Demo delivery estimate: 5–7 business days. Actual availability will be confirmed by Ornate."
                  : "Please enter a valid 6-digit Indian pincode.",
              );
            }}
          >
            <label htmlFor="pincode-check">
              <Truck size={18} /> A little closer to you
            </label>
            <div>
              <input
                id="pincode-check"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                placeholder="Enter delivery pincode"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setDelivery("");
                }}
              />
              <button>Check</button>
            </div>
            {delivery && (
              <p className="small" role="status">
                {delivery}
              </p>
            )}
          </form>
          <div className="product-accordions">
            <details open>
              <summary>
                About this piece <ChevronDown size={16} />
              </summary>
              <p>
                {p.material}-inspired styling from {p.collection.toLowerCase()}.
                Product photography is sourced from Ornate’s public collection.
                The name, price, material description, size and availability are
                illustrative for this demo; confirm all specifications with the
                boutique.
              </p>
            </details>
            <details>
              <summary>
                Care & keeping <ChevronDown size={16} />
              </summary>
              <p>
                Store separately in a soft pouch, avoid perfumes and moisture,
                and wipe gently after wearing. For stone-set pieces, ask the
                boutique about appropriate cleaning.
              </p>
              <Link className="underlined" to="/care-guide">
                Read the care guide
              </Link>
            </details>
            <details>
              <summary>
                Delivery & returns <ChevronDown size={16} />
              </summary>
              <p>
                This is a presentation storefront. No real payment or shipment
                takes place. The final delivery and return policies will be
                confirmed by Ornate.
              </p>
              <Link className="underlined" to="/policies/returns">
                View the demo return policy
              </Link>
            </details>
          </div>
          <div className="personal-help">
            <span>Not quite sure? That’s what we’re here for.</span>
            <TextLink to={"/consultation?piece=" + encodeURIComponent(p.name)}>
              Find your piece with Piyusha
            </TextLink>
          </div>
        </div>
      </section>
      <Reveal className="product-story container">
        <div className="product-story-detail">
          <img
            src={p.image}
            alt={"A closer look at " + p.name}
            loading="lazy"
          />
          <span>The details are the story.</span>
        </div>
        <div className="product-story-copy">
          <span className="chapter-marker">A piece. A point of view.</span>
          <h2>
            Wear it your way.
            <br />
            Remember it forever.
          </h2>
          <p>
            {p.material === "Gold" ||
            p.material === "Kundan" ||
            p.material === "Polki"
              ? "A familiar warmth. An unexpected detail. Let it be the piece that connects a little of your past with the way you want to feel today."
              : "Light has a way of finding you. Wear this piece on its own for a quiet statement, or begin a conversation about creating a look that feels entirely yours."}
          </p>
          <TextLink to={"/consultation?piece=" + encodeURIComponent(p.name)}>
            A little styling guidance
          </TextLink>
        </div>
      </Reveal>
      <section className="container section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">A beautiful conversation</p>
            <h2>You might also fall for.</h2>
          </div>
          <TextLink to="/shop">Explore more</TextLink>
        </div>
        <ProductGrid
          items={products.filter((x) => x.id !== p.id).slice(0, 4)}
        />
      </section>
      <Modal open={zoom} onClose={() => setZoom(false)} title={p.name}>
        <img
          className="zoom-image"
          src={p.image}
          alt={"Close-up of " + p.name}
        />
      </Modal>
      <Modal
        open={sizeGuide}
        onClose={() => setSizeGuide(false)}
        title="A fit that feels like you"
      >
        <p className="muted">
          For the best fit, compare with a piece you already love. Sizes in this
          demo are sample options.
        </p>
        <table className="size-table">
          <thead>
            <tr>
              <th>Bangle size</th>
              <th>Inner diameter</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>2.4</td>
              <td>57.2 mm</td>
            </tr>
            <tr>
              <td>2.6</td>
              <td>60.3 mm</td>
            </tr>
            <tr>
              <td>2.8</td>
              <td>63.5 mm</td>
            </tr>
          </tbody>
        </table>
        <p>
          For necklaces, use a soft measuring tape around your neckline to find
          a comfortable length. Ask us to confirm the specific piece’s
          dimensions.
        </p>
        <ButtonLink to="/size-guide" outline>
          Explore the size guide
        </ButtonLink>
      </Modal>
    </>
  );
}
function ShoppingIcon() {
  return <ArrowRight size={17} />;
}
