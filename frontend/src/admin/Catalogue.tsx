import { useSearchParams } from "react-router-dom";
import { useState, type FormEvent } from "react";
import { Plus, Download, Pencil, Archive, Package } from "lucide-react";
import { money, categories } from "../data";
import { useAdmin } from "./context";
import {
  uid,
  csvDownload,
  type ProductRecord,
  type CollectionRecord,
} from "./model";
import {
  Badge,
  Dialog,
  Empty,
  Field,
  FormActions,
  PageHeading,
  Pagination,
  Panel,
  SearchField,
  Stat,
  TableWrap,
} from "./ui";
export function Products() {
  const { state, update, notify } = useAdmin();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("search") || "");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [edit, setEdit] = useState<ProductRecord | null | undefined>();
  const [confirm, setConfirm] = useState(false);
  const filtered = state.products.filter(
    (p) =>
      (!status || p.status === status) &&
      (!category || p.category === category) &&
      `${p.name} ${p.sku} ${p.material}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const currentPage = Math.min(
    page,
    Math.max(1, Math.ceil(filtered.length / 8)),
  );
  const rows = filtered.slice((currentPage - 1) * 8, currentPage * 8);
  const select = (id: string) =>
    setSelected((old) =>
      old.includes(id) ? old.filter((x) => x !== id) : [...old, id],
    );
  function bulkArchive() {
    update(
      (s) => ({
        ...s,
        products: s.products.map((p) =>
          selected.includes(p.id) ? { ...p, status: "Archived" } : p,
        ),
      }),
      `${selected.length} products archived in the demo.`,
    );
    setSelected([]);
    setConfirm(false);
  }
  return (
    <>
      <PageHeading
        title="Products"
        description="A considered catalogue. Every piece, in one place."
      >
        <button
          className="a-button a-secondary"
          onClick={() => {
            csvDownload("ornate-products.csv", [
              [
                "SKU",
                "Product",
                "Category",
                "Material",
                "Price INR",
                "Stock",
                "Status",
              ],
              ...filtered.map((p) => [
                p.sku,
                p.name,
                p.category,
                p.material,
                p.price,
                p.stock,
                p.status,
              ]),
            ]);
            notify("Product export downloaded.");
          }}
        >
          <Download size={16} />
          Export
        </button>
        <button className="a-button" onClick={() => setEdit(null)}>
          <Plus size={17} />
          Add product
        </button>
      </PageHeading>
      <div className="a-stats a-stats-three">
        <Stat
          label="Catalogue"
          value={state.products.length}
          note="All product records"
        />
        <Stat
          label="Active pieces"
          value={state.products.filter((p) => p.status === "Active").length}
          note="Available in this demo catalogue"
        />
        <Stat
          label="Needs attention"
          value={
            state.products.filter(
              (p) =>
                p.stock <= state.settings.lowStock && p.status !== "Archived",
            ).length
          }
          note={`At or below ${state.settings.lowStock} units`}
        />
      </div>
      <Panel>
        <div className="a-toolbar">
          <SearchField
            value={query}
            onChange={(v) => {
              setQuery(v);
              setPage(1);
            }}
            placeholder="Search products or SKU…"
          />
          <div className="a-filter-controls">
            <select
              aria-label="Product status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All statuses</option>
              {["Active", "Draft", "Archived"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
            <select
              aria-label="Product category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
        {selected.length > 0 && (
          <div className="a-bulk">
            <span>{selected.length} selected</span>
            <button className="a-text-link" onClick={() => setConfirm(true)}>
              <Archive size={15} />
              Archive selected
            </button>
            <button className="a-text-link" onClick={() => setSelected([])}>
              Clear selection
            </button>
          </div>
        )}
        {filtered.length ? (
          <>
            <TableWrap label="Product catalogue">
              <thead>
                <tr>
                  <th>
                    <input
                      aria-label="Select visible products"
                      type="checkbox"
                      checked={
                        rows.length > 0 &&
                        rows.every((p) => selected.includes(p.id))
                      }
                      onChange={(e) =>
                        setSelected(
                          e.target.checked
                            ? [
                                ...new Set([
                                  ...selected,
                                  ...rows.map((p) => p.id),
                                ]),
                              ]
                            : selected.filter(
                                (id) => !rows.some((p) => p.id === id),
                              ),
                        )
                      }
                    />
                  </th>
                  <th>Product</th>
                  <th>Status</th>
                  <th>Inventory</th>
                  <th>Price</th>
                  <th>Category</th>
                  <th>
                    <span className="a-sr">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <input
                        type="checkbox"
                        aria-label={`Select ${p.name}`}
                        checked={selected.includes(p.id)}
                        onChange={() => select(p.id)}
                      />
                    </td>
                    <td>
                      <button
                        className="a-product-cell"
                        onClick={() => setEdit(p)}
                      >
                        <img src={p.image} alt="" />
                        <span>
                          <strong>{p.name}</strong>
                          <small>
                            {p.sku} · {p.material}
                          </small>
                        </span>
                      </button>
                    </td>
                    <td>
                      <Badge>{p.status}</Badge>
                    </td>
                    <td>
                      <span
                        className={
                          p.stock <= state.settings.lowStock
                            ? "a-stock-low"
                            : ""
                        }
                      >
                        {p.stock === 0 ? "Out of stock" : `${p.stock} in stock`}
                      </span>
                    </td>
                    <td className="a-numeric">{money(p.price)}</td>
                    <td>{p.category}</td>
                    <td>
                      <button
                        className="a-icon"
                        aria-label={`Edit ${p.name}`}
                        onClick={() => setEdit(p)}
                      >
                        <Pencil size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
            <Pagination
              page={currentPage}
              total={filtered.length}
              onChange={setPage}
            />
          </>
        ) : (
          <Empty>
            <button
              className="a-button a-secondary"
              onClick={() => {
                setQuery("");
                setStatus("");
                setCategory("");
              }}
            >
              Clear filters
            </button>
          </Empty>
        )}
      </Panel>
      {edit !== undefined && (
        <ProductEditor item={edit} onClose={() => setEdit(undefined)} />
      )}
      {confirm && (
        <Dialog
          title="Archive selected products?"
          onClose={() => setConfirm(false)}
        >
          <div className="a-dialog-body">
            <p>
              The {selected.length} selected records will be archived in this
              demo. You can restore each record by changing its status to
              Active.
            </p>
            <div className="a-form-actions">
              <button
                className="a-button a-secondary"
                onClick={() => setConfirm(false)}
              >
                Keep products
              </button>
              <button className="a-button" onClick={bulkArchive}>
                Archive products
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
}
function ProductEditor({
  item,
  onClose,
}: {
  item: ProductRecord | null;
  onClose: () => void;
}) {
  const { state, update } = useAdmin();
  const [error, setError] = useState("");
  const [image, setImage] = useState(
    item?.image || state.media[0]?.url || "/assets/favourite-bangle.jpg",
  );
  function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name")).trim();
    const sku = String(f.get("sku")).trim().toUpperCase();
    const variants = String(f.get("variants"))
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!name || !sku || !variants.length) {
      setError("Enter a name, SKU and at least one size or fit.");
      return;
    }
    if (state.products.some((p) => p.sku === sku && p.id !== item?.id)) {
      setError("That SKU is already used. Choose a unique SKU.");
      return;
    }
    const id = item?.id || uid();
    const p: ProductRecord = {
      id,
      slug:
        item?.slug ||
        name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + id.slice(0, 5),
      name,
      sku,
      category: String(f.get("category")),
      material: String(f.get("material")),
      collection: String(f.get("collection")),
      price: Number(f.get("price")),
      stock: Number(f.get("stock")),
      description: String(f.get("description")).trim(),
      variants: [...new Set(variants)],
      image,
      status: String(f.get("status")) as ProductRecord["status"],
      purchasable: f.get("purchasable") === "on",
      tag: String(f.get("tag")),
    };
    update(
      (s) => ({
        ...s,
        products: item
          ? s.products.map((old) => (old.id === id ? p : old))
          : [p, ...s.products],
      }),
      `${name} ${item ? "updated" : "added"} in the demo catalogue.`,
    );
    onClose();
  }
  return (
    <Dialog
      title={item ? "Edit product" : "Add a new piece"}
      onClose={onClose}
      wide
    >
      <form onSubmit={save}>
        <div className="a-dialog-body a-product-editor">
          <div className="a-editor-image">
            <img src={image} alt="Product image preview" />
            <Field label="Catalogue image">
              <select value={image} onChange={(e) => setImage(e.target.value)}>
                {!state.media.some((m) => m.url === image) && (
                  <option value={image}>Current image</option>
                )}
                {state.media.map((m) => (
                  <option key={m.id} value={m.url}>
                    {m.name}
                  </option>
                ))}
              </select>
            </Field>
            <p>Upload additional images in the media library.</p>
          </div>
          <div className="a-form-grid">
            <Field label="Product name" full>
              <input
                name="name"
                required
                maxLength={100}
                defaultValue={item?.name}
              />
            </Field>
            <Field label="SKU">
              <input
                name="sku"
                required
                maxLength={30}
                defaultValue={item?.sku}
              />
            </Field>
            <Field label="Status">
              <select name="status" defaultValue={item?.status || "Draft"}>
                {["Draft", "Active", "Archived"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
            <Field label="Price (₹)">
              <input
                name="price"
                type="number"
                required
                min="1"
                step="1"
                defaultValue={item?.price}
              />
            </Field>
            <Field label="Stock on hand">
              <input
                name="stock"
                type="number"
                required
                min="0"
                step="1"
                defaultValue={item?.stock ?? 0}
              />
            </Field>
            <Field label="Category">
              <select name="category" defaultValue={item?.category}>
                {categories.map((c) => (
                  <option key={c.name}>{c.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Material">
              <select name="material" defaultValue={item?.material}>
                {["Gold", "Diamond", "Polki", "Kundan", "Silver"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
            <Field label="Collection">
              <select name="collection" defaultValue={item?.collection || ""}>
                <option value="">No collection</option>
                {state.collections.map((c) => (
                  <option key={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Product label">
              <input name="tag" maxLength={40} defaultValue={item?.tag} />
            </Field>
            <Field
              label="Sizes / fits"
              hint="Separate options with commas."
              full
            >
              <input
                name="variants"
                required
                defaultValue={item?.variants.join(", ") || "One size"}
              />
            </Field>
            <Field label="Description" full>
              <textarea
                name="description"
                rows={4}
                required
                maxLength={2000}
                defaultValue={item?.description}
              />
            </Field>
            <label className="a-check a-field-full">
              <input
                name="purchasable"
                type="checkbox"
                defaultChecked={item?.purchasable ?? true}
              />
              Available for direct purchase
            </label>
            {error && (
              <p className="a-error" role="alert">
                {error}
              </p>
            )}
          </div>
        </div>
        <FormActions
          onClose={onClose}
          label={item ? "Save product" : "Create product"}
        />
      </form>
    </Dialog>
  );
}
export function Inventory() {
  const { state, update } = useAdmin();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("");
  const [edit, setEdit] = useState<ProductRecord>();
  const [error, setError] = useState("");
  const rows = state.products.filter(
    (p) =>
      p.status !== "Archived" &&
      `${p.name} ${p.sku}`.toLowerCase().includes(query.toLowerCase()) &&
      (!filter ||
        (filter === "out"
          ? p.stock === 0
          : p.stock > 0 && p.stock <= state.settings.lowStock)),
  );
  function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!edit) return;
    const f = new FormData(e.currentTarget);
    const quantity = Number(f.get("quantity"));
    const reason = String(f.get("reason")).trim();
    if (!Number.isInteger(quantity) || quantity < 0 || !reason) {
      setError(
        "Enter a whole quantity of zero or more and an adjustment reason.",
      );
      return;
    }
    update(
      (s) => ({
        ...s,
        products: s.products.map((p) =>
          p.id === edit.id ? { ...p, stock: quantity } : p,
        ),
      }),
      `${edit.sku} stock adjusted from ${edit.stock} to ${quantity}. ${reason}`,
    );
    setEdit(undefined);
  }
  return (
    <>
      <PageHeading
        title="Inventory"
        description="Keep every piece accounted for, from boutique to bag."
      />
      <div className="a-stats a-stats-three">
        <Stat
          label="Units on hand"
          value={state.products
            .filter((p) => p.status !== "Archived")
            .reduce((s, p) => s + p.stock, 0)}
          note="Across non-archived products"
        />
        <Stat
          label="Low stock"
          value={
            state.products.filter(
              (p) =>
                p.status !== "Archived" &&
                p.stock > 0 &&
                p.stock <= state.settings.lowStock,
            ).length
          }
          note={`Threshold: ${state.settings.lowStock} units`}
        />
        <Stat
          label="Out of stock"
          value={
            state.products.filter(
              (p) => p.status !== "Archived" && p.stock === 0,
            ).length
          }
          note="Needs replenishment"
        />
      </div>
      <Panel>
        <div className="a-toolbar">
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Search inventory…"
          />
          <select
            aria-label="Stock level"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">All stock levels</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
          </select>
        </div>
        {rows.length ? (
          <TableWrap label="Inventory">
            <thead>
              <tr>
                <th>Piece</th>
                <th>SKU</th>
                <th>On hand</th>
                <th>Stock level</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="a-product-cell">
                      <img src={p.image} alt="" />
                      <strong>{p.name}</strong>
                    </div>
                  </td>
                  <td>{p.sku}</td>
                  <td className="a-numeric">{p.stock}</td>
                  <td>
                    <Badge>
                      {p.stock === 0
                        ? "Out of stock"
                        : p.stock <= state.settings.lowStock
                          ? "Low stock"
                          : "Healthy"}
                    </Badge>
                  </td>
                  <td>
                    <button
                      className="a-button a-secondary a-small"
                      onClick={() => {
                        setError("");
                        setEdit(p);
                      }}
                    >
                      Adjust stock
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
      {edit && (
        <Dialog title="Adjust inventory" onClose={() => setEdit(undefined)}>
          <form onSubmit={save}>
            <div className="a-dialog-body a-form-grid">
              <div className="a-callout a-field-full">
                <Package size={22} />
                <div>
                  <strong>{edit.name}</strong>
                  <p>
                    {edit.sku} · Current stock: {edit.stock}
                  </p>
                </div>
              </div>
              <Field label="New stock on hand" full>
                <input
                  name="quantity"
                  type="number"
                  min="0"
                  step="1"
                  required
                  defaultValue={edit.stock}
                />
              </Field>
              <Field label="Adjustment reason" full>
                <textarea
                  name="reason"
                  required
                  rows={3}
                  placeholder="e.g. New boutique stock received"
                />
              </Field>
              {error && (
                <p className="a-error" role="alert">
                  {error}
                </p>
              )}
            </div>
            <FormActions
              label="Save stock adjustment"
              onClose={() => setEdit(undefined)}
            />
          </form>
        </Dialog>
      )}
    </>
  );
}
export function CollectionsManager() {
  const { state, update } = useAdmin();
  const [edit, setEdit] = useState<CollectionRecord | null | undefined>();
  const [error, setError] = useState("");
  function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name")).trim();
    if (
      !name ||
      state.collections.some(
        (c) => c.name.toLowerCase() === name.toLowerCase() && c.id !== edit?.id,
      )
    ) {
      setError("Choose a unique collection name.");
      return;
    }
    const c: CollectionRecord = {
      id: edit?.id || uid(),
      name,
      description: String(f.get("description")),
      image: String(f.get("image")),
      status: String(f.get("status")) as CollectionRecord["status"],
    };
    update(
      (s) => ({
        ...s,
        collections: edit
          ? s.collections.map((old) => (old.id === c.id ? c : old))
          : [...s.collections, c],
        products: edit
          ? s.products.map((p) =>
              p.collection === edit.name ? { ...p, collection: name } : p,
            )
          : s.products,
      }),
      `${c.name} collection saved.`,
    );
    setEdit(undefined);
  }
  return (
    <>
      <PageHeading
        title="Collections"
        description="Shape the edits that help customers find their story."
      >
        <button
          className="a-button"
          onClick={() => {
            setError("");
            setEdit(null);
          }}
        >
          <Plus size={17} />
          New collection
        </button>
      </PageHeading>
      <div className="a-collection-grid">
        {state.collections.map((c) => (
          <article className="a-collection" key={c.id}>
            <div className="a-collection-image">
              <img src={c.image} alt="" />
              <Badge>{c.status}</Badge>
            </div>
            <div>
              <h2>{c.name}</h2>
              <p>{c.description}</p>
              <footer>
                <span>
                  {state.products.filter((p) => p.collection === c.name).length}{" "}
                  pieces
                </span>
                <button
                  className="a-text-link"
                  onClick={() => {
                    setError("");
                    setEdit(c);
                  }}
                >
                  Edit collection
                  <Pencil size={14} />
                </button>
              </footer>
            </div>
          </article>
        ))}
      </div>
      {edit !== undefined && (
        <Dialog
          title={edit ? "Edit collection" : "New collection"}
          onClose={() => setEdit(undefined)}
        >
          <form onSubmit={save}>
            <div className="a-dialog-body a-form-grid">
              <Field label="Collection name" full>
                <input
                  name="name"
                  required
                  maxLength={70}
                  defaultValue={edit?.name}
                />
              </Field>
              <Field label="Description" full>
                <textarea
                  name="description"
                  required
                  rows={4}
                  maxLength={1000}
                  defaultValue={edit?.description}
                />
              </Field>
              <Field label="Cover image" full>
                <select name="image" defaultValue={edit?.image}>
                  {edit && !state.media.some((m) => m.url === edit.image) && (
                    <option value={edit.image}>Current cover</option>
                  )}
                  {state.media.map((m) => (
                    <option key={m.id} value={m.url}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Status" full>
                <select name="status" defaultValue={edit?.status || "Draft"}>
                  <option>Draft</option>
                  <option>Active</option>
                </select>
              </Field>
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
