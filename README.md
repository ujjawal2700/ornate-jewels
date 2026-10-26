# Ornate Jewels — The Ornate Edit

A premium customer storefront concept for Ornate Jewels, Kota, structured as the React frontend of a MERN project.

## Run locally

Use Node.js 22.12+ (Node 24 recommended) and npm.

```bash
npm install
npm run dev
```

Open the Local URL printed by Vite (normally `http://127.0.0.1:5173`; if occupied, it chooses the next free port).

```bash
npm run build        # typecheck and production assets in dist/
npm test             # catalogue and shopping interaction tests
npm run preview      # serve the production build
npm run dev:server   # optional Express scaffold on port 5001
```

The frontend works without a database or API server. The backend health endpoint is `/api/health`. To enable a real MongoDB connection later, copy `backend/.env.example` to `backend/.env` and configure `MONGODB_URI`. No database is created or seeded by this demo. Do not expose the scaffold as a real commerce API.

## Project structure

- `frontend/`: React, TypeScript, Vite, React Router, CSS, GSAP ScrollTrigger, Motion, Lenis, local demo state and tests.
- `backend/`: Express application, optional MongoDB connection, Mongoose product/order models. Commerce/auth endpoints are intentionally not implemented yet.
- `dist/`: generated static storefront; serve with history fallback to `index.html` for deep links.
- `.agents/skills/`: project-local frontend design, GSAP, and web interface review skills.
- `docs/`: design brief, asset provenance, verification notes, and presentation walkthrough.

## Demo capabilities

Home, collections, category discovery, bridal, gifting, query-based filters/search/sorting, product galleries, fit selection, wishlist, bag quantities and totals, validated multi-step checkout, local order confirmation/history, demo profile and addresses, consultations, contact, care/sizing guides, FAQs, policies, and not-found states.

Names, prices, materials, sizes, and stock are sample data. No payments, real authentication, OTPs, emails, shipping, or appointment booking occur. Use fictional information in forms. State is saved locally in the current browser and is not secure customer storage.

The admin frontend is available at `/admin`. Actual Express/MongoDB commerce integration remains follow-on work. See `IMPLEMENTATION_PLAN.md` for the full scope and `docs/demo-guide.md` for the presentation sequence.

## Creative direction

The redesigned storefront uses an oxblood, parchment and antique-gold palette, cinematic campaign typography, scroll-linked material chapters and an editorial collection gallery. Desktop smooth scrolling progressively enhances native scrolling; touch devices retain native scrolling. Reduced-motion alternatives are included. `Home.tsx`, `Navigation.tsx`, `experience.tsx` and `studio.css` contain the new presentation layer. See `docs/redesign-direction.md` for the design rationale and `docs/verification.md` for check results and limits.

## Admin frontend — Ornate Studio

Open `/admin` on the same local URL as the storefront. Overview, orders, products, collections, inventory, customers, consultations, content, media, discounts, analytics and settings are implemented. Product editing, order transitions, stock adjustments, content previews, image uploads and CSV exports work with browser-local demo data.

`frontend/src/admin/model.ts` defines the record types and seeded data; `context.tsx` owns persistence and imports customer demo orders/consultations. The admin bundle and styles load separately from the customer shell. There are no new backend endpoints or dependencies.

Admin records use `ornate:admin:v1` in local storage. Catalogue/content/settings changes remain inside the admin demo; they do not publish changes to the storefront. `/admin` redirects through `/admin/login` using an explicitly labelled frontend demo session. This is not server authentication. See `docs/admin-demo-guide.md` for the walkthrough and integration boundaries.

## Customer and admin account flows

- Customer sign in: `/account/sign-in`; sign up: `/account/sign-up`; recovery: `/account/forgot-password`.
- Customer sample: `diya@example.com` / `OrnateDemo123!`. Select **Fill demo credentials** on the sign-in screen.
- Admin sign in: `/admin/login`; sample: `studio@ornate.example` / `OrnateAdmin123!`.
- Sign-up creates a local demo identity and signs it in. The recovery flow displays its simulated verification code on screen; no email or SMS is sent.
- Customer and admin sessions are separate, tab-scoped browser sessions. Protected frontend routes return to the intended page after sign-in. Checkout remains available to guests. Customer account orders and addresses are filtered by the signed-in demo email.
- New demo account verifiers are stored locally using salted PBKDF2 digests; plaintext passwords are not stored. This is presentation logic, not a security boundary: use fictional details and passwords. Real authentication, recovery, role permissions and data authorization require a backend.
- Clear site data to remove local demo registrations. Shopping/admin resets retain the demo registration records.

## Instagram journal

The homepage's `#ornate-on-instagram` section features the brand's model campaign, product photography and three native video reels. `instagram-data.ts` is the curated content manifest with local asset paths and original post URLs. Visitors can filter photo/reel entries, open full-frame imagery, play videos and follow links to the Instagram profile. Footer and navigation include the profile link.

This is a curated frontend snapshot, with no embedded third-party scripts or automatic feed synchronization. Update the manifest/assets to curate another selection; a future live feed needs a separately configured integration. See `docs/asset-register.md` for provenance.

## Trending runway

The homepage's existing curated-product row is now a runway showcase in **The trending edit**, between the collection gallery and Instagram journal. Six existing catalogue pieces advance through responsive depth positions on a shared stage. Product details, wishlist action and product link settle together; size/fit selection remains on the existing product page.

`frontend/src/runway/model.ts` holds the curated list, responsive positions, per-product adjustments and timing. `TrendingRunway.tsx` owns the GSAP progress timeline, observers, autoplay and pointer controls. Normal travel takes 900ms with a five-second dwell. Reduced motion starts paused and selects immediately. Autoplay pauses outside the viewport, in hidden tabs, during hover/focus/touch, and after explicit pause. No extra dependencies or product cutouts were introduced.
