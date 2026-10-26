import { describe, it, expect } from "vitest";
import {
  render,
  screen,
  within,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { StoreProvider } from "../store";
import Admin from "./Admin";
import { AuthProvider, ADMIN_SESSION_KEY } from "../auth";
import {
  ADMIN_KEY,
  seedAdmin,
  loadAdmin,
  isAdminState,
  type AdminState,
} from "./model";
import { periodOrders } from "./Dashboard";
function app(path = "/admin") {
  sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
  return render(
    <MemoryRouter initialEntries={[path]}>
      <StoreProvider>
        <AuthProvider>
          <Routes>
            <Route path="/admin/*" element={<Admin />} />
          </Routes>
        </AuthProvider>
      </StoreProvider>
    </MemoryRouter>,
  );
}
const saved = (): AdminState => JSON.parse(localStorage.getItem(ADMIN_KEY)!);
describe("Ornate Studio management flows", () => {
  it("creates a product, rejects a duplicate SKU and persists a valid record", async () => {
    const user = userEvent.setup();
    const view = app("/admin/products");
    await user.click(screen.getByRole("button", { name: "Add product" }));
    let dialog = within(screen.getByRole("dialog"));
    await user.type(dialog.getByLabelText("Product name"), "Chand Gold Ring");
    await user.type(dialog.getByLabelText("SKU"), "ORN-001");
    await user.type(dialog.getByLabelText("Price (₹)"), "15000");
    await user.type(
      dialog.getByLabelText("Description"),
      "A delicate gold ring.",
    );
    await user.click(dialog.getByRole("button", { name: "Create product" }));
    expect(dialog.getByRole("alert").textContent).toContain(
      "SKU is already used",
    );
    await user.clear(dialog.getByLabelText("SKU"));
    await user.type(dialog.getByLabelText("SKU"), "ORN-RING");
    await user.click(dialog.getByRole("button", { name: "Create product" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(saved().products[0].name).toBe("Chand Gold Ring");
    expect(saved().products[0].status).toBe("Draft");
    view.unmount();
    app("/admin/products?search=ORN-RING");
    expect(screen.getByText("Chand Gold Ring")).toBeTruthy();
  });
  it("archives a selected product and keeps it available through the Archived filter", async () => {
    const user = userEvent.setup();
    app("/admin/products");
    await user.click(screen.getByLabelText("Select The Emerald Muse"));
    await user.click(screen.getByRole("button", { name: "Archive selected" }));
    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Archive products",
      }),
    );
    await user.selectOptions(
      screen.getByLabelText("Product status"),
      "Archived",
    );
    expect(screen.getByText("The Emerald Muse")).toBeTruthy();
    expect(saved().products.find((p) => p.id === "emerald-muse")?.status).toBe(
      "Archived",
    );
  });
  it("returns to a valid page when archiving the last page of filtered products", async () => {
    const user = userEvent.setup();
    app("/admin/products");
    await user.selectOptions(screen.getByLabelText("Product status"), "Active");
    await user.click(screen.getByRole("button", { name: "Next page" }));
    await user.click(screen.getByLabelText("Select visible products"));
    await user.click(screen.getByRole("button", { name: "Archive selected" }));
    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Archive products",
      }),
    );
    expect(screen.getByText("1–8 of 8 records")).toBeTruthy();
    expect(
      (
        screen.getByRole("button", {
          name: "Previous page",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
  });
  it("adjusts stock with a reason and records the change", async () => {
    const user = userEvent.setup();
    app("/admin/inventory");
    await user.type(
      screen.getByRole("searchbox", { name: "Search inventory…" }),
      "ORN-003",
    );
    await user.click(screen.getByRole("button", { name: "Adjust stock" }));
    const d = within(screen.getByRole("dialog"));
    await user.clear(d.getByLabelText("New stock on hand"));
    await user.type(d.getByLabelText("New stock on hand"), "11");
    await user.type(
      d.getByLabelText("Adjustment reason"),
      "Boutique replenishment",
    );
    await user.click(d.getByRole("button", { name: "Save stock adjustment" }));
    expect(saved().products.find((p) => p.sku === "ORN-003")?.stock).toBe(11);
    expect(saved().activity[0].text).toContain("Boutique replenishment");
  });
  it("requires payment and tracking before shipping and saves a valid transition", async () => {
    const user = userEvent.setup();
    app("/admin/orders?order=ORN-1044");
    const d = within(screen.getByRole("dialog"));
    await user.selectOptions(d.getByLabelText("Fulfilment"), "Shipped");
    await user.click(d.getByRole("button", { name: "Update order" }));
    expect(d.getByRole("alert").textContent).toContain("tracking reference");
    await user.selectOptions(d.getByLabelText("Demo payment record"), "Paid");
    await user.type(d.getByLabelText("Tracking reference"), "DEMO-TRACK-44");
    await user.click(d.getByRole("button", { name: "Update order" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(saved().orders.find((o) => o.id === "ORN-1044")).toMatchObject({
      status: "Shipped",
      payment: "Paid",
      tracking: "DEMO-TRACK-44",
    });
  });
  it("keeps product collection membership when a collection is renamed", async () => {
    const user = userEvent.setup();
    app("/admin/collections");
    await user.click(
      screen.getAllByRole("button", { name: "Edit collection" })[0],
    );
    const d = within(screen.getByRole("dialog"));
    await user.clear(d.getByLabelText("Collection name"));
    await user.type(d.getByLabelText("Collection name"), "The Heirloom Edit");
    await user.click(d.getByRole("button", { name: "Save changes" }));
    expect(
      saved().products.find((p) => p.id === "gulabi-drops")?.collection,
    ).toBe("The Heirloom Edit");
  });
  it("finds a product from studio-wide search and closes dialogs with Escape", async () => {
    const user = userEvent.setup();
    app();
    await user.click(
      screen.getByRole("button", { name: /Search your studio/ }),
    );
    const d = within(screen.getByRole("dialog"));
    await user.type(d.getByRole("searchbox"), "ORN-003");
    await user.click(d.getByRole("button", { name: /Sunehri Heritage Kada/ }));
    expect(
      screen.getByRole("heading", { name: "Products", level: 1 }),
    ).toBeTruthy();
    expect(screen.getByText("Sunehri Heritage Kada")).toBeTruthy();
    expect(screen.queryByText("The Emerald Muse")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Add product" }));
    fireEvent(
      screen.getByRole("dialog"),
      new Event("cancel", { cancelable: true }),
    );
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.body.style.overflow).toBe("");
  });
  it("previews and saves banner copy without changing customer campaign data", async () => {
    const user = userEvent.setup();
    app("/admin/content");
    await user.click(screen.getAllByRole("button", { name: "Edit banner" })[0]);
    const d = within(screen.getByRole("dialog"));
    await user.clear(d.getByLabelText("Headline"));
    await user.type(d.getByLabelText("Headline"), "Your next heirloom.");
    expect(
      d.getByRole("heading", { name: "Your next heirloom." }),
    ).toBeTruthy();
    await user.click(d.getByRole("button", { name: "Save banner" }));
    expect(saved().banners[0].title).toBe("Your next heirloom.");
  });
  it("rejects an excessive percentage discount then saves a valid code", async () => {
    const user = userEvent.setup();
    app("/admin/discounts");
    await user.click(screen.getByRole("button", { name: "Create discount" }));
    const d = within(screen.getByRole("dialog"));
    await user.type(d.getByLabelText("Discount code"), "ORNATE10");
    await user.type(d.getByLabelText("Value (% or ₹)"), "110");
    fireEvent.change(d.getByLabelText("Expiry date"), {
      target: { value: "2026-12-31" },
    });
    await user.click(d.getByRole("button", { name: "Save discount" }));
    expect(d.getByRole("alert").textContent).toContain("100%");
    await user.clear(d.getByLabelText("Value (% or ₹)"));
    await user.type(d.getByLabelText("Value (% or ₹)"), "10");
    await user.click(d.getByRole("button", { name: "Save discount" }));
    expect(saved().discounts.find((d) => d.code === "ORNATE10")?.value).toBe(
      10,
    );
  });
  it("imports a customer consultation once and retains admin changes on revisit", async () => {
    localStorage.setItem(
      "ornate:consultations",
      JSON.stringify([
        {
          id: "CONS-DEMO",
          name: "Demo Guest",
          email: "guest@example.com",
          phone: "9000000000",
          occasion: "Wedding",
          date: "2026-11-12",
          message: "Bridal appointment",
        },
      ]),
    );
    const user = userEvent.setup();
    const view = app("/admin/consultations");
    const row = screen.getByText("Demo Guest").closest("tr")!;
    await user.click(within(row).getByRole("button", { name: "Manage" }));
    const d = within(screen.getByRole("dialog"));
    await user.selectOptions(d.getByLabelText("Status"), "Confirmed");
    await user.click(d.getByRole("button", { name: "Save appointment" }));
    view.unmount();
    app("/admin/consultations");
    expect(
      saved().consultations.filter((c) => c.id === "CONS-DEMO"),
    ).toHaveLength(1);
    expect(
      saved().consultations.find((c) => c.id === "CONS-DEMO")?.status,
    ).toBe("Confirmed");
  });
  it("imports a customer demo order as unpaid and retains fulfilment edits", async () => {
    const base = seedAdmin().orders[0];
    localStorage.setItem(
      "ornate:orders",
      JSON.stringify([
        {
          id: "ORN-LOCAL",
          date: "2026-10-25T10:00:00+05:30",
          items: base.items,
          address: {
            name: "Local Guest",
            email: "local@example.com",
            phone: "9000000000",
            line1: "12 Sample Lane",
            city: "Kota",
            state: "Rajasthan",
            pincode: "324005",
          },
          subtotal: base.total,
          shipping: 0,
          total: base.total,
          status: "Demo order placed",
        },
      ]),
    );
    const user = userEvent.setup();
    const view = app("/admin/orders?order=ORN-LOCAL");
    const d = within(screen.getByRole("dialog"));
    expect(
      (d.getByLabelText("Demo payment record") as HTMLSelectElement).value,
    ).toBe("Pending");
    await user.selectOptions(d.getByLabelText("Fulfilment"), "Processing");
    await user.click(d.getByRole("button", { name: "Update order" }));
    view.unmount();
    app("/admin/orders");
    expect(saved().orders.filter((o) => o.id === "ORN-LOCAL")).toHaveLength(1);
    expect(saved().orders.find((o) => o.id === "ORN-LOCAL")?.status).toBe(
      "Processing",
    );
  });
  it("uploads a local image and saves descriptive alternative text", async () => {
    const user = userEvent.setup();
    app("/admin/media");
    const file = new File(["demo image bytes"], "heritage-detail.png", {
      type: "image/png",
    });
    await user.upload(screen.getByLabelText(/Upload images/), file);
    await waitFor(() =>
      expect(saved().media[0].name).toBe("heritage-detail.png"),
    );
    await user.click(
      screen.getByRole("button", { name: /heritage-detail.png/ }),
    );
    const d = within(screen.getByRole("dialog"));
    await user.clear(d.getByLabelText("Alternative text"));
    await user.type(
      d.getByLabelText("Alternative text"),
      "Gold bangle with floral engraving",
    );
    await user.click(d.getByRole("button", { name: "Save changes" }));
    expect(saved().media[0].alt).toBe("Gold bangle with floral engraving");
    expect(saved().media[0].url).toMatch(/^data:image\/png/);
  });
  it("resets admin data only after confirmation and preserves customer shopping data", async () => {
    const state = seedAdmin();
    state.settings.name = "Edited demo";
    localStorage.setItem(ADMIN_KEY, JSON.stringify(state));
    localStorage.setItem("ornate:wishlist", JSON.stringify(["emerald-muse"]));
    const user = userEvent.setup();
    app("/admin/settings");
    await user.click(screen.getByRole("button", { name: "Demo workspace" }));
    await user.click(screen.getByRole("button", { name: "Reset admin demo" }));
    const d = within(screen.getByRole("dialog"));
    expect(
      (d.getByRole("button", { name: "Reset admin demo" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    await user.type(d.getByLabelText("Type RESET to confirm"), "RESET");
    await user.click(d.getByRole("button", { name: "Reset admin demo" }));
    expect(saved().settings.name).toBe("Ornate Jewels, Kota");
    expect(JSON.parse(localStorage.getItem("ornate:wishlist")!)).toEqual([
      "emerald-muse",
    ]);
  });
});
describe("admin state and reporting", () => {
  it("recovers malformed persisted records and accepts a complete workspace", () => {
    expect(isAdminState(seedAdmin())).toBe(true);
    localStorage.setItem(ADMIN_KEY, "{broken");
    expect(loadAdmin().orders.length).toBe(36);
    const bad = seedAdmin();
    bad.orders[0].date = "bad-date";
    localStorage.setItem(ADMIN_KEY, JSON.stringify(bad));
    expect(loadAdmin().orders[0].date).not.toBe("bad-date");
  });
  it("filters reporting dates at both boundaries and excludes future records", () => {
    const order = seedAdmin().orders[0];
    const records = [
      { ...order, date: "2026-10-19T00:00:00+05:30" },
      { ...order, date: "2026-10-25T23:59:59+05:30" },
      { ...order, date: "2026-10-18T23:59:59+05:30" },
      { ...order, date: "2026-10-26T00:00:00+05:30" },
    ];
    expect(periodOrders(records, 7)).toHaveLength(2);
  });
});
