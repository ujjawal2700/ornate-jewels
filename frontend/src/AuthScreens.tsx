import { useState, useId, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import {
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowLeft,
  Check,
  LockKeyhole,
  LoaderCircle,
} from "lucide-react";
import { Logo } from "./Logo";
import {
  CUSTOMER_DEMO,
  ADMIN_DEMO,
  useAuth,
  safeCustomerReturn,
  safeAdminReturn,
  validPassword,
} from "./auth";
import { useStore } from "./store";
import "./auth.css";
export function PasswordField({
  label,
  value,
  onChange,
  autoComplete = "current-password",
  hint,
  required = true,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  hint?: string;
  required?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const id = useId();
  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <div className="auth-password">
        <input
          id={id}
          type={visible ? "text" : "password"}
          required={required}
          maxLength={128}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          aria-describedby={hint ? id + "-hint" : undefined}
        />
        <button
          type="button"
          aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}
          aria-pressed={visible}
          onClick={() => setVisible(!visible)}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {hint && <small id={id + "-hint"}>{hint}</small>}
    </div>
  );
}
export default function CustomerAuth({
  mode,
}: {
  mode: "sign-in" | "sign-up" | "recovery";
}) {
  const auth = useAuth();
  const { setProfile } = useStore();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const next = safeCustomerReturn(params.get("next"));
  const suffix = next !== "/account" ? "?next=" + encodeURIComponent(next) : "";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState<"email" | "code" | "password" | "done">(
    "email",
  );
  const [code, setCode] = useState("");
  const [entered, setEntered] = useState("");
  if (auth.customer && mode !== "recovery")
    return <Navigate to={next} replace />;
  const title =
    mode === "sign-up"
      ? "A little more personal."
      : mode === "recovery"
        ? step === "done"
          ? "A fresh beginning."
          : "Let’s get you back in."
        : "Your world of Ornate.";
  const createCode = () => {
    const digits = String(
      100000 + (crypto.getRandomValues(new Uint32Array(1))[0] % 900000),
    );
    setCode(digits);
    setEntered("");
    return digits;
  };
  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "recovery") {
        if (step === "email") {
          if (!auth.hasAccount(email))
            throw new Error(
              "There’s no demo account with this email yet. Create one or use diya@example.com.",
            );
          createCode();
          setStep("code");
        } else if (step === "code") {
          if (entered !== code)
            throw new Error(
              "That code doesn’t match. Enter the six-digit demo code shown below.",
            );
          setStep("password");
        } else if (step === "password") {
          if (password !== confirm)
            throw new Error(
              "The passwords don’t match. Enter the same password in both fields.",
            );
          await auth.resetPassword(email, password);
          setPassword("");
          setConfirm("");
          setStep("done");
        }
      } else {
        if (mode === "sign-up" && password !== confirm)
          throw new Error(
            "The passwords don’t match. Enter the same password in both fields.",
          );
        const identity =
          mode === "sign-up"
            ? await auth.signUp(name, email, password)
            : await auth.signIn(email, password);
        setProfile(identity);
        navigate(next, { replace: true });
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "This step could not be completed. Try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="customer-auth">
      <div className="auth-art">
        <img
          src="/assets/section-necklace-3.jpg"
          alt="Intricate gold and ruby jewellery from the Ornate collection"
        />
        <div>
          <p>A space for your favourites.</p>
          <h2>
            Beautiful things.
            <br />
            Entirely yours.
          </h2>
          <span>Ornate Jewels, Kota</span>
        </div>
      </div>
      <div className="auth-form-side">
        <Link className="auth-back" to="/shop">
          <ArrowLeft size={15} />
          Back to the collection
        </Link>
        <div className="auth-form-content">
          <h1>{title}</h1>
          <p className="auth-intro">
            {mode === "sign-up"
              ? "Keep the pieces you love and the moments you’re planning, all together."
              : mode === "recovery"
                ? step === "done"
                  ? "Your demo password has been updated in this browser."
                  : "A few simple steps to return to your favourites."
                : "Sign in to revisit your favourites, orders and saved details."}
          </p>
          <p className="auth-demo-note">
            <LockKeyhole size={15} />
            <span>
              Frontend demo. Use fictional details and a made-up password. No
              email is sent.
            </span>
          </p>
          {mode === "recovery" && step === "done" ? (
            <div className="auth-success" role="status">
              <span>
                <Check size={24} />
              </span>
              <h2>You’re ready to return.</h2>
              <p>Sign in using your email and new demo password.</p>
              <Link className="auth-submit" to={"/account/sign-in" + suffix}>
                Back to sign in
                <ArrowUpRight size={17} />
              </Link>
            </div>
          ) : (
            <form
              onSubmit={submit}
              className="auth-form"
              aria-label={
                mode === "sign-up"
                  ? "Create customer account"
                  : mode === "recovery"
                    ? "Recover customer account"
                    : "Customer sign in"
              }
            >
              {mode === "sign-up" && (
                <label className="auth-field">
                  Full name
                  <input
                    required
                    minLength={2}
                    maxLength={100}
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
              )}
              {(mode !== "recovery" || step === "email") && (
                <label className="auth-field">
                  Email address
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    maxLength={254}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
              )}
              {mode === "recovery" && step === "code" && (
                <>
                  <div className="auth-recovery-progress">
                    <span className="is-complete">Email</span>
                    <span className="is-current">Verify code</span>
                    <span>New password</span>
                  </div>
                  <p className="auth-recovery-copy">
                    Confirm the demo code for <strong>{email}</strong>.
                  </p>
                  <label className="auth-field">
                    Verification code
                    <input
                      required
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      value={entered}
                      onChange={(e) =>
                        setEntered(e.target.value.replace(/\D/g, ""))
                      }
                    />
                  </label>
                  <div className="auth-demo-code">
                    <span>
                      Demo code: <strong>{code}</strong>
                    </span>
                    <p>Shown here for the presentation. No message was sent.</p>
                    <button
                      type="button"
                      onClick={() => {
                        createCode();
                        setError("");
                      }}
                    >
                      Generate a new demo code
                    </button>
                  </div>
                  <button
                    className="auth-text-button"
                    type="button"
                    onClick={() => {
                      setStep("email");
                      setError("");
                    }}
                  >
                    Use another email
                  </button>
                </>
              )}
              {(mode !== "recovery" || step === "password") && (
                <>
                  <PasswordField
                    label={mode === "recovery" ? "New password" : "Password"}
                    value={password}
                    onChange={setPassword}
                    autoComplete={
                      mode === "sign-in" ? "current-password" : "new-password"
                    }
                    hint={
                      mode !== "sign-in"
                        ? "At least 8 characters, including a letter and a number."
                        : undefined
                    }
                  />
                  {mode !== "sign-in" && (
                    <PasswordField
                      label="Confirm password"
                      value={confirm}
                      onChange={setConfirm}
                      autoComplete="new-password"
                    />
                  )}
                </>
              )}
              {mode === "sign-in" && (
                <Link
                  className="auth-forgot"
                  to={"/account/forgot-password" + suffix}
                >
                  Forgot password?
                </Link>
              )}
              {error && (
                <p className="auth-error" role="alert">
                  {error}
                </p>
              )}
              <button className="auth-submit" disabled={busy} type="submit">
                {busy ? (
                  <>
                    <LoaderCircle className="auth-spin" size={17} />
                    Please wait…
                  </>
                ) : (
                  <>
                    {mode === "sign-up"
                      ? "Create demo account"
                      : mode === "sign-in"
                        ? "Sign in"
                        : step === "email"
                          ? "Continue to verification"
                          : step === "code"
                            ? "Verify demo code"
                            : "Save new password"}
                    <ArrowUpRight size={17} />
                  </>
                )}
              </button>
            </form>
          )}
          {mode === "sign-in" && (
            <>
              <p className="auth-switch">
                New to Ornate?{" "}
                <Link to={"/account/sign-up" + suffix}>Create an account</Link>
              </p>
              <details className="auth-credentials">
                <summary>Try the customer demo account</summary>
                <dl>
                  <div>
                    <dt>Email</dt>
                    <dd>{CUSTOMER_DEMO.email}</dd>
                  </div>
                  <div>
                    <dt>Password</dt>
                    <dd>{CUSTOMER_DEMO.password}</dd>
                  </div>
                </dl>
                <button
                  type="button"
                  onClick={() => {
                    setEmail(CUSTOMER_DEMO.email);
                    setPassword(CUSTOMER_DEMO.password);
                    setError("");
                  }}
                >
                  Fill demo credentials
                </button>
              </details>
            </>
          )}
          {mode === "sign-up" && (
            <p className="auth-switch">
              Already have an account?{" "}
              <Link to={"/account/sign-in" + suffix}>Sign in</Link>
            </p>
          )}
          {mode === "recovery" && step !== "done" && (
            <p className="auth-switch">
              <Link to={"/account/sign-in" + suffix}>Return to sign in</Link>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
export function AdminLogin() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const next = safeAdminReturn(params.get("next"));
  if (auth.admin) return <Navigate to={next} replace />;
  return (
    <div className="admin-login">
      <section className="admin-login-art">
        <Link to="/" aria-label="Ornate Jewels home">
          <Logo />
        </Link>
        <div>
          <span>Ornate Studio</span>
          <h1>
            Behind every
            <br />
            beautiful moment.
          </h1>
          <p>
            A considered space to care for your collection, your clients and
            every little detail.
          </p>
        </div>
        <small>Ornate Jewels, Kota</small>
      </section>
      <main className="admin-login-main">
        <Link className="auth-back" to="/">
          <ArrowLeft size={15} />
          View the storefront
        </Link>
        <div className="admin-login-form">
          <span className="admin-login-mark">
            <LockKeyhole size={22} />
          </span>
          <h2>Welcome to the studio.</h2>
          <p className="auth-intro">Sign in to manage the Ornate experience.</p>
          <p className="auth-demo-note">
            <LockKeyhole size={15} />
            <span>
              Frontend demo access. This screen does not secure live store data.
            </span>
          </p>
          <form
            className="auth-form"
            aria-label="Admin sign in"
            onSubmit={(e) => {
              e.preventDefault();
              setError("");
              try {
                auth.signInAdmin(email, password);
                navigate(next, { replace: true });
              } catch (err) {
                setError(
                  err instanceof Error ? err.message : "Unable to sign in.",
                );
              }
            }}
          >
            <label className="auth-field">
              Studio email
              <input
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <PasswordField
              label="Password"
              value={password}
              onChange={setPassword}
            />
            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}
            <button className="auth-submit">
              Sign in to studio
              <ArrowUpRight size={17} />
            </button>
          </form>
          <details className="auth-credentials" open>
            <summary>Client presentation credentials</summary>
            <dl>
              <div>
                <dt>Email</dt>
                <dd>{ADMIN_DEMO.email}</dd>
              </div>
              <div>
                <dt>Password</dt>
                <dd>{ADMIN_DEMO.password}</dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={() => {
                setEmail(ADMIN_DEMO.email);
                setPassword(ADMIN_DEMO.password);
                setError("");
              }}
            >
              Fill demo credentials
            </button>
          </details>
          <p className="admin-login-help">
            Staff account creation and password recovery will be managed by the
            store owner when backend authentication is connected.
          </p>
        </div>
        <footer>Ornate Studio · Owner demonstration</footer>
      </main>
    </div>
  );
}
