import { describe, it, expect } from "vitest";
import { AuthProvider } from "./auth";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { products, filterProducts } from "./data";
import { addLine, subtotal, StoreProvider, useStore } from "./store";
import Catalog from "./Catalog";
import ProductPage from "./Product";
import { CartDrawer } from "./components";
import { Checkout, Confirmation } from "./Commerce";
function app(element: React.ReactNode, url = "/") {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <StoreProvider>
        <AuthProvider>{element}</AuthProvider>
      </StoreProvider>
    </MemoryRouter>,
  );
}
describe("catalogue and bag rules", () => {
  it("combines category, material, price and availability filters", () => {
    const result = filterProducts(products, {
      category: "Earrings",
      material: "Polki",
      budget: "30000",
      available: true,
    });
    expect(result.map((p) => p.id)).toEqual(["gulabi-drops"]);
  });
  it("sorts without mutating the source catalogue", () => {
    const original = products.map((p) => p.id);
    const result = filterProducts(products, { sort: "price-asc" });
    expect(result[0].price).toBe(Math.min(...products.map((p) => p.price)));
    expect(products.map((p) => p.id)).toEqual(original);
  });
  it("keeps variants distinct, combines matching lines, and computes accurate totals", () => {
    const p = products[2];
    let lines = addLine([], p, "2.4");
    lines = addLine(lines, p, "2.6");
    lines = addLine(lines, p, "2.4");
    expect(lines).toEqual([
      { productId: p.id, variant: "2.4", quantity: 2 },
      { productId: p.id, variant: "2.6", quantity: 1 },
    ]);
    expect(subtotal(lines)).toBe(p.price * 3);
  });
  it("rejects sold-out pieces, consultation pieces, invalid variants and stock overflow across sizes", () => {
    expect(addLine([], products[8], "One size")).toEqual([]);
    expect(addLine([], products[4], "Standard length")).toEqual([]);
    expect(addLine([], products[0], "wrong")).toEqual([]);
    const p = products[2];
    let lines = addLine([], p, "2.4");
    for (let i = 0; i < 4; i++) lines = addLine(lines, p, "2.4");
    expect(addLine(lines, p, "2.6")).toBe(lines);
  });
});
describe("storefront interactions", () => {
  it("requires a fit before adding a product and persists it to the bag", async () => {
    const user = userEvent.setup();
    app(
      <>
        <Routes>
          <Route path="/products/:slug" element={<ProductPage />} />
        </Routes>
        <CartDrawer />
      </>,
      "/products/sunehri-kada",
    );
    await user.click(screen.getByRole("button", { name: "Add to your bag" }));
    expect(screen.getByRole("alert").textContent).toContain("Please choose");
    await user.click(screen.getByRole("button", { name: "2.6" }));
    await user.click(screen.getByRole("button", { name: "Add to your bag" }));
    expect(JSON.parse(localStorage.getItem("ornate:cart")!)[0]).toEqual({
      productId: "sunehri-kada",
      variant: "2.6",
      quantity: 1,
    });
    expect(
      screen
        .getByRole("dialog", { name: "Your jewellery bag" })
        .hasAttribute("open"),
    ).toBe(true);
  });
  it("shows zero results and recovers when filters are cleared", async () => {
    const user = userEvent.setup();
    app(<Catalog />, "/shop?category=Earrings&material=Gold");
    expect(screen.getByText("A different direction, perhaps?")).toBeTruthy();
    await user.click(
      screen.getByRole("button", { name: "Explore all pieces" }),
    );
    expect(screen.getByText("12 beautiful pieces")).toBeTruthy();
  });
  it("recovers from corrupt saved shopping state", () => {
    localStorage.setItem("ornate:cart", '{"broken":true}');
    function State() {
      const { cart } = useStore();
      return <p>Bag count: {cart.length}</p>;
    }
    app(<State />);
    expect(screen.getByText("Bag count: 0")).toBeTruthy();
  });
  it("persists wishlist state across remounts", async () => {
    const user = userEvent.setup();
    function State() {
      const { wishlist, toggleWish } = useStore();
      return (
        <button onClick={() => toggleWish(products[0].id)}>
          Saved: {wishlist.length}
        </button>
      );
    }
    const view = app(<State />);
    await user.click(screen.getByRole("button", { name: "Saved: 0" }));
    view.unmount();
    app(<State />);
    expect(screen.getByRole("button", { name: "Saved: 1" })).toBeTruthy();
  });
  it("completes demo checkout with consistent order totals and clears the bag", async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      "ornate:cart",
      JSON.stringify([
        { productId: "sunehri-kada", variant: "2.6", quantity: 2 },
      ]),
    );
    app(
      <Routes>
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-confirmation/:id" element={<Confirmation />} />
      </Routes>,
      "/checkout",
    );
    const fields = {
      "Full name": "Demo Customer",
      "Email address": "demo@example.com",
      "Mobile number": "9876543210",
      Pincode: "324005",
      Address: "12 Demo Lane",
      City: "Kota",
      State: "Rajasthan",
    };
    for (const [label, value] of Object.entries(fields))
      await user.type(screen.getByLabelText(label), value);
    await user.click(
      screen.getByRole("button", { name: "Continue to delivery" }),
    );
    await user.click(screen.getByRole("radio", { name: /Priority delivery/ }));
    await user.click(screen.getByRole("button", { name: "Review your order" }));
    await user.click(
      screen.getByRole("button", { name: "Confirm demo order" }),
    );
    expect(
      await screen.findByRole("heading", { name: "Excellent taste, Demo." }),
    ).toBeTruthy();
    const orders = JSON.parse(localStorage.getItem("ornate:orders")!);
    expect(orders).toHaveLength(1);
    expect(orders[0].total).toBe(46500 * 2 + 499);
    expect(orders[0].items[0].quantity).toBe(2);
    expect(JSON.parse(localStorage.getItem("ornate:cart")!)).toEqual([]);
    expect(screen.getByText(/No payment was taken/)).toBeTruthy();
  });
});
