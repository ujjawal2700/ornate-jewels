import { useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import "./transitions.css";

/** Place inside Suspense so a lazy page reveals when its content is ready.
 * Query/hash edits preserve the current screen and its input state. */
export function PageTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return <PageEntrance key={pathname}>{children}</PageEntrance>;
}
function PageEntrance({ children }: { children: ReactNode }) {
  // Capture once per path; removing the document flag must not replay the generic reveal.
  const [shared] = useState(() =>
    document.documentElement.hasAttribute("data-product-transition"),
  );
  return (
    <div
      className={`page-transition${shared ? " product-shared-arrival" : ""}`}
    >
      {children}
    </div>
  );
}
