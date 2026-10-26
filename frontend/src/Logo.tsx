/** Original Ornate artwork. The dark-surface layer reverses only the lettering;
 * the orange ring and the complete lockup retain the supplied geometry. */
export function Logo({ decorative = false }: { decorative?: boolean }) {
  return (
    <span className="ornate-logo">
      <img
        className="ornate-logo-original"
        src="/assets/footer-logo.png"
        width={739}
        height={417}
        alt={decorative ? "" : "Ornate Jewels, Kota"}
        aria-hidden={decorative || undefined}
      />
      <img
        className="ornate-logo-reverse"
        src="/assets/footer-logo.png"
        width={739}
        height={417}
        alt=""
        aria-hidden="true"
      />
    </span>
  );
}
export function LogoSymbol({ className = "" }: { className?: string }) {
  return (
    <img
      className={className}
      src="/assets/logo-ring.png"
      width={150}
      height={147}
      alt=""
      aria-hidden="true"
    />
  );
}
