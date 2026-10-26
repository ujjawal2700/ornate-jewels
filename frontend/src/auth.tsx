import { createContext, useContext, useState, type ReactNode } from "react";
export const CUSTOMER_SESSION_KEY = "ornate:customer-session";
export const ADMIN_SESSION_KEY = "ornate:admin-session";
const ACCOUNTS_KEY = "ornate:demo-accounts:v1";
export const CUSTOMER_DEMO = {
  name: "Diya Sharma",
  email: "diya@example.com",
  password: "OrnateDemo123!",
};
export const ADMIN_DEMO = {
  email: "studio@ornate.example",
  password: "OrnateAdmin123!",
};
type Identity = { name: string; email: string };
type DemoAccount = Identity & { salt: string; digest: string };
const normalize = (email: string) => email.trim().toLowerCase();
function accounts(): DemoAccount[] {
  try {
    const value: unknown = JSON.parse(
      localStorage.getItem(ACCOUNTS_KEY) || "[]",
    );
    return Array.isArray(value)
      ? value.filter(
          (a): a is DemoAccount =>
            !!a &&
            [a.name, a.email, a.salt, a.digest].every(
              (v) => typeof v === "string",
            ),
        )
      : [];
  } catch {
    return [];
  }
}
function saveAccounts(value: DemoAccount[]) {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(value));
  } catch {
    throw new Error(
      "This browser could not save your demo account. Allow site storage and try again.",
    );
  }
}
function readCustomer(): Identity | null {
  try {
    const value = JSON.parse(
      sessionStorage.getItem(CUSTOMER_SESSION_KEY) || "null",
    );
    if (
      value &&
      typeof value.email === "string" &&
      typeof value.name === "string" &&
      (value.email === CUSTOMER_DEMO.email ||
        accounts().some((a) => a.email === value.email))
    )
      return value;
  } catch {
    /* No active demo session. */
  }
  return null;
}
export const validPassword = (password: string) =>
  password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password);
async function credential(password: string, salt: string) {
  // Demo verifier only. Production authentication and authorization belong on the server.
  if (!crypto.subtle)
    throw new Error(
      "Open the localhost or HTTPS preview to use the demo account flow.",
    );
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: new TextEncoder().encode(salt),
      iterations: 100000,
      hash: "SHA-256",
    },
    key,
    256,
  );
  return Array.from(new Uint8Array(bits), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}
function useAuthValue() {
  const [customer, setCustomer] = useState<Identity | null>(readCustomer);
  const [admin, setAdmin] = useState(() => {
    try {
      return sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";
    } catch {
      return false;
    }
  });
  function customerSession(identity: Identity) {
    try {
      sessionStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(identity));
    } catch {
      throw new Error(
        "Allow browser session storage to enter the demo account.",
      );
    }
    setCustomer(identity);
    return identity;
  }
  function hasAccount(email: string) {
    const key = normalize(email);
    return (
      key === CUSTOMER_DEMO.email || accounts().some((a) => a.email === key)
    );
  }
  async function signIn(email: string, password: string) {
    const key = normalize(email);
    const account = accounts().find((a) => a.email === key);
    const matches = account
      ? (await credential(password, account.salt)) === account.digest
      : key === CUSTOMER_DEMO.email && password === CUSTOMER_DEMO.password;
    if (!matches)
      throw new Error(
        "The email or password doesn’t match a demo account. Try again or create an account.",
      );
    return customerSession(
      account
        ? { name: account.name, email: account.email }
        : { name: CUSTOMER_DEMO.name, email: CUSTOMER_DEMO.email },
    );
  }
  async function signUp(name: string, email: string, password: string) {
    const key = normalize(email);
    if (name.trim().length < 2)
      throw new Error("Enter your name using at least two characters.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(key))
      throw new Error("Enter a valid email address.");
    if (hasAccount(key))
      throw new Error(
        "A demo account with this email already exists. Sign in or reset its password.",
      );
    if (!validPassword(password))
      throw new Error(
        "Use at least 8 characters, including a letter and a number.",
      );
    const salt = crypto.randomUUID();
    const identity = { name: name.trim(), email: key };
    const digest = await credential(password, salt);
    saveAccounts([...accounts(), { ...identity, salt, digest }]);
    return customerSession(identity);
  }
  async function resetPassword(email: string, password: string) {
    const key = normalize(email);
    if (!hasAccount(key))
      throw new Error("Create a demo account with this email first.");
    if (!validPassword(password))
      throw new Error(
        "Use at least 8 characters, including a letter and a number.",
      );
    const old = accounts().find((a) => a.email === key);
    const salt = crypto.randomUUID();
    const digest = await credential(password, salt);
    saveAccounts([
      ...accounts().filter((a) => a.email !== key),
      { name: old?.name || CUSTOMER_DEMO.name, email: key, salt, digest },
    ]);
  }
  function updateIdentity(name: string, email: string) {
    if (!customer) return;
    const key = normalize(email);
    if (key !== customer.email && hasAccount(key))
      throw new Error("Another demo account already uses this email.");
    if (name.trim().length < 2)
      throw new Error("Enter at least two characters for your name.");
    const records = accounts();
    const registered = records.find((a) => a.email === customer.email);
    if (key !== customer.email && !registered)
      throw new Error(
        "The sample account email stays fixed. Create your own demo account to use another email.",
      );
    if (registered)
      saveAccounts(
        records.map((a) =>
          a.email === customer.email
            ? { ...a, name: name.trim(), email: key }
            : a,
        ),
      );
    customerSession({ name: name.trim(), email: key });
  }
  function signOutCustomer() {
    try {
      sessionStorage.removeItem(CUSTOMER_SESSION_KEY);
    } catch {}
    setCustomer(null);
  }
  function signInAdmin(email: string, password: string) {
    if (
      normalize(email) !== ADMIN_DEMO.email ||
      password !== ADMIN_DEMO.password
    )
      throw new Error(
        "The studio email or password is incorrect. Use the demo credentials below.",
      );
    try {
      sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
    } catch {
      throw new Error("Allow browser session storage to open the studio demo.");
    }
    setAdmin(true);
  }
  function signOutAdmin() {
    try {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    } catch {}
    setAdmin(false);
  }
  return {
    customer,
    admin,
    hasAccount,
    signIn,
    signUp,
    resetPassword,
    updateIdentity,
    signOutCustomer,
    signInAdmin,
    signOutAdmin,
  };
}
const Context = createContext<ReturnType<typeof useAuthValue> | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const value = useAuthValue();
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useAuth() {
  const value = useContext(Context);
  if (!value) throw new Error("Auth provider missing");
  return value;
}
export function safeCustomerReturn(value: string | null) {
  return value &&
    /^\/(account(?:\/|$)|wishlist(?:\?|$)|checkout(?:\?|$))/.test(value) &&
    !value.startsWith("/account/sign-") &&
    !value.startsWith("/account/forgot-")
    ? value
    : "/account";
}
export function safeAdminReturn(value: string | null) {
  return value &&
    /^\/admin(?:\/|$|\?)/.test(value) &&
    !value.startsWith("/admin/login")
    ? value
    : "/admin";
}
