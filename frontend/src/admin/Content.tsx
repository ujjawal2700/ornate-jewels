import { useState, type FormEvent, type ChangeEvent } from "react";
import { Plus, Pencil, Eye, Upload, Trash2, Tag, FileText } from "lucide-react";
import { money } from "../data";
import { useAdmin } from "./context";
import {
  uid,
  dateLabel,
  type Banner,
  type PageRecord,
  type Discount,
  type MediaRecord,
} from "./model";
import {
  Badge,
  Dialog,
  Empty,
  Field,
  FormActions,
  PageHeading,
  Panel,
  SearchField,
  TableWrap,
} from "./ui";
export function Content() {
  const { state, update } = useAdmin();
  const [tab, setTab] = useState("Banners");
  const [banner, setBanner] = useState<Banner>();
  const [page, setPage] = useState<PageRecord>();
  return (
    <>
      <PageHeading
        title="Storefront content"
        description="Give every edit, invitation and story the right words."
      />
      <div className="a-notice">
        <Eye size={17} />
        <span>
          Content previews and changes stay in the admin demo. The customer
          storefront is managed separately until backend integration.
        </span>
      </div>
      <div className="a-tabs">
        {["Banners", "Pages"].map((t) => (
          <button
            aria-pressed={tab === t}
            className={tab === t ? "is-active" : ""}
            onClick={() => setTab(t)}
            key={t}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "Banners" ? (
        <>
          <div className="a-content-actions">
            <p className="a-muted">Campaign banners and boutique invitations</p>
            <button
              className="a-button"
              onClick={() =>
                setBanner({
                  id: uid(),
                  title: "A new story begins.",
                  subtitle: "Discover your next favourite piece.",
                  image: state.media[0]?.url || "/assets/campaign.webp",
                  button: "Explore the collection",
                  link: "/shop",
                  active: false,
                })
              }
            >
              <Plus size={17} />
              Add banner
            </button>
          </div>
          <div className="a-banner-grid">
            {state.banners.map((b) => (
              <article className="a-banner-card" key={b.id}>
                <div
                  className="a-banner-preview"
                  style={{
                    backgroundImage: `linear-gradient(90deg,rgba(35,14,23,.8),rgba(35,14,23,.15)),url("${b.image}")`,
                  }}
                >
                  <div>
                    <h2>{b.title}</h2>
                    <p>{b.subtitle}</p>
                    <span>
                      {b.button}
                      <Eye size={14} />
                    </span>
                  </div>
                </div>
                <footer>
                  <Badge>{b.active ? "Enabled" : "Draft"}</Badge>
                  <button className="a-text-link" onClick={() => setBanner(b)}>
                    Edit banner
                    <Pencil size={15} />
                  </button>
                </footer>
              </article>
            ))}
          </div>
        </>
      ) : (
        <Panel
          title="Pages & policies"
          subtitle="Editable copy for the brand and the customer journey"
        >
          <TableWrap label="Content pages">
            <thead>
              <tr>
                <th>Page</th>
                <th>Status</th>
                <th>Content</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {state.pages.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span className="a-inline">
                      <FileText size={17} />
                      <strong>{p.title}</strong>
                    </span>
                  </td>
                  <td>
                    <Badge>{p.status}</Badge>
                  </td>
                  <td className="a-page-excerpt">{p.body}</td>
                  <td>
                    <button
                      className="a-button a-secondary a-small"
                      onClick={() => setPage(p)}
                    >
                      Edit page
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </Panel>
      )}
      {banner && (
        <BannerEditor item={banner} onClose={() => setBanner(undefined)} />
      )}{" "}
      {page && (
        <Dialog
          title={`Edit ${page.title}`}
          onClose={() => setPage(undefined)}
          wide
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              update(
                (s) => ({
                  ...s,
                  pages: s.pages.map((p) =>
                    p.id === page.id
                      ? {
                          ...p,
                          title: String(f.get("title")),
                          body: String(f.get("body")),
                          status: String(
                            f.get("status"),
                          ) as PageRecord["status"],
                        }
                      : p,
                  ),
                }),
                `${page.title} content saved to the demo workspace.`,
              );
              setPage(undefined);
            }}
          >
            <div className="a-dialog-body a-form-grid">
              <Field label="Page title" full>
                <input
                  name="title"
                  required
                  maxLength={100}
                  defaultValue={page.title}
                />
              </Field>
              <Field
                label="Page content"
                full
                hint="Plain text. Display formatting can be added during backend integration."
              >
                <textarea
                  name="body"
                  rows={12}
                  required
                  maxLength={10000}
                  defaultValue={page.body}
                />
              </Field>
              <Field label="Editorial status" full>
                <select name="status" defaultValue={page.status}>
                  <option>Draft</option>
                  <option>Ready</option>
                </select>
              </Field>
            </div>
            <FormActions label="Save page" onClose={() => setPage(undefined)} />
          </form>
        </Dialog>
      )}
    </>
  );
}
function BannerEditor({
  item,
  onClose,
}: {
  item: Banner;
  onClose: () => void;
}) {
  const { state, update } = useAdmin();
  const [draft, setDraft] = useState(item);
  const [error, setError] = useState("");
  function save(e: FormEvent) {
    e.preventDefault();
    if (!draft.link.startsWith("/") || draft.link.startsWith("//")) {
      setError("Use a storefront path, such as /shop or /bridal.");
      return;
    }
    update(
      (s) => ({
        ...s,
        banners: s.banners.some((b) => b.id === draft.id)
          ? s.banners.map((b) => (b.id === draft.id ? draft : b))
          : [...s.banners, draft],
      }),
      "Banner saved to the demo workspace.",
    );
    onClose();
  }
  return (
    <Dialog title="Edit campaign banner" onClose={onClose} wide>
      <form onSubmit={save}>
        <div className="a-dialog-body">
          <div
            className="a-banner-preview a-banner-live"
            style={{
              backgroundImage: `linear-gradient(90deg,rgba(35,14,23,.8),rgba(35,14,23,.15)),url("${draft.image}")`,
            }}
          >
            <div>
              <h2>{draft.title}</h2>
              <p>{draft.subtitle}</p>
              <span>{draft.button}</span>
            </div>
            <small>Live preview</small>
          </div>
          <div className="a-form-grid">
            <Field label="Headline" full>
              <input
                required
                maxLength={80}
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
            </Field>
            <Field label="Supporting copy" full>
              <textarea
                required
                rows={2}
                maxLength={200}
                value={draft.subtitle}
                onChange={(e) =>
                  setDraft({ ...draft, subtitle: e.target.value })
                }
              />
            </Field>
            <Field label="Button text">
              <input
                required
                maxLength={40}
                value={draft.button}
                onChange={(e) => setDraft({ ...draft, button: e.target.value })}
              />
            </Field>
            <Field label="Storefront path">
              <input
                required
                value={draft.link}
                onChange={(e) => setDraft({ ...draft, link: e.target.value })}
              />
            </Field>
            <Field label="Image" full>
              <select
                value={draft.image}
                onChange={(e) => setDraft({ ...draft, image: e.target.value })}
              >
                {!state.media.some((m) => m.url === draft.image) && (
                  <option value={draft.image}>Current campaign image</option>
                )}
                {state.media.map((m) => (
                  <option key={m.id} value={m.url}>
                    {m.name}
                  </option>
                ))}
              </select>
            </Field>
            <label className="a-check a-field-full">
              <input
                type="checkbox"
                checked={draft.active}
                onChange={(e) =>
                  setDraft({ ...draft, active: e.target.checked })
                }
              />
              Enable in demo content list
            </label>
            {error && (
              <p className="a-error" role="alert">
                {error}
              </p>
            )}
          </div>
        </div>
        <FormActions label="Save banner" onClose={onClose} />
      </form>
    </Dialog>
  );
}
export function Discounts() {
  const { state, update } = useAdmin();
  const [edit, setEdit] = useState<Discount | null | undefined>();
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const rows = state.discounts.filter((d) =>
    d.code.toLowerCase().includes(query.toLowerCase()),
  );
  function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const code = String(f.get("code")).trim().toUpperCase();
    const type = String(f.get("type")) as Discount["type"];
    const value = Number(f.get("value"));
    if (!/^[A-Z0-9_-]{3,30}$/.test(code)) {
      setError(
        "Use 3–30 letters, numbers, hyphens or underscores for the code.",
      );
      return;
    }
    if (state.discounts.some((d) => d.code === code && d.id !== edit?.id)) {
      setError("That discount code already exists.");
      return;
    }
    if (type === "Percentage" && value > 100) {
      setError("A percentage discount cannot exceed 100%.");
      return;
    }
    const d: Discount = {
      id: edit?.id || uid(),
      code,
      type,
      value,
      minimum: Number(f.get("minimum")),
      expiry: String(f.get("expiry")),
      active: f.get("active") === "on",
      uses: edit?.uses || 0,
    };
    update(
      (s) => ({
        ...s,
        discounts: edit
          ? s.discounts.map((x) => (x.id === d.id ? d : x))
          : [...s.discounts, d],
      }),
      `${code} discount saved in the demo.`,
    );
    setEdit(undefined);
  }
  return (
    <>
      <PageHeading
        title="Discounts"
        description="Thoughtful invitations for first visits and special occasions."
      >
        <button
          className="a-button"
          onClick={() => {
            setError("");
            setEdit(null);
          }}
        >
          <Plus size={17} />
          Create discount
        </button>
      </PageHeading>
      <div className="a-notice">
        <Tag size={17} />
        <span>
          Codes are demo records. They are not applied in the customer checkout.
        </span>
      </div>
      <Panel>
        <div className="a-toolbar">
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Search discount codes…"
          />
        </div>
        {rows.length ? (
          <TableWrap label="Discount codes">
            <thead>
              <tr>
                <th>Code</th>
                <th>Value</th>
                <th>Minimum order</th>
                <th>Expiry</th>
                <th>Status</th>
                <th>Demo uses</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr key={d.id}>
                  <td>
                    <strong className="a-code">{d.code}</strong>
                  </td>
                  <td>
                    {d.type === "Percentage" ? `${d.value}%` : money(d.value)}
                  </td>
                  <td>{money(d.minimum)}</td>
                  <td>{dateLabel(d.expiry + "T12:00:00")}</td>
                  <td>
                    <Badge>
                      {d.expiry < new Date().toLocaleDateString("en-CA")
                        ? "Expired"
                        : d.active
                          ? "Active"
                          : "Inactive"}
                    </Badge>
                  </td>
                  <td>{d.uses}</td>
                  <td>
                    <button
                      className="a-icon"
                      aria-label={`Edit ${d.code}`}
                      onClick={() => {
                        setError("");
                        setEdit(d);
                      }}
                    >
                      <Pencil size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        ) : (
          <Empty />
        )}
      </Panel>
      {edit !== undefined && (
        <Dialog
          title={edit ? "Edit discount" : "Create discount"}
          onClose={() => setEdit(undefined)}
        >
          <form onSubmit={save}>
            <div className="a-dialog-body a-form-grid">
              <Field label="Discount code" full>
                <input
                  name="code"
                  required
                  maxLength={30}
                  defaultValue={edit?.code}
                  placeholder="e.g. ORNATE10"
                />
              </Field>
              <Field label="Type">
                <select name="type" defaultValue={edit?.type || "Percentage"}>
                  <option>Percentage</option>
                  <option>Fixed amount</option>
                </select>
              </Field>
              <Field label="Value (% or ₹)">
                <input
                  name="value"
                  type="number"
                  min="1"
                  step="1"
                  required
                  defaultValue={edit?.value}
                />
              </Field>
              <Field label="Minimum order (₹)">
                <input
                  name="minimum"
                  type="number"
                  min="0"
                  step="1"
                  required
                  defaultValue={edit?.minimum ?? 0}
                />
              </Field>
              <Field label="Expiry date">
                <input
                  name="expiry"
                  type="date"
                  required
                  defaultValue={edit?.expiry}
                />
              </Field>
              <label className="a-check a-field-full">
                <input
                  name="active"
                  type="checkbox"
                  defaultChecked={edit?.active ?? true}
                />
                Active in demo workspace
              </label>
              {error && (
                <p className="a-error" role="alert">
                  {error}
                </p>
              )}
            </div>
            <FormActions
              label="Save discount"
              onClose={() => setEdit(undefined)}
            />
          </form>
        </Dialog>
      )}
    </>
  );
}
export function Media() {
  const { state, update, notify } = useAdmin();
  const [query, setQuery] = useState("");
  const [edit, setEdit] = useState<MediaRecord>();
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  async function upload(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    setError("");
    if (!files.length) return;
    if (
      files.length > 5 ||
      files.some(
        (f) =>
          !["image/jpeg", "image/png", "image/webp"].includes(f.type) ||
          f.size > 1024 * 1024,
      )
    ) {
      setError(
        "Choose up to 5 JPEG, PNG or WebP images, each no larger than 1 MB.",
      );
      return;
    }
    const total = state.media.reduce(
      (n, m) => n + (m.url.startsWith("data:") ? m.url.length : 0),
      0,
    );
    if (total + files.reduce((n, f) => n + f.size * 1.4, 0) > 3500000) {
      setError(
        "This demo image library is full. Remove an unused uploaded image before adding more.",
      );
      return;
    }
    setUploading(true);
    try {
      const media = await Promise.all(
        files.map(
          (file) =>
            new Promise<MediaRecord>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () =>
                resolve({
                  id: uid(),
                  name: file.name,
                  url: String(reader.result),
                  alt: file.name.replace(/\.[^.]+$/, "").replaceAll("-", " "),
                });
              reader.onerror = reject;
              reader.readAsDataURL(file);
            }),
        ),
      );
      update(
        (s) => ({ ...s, media: [...media, ...s.media] }),
        `${media.length} image(s) added to the local media library.`,
      );
    } catch {
      setError("The images could not be read. Try another file.");
    } finally {
      setUploading(false);
    }
  }
  const rows = state.media.filter((m) =>
    `${m.name} ${m.alt}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <PageHeading
        title="Media library"
        description="The imagery behind the Ornate experience."
      >
        <label
          className={`a-button a-upload ${uploading ? "is-disabled" : ""}`}
        >
          <Upload size={16} />
          {uploading ? "Adding images…" : "Upload images"}
          <input
            className="a-sr"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={uploading}
            onChange={upload}
          />
        </label>
      </PageHeading>
      <div className="a-media-toolbar">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Search images…"
        />
        <span className="a-muted">
          JPEG, PNG, WebP · Up to 1 MB each · Local demo storage
        </span>
      </div>
      {error && (
        <p className="a-error" role="alert">
          {error}
        </p>
      )}
      {rows.length ? (
        <div className="a-media-grid">
          {rows.map((m) => (
            <button
              className="a-media-card"
              key={m.id}
              onClick={() => {
                setError("");
                setEdit(m);
              }}
            >
              <img src={m.url} alt={m.alt} />
              <span>
                <strong>{m.name}</strong>
                <small>
                  {m.url.startsWith("data:") ? "Local upload" : "Brand library"}
                </small>
              </span>
            </button>
          ))}
        </div>
      ) : (
        <Empty title="No images found" />
      )}
      {edit && (
        <Dialog title="Image details" onClose={() => setEdit(undefined)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              update(
                (s) => ({
                  ...s,
                  media: s.media.map((m) =>
                    m.id === edit.id
                      ? {
                          ...m,
                          name: String(f.get("name")),
                          alt: String(f.get("alt")),
                        }
                      : m,
                  ),
                }),
                "Image details saved.",
              );
              setEdit(undefined);
            }}
          >
            <div className="a-dialog-body a-form-grid">
              <img
                className="a-media-detail a-field-full"
                src={edit.url}
                alt={edit.alt}
              />
              <Field label="Image name" full>
                <input name="name" required defaultValue={edit.name} />
              </Field>
              <Field
                label="Alternative text"
                full
                hint="Describe the jewellery for people using screen readers."
              >
                <textarea
                  name="alt"
                  required
                  rows={2}
                  defaultValue={edit.alt}
                />
              </Field>
              {edit.url.startsWith("data:") && (
                <button
                  type="button"
                  className="a-text-link a-danger"
                  onClick={() => {
                    const used =
                      state.products.some((p) => p.image === edit.url) ||
                      state.banners.some((b) => b.image === edit.url) ||
                      state.collections.some((c) => c.image === edit.url);
                    if (used) {
                      setError(
                        "This image is in use. Choose another image on the linked record first.",
                      );
                      return;
                    }
                    update(
                      (s) => ({
                        ...s,
                        media: s.media.filter((m) => m.id !== edit.id),
                      }),
                      "Unused uploaded image removed.",
                    );
                    setEdit(undefined);
                  }}
                >
                  <Trash2 size={16} />
                  Remove unused upload
                </button>
              )}
              {error && (
                <p className="a-error" role="alert">
                  {error}
                </p>
              )}
            </div>
            <FormActions onClose={() => setEdit(undefined)} />
          </form>
        </Dialog>
      )}
    </>
  );
}
export function Settings() {
  const { state, update, reset } = useAdmin();
  const [tab, setTab] = useState("Boutique");
  const [confirm, setConfirm] = useState(false);
  const [resetText, setResetText] = useState("");
  function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    update(
      (s) => ({
        ...s,
        settings: {
          ...s.settings,
          ...(tab === "Boutique"
            ? {
                name: String(f.get("name")).trim(),
                email: String(f.get("email")),
                phone: String(f.get("phone")),
                address: String(f.get("address")),
              }
            : tab === "Delivery"
              ? {
                  shipping: Number(f.get("shipping")),
                  freeShipping: Number(f.get("freeShipping")),
                  lowStock: Number(f.get("lowStock")),
                }
              : {
                  orderAlerts: f.get("orderAlerts") === "on",
                  stockAlerts: f.get("stockAlerts") === "on",
                }),
        },
      }),
      "Store settings saved to the demo workspace.",
    );
  }
  return (
    <>
      <PageHeading
        title="Settings"
        description="The details that keep your studio running smoothly."
      />
      <div className="a-settings-layout">
        <nav aria-label="Settings sections">
          {["Boutique", "Delivery", "Notifications", "Demo workspace"].map(
            (t) => (
              <button
                key={t}
                className={tab === t ? "is-active" : ""}
                aria-pressed={tab === t}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ),
          )}
        </nav>
        <Panel
          title={tab}
          subtitle={
            tab === "Demo workspace"
              ? "Frontend demonstration, ready for a client walkthrough"
              : "Saved locally in this admin workspace"
          }
        >
          {tab === "Demo workspace" ? (
            <div className="a-settings-body">
              <div className="a-callout">
                <Eye size={24} />
                <div>
                  <strong>Owner demo access</strong>
                  <p>
                    This is a browser-only demo session. Live staff
                    authentication and permission enforcement require a backend.
                  </p>
                </div>
              </div>
              <dl className="a-setting-facts">
                <div>
                  <dt>Data storage</dt>
                  <dd>This browser only</dd>
                </div>
                <div>
                  <dt>Currency</dt>
                  <dd>Indian rupee (INR)</dd>
                </div>
                <div>
                  <dt>Appointment timezone</dt>
                  <dd>Asia/Kolkata (IST)</dd>
                </div>
                <div>
                  <dt>Payments, emails, fulfilment</dt>
                  <dd>No external actions</dd>
                </div>
              </dl>
              <h3>Start a fresh walkthrough</h3>
              <p>
                Restore the seeded admin records. Customer bag, wishlist and
                storefront orders are kept. Storefront demo orders will reappear
                on the next admin visit.
              </p>
              <button
                className="a-button a-secondary a-danger"
                onClick={() => {
                  setResetText("");
                  setConfirm(true);
                }}
              >
                Reset admin demo
              </button>
            </div>
          ) : (
            <form key={tab} onSubmit={save}>
              <div className="a-settings-body a-form-grid">
                {tab === "Boutique" ? (
                  <>
                    <Field label="Store name" full>
                      <input
                        name="name"
                        required
                        minLength={2}
                        defaultValue={state.settings.name}
                      />
                    </Field>
                    <Field label="Contact email">
                      <input
                        name="email"
                        type="email"
                        required
                        defaultValue={state.settings.email}
                      />
                    </Field>
                    <Field label="Contact phone">
                      <input
                        name="phone"
                        type="tel"
                        required
                        pattern="[0-9+ ()-]{7,20}"
                        defaultValue={state.settings.phone}
                      />
                    </Field>
                    <Field label="Boutique address" full>
                      <textarea
                        name="address"
                        required
                        rows={3}
                        defaultValue={state.settings.address}
                      />
                    </Field>
                    <p className="a-muted a-field-full">
                      Contact values are illustrative demo settings. Confirm
                      business details before launch.
                    </p>
                  </>
                ) : tab === "Delivery" ? (
                  <>
                    <Field label="Standard delivery fee (₹)">
                      <input
                        name="shipping"
                        type="number"
                        min="0"
                        step="1"
                        required
                        defaultValue={state.settings.shipping}
                      />
                    </Field>
                    <Field label="Free delivery from (₹)">
                      <input
                        name="freeShipping"
                        type="number"
                        min="0"
                        step="1"
                        required
                        defaultValue={state.settings.freeShipping}
                      />
                    </Field>
                    <Field
                      label="Low-stock threshold"
                      hint="Used by dashboard and inventory alerts."
                    >
                      <input
                        name="lowStock"
                        type="number"
                        min="0"
                        max="1000"
                        step="1"
                        required
                        defaultValue={state.settings.lowStock}
                      />
                    </Field>
                    <p className="a-muted a-field-full">
                      Delivery settings are demo configuration and do not change
                      the customer checkout.
                    </p>
                  </>
                ) : (
                  <>
                    <label className="a-toggle-row">
                      <span>
                        <strong>Order attention items</strong>
                        <small>
                          Show unfulfilled order counts in the studio
                          notifications.
                        </small>
                      </span>
                      <input
                        role="switch"
                        name="orderAlerts"
                        type="checkbox"
                        defaultChecked={state.settings.orderAlerts}
                      />
                    </label>
                    <label className="a-toggle-row">
                      <span>
                        <strong>Low-stock attention items</strong>
                        <small>
                          Show low-stock counts in the studio notifications.
                        </small>
                      </span>
                      <input
                        role="switch"
                        name="stockAlerts"
                        type="checkbox"
                        defaultChecked={state.settings.stockAlerts}
                      />
                    </label>
                    <p className="a-muted a-field-full">
                      These control the admin notification panel. Email and SMS
                      delivery are not connected.
                    </p>
                  </>
                )}
              </div>
              <div className="a-form-actions">
                <button className="a-button" type="submit">
                  Save settings
                </button>
              </div>
            </form>
          )}
        </Panel>
      </div>
      {confirm && (
        <Dialog title="Reset the admin demo?" onClose={() => setConfirm(false)}>
          <div className="a-dialog-body">
            <p>
              This replaces your admin edits, uploaded images and activity with
              the original demo records. Customer shopping data is kept.
            </p>
            <Field label="Type RESET to confirm">
              <input
                value={resetText}
                onChange={(e) => setResetText(e.target.value)}
              />
            </Field>
            <div className="a-form-actions">
              <button
                className="a-button a-secondary"
                onClick={() => setConfirm(false)}
              >
                Keep my changes
              </button>
              <button
                className="a-button"
                disabled={resetText !== "RESET"}
                onClick={() => {
                  reset();
                  setConfirm(false);
                }}
              >
                Reset admin demo
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
}
