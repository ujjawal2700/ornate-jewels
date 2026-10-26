import { useAuth } from "./auth";
import { useState, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  LockKeyhole,
  ShoppingBag,
  Truck,
  Gift,
  Heart,
  Package,
  MapPin,
} from "lucide-react";
import { products, money } from "./data";
import { useStore, subtotal, type Address, type Order } from "./store";
import {
  PageIntro,
  EmptyState,
  ProductGrid,
  CartLines,
  ButtonLink,
  TextLink,
} from "./components";
export function Wishlist() {
  const { wishlist } = useStore();
  return (
    <>
      <PageIntro
        eyebrow="A few things you love"
        title="Your little collection of favourites."
        description="Some pieces stay with you. Save them here until the moment feels right."
      />
      <section className="container section compact-section">
        {wishlist.length ? (
          <ProductGrid
            items={products.filter((p) => wishlist.includes(p.id))}
          />
        ) : (
          <EmptyState
            title="Something beautiful will find its way here."
            description="Tap the heart on a piece you love to keep it close."
            icon="heart"
          />
        )}
      </section>
    </>
  );
}
export function Cart() {
  const { cart } = useStore();
  return (
    <>
      <PageIntro eyebrow="A beautiful choice" title="Your jewellery bag" />
      {cart.length ? (
        <section className="container commerce-grid">
          <div>
            <CartLines />
            <TextLink to="/shop">Keep discovering</TextLink>
          </div>
          <aside className="order-summary">
            <h2>A little closer to yours.</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{money(subtotal(cart))}</span>
            </div>
            <div className="summary-row">
              <span>Delivery</span>
              <span>At checkout</span>
            </div>
            <div className="summary-row total">
              <span>Subtotal</span>
              <strong>{money(subtotal(cart))}</strong>
            </div>
            <p className="small muted">
              Illustrative prices. This purchase journey is a demo.
            </p>
            <ButtonLink to="/checkout" className="full">
              Continue to checkout
            </ButtonLink>
            <p className="secure-note">
              <LockKeyhole size={13} /> No real payment will be taken.
            </p>
          </aside>
        </section>
      ) : (
        <EmptyState
          title="A little room for something beautiful."
          description="Explore the edit and find the piece that speaks to you."
        />
      )}
    </>
  );
}
const blank: Address = {
  name: "",
  email: "",
  phone: "",
  line1: "",
  city: "",
  state: "",
  pincode: "",
};
export function AddressFields({
  address,
  setAddress,
}: {
  address: Address;
  setAddress: (a: Address) => void;
}) {
  const input = (
    key: keyof Address,
    label: string,
    type = "text",
    props: Record<string, unknown> = {},
  ) => (
    <label className={key === "line1" ? "field field-wide" : "field"} key={key}>
      {label}
      <input
        name={key}
        value={address[key]}
        onChange={(e) => setAddress({ ...address, [key]: e.target.value })}
        required
        type={type}
        {...props}
      />
    </label>
  );
  return (
    <div className="form-grid">
      {input("name", "Full name", "text", {
        autoComplete: "name",
        minLength: 2,
      })}
      {input("email", "Email address", "email", { autoComplete: "email" })}
      {input("phone", "Mobile number", "tel", {
        autoComplete: "tel",
        pattern: "[6-9][0-9]{9}",
        title: "Enter a 10-digit Indian mobile number",
        maxLength: 10,
      })}
      {input("pincode", "Pincode", "text", {
        autoComplete: "postal-code",
        inputMode: "numeric",
        pattern: "[0-9]{6}",
        maxLength: 6,
      })}
      {input("line1", "Address", "text", {
        autoComplete: "street-address",
        minLength: 5,
      })}
      {input("city", "City", "text", { autoComplete: "address-level2" })}
      {input("state", "State", "text", { autoComplete: "address-level1" })}
    </div>
  );
}
export function Checkout() {
  const { cart, profile, addresses, placeOrder } = useStore();
  const { customer } = useAuth();
  const identity = customer || profile;
  const savedAddress = identity
    ? addresses.find(
        (a) =>
          (a.email || "").trim().toLowerCase() ===
          identity.email.trim().toLowerCase(),
      )
    : undefined;
  const [step, setStep] = useState(0);
  const [address, setAddress] = useState<Address>(
    savedAddress || {
      ...blank,
      name: identity?.name || "",
      email: identity?.email || "",
    },
  );
  const [shipping, setShipping] = useState(0);
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  const navigate = useNavigate();
  const sum = subtotal(cart);
  if (!cart.length)
    return (
      <EmptyState
        title="Let’s find your first piece."
        description="Your bag is empty. Add a favourite before starting checkout."
      />
    );
  function submit() {
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    const order = placeOrder(address, shipping);
    navigate("/order-confirmation/" + order.id, { replace: true });
  }
  return (
    <>
      <PageIntro eyebrow="Almost yours" title="The finishing touches." />
      <section className="container commerce-grid checkout-grid">
        <div>
          {!customer && (
            <p className="checkout-account-entry">
              Already have an account?{" "}
              <Link to="/account/sign-in?next=%2Fcheckout">
                Sign in for your saved details
              </Link>
            </p>
          )}
          <div className="checkout-steps">
            {["Your details", "Delivery", "Review & confirm"].map((s, i) => (
              <button
                key={s}
                disabled={i > step}
                onClick={() => setStep(i)}
                aria-current={step === i ? "step" : undefined}
              >
                <span>{i < step ? <Check size={13} /> : i + 1}</span>
                {s}
              </button>
            ))}
          </div>
          <div className="demo-notice">
            <LockKeyhole size={18} />
            <span>
              This is a demo checkout. Use sample details; no payment is
              collected and no order is sent to Ornate.
            </span>
          </div>
          {step === 0 && (
            <form
              className="checkout-form"
              onSubmit={(e) => {
                e.preventDefault();
                setStep(1);
              }}
            >
              <h2>Where shall we send your sparkle?</h2>
              <p className="muted">
                Enter sample details to try the complete experience.
              </p>
              <AddressFields address={address} setAddress={setAddress} />
              <button className="button">
                Continue to delivery <ArrowRight size={17} />
              </button>
            </form>
          )}
          {step === 1 && (
            <div className="checkout-form">
              <h2>Beautiful things, delivered with care.</h2>
              <p className="muted">Select a sample delivery option.</p>
              <fieldset className="delivery-options">
                <legend className="sr-only">Delivery method</legend>
                {[
                  [0, "Standard delivery", "Estimated 5–7 business days"],
                  [499, "Priority delivery", "Estimated 2–3 business days"],
                ].map(([price, label, desc]) => (
                  <label
                    key={price}
                    className={shipping === price ? "selected" : ""}
                  >
                    <input
                      type="radio"
                      name="delivery"
                      checked={shipping === price}
                      onChange={() => setShipping(Number(price))}
                    />
                    <Truck size={24} strokeWidth={1} />
                    <span>
                      <strong>{label}</strong>
                      <small>{desc}</small>
                    </span>
                    <b>{price ? money(Number(price)) : "Complimentary"}</b>
                  </label>
                ))}
              </fieldset>
              <button className="button" onClick={() => setStep(2)}>
                Review your order <ArrowRight size={17} />
              </button>
            </div>
          )}
          {step === 2 && (
            <div className="checkout-form">
              <h2>One last look.</h2>
              <div className="review-address">
                <div>
                  <h3>Deliver to</h3>
                  <p>
                    {address.name}
                    <br />
                    {address.line1}
                    <br />
                    {address.city}, {address.state} {address.pincode}
                    <br />
                    {address.phone}
                    <br />
                    {address.email}
                  </p>
                </div>
                <button className="underlined" onClick={() => setStep(0)}>
                  Edit
                </button>
              </div>
              <p className="small muted">
                {shipping ? "Priority delivery" : "Standard delivery"} ·
                Simulated delivery only
              </p>
              <div className="demo-payment">
                <CheckCircle2 size={23} />
                <div>
                  <strong>Demo payment</strong>
                  <p>
                    No card, UPI, or bank details required. Confirming creates a
                    demo order on this device.
                  </p>
                </div>
              </div>
              <button className="button full" onClick={submit} disabled={busy}>
                {busy ? "Creating your demo order…" : "Confirm demo order"}
                <ArrowRight size={17} />
              </button>
            </div>
          )}
        </div>
        <aside className="order-summary">
          <h2>Your chosen pieces</h2>
          {cart.map((l) => {
            const p = products.find((p) => p.id === l.productId)!;
            return (
              <div className="checkout-product" key={l.productId + l.variant}>
                <img src={p.image} alt={p.name} />
                <div>
                  <strong>{p.name}</strong>
                  <span>
                    {l.variant} · Qty {l.quantity}
                  </span>
                  <span>{money(p.price * l.quantity)}</span>
                </div>
              </div>
            );
          })}
          <div className="summary-row">
            <span>Subtotal</span>
            <span>{money(sum)}</span>
          </div>
          <div className="summary-row">
            <span>Delivery</span>
            <span>{shipping ? money(shipping) : "Complimentary"}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <strong>{money(sum + shipping)}</strong>
          </div>
          <p className="small muted">
            Sample catalogue prices. No additional demo taxes.
          </p>
        </aside>
      </section>
    </>
  );
}
export function Confirmation() {
  const { id } = useParams();
  const { orders } = useStore();
  const order = orders.find((o) => o.id === id);
  if (!order)
    return (
      <EmptyState
        title="We couldn’t find this demo order."
        description="Demo orders are saved on the device where they were created."
        to="/account/orders"
        action="View your orders"
      />
    );
  return (
    <section className="confirmation container">
      <span className="confirmation-icon">
        <Check size={30} strokeWidth={1} />
      </span>
      <p className="eyebrow">A beautiful beginning</p>
      <h1>Excellent taste, {order.address.name.split(" ")[0]}.</h1>
      <p>
        Your demo order is ready. Imagine the joy of opening this little box of
        possibilities.
      </p>
      <div className="confirmation-card">
        <span>Demo order {order.id}</span>
        <strong>{money(order.total)}</strong>
        <span>
          {order.items.reduce((n, l) => n + l.quantity, 0)} pieces ·{" "}
          {new Date(order.date).toLocaleDateString("en-IN")}
        </span>
      </div>
      <p className="small muted">
        No payment was taken, no email was sent, and no real order was placed.
      </p>
      <div className="button-row">
        <ButtonLink to={"/account/orders/" + order.id}>
          View demo order
        </ButtonLink>
        <ButtonLink to="/shop" outline>
          Keep discovering
        </ButtonLink>
      </div>
    </section>
  );
}
export function OrderView({ order }: { order: Order }) {
  return (
    <>
      <div className="order-detail-head">
        <div>
          <p className="eyebrow">{order.id}</p>
          <h2>A beautiful choice.</h2>
          <span className="muted small">
            {new Date(order.date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
        <span className="status-chip">
          <Check size={13} />
          {order.status}
        </span>
      </div>
      <div className="tracking">
        <span className="active">
          <Check size={16} /> Demo order placed
        </span>
        <span>
          <Package size={16} /> Preparation
        </span>
        <span>
          <Truck size={16} /> Delivery
        </span>
      </div>
      <p className="small muted">
        Tracking stages are illustrative. This demo order will not be fulfilled.
      </p>
      {order.items.map((l, i) => (
        <div className="order-item" key={i}>
          <img src={l.image} alt={l.name} />
          <div>
            <h3>{l.name}</h3>
            <span className="small muted">
              {l.variant} · Qty {l.quantity}
            </span>
          </div>
          <strong>{money(l.price * l.quantity)}</strong>
        </div>
      ))}
      <div className="order-detail-bottom">
        <div>
          <h3>Delivery details</h3>
          <p>
            {order.address.name}
            <br />
            {order.address.line1}
            <br />
            {order.address.city}, {order.address.state} {order.address.pincode}
          </p>
        </div>
        <div>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>{money(order.subtotal)}</span>
          </div>
          <div className="summary-row">
            <span>Delivery</span>
            <span>{money(order.shipping)}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <strong>{money(order.total)}</strong>
          </div>
        </div>
      </div>
    </>
  );
}
