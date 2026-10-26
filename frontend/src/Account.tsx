import { useState } from "react";
import {
  Link,
  Navigate,
  NavLink,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  UserRound,
  Package,
  MapPin,
  Heart,
  ArrowUpRight,
  LogOut,
  RotateCcw,
  Plus,
  Trash2,
} from "lucide-react";
import { useStore, type Address } from "./store";
import { PageIntro, ButtonLink, EmptyState, Modal } from "./components";
import { AddressFields, OrderView } from "./Commerce";
import { money } from "./data";
import { useAuth } from "./auth";
export default function Account() {
  const {
    setProfile,
    orders: allOrders,
    wishlist,
    addresses: allAddresses,
    setAddresses,
    reset,
    notify,
  } = useStore();
  const auth = useAuth();
  const profile = auth.customer;
  const orders = allOrders.filter(
    (o) => (o.address.email || "").trim().toLowerCase() === profile?.email,
  );
  const addresses = allAddresses.filter(
    (a) => (a.email || "").trim().toLowerCase() === profile?.email,
  );
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [name, setName] = useState(profile?.name || "");
  const email = profile?.email || "";
  const [addressOpen, setAddressOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [address, setAddress] = useState<Address>({
    name: profile?.name || "",
    email: profile?.email || "",
    phone: "",
    line1: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [profileError, setProfileError] = useState("");
  if (!profile)
    return (
      <Navigate
        to={
          "/account/sign-in?next=" +
          encodeURIComponent(location.pathname + location.search)
        }
        replace
      />
    );
  const order = orders.find((o) => o.id === id);
  const section = location.pathname.includes("/orders")
    ? "orders"
    : location.pathname.includes("/addresses")
      ? "addresses"
      : "overview";
  return (
    <>
      <PageIntro
        eyebrow="Your world of Ornate"
        title={`Lovely to see you, ${profile.name.split(" ")[0]}.`}
      />
      <div className="container account-layout">
        <aside className="account-nav">
          <div className="account-avatar">
            <UserRound size={24} />
            <strong>{profile.name}</strong>
            <span>{profile.email}</span>
          </div>
          <NavLink end to="/account">
            <UserRound size={17} /> My account
          </NavLink>
          <NavLink to="/account/orders">
            <Package size={17} /> My demo orders
          </NavLink>
          <NavLink to="/account/addresses">
            <MapPin size={17} /> Saved addresses
          </NavLink>
          <Link to="/wishlist">
            <Heart size={17} /> My favourites ({wishlist.length})
          </Link>
          <button
            onClick={() => {
              auth.signOutCustomer();
              setProfile(null);
              navigate("/account/sign-in");
            }}
          >
            <LogOut size={17} /> Sign out
          </button>
          <button onClick={() => setResetOpen(true)}>
            <RotateCcw size={17} /> Reset demo data
          </button>
        </aside>
        <section className="account-content">
          {section === "overview" && (
            <>
              <h2>Make yourself at home.</h2>
              <p className="muted">
                A little space for the pieces you love and the ones you’re still
                dreaming of.
              </p>
              <div className="account-stats">
                <Link to="/account/orders">
                  <Package />
                  <strong>{orders.length}</strong>
                  <span>Demo orders</span>
                </Link>
                <Link to="/wishlist">
                  <Heart />
                  <strong>{wishlist.length}</strong>
                  <span>Saved pieces</span>
                </Link>
                <Link to="/account/addresses">
                  <MapPin />
                  <strong>{addresses.length}</strong>
                  <span>Saved addresses</span>
                </Link>
              </div>
              <form
                className="profile-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  setProfileError("");
                  try {
                    auth.updateIdentity(name, profile.email);
                    setProfile({ name: name.trim(), email: profile.email });
                    notify("Your demo profile has been updated.");
                  } catch (err) {
                    setProfileError(
                      err instanceof Error
                        ? err.message
                        : "Unable to save your details.",
                    );
                  }
                }}
              >
                <h3>Your details</h3>
                <div className="form-grid">
                  <label className="field">
                    Your name
                    <input
                      required
                      minLength={2}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </label>
                  <label className="field">
                    Email address
                    <input
                      required
                      type="email"
                      value={email}
                      readOnly
                      aria-describedby="account-email-note"
                    />
                  </label>
                </div>
                <p id="account-email-note" className="small muted">
                  Your email identifies this demo account.
                </p>
                {profileError && (
                  <p role="alert" className="form-error">
                    {profileError}
                  </p>
                )}
                <button className="button button-outline">
                  Save your details
                </button>
              </form>
            </>
          )}
          {section === "orders" &&
            (id ? (
              order ? (
                <OrderView order={order} />
              ) : (
                <EmptyState
                  title="This demo order isn’t here."
                  description="It may have been created on another browser, or the demo data was reset."
                  to="/account/orders"
                  action="View your orders"
                />
              )
            ) : (
              <>
                <h2>Your beautiful choices.</h2>
                {orders.length ? (
                  orders.map((o) => (
                    <Link
                      className="order-list-card"
                      to={"/account/orders/" + o.id}
                      key={o.id}
                    >
                      <img src={o.items[0]?.image} alt="" />
                      <div>
                        <strong>{o.id}</strong>
                        <span>
                          {new Date(o.date).toLocaleDateString("en-IN")} ·{" "}
                          {o.items.length}{" "}
                          {o.items.length === 1 ? "piece" : "pieces"}
                        </span>
                        <span className="status-chip">Demo order placed</span>
                      </div>
                      <span>{money(o.total)}</span>
                      <ArrowUpRight size={20} />
                    </Link>
                  ))
                ) : (
                  <EmptyState
                    title="Your story is just beginning."
                    description="Complete a demo checkout and your order will appear here."
                  />
                )}
              </>
            ))}
          {section === "addresses" && (
            <>
              <div className="section-heading">
                <h2>A place for your favourites.</h2>
                <button
                  className="text-link"
                  onClick={() => setAddressOpen(true)}
                >
                  Add address <Plus size={17} />
                </button>
              </div>
              {addresses.length ? (
                <div className="address-grid">
                  {addresses.map((a, i) => (
                    <div className="address-card" key={i}>
                      <MapPin size={20} />
                      <h3>{a.name}</h3>
                      <p>
                        {a.line1}
                        <br />
                        {a.city}, {a.state} {a.pincode}
                        <br />
                        {a.phone}
                      </p>
                      <button
                        className="text-link"
                        onClick={() =>
                          setAddresses(
                            allAddresses.filter((saved) => saved !== a),
                          )
                        }
                      >
                        Remove <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="muted">
                  No saved addresses yet. Add a sample address or complete the
                  demo checkout.
                </p>
              )}
            </>
          )}
        </section>
      </div>
      <Modal
        open={addressOpen}
        onClose={() => setAddressOpen(false)}
        title="Add a demo address"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setAddresses([
              ...allAddresses,
              { ...address, email: profile.email },
            ]);
            setAddressOpen(false);
            notify("Demo address saved.");
          }}
        >
          <AddressFields address={address} setAddress={setAddress} />
          <button className="button full">Save address</button>
        </form>
      </Modal>
      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="A fresh start?"
      >
        <p>
          This clears your local demo bag, wishlist, profile, addresses, and
          orders. You can build a new demo journey straight away.
        </p>
        <div className="button-row">
          <button
            className="button"
            onClick={() => {
              reset();
              auth.signOutCustomer();
              setResetOpen(false);
              navigate("/");
            }}
          >
            Reset demo
          </button>
          <button
            className="button button-outline"
            onClick={() => setResetOpen(false)}
          >
            Keep my demo
          </button>
        </div>
      </Modal>
    </>
  );
}
