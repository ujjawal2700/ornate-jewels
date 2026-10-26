import { useState, type FormEvent } from "react";
import {
  Download,
  Plus,
  ArrowUpRight,
  MapPin,
  Mail,
  Phone,
  Clock,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { money } from "../data";
import { useAdmin } from "./context";
import {
  csvDownload,
  dateLabel,
  uid,
  type AdminOrder,
  type OrderStatus,
  type Customer,
  type ConsultationRecord,
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
export const transitions: Record<OrderStatus, OrderStatus[]> = {
  Unfulfilled: ["Processing", "Cancelled"],
  Processing: ["Shipped", "Cancelled"],
  Shipped: ["Delivered"],
  Delivered: [],
  Cancelled: [],
};
export function Orders() {
  const { state, notify } = useAdmin();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState(params.get("status") || "");
  const [page, setPage] = useState(1);
  const selected = state.orders.find((o) => o.id === params.get("order"));
  const rows = state.orders
    .filter(
      (o) =>
        (!filter || o.status === filter) &&
        `${o.id} ${o.customer} ${o.email}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((a, b) => b.date.localeCompare(a.date));
  const currentPage = Math.min(page, Math.max(1, Math.ceil(rows.length / 8)));
  return (
    <>
      <PageHeading
        title="Orders"
        description="From a beautiful choice to a carefully delivered piece."
      >
        <button
          className="a-button a-secondary"
          onClick={() => {
            csvDownload("ornate-orders.csv", [
              [
                "Order",
                "Date",
                "Customer",
                "Total INR",
                "Payment",
                "Fulfilment",
              ],
              ...rows.map((o) => [
                o.id,
                o.date,
                o.customer,
                o.total,
                o.payment,
                o.status,
              ]),
            ]);
            notify("Order export downloaded.");
          }}
        >
          <Download size={16} />
          Export orders
        </button>
      </PageHeading>
      <div className="a-tabs" role="group" aria-label="Filter orders">
        {[
          "",
          "Unfulfilled",
          "Processing",
          "Shipped",
          "Delivered",
          "Cancelled",
        ].map((s) => (
          <button
            key={s}
            aria-pressed={filter === s}
            className={filter === s ? "is-active" : ""}
            onClick={() => {
              setFilter(s);
              setPage(1);
            }}
          >
            {s || "All orders"}
            <span>
              {state.orders.filter((o) => !s || o.status === s).length}
            </span>
          </button>
        ))}
      </div>
      <Panel>
        <div className="a-toolbar">
          <SearchField
            value={query}
            onChange={(v) => {
              setQuery(v);
              setPage(1);
            }}
            placeholder="Search order number or customer…"
          />
          <span className="a-muted">{rows.length} orders</span>
        </div>
        {rows.length ? (
          <>
            <TableWrap label="Orders">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Payment</th>
                  <th>Fulfilment</th>
                  <th>Total</th>
                  <th>
                    <span className="a-sr">View</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.slice((currentPage - 1) * 8, currentPage * 8).map((o) => (
                  <tr key={o.id}>
                    <td>
                      <button
                        className="a-text-link"
                        onClick={() => setParams({ order: o.id })}
                      >
                        {o.id}
                      </button>
                      <small className="a-block a-muted">
                        {o.items.reduce((s, i) => s + i.quantity, 0)} piece(s)
                      </small>
                    </td>
                    <td>
                      <strong>{o.customer}</strong>
                      <small className="a-block a-muted">{o.city}</small>
                    </td>
                    <td>{dateLabel(o.date)}</td>
                    <td>
                      <Badge>{o.payment}</Badge>
                    </td>
                    <td>
                      <Badge>{o.status}</Badge>
                    </td>
                    <td className="a-numeric">{money(o.total)}</td>
                    <td>
                      <button
                        className="a-icon"
                        aria-label={`View order ${o.id}`}
                        onClick={() => setParams({ order: o.id })}
                      >
                        <ArrowUpRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
            <Pagination
              page={currentPage}
              total={rows.length}
              onChange={setPage}
            />
          </>
        ) : (
          <Empty />
        )}
      </Panel>
      {selected && (
        <OrderDetail
          order={selected}
          onClose={() => {
            params.delete("order");
            setParams(params);
          }}
        />
      )}
      {params.get("order") && !selected && (
        <div className="a-notice">
          That order could not be found.{" "}
          <button className="a-text-link" onClick={() => setParams({})}>
            Return to orders
          </button>
        </div>
      )}
    </>
  );
}
function OrderDetail({
  order: o,
  onClose,
}: {
  order: AdminOrder;
  onClose: () => void;
}) {
  const { state, update } = useAdmin();
  const [status, setStatus] = useState(o.status);
  const [payment, setPayment] = useState(o.payment);
  const [error, setError] = useState("");
  function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const tracking = String(f.get("tracking")).trim();
    if (status !== o.status && !transitions[o.status].includes(status)) {
      setError("This fulfilment transition is not available.");
      return;
    }
    if (
      (status === "Shipped" || status === "Delivered") &&
      (!tracking || payment !== "Paid")
    ) {
      setError(
        "Record the demo payment as Paid and enter a tracking reference before shipping.",
      );
      return;
    }
    update(
      (s) => ({
        ...s,
        orders: s.orders.map((old) =>
          old.id === o.id
            ? { ...old, status, payment, tracking, note: String(f.get("note")) }
            : old,
        ),
      }),
      `${o.id} updated: ${status}, ${payment.toLowerCase()}.`,
    );
    onClose();
  }
  return (
    <Dialog title={o.id} onClose={onClose} wide>
      <form onSubmit={save}>
        <div className="a-dialog-body">
          <div className="a-order-summary">
            <div>
              <span className="a-muted">Placed {dateLabel(o.date)}</span>
              <h3>{o.customer}</h3>
            </div>
            <div>
              <Badge>{o.payment}</Badge>
              <Badge>{o.status}</Badge>
            </div>
          </div>
          <div className="a-order-layout">
            <div>
              <h3 className="a-section-title">Pieces in this order</h3>
              {o.items.map((i, n) => (
                <div className="a-order-line" key={n}>
                  <img src={i.image} alt="" />
                  <div>
                    <strong>{i.name}</strong>
                    <small>
                      {i.variant} · Qty {i.quantity}
                    </small>
                  </div>
                  <strong>{money(i.price * i.quantity)}</strong>
                </div>
              ))}
              <dl className="a-totals">
                <div>
                  <dt>Subtotal</dt>
                  <dd>{money(o.total - o.shipping)}</dd>
                </div>
                <div>
                  <dt>Delivery</dt>
                  <dd>{money(o.shipping)}</dd>
                </div>
                <div>
                  <dt>Total</dt>
                  <dd>{money(o.total)}</dd>
                </div>
              </dl>
              <div className="a-form-grid">
                <Field label="Fulfilment">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as OrderStatus)}
                  >
                    <option>{o.status}</option>
                    {transitions[o.status].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Demo payment record">
                  <select
                    value={payment}
                    onChange={(e) =>
                      setPayment(e.target.value as AdminOrder["payment"])
                    }
                  >
                    <option>Pending</option>
                    <option>Paid</option>
                  </select>
                </Field>
                <Field
                  label="Tracking reference"
                  full
                  hint="Required before marking an order Shipped."
                >
                  <input
                    name="tracking"
                    defaultValue={o.tracking}
                    maxLength={60}
                  />
                </Field>
                <Field label="Internal note" full>
                  <textarea
                    name="note"
                    rows={3}
                    defaultValue={o.note}
                    maxLength={2000}
                  />
                </Field>
              </div>
              {status === "Cancelled" && o.status !== "Cancelled" && (
                <p className="a-notice">
                  Cancelling updates this demo record only. No refund, stock
                  change or customer message is sent.
                </p>
              )}
              {error && (
                <p className="a-error" role="alert">
                  {error}
                </p>
              )}
            </div>
            <aside className="a-detail-aside">
              <h3>Customer details</h3>
              <p>
                <Mail size={15} />
                {o.email}
              </p>
              <p>
                <Phone size={15} />
                {o.phone}
              </p>
              <h3>Delivery address</h3>
              <p>
                <MapPin size={16} />
                {o.address}
              </p>
              <h3>Record activity</h3>
              <div className="a-timeline">
                <p>
                  <span />
                  Order created<small>{dateLabel(o.date)}</small>
                </p>
                {state.activity
                  .filter((a) => a.text.includes(o.id))
                  .slice(0, 5)
                  .map((a) => (
                    <p key={a.id}>
                      <span />
                      {a.text}
                      <small>{dateLabel(a.date)}</small>
                    </p>
                  ))}
              </div>
              <p className="a-muted">
                Demo records only. No payment is collected or parcel dispatched.
              </p>
            </aside>
          </div>
        </div>
        <FormActions label="Update order" onClose={onClose} />
      </form>
    </Dialog>
  );
}
export function Customers() {
  const { state, update, notify } = useAdmin();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("search") || "");
  const [segment, setSegment] = useState("");
  const [page, setPage] = useState(1);
  const [edit, setEdit] = useState<Customer | null | undefined>();
  const [error, setError] = useState("");
  const imported = state.orders
    .filter((o) => !state.customers.some((c) => c.email === o.email))
    .filter((o, i, all) => all.findIndex((x) => x.email === o.email) === i)
    .map((o) => ({
      id: o.email,
      name: o.customer,
      email: o.email,
      phone: o.phone,
      city: o.city,
      note: "Imported from a customer demo order.",
      segment: "New" as const,
    }));
  const customers = [...state.customers, ...imported];
  const rows = customers.filter(
    (c) =>
      (!segment || c.segment === segment) &&
      `${c.name} ${c.email} ${c.city}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const currentPage = Math.min(page, Math.max(1, Math.ceil(rows.length / 8)));
  function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email")).trim().toLowerCase();
    if (
      customers.some(
        (c) => c.email.toLowerCase() === email && c.id !== edit?.id,
      )
    ) {
      setError("A customer with this email already exists.");
      return;
    }
    const c: Customer = {
      id: edit?.id || uid(),
      name: String(f.get("name")).trim(),
      email,
      phone: String(f.get("phone")),
      city: String(f.get("city")),
      note: String(f.get("note")),
      segment: String(f.get("segment")) as Customer["segment"],
    };
    update(
      (s) => ({
        ...s,
        customers: s.customers.some((x) => x.id === c.id)
          ? s.customers.map((old) => (old.id === c.id ? c : old))
          : [...s.customers, c],
      }),
      `${c.name} customer profile saved.`,
    );
    setEdit(undefined);
  }
  return (
    <>
      <PageHeading
        title="Customers"
        description="Remember the person behind every piece."
      >
        <button
          className="a-button a-secondary"
          onClick={() => {
            csvDownload("ornate-customers.csv", [
              ["Name", "Email", "Phone", "City", "Segment"],
              ...rows.map((c) => [c.name, c.email, c.phone, c.city, c.segment]),
            ]);
            notify("Customer export downloaded.");
          }}
        >
          <Download size={16} />
          Export
        </button>
        <button
          className="a-button"
          onClick={() => {
            setError("");
            setEdit(null);
          }}
        >
          <Plus size={17} />
          Add customer
        </button>
      </PageHeading>
      <div className="a-stats a-stats-three">
        <Stat
          label="Client book"
          value={customers.length}
          note="Demo customer profiles"
        />
        <Stat
          label="Returning clients"
          value={customers.filter((c) => c.segment !== "New").length}
          note="Returning and VIP profiles"
        />
        <Stat
          label="VIP clients"
          value={customers.filter((c) => c.segment === "VIP").length}
          note="Personal curation relationships"
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
            placeholder="Search name, email or city…"
          />
          <select
            value={segment}
            aria-label="Customer segment"
            onChange={(e) => {
              setSegment(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All customers</option>
            {["New", "Returning", "VIP"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </div>
        {rows.length ? (
          <>
            <TableWrap label="Customers">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Location</th>
                  <th>Segment</th>
                  <th>Orders</th>
                  <th>Paid order value</th>
                  <th>
                    <span className="a-sr">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.slice((currentPage - 1) * 8, currentPage * 8).map((c) => {
                  const orders = state.orders.filter(
                    (o) => o.email === c.email && o.status !== "Cancelled",
                  );
                  return (
                    <tr key={c.id}>
                      <td>
                        <button
                          className="a-customer-cell"
                          onClick={() => {
                            setError("");
                            setEdit(c);
                          }}
                        >
                          <span className="a-avatar">
                            {c.name
                              .split(" ")
                              .map((s) => s[0])
                              .slice(0, 2)
                              .join("")}
                          </span>
                          <span>
                            <strong>{c.name}</strong>
                            <small>{c.email}</small>
                          </span>
                        </button>
                      </td>
                      <td>{c.city}</td>
                      <td>
                        <Badge>{c.segment}</Badge>
                      </td>
                      <td>{orders.length}</td>
                      <td className="a-numeric">
                        {money(
                          orders
                            .filter((o) => o.payment === "Paid")
                            .reduce((s, o) => s + o.total, 0),
                        )}
                      </td>
                      <td>
                        <button
                          className="a-icon"
                          aria-label={`View customer ${c.name}`}
                          onClick={() => {
                            setError("");
                            setEdit(c);
                          }}
                        >
                          <ArrowUpRight size={17} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </TableWrap>
            <Pagination
              page={currentPage}
              total={rows.length}
              onChange={setPage}
            />
          </>
        ) : (
          <Empty />
        )}
      </Panel>
      {edit !== undefined && (
        <Dialog
          title={edit ? "Customer profile" : "Add customer"}
          onClose={() => setEdit(undefined)}
        >
          <form onSubmit={save}>
            <div className="a-dialog-body a-form-grid">
              <Field label="Full name" full>
                <input
                  name="name"
                  required
                  minLength={2}
                  maxLength={100}
                  defaultValue={edit?.name}
                />
              </Field>
              <Field label="Email" full>
                <input
                  name="email"
                  type="email"
                  required
                  defaultValue={edit?.email}
                />
              </Field>
              <Field label="Phone">
                <input
                  name="phone"
                  type="tel"
                  pattern="[0-9+ ()-]{7,20}"
                  required
                  defaultValue={edit?.phone}
                />
              </Field>
              <Field label="City">
                <input name="city" required defaultValue={edit?.city} />
              </Field>
              <Field label="Client segment" full>
                <select name="segment" defaultValue={edit?.segment || "New"}>
                  {["New", "Returning", "VIP"].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </Field>
              <Field label="Client notes" full>
                <textarea
                  name="note"
                  rows={3}
                  maxLength={2000}
                  defaultValue={edit?.note}
                />
              </Field>
              {edit && (
                <div className="a-field-full">
                  <h3 className="a-section-title">Order history</h3>
                  {state.orders.filter((o) => o.email === edit.email).length ? (
                    state.orders
                      .filter((o) => o.email === edit.email)
                      .map((o) => (
                        <Link
                          onClick={() => setEdit(undefined)}
                          className="a-history-row"
                          key={o.id}
                          to={`/admin/orders?order=${o.id}`}
                        >
                          <span>
                            {o.id}
                            <small>{dateLabel(o.date)}</small>
                          </span>
                          <strong>{money(o.total)}</strong>
                          <ArrowUpRight size={15} />
                        </Link>
                      ))
                  ) : (
                    <p className="a-muted">No orders yet.</p>
                  )}
                </div>
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
export function Consultations() {
  const { state, update } = useAdmin();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("");
  const [edit, setEdit] = useState<ConsultationRecord | null | undefined>();
  const rows = state.consultations.filter(
    (c) =>
      (!filter || c.status === filter) &&
      `${c.name} ${c.interest}`.toLowerCase().includes(query.toLowerCase()),
  );
  function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const c: ConsultationRecord = {
      id: edit?.id || uid(),
      name: String(f.get("name")),
      email: String(f.get("email")),
      phone: String(f.get("phone")),
      interest: String(f.get("interest")),
      date: String(f.get("date")),
      status: String(f.get("status")) as ConsultationRecord["status"],
      note: String(f.get("note")),
    };
    update(
      (s) => ({
        ...s,
        consultations: edit
          ? s.consultations.map((x) => (x.id === c.id ? c : x))
          : [...s.consultations, c],
      }),
      `${c.name} consultation saved as ${c.status.toLowerCase()}.`,
    );
    setEdit(undefined);
  }
  return (
    <>
      <PageHeading
        title="Consultations"
        description="Make room for personal conversations and extraordinary occasions."
      >
        <button className="a-button" onClick={() => setEdit(null)}>
          <Plus size={17} />
          Add appointment
        </button>
      </PageHeading>
      <div className="a-notice">
        <Clock size={17} />
        <span>
          Appointment changes are saved in this demo only. No invitations or
          reminders are sent.
        </span>
      </div>
      <Panel>
        <div className="a-toolbar">
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Search client or interest…"
          />
          <select
            value={filter}
            aria-label="Consultation status"
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">All appointments</option>
            {["New", "Confirmed", "Completed", "Cancelled"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </div>
        {rows.length ? (
          <TableWrap label="Consultations">
            <thead>
              <tr>
                <th>Client</th>
                <th>Interest</th>
                <th>Preferred appointment (IST)</th>
                <th>Status</th>
                <th>
                  <span className="a-sr">Manage</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.name}</strong>
                    <small className="a-block a-muted">{c.email}</small>
                  </td>
                  <td>{c.interest}</td>
                  <td>
                    {c.date
                      ? new Intl.DateTimeFormat("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "numeric",
                          minute: "2-digit",
                          timeZone: "Asia/Kolkata",
                        }).format(new Date(c.date + "+05:30"))
                      : "Not scheduled"}
                  </td>
                  <td>
                    <Badge>{c.status}</Badge>
                  </td>
                  <td>
                    <button
                      className="a-button a-secondary a-small"
                      onClick={() => setEdit(c)}
                    >
                      Manage
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
          title={edit ? "Manage consultation" : "Add appointment"}
          onClose={() => setEdit(undefined)}
        >
          <form onSubmit={save}>
            <div className="a-dialog-body a-form-grid">
              <Field label="Client name" full>
                <input
                  name="name"
                  required
                  minLength={2}
                  defaultValue={edit?.name}
                />
              </Field>
              <Field label="Email">
                <input
                  name="email"
                  type="email"
                  required
                  defaultValue={edit?.email}
                />
              </Field>
              <Field label="Phone">
                <input
                  name="phone"
                  type="tel"
                  pattern="[0-9+ ()-]{7,20}"
                  required
                  defaultValue={edit?.phone}
                />
              </Field>
              <Field label="Interest / occasion" full>
                <input name="interest" required defaultValue={edit?.interest} />
              </Field>
              <Field label="Appointment (IST)">
                <input
                  name="date"
                  type="datetime-local"
                  required
                  defaultValue={edit?.date}
                />
              </Field>
              <Field label="Status">
                <select name="status" defaultValue={edit?.status || "New"}>
                  {["New", "Confirmed", "Completed", "Cancelled"].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </Field>
              <Field label="Notes" full>
                <textarea
                  name="note"
                  rows={4}
                  maxLength={2000}
                  defaultValue={edit?.note}
                />
              </Field>
            </div>
            <FormActions
              label="Save appointment"
              onClose={() => setEdit(undefined)}
            />
          </form>
        </Dialog>
      )}
    </>
  );
}
