import { webcrypto } from "node:crypto";
import { beforeAll, describe, it, expect } from "vitest";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { StoreProvider } from "./store";
import {
  AuthProvider,
  CUSTOMER_SESSION_KEY,
  ADMIN_SESSION_KEY,
  safeCustomerReturn,
  safeAdminReturn,
} from "./auth";
import CustomerAuth from "./AuthScreens";
import Account from "./Account";
import Admin from "./admin/Admin";
beforeAll(() => {
  Object.defineProperty(crypto, "subtle", {
    value: webcrypto.subtle,
    configurable: true,
  });
});
function app(path = "/account/sign-in") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <StoreProvider>
        <AuthProvider>
          <Routes>
            <Route
              path="/account/sign-in"
              element={<CustomerAuth key="in" mode="sign-in" />}
            />
            <Route
              path="/account/sign-up"
              element={<CustomerAuth key="up" mode="sign-up" />}
            />
            <Route
              path="/account/forgot-password"
              element={<CustomerAuth key="recover" mode="recovery" />}
            />
            <Route path="/account" element={<Account />} />
            <Route path="/account/orders" element={<Account />} />
            <Route path="/admin/*" element={<Admin />} />
          </Routes>
        </AuthProvider>
      </StoreProvider>
    </MemoryRouter>,
  );
}
async function login(
  user: ReturnType<typeof userEvent.setup>,
  email: string,
  password: string,
) {
  const form = within(screen.getByRole("form", { name: "Customer sign in" }));
  await user.type(form.getByLabelText("Email address"), email);
  await user.type(form.getByLabelText("Password", { exact: true }), password);
  await user.click(form.getByRole("button", { name: "Sign in" }));
}
describe("customer and studio demo authentication", () => {
  it("registers, signs out, restores registration after remount and rejects a wrong password", async () => {
    const user = userEvent.setup();
    let view = app("/account/sign-up");
    const form = within(
      screen.getByRole("form", { name: "Create customer account" }),
    );
    await user.type(form.getByLabelText("Full name"), "Sample Client");
    await user.type(form.getByLabelText("Email address"), "sample@example.com");
    await user.type(
      form.getByLabelText("Password", { exact: true }),
      "SamplePass123!",
    );
    await user.type(form.getByLabelText("Confirm password"), "SamplePass123!");
    await user.click(form.getByRole("button", { name: "Create demo account" }));
    await screen.findByRole("heading", { name: "Lovely to see you, Sample." });
    expect(localStorage.getItem("ornate:demo-accounts:v1")).not.toContain(
      "SamplePass123!",
    );
    expect(sessionStorage.getItem(ADMIN_SESSION_KEY)).toBeNull();
    await user.click(screen.getByRole("button", { name: "Sign out" }));
    expect(sessionStorage.getItem(CUSTOMER_SESSION_KEY)).toBeNull();
    view.unmount();
    view = app();
    await login(user, "sample@example.com", "WrongPass123");
    expect((await screen.findByRole("alert")).textContent).toContain(
      "doesn’t match",
    );
    const field = screen.getByLabelText("Password", { exact: true });
    await user.clear(field);
    await user.type(field, "SamplePass123!");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    await screen.findByRole("heading", { name: "Lovely to see you, Sample." });
  });
  it("validates password confirmation and duplicate registration", async () => {
    const user = userEvent.setup();
    app("/account/sign-up");
    await user.type(screen.getByLabelText("Full name"), "Sample Client");
    await user.type(screen.getByLabelText("Email address"), "diya@example.com");
    await user.type(
      screen.getByLabelText("Password", { exact: true }),
      "SamplePass123!",
    );
    await user.type(screen.getByLabelText("Confirm password"), "Different123!");
    await user.click(
      screen.getByRole("button", { name: "Create demo account" }),
    );
    expect(screen.getByRole("alert").textContent).toContain("don’t match");
    await user.clear(screen.getByLabelText("Confirm password"));
    await user.type(
      screen.getByLabelText("Confirm password"),
      "SamplePass123!",
    );
    await user.click(
      screen.getByRole("button", { name: "Create demo account" }),
    );
    expect((await screen.findByRole("alert")).textContent).toContain(
      "already exists",
    );
  });
  it("gates customer pages, preserves the intended return and filters account order history", async () => {
    const base = {
      date: "2026-10-25T12:00:00Z",
      items: [{ name: "Demo piece", price: 1000, quantity: 1 }],
      total: 1000,
      shipping: 0,
      subtotal: 1000,
      status: "Demo order placed",
    };
    localStorage.setItem(
      "ornate:orders",
      JSON.stringify([
        {
          ...base,
          id: "OWN-ORDER",
          address: { name: "Diya", email: "diya@example.com" },
        },
        {
          ...base,
          id: "OTHER-ORDER",
          address: { name: "Other Guest", email: "other@example.com" },
        },
      ]),
    );
    localStorage.setItem(
      "ornate:profile",
      JSON.stringify({ name: "Guest", email: "guest@example.com" }),
    );
    const user = userEvent.setup();
    app("/account/orders");
    expect(screen.getByRole("form", { name: "Customer sign in" })).toBeTruthy();
    await login(user, "diya@example.com", "OrnateDemo123!");
    await screen.findByRole("heading", { name: "Your beautiful choices." });
    expect(screen.getByText("OWN-ORDER")).toBeTruthy();
    expect(screen.queryByText("OTHER-ORDER")).toBeNull();
  });
  it("verifies a demo recovery code before resetting and accepts only the new password", async () => {
    const user = userEvent.setup();
    app("/account/forgot-password");
    await user.type(screen.getByLabelText("Email address"), "diya@example.com");
    await user.click(
      screen.getByRole("button", { name: "Continue to verification" }),
    );
    const code = screen
      .getByText(/Demo code:/)
      .querySelector("strong")!.textContent!;
    const wrong = code === "111111" ? "222222" : "111111";
    await user.type(screen.getByLabelText("Verification code"), wrong);
    await user.click(screen.getByRole("button", { name: "Verify demo code" }));
    expect(screen.getByRole("alert").textContent).toContain("doesn’t match");
    await user.clear(screen.getByLabelText("Verification code"));
    await user.type(screen.getByLabelText("Verification code"), code);
    await user.click(screen.getByRole("button", { name: "Verify demo code" }));
    await user.type(
      screen.getByLabelText("New password", { exact: true }),
      "NewSample123!",
    );
    await user.type(screen.getByLabelText("Confirm password"), "NewSample123!");
    await user.click(screen.getByRole("button", { name: "Save new password" }));
    await screen.findByRole("heading", { name: "You’re ready to return." });
    await user.click(screen.getByRole("link", { name: "Back to sign in" }));
    await login(user, "diya@example.com", "OrnateDemo123!");
    expect((await screen.findByRole("alert")).textContent).toContain(
      "doesn’t match",
    );
    await user.clear(screen.getByLabelText("Password", { exact: true }));
    await user.type(
      screen.getByLabelText("Password", { exact: true }),
      "NewSample123!",
    );
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    await screen.findByRole("heading", { name: "Lovely to see you, Diya." });
  });
  it("gates admin deep links, rejects wrong credentials, returns after login and signs out", async () => {
    const user = userEvent.setup();
    app("/admin/inventory");
    expect(
      screen.getByRole("heading", { name: "Welcome to the studio." }),
    ).toBeTruthy();
    await user.type(
      screen.getByLabelText("Studio email"),
      "studio@ornate.example",
    );
    await user.type(
      screen.getByLabelText("Password", { exact: true }),
      "Incorrect123",
    );
    await user.click(screen.getByRole("button", { name: "Sign in to studio" }));
    expect(screen.getByRole("alert").textContent).toContain("incorrect");
    await user.click(
      screen.getByRole("button", { name: "Fill demo credentials" }),
    );
    await user.click(screen.getByRole("button", { name: "Sign in to studio" }));
    await screen.findByRole("heading", { name: "Inventory", level: 1 });
    expect(sessionStorage.getItem(CUSTOMER_SESSION_KEY)).toBeNull();
    await user.click(screen.getByRole("button", { name: "Sign out" }));
    await screen.findByRole("heading", { name: "Welcome to the studio." });
    expect(sessionStorage.getItem(ADMIN_SESSION_KEY)).toBeNull();
  });
  it("does not grant admin entry to a signed-in customer", async () => {
    const user = userEvent.setup();
    const view = app();
    await login(user, "diya@example.com", "OrnateDemo123!");
    await screen.findByRole("heading", { name: "Lovely to see you, Diya." });
    view.unmount();
    app("/admin/orders");
    expect(screen.getByRole("form", { name: "Admin sign in" })).toBeTruthy();
  });
  it("toggles password visibility without losing the field value", async () => {
    const user = userEvent.setup();
    app();
    const field = screen.getByLabelText("Password", {
      exact: true,
    }) as HTMLInputElement;
    await user.type(field, "Demo12345");
    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(field.type).toBe("text");
    expect(field.value).toBe("Demo12345");
    await user.click(screen.getByRole("button", { name: "Hide password" }));
    expect(field.type).toBe("password");
  });
  it("rejects external and cross-role return paths", () => {
    expect(safeCustomerReturn("//evil.example")).toBe("/account");
    expect(safeCustomerReturn("/admin/orders")).toBe("/account");
    expect(safeCustomerReturn("/account/sign-up")).toBe("/account");
    expect(safeAdminReturn("https://evil.example")).toBe("/admin");
    expect(safeAdminReturn("/admin/login?next=/admin")).toBe("/admin");
    expect(safeAdminReturn("/admin/orders?order=ORN-1048")).toBe(
      "/admin/orders?order=ORN-1048",
    );
  });
});
