import { ProductTransitions } from "./ProductTransition";
import { PageTransition } from "./PageTransition";
import { LogoSymbol } from "./Logo";
import React, { Component, Suspense, lazy, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MotionConfig } from "motion/react";
import { StoreProvider } from "./store";
import { AuthProvider } from "./auth";
import { Shell, EmptyState } from "./components";
import Home, { Collections } from "./Home";
import "./styles.css";
import "./studio.css";
const Admin = lazy(() => import("./admin/Admin"));
const Catalog = lazy(() => import("./Catalog"));
const ProductPage = lazy(() => import("./Product"));
const Account = lazy(() => import("./Account"));
const CustomerAuth = lazy(() => import("./AuthScreens"));
const Editorial = () => import("./Editorial");
const Commerce = () => import("./Commerce");
const Story = lazy(() => Editorial().then((m) => ({ default: m.Story })));
const Bridal = lazy(() => Editorial().then((m) => ({ default: m.Bridal })));
const PiyushaEdit = lazy(() =>
  Editorial().then((m) => ({ default: m.PiyushaEdit })),
);
const Consultation = lazy(() =>
  Editorial().then((m) => ({ default: m.Consultation })),
);
const Visit = lazy(() => Editorial().then((m) => ({ default: m.Visit })));
const Contact = lazy(() => Editorial().then((m) => ({ default: m.Contact })));
const FAQs = lazy(() => Editorial().then((m) => ({ default: m.FAQs })));
const Guide = lazy(() => Editorial().then((m) => ({ default: m.Guide })));
const Policy = lazy(() => Editorial().then((m) => ({ default: m.Policy })));
const Wishlist = lazy(() => Commerce().then((m) => ({ default: m.Wishlist })));
const Cart = lazy(() => Commerce().then((m) => ({ default: m.Cart })));
const Checkout = lazy(() => Commerce().then((m) => ({ default: m.Checkout })));
const Confirmation = lazy(() =>
  Commerce().then((m) => ({ default: m.Confirmation })),
);
class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="empty-state">
        <h1>Let’s take a fresh look.</h1>
        <p>Something interrupted this page. Reload to continue exploring.</p>
        <button className="button" onClick={() => window.location.reload()}>
          Reload the storefront
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <MotionConfig reducedMotion="user">
        <BrowserRouter>
          <StoreProvider>
            <AuthProvider>
              <ProductTransitions>
                <Routes>
                  <Route
                    path="/admin/*"
                    element={
                      <Suspense
                        fallback={
                          <div className="page-loading" role="status">
                            Opening Ornate Studio…
                          </div>
                        }
                      >
                        <Admin />
                      </Suspense>
                    }
                  />
                  <Route
                    path="*"
                    element={
                      <Shell>
                        <Suspense
                          fallback={
                            <div className="page-loading" role="status">
                              <LogoSymbol className="loading-brand-symbol" />
                              <p>Finding something beautiful…</p>
                            </div>
                          }
                        >
                          <PageTransition>
                            <Routes>
                              <Route path="/" element={<Home />} />
                              <Route path="/shop" element={<Catalog />} />
                              <Route
                                path="/shop/:category"
                                element={<Catalog />}
                              />
                              <Route path="/search" element={<Catalog />} />
                              <Route path="/gifting" element={<Catalog />} />
                              <Route
                                path="/collections"
                                element={<Collections />}
                              />
                              <Route
                                path="/collections/:slug"
                                element={<Catalog />}
                              />
                              <Route
                                path="/products/:slug"
                                element={<ProductPage />}
                              />
                              <Route path="/wishlist" element={<Wishlist />} />
                              <Route path="/cart" element={<Cart />} />
                              <Route path="/checkout" element={<Checkout />} />
                              <Route
                                path="/order-confirmation/:id"
                                element={<Confirmation />}
                              />
                              <Route path="/account" element={<Account />} />
                              <Route
                                path="/account/sign-in"
                                element={
                                  <CustomerAuth key="sign-in" mode="sign-in" />
                                }
                              />
                              <Route
                                path="/account/sign-up"
                                element={
                                  <CustomerAuth key="sign-up" mode="sign-up" />
                                }
                              />
                              <Route
                                path="/account/forgot-password"
                                element={
                                  <CustomerAuth
                                    key="recovery"
                                    mode="recovery"
                                  />
                                }
                              />
                              <Route
                                path="/account/addresses"
                                element={<Account />}
                              />
                              <Route
                                path="/account/orders"
                                element={<Account />}
                              />
                              <Route
                                path="/account/orders/:id"
                                element={<Account />}
                              />
                              <Route path="/our-story" element={<Story />} />
                              <Route
                                path="/piyushas-edit"
                                element={<PiyushaEdit />}
                              />
                              <Route path="/bridal" element={<Bridal />} />
                              <Route
                                path="/consultation"
                                element={<Consultation />}
                              />
                              <Route path="/visit-us" element={<Visit />} />
                              <Route path="/contact" element={<Contact />} />
                              <Route path="/faqs" element={<FAQs />} />
                              <Route path="/size-guide" element={<Guide />} />
                              <Route path="/care-guide" element={<Guide />} />
                              <Route
                                path="/policies/:slug"
                                element={<Policy />}
                              />
                              <Route
                                path="*"
                                element={
                                  <EmptyState
                                    title="A beautiful detour."
                                    description="This page isn’t part of our collection. Let’s find you something lovely."
                                  />
                                }
                              />
                            </Routes>
                          </PageTransition>
                        </Suspense>
                      </Shell>
                    }
                  />
                </Routes>
              </ProductTransitions>
            </AuthProvider>
          </StoreProvider>
        </BrowserRouter>
      </MotionConfig>
    </ErrorBoundary>
  </React.StrictMode>,
);
