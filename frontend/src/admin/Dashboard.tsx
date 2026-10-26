import { LogoSymbol } from "../Logo";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Download,
  Package,
  Clock,
  CalendarDays,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { money } from "../data";
import { useAdmin } from "./context";
import { csvDownload, dateLabel, demoDate, type AdminOrder } from "./model";
import {
  Badge,
  Empty,
  PageHeading,
  Panel,
  Stat,
  TableWrap,
  ViewLink,
} from "./ui";
export function periodOrders(orders: AdminOrder[], days: number) {
  const end = new Date("2026-10-25T23:59:59.999+05:30");
  const start = new Date(end.getTime() - days * 86400000 + 1);
  return orders.filter(
    (o) => new Date(o.date) >= start && new Date(o.date) <= end,
  );
}
function SalesChart({ orders, days }: { orders: AdminOrder[]; days: number }) {
  const [table, setTable] = useState(false);
  const points = Array.from({ length: days }, (_, i) => {
    const date = new Date(demoDate);
    date.setDate(date.getDate() - days + 1 + i);
    const key = date.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    const value = orders
      .filter(
        (o) =>
          new Date(o.date).toLocaleDateString("en-CA", {
            timeZone: "Asia/Kolkata",
          }) === key,
      )
      .reduce((s, o) => s + o.total, 0);
    return { date: date.toISOString(), value };
  });
  const max = Math.max(100000, ...points.map((p) => p.value));
  const y = (v: number) => 180 - (v / max) * 145;
  const path = points
    .map(
      (p, i) =>
        `${i ? "L" : "M"}${48 + (i / (points.length - 1)) * 780},${y(p.value)}`,
    )
    .join(" ");
  return (
    <>
      <div className="a-chart-meta">
        <div>
          <strong>{money(orders.reduce((s, o) => s + o.total, 0))}</strong>
          <span>
            <i />
            Paid order value
          </span>
        </div>
        <button
          className="a-text-link"
          onClick={() => setTable(!table)}
          aria-expanded={table}
        >
          {table ? "Hide data" : "View data"}
        </button>
      </div>
      <div className="a-chart">
        <svg
          viewBox="0 0 860 225"
          role="img"
          aria-label={`Daily paid order value for ${days} days ending 25 October 2026`}
        >
          <desc>
            Values come from paid, non-cancelled demo orders. Use View data for
            exact daily amounts.
          </desc>
          {[0, 0.5, 1].map((n) => (
            <g key={n}>
              <line
                x1="48"
                x2="828"
                y1={y(max * n)}
                y2={y(max * n)}
                stroke="#e9e9ed"
                strokeDasharray="4 5"
              />
              <text x="0" y={y(max * n) + 4} fill="#767681" fontSize="10">
                {n === 0 ? "₹0" : `₹${Math.round((max * n) / 1000)}k`}
              </text>
            </g>
          ))}
          <path d={`${path} L828,180 L48,180 Z`} fill="#f1e7eb" />
          <path
            d={path}
            fill="none"
            stroke="#6d3549"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {points.map((p, i) =>
            days <= 7 ? (
              <circle
                key={i}
                cx={48 + (i / (points.length - 1)) * 780}
                cy={y(p.value)}
                r="4"
                fill="#6d3549"
                stroke="white"
                strokeWidth="2"
              />
            ) : null,
          )}
          {[0, Math.floor((days - 1) / 2), days - 1].map((i) => (
            <text
              key={i}
              x={48 + (i / (days - 1)) * 780}
              y="210"
              textAnchor={i === 0 ? "start" : i === days - 1 ? "end" : "middle"}
              fill="#767681"
              fontSize="11"
            >
              {dateLabel(points[i].date).replace(" 2026", "")}
            </text>
          ))}
        </svg>
      </div>
      {table && (
        <TableWrap label="Daily order value">
          <thead>
            <tr>
              <th>Date</th>
              <th>Paid order value</th>
            </tr>
          </thead>
          <tbody>
            {points.map((p) => (
              <tr key={p.date}>
                <td>{dateLabel(p.date)}</td>
                <td>{money(p.value)}</td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}
    </>
  );
}
export function Dashboard({ analytics = false }: { analytics?: boolean }) {
  const { state, notify } = useAdmin();
  const [days, setDays] = useState(30);
  const orders = periodOrders(state.orders, days);
  const paid = orders.filter(
    (o) => o.payment === "Paid" && o.status !== "Cancelled",
  );
  const revenue = paid.reduce((s, o) => s + o.total, 0);
  const activeOrders = orders.filter((o) => o.status !== "Cancelled");
  const pending = state.orders.filter(
    (o) => o.status === "Unfulfilled" || o.status === "Processing",
  );
  const low = state.products.filter(
    (p) => p.status !== "Archived" && p.stock <= state.settings.lowStock,
  );
  const top = state.products
    .map((p) => {
      const items = paid
        .flatMap((o) => o.items)
        .filter((i) => i.productId === p.id);
      return {
        ...p,
        sales: items.reduce((s, i) => s + i.price * i.quantity, 0),
        units: items.reduce((s, i) => s + i.quantity, 0),
      };
    })
    .filter((p) => p.units > 0)
    .sort((a, b) => b.sales - a.sales);
  const cities = [...new Set(paid.map((o) => o.city))]
    .map((city) => ({
      city,
      total: paid
        .filter((o) => o.city === city)
        .reduce((s, o) => s + o.total, 0),
    }))
    .sort((a, b) => b.total - a.total);
  return (
    <>
      <PageHeading
        title={analytics ? "Analytics" : "Your boutique, at a glance."}
        description={
          analytics
            ? "A clear view of the pieces and places behind your sales."
            : "A little clarity before the day begins. Welcome to Ornate Studio."
        }
      >
        <select
          aria-label="Reporting period"
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
        {analytics && (
          <button
            className="a-button a-secondary"
            onClick={() => {
              csvDownload("ornate-sales-report.csv", [
                [
                  "Period ending",
                  "Days",
                  "Paid order value INR",
                  "Non-cancelled orders",
                  "Paid orders",
                ],
                ["2026-10-25", days, revenue, activeOrders.length, paid.length],
              ]);
              notify("Sales report downloaded.");
            }}
          >
            <Download size={16} />
            Export report
          </button>
        )}
      </PageHeading>
      <div className="a-date-context">
        <CalendarDays size={15} />
        Demo reporting period ends 25 October 2026<span>INR · India</span>
      </div>
      <div className="a-stats">
        <Stat
          label="Paid order value"
          value={money(revenue)}
          note={`${paid.length} paid, non-cancelled orders`}
        />
        <Stat
          label="Orders"
          value={activeOrders.length}
          note={`${orders.filter((o) => o.status === "Cancelled").length} cancelled orders excluded`}
        />
        <Stat
          label="Average paid order"
          value={money(paid.length ? revenue / paid.length : 0)}
          note="Paid order value ÷ paid orders"
        />
        <Stat
          label={analytics ? "Units sold" : "To fulfil"}
          value={
            analytics
              ? paid.reduce(
                  (s, o) => s + o.items.reduce((n, i) => n + i.quantity, 0),
                  0,
                )
              : pending.length
          }
          note={
            analytics
              ? "Pieces in paid, non-cancelled orders"
              : "Unfulfilled and processing, all dates"
          }
        />
      </div>
      <div className="a-dashboard-grid">
        <Panel
          title="The sales picture"
          subtitle={`Daily paid order value · last ${days} days`}
          action={<span className="a-dot-label">Demo records</span>}
        >
          <SalesChart orders={paid} days={days} />
        </Panel>
        {analytics ? (
          <Panel
            title="Where your clients are"
            subtitle="Paid order value by city"
          >
            <div className="a-city-list">
              {cities.length ? (
                cities.map((c, i) => (
                  <div key={c.city}>
                    <div>
                      <span>{c.city}</span>
                      <strong>{money(c.total)}</strong>
                    </div>
                    <div className="a-meter">
                      <i
                        style={{
                          width: `${revenue ? (c.total / revenue) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <small>
                      {Math.round((c.total / revenue) * 100)}% of paid order
                      value
                    </small>
                  </div>
                ))
              ) : (
                <Empty
                  title="No paid orders"
                  description="This period has no paid order data."
                />
              )}
            </div>
          </Panel>
        ) : (
          <Panel
            title="A few things need you"
            subtitle="Your next best steps"
            className="a-priorities"
          >
            <Link to="/admin/orders?status=Unfulfilled">
              <span className="a-priority-icon">
                <Package size={20} />
              </span>
              <span>
                <strong>
                  {
                    state.orders.filter((o) => o.status === "Unfulfilled")
                      .length
                  }{" "}
                  orders awaiting care
                </strong>
                <small>Review and begin fulfilment</small>
              </span>
              <ChevronRight size={17} />
            </Link>
            <Link to="/admin/inventory">
              <span className="a-priority-icon a-brass">
                <Clock size={20} />
              </span>
              <span>
                <strong>{low.length} pieces running low</strong>
                <small>Review boutique stock levels</small>
              </span>
              <ChevronRight size={17} />
            </Link>
            <Link to="/admin/consultations">
              <span className="a-priority-icon a-sage">
                <CalendarDays size={20} />
              </span>
              <span>
                <strong>
                  {state.consultations.filter((c) => c.status === "New").length}{" "}
                  new consultation requests
                </strong>
                <small>Make time for a personal conversation</small>
              </span>
              <ChevronRight size={17} />
            </Link>
            <div className="a-studio-note">
              <LogoSymbol className="a-studio-monogram" />
              <p>Beautiful experiences begin with the little details.</p>
              <span>Ornate Studio</span>
            </div>
          </Panel>
        )}
      </div>
      <div className="a-dashboard-grid a-dashboard-lower">
        <Panel
          title={analytics ? "Product performance" : "Recent orders"}
          subtitle={
            analytics
              ? "Ranked by paid order value"
              : "The latest choices from your customers"
          }
          action={
            <ViewLink to={analytics ? "/admin/products" : "/admin/orders"}>
              View all
            </ViewLink>
          }
        >
          {analytics ? (
            <TableWrap label="Product performance">
              <thead>
                <tr>
                  <th>Piece</th>
                  <th>Units</th>
                  <th>Paid order value</th>
                </tr>
              </thead>
              <tbody>
                {top.slice(0, 6).map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="a-product-cell">
                        <img src={p.image} alt="" />
                        <strong>{p.name}</strong>
                      </div>
                    </td>
                    <td>{p.units}</td>
                    <td>{money(p.sales)}</td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          ) : (
            <TableWrap label="Recent orders">
              <thead>
                <tr>
                  <th>Order / client</th>
                  <th>Fulfilment</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {[...state.orders]
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .slice(0, 5)
                  .map((o) => (
                    <tr key={o.id}>
                      <td>
                        <Link
                          className="a-text-link"
                          to={`/admin/orders?order=${o.id}`}
                        >
                          {o.id}
                        </Link>
                        <small className="a-block a-muted">{o.customer}</small>
                      </td>
                      <td>
                        <Badge>{o.status}</Badge>
                      </td>
                      <td className="a-numeric">{money(o.total)}</td>
                    </tr>
                  ))}
              </tbody>
            </TableWrap>
          )}
        </Panel>
        <Panel
          title={
            analytics ? "How this report is calculated" : "The pieces they love"
          }
          subtitle={
            analytics
              ? "Transparent demo reporting"
              : "Top pieces by paid order value"
          }
        >
          {analytics ? (
            <div className="a-report-notes">
              <TrendingUp size={25} />
              <p>
                Paid order value includes delivery charges and excludes pending
                payments and cancelled orders.
              </p>
              <p>
                These are seeded demo orders plus customer demo orders created
                in this browser. Returns, taxes, acquisition channels and
                conversion rates are not tracked.
              </p>
              <p>
                Financial reporting and live store analytics will require
                backend integrations.
              </p>
            </div>
          ) : (
            <div className="a-top-products">
              {top.slice(0, 4).map((p, i) => (
                <Link key={p.id} to="/admin/products">
                  <span className="a-rank">{i + 1}</span>
                  <img src={p.image} alt="" />
                  <div>
                    <strong>{p.name}</strong>
                    <small>{p.units} pieces sold</small>
                  </div>
                  <span>{money(p.sales)}</span>
                </Link>
              ))}
            </div>
          )}
        </Panel>
      </div>
      {!analytics && (
        <Panel
          title="Studio activity"
          subtitle="Recent changes in this browser"
        >
          <div className="a-activity">
            {state.activity.slice(0, 4).map((a) => (
              <div key={a.id}>
                <span className="a-activity-dot" />
                <p>{a.text}</p>
                <time dateTime={a.date}>{dateLabel(a.date)}</time>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </>
  );
}
