# Ornate Jewels — Customer Storefront Implementation Plan

Status: Customer storefront implemented in a MERN workspace; build and shopping interaction tests pass. See `docs/verification.md` for completed checks and remaining browser coverage.

MERN update: React frontend in `frontend/`; Express/Mongoose foundation in `backend/`. The current demo uses browser-local data. Live MongoDB commerce endpoints and admin screens remain follow-on scope. Native HTML validation is used for the demo forms instead of the initially proposed form-library dependencies. The coherent sample catalogue contains 12 listings rather than expanding with additional repeated imagery.

## 1. Intended outcome

Build a premium, responsive, fully navigable customer storefront for an Ornate Jewels Kota client presentation. The demo should communicate the brand, help customers discover jewellery, support a complete simulated purchase, and offer personal guidance for considered purchases.

The creative starting point is **The Ornate Edit**: a curated balance of heritage, bridal, and contemporary jewellery, with Piyusha's personal curation as a recurring feature. This is a working direction based on the previous discussion, rather than a confirmed client brief.

The finished demo must work as an experience: links lead to appropriate pages, filters change results, product choices affect the bag, and checkout produces a local demo order.

## 2. Scope and boundaries

### Included now

- All customer-facing routes listed below, their responsive layouts, navigation, forms, and interaction states.
- A coherent visual system, campaign banners, product presentation, copywriting, and restrained premium animation.
- A locally stored demonstration catalogue, wishlist, bag, demo customer profile, and demo orders.
- Simulated account, consultation, and checkout flows with explicit demonstration messaging where relevant.
- Build instructions, repeatable demo data, meaningful journey checks, and a presentation walkthrough.

### Separate follow-on scope

- Admin dashboard and catalogue/content management screens.
- Real authentication, payments, order fulfilment, inventory, gold-rate feeds, messaging, and transactional email.
- Production policy approval, product pricing verification, and backend integration.

The catalogue and service interfaces will be structured so the later admin/backend work can replace local data without redesigning storefront components.

## 3. Phase 1 — Brief, reference review, and page inventory

### Work

1. Complete a focused visual reference review where browser access permits: homepage, collection, product, navigation, and mobile behaviour. The earlier analysis established content and shopping patterns but did not verify responsive rendering or animation.
2. Inspect Ornate's public brand assets and confirm the public brand spelling, logo treatment, colour cues, boutique information, and Piyusha's role before publishing those details in the demo.
3. Capture a reference matrix: observation, intended benefit, and Ornate-specific interpretation. References guide decisions; their layouts and campaign assets are not our design specification.
4. Establish the route manifest and two primary journeys: buy a piece; save pieces and seek guidance.
5. Record assumptions about categories, prices, materials, policies, and imagery. Unverified details use clearly identified sample content.

### Output and completion check

- `docs/creative-brief.md`, `docs/reference-review.md`, and a route inventory.
- Every main navigation and footer destination maps to a planned route.
- The brief distinguishes confirmed brand information from creative/sample material.

## 4. Phase 2 — Skills, framework, and project foundation

### Skills to obtain and inspect

Use the Skill Installer workflow to download skills from their official repositories, inspect the instructions, and record the source and revision. Install project-local where supported; avoid replacing existing personal skills. Follow any tool permission requirements for network access and installation.

| Skill                         | Source                                                                             | Intended role                                                         |
| ----------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `frontend-design`             | https://github.com/anthropics/skills/tree/main/skills/frontend-design              | Visual direction, typography, composition, and component craft        |
| Selected official GSAP skills | https://github.com/greensock/gsap-skills                                           | Core animation, timelines, ScrollTrigger, and React lifecycle cleanup |
| `web-design-guidelines`       | https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines | Interface quality, accessibility, forms, and interaction review       |

Inspect actual repository paths before installation. Keep the selection limited to relevant skills. Newly installed skills may require a subsequent turn to become discoverable; do not claim they are active before they are available.

Available skills to use when applicable: Sites for build/preview packaging, ImageGen for original campaign assets, and Skill Installer for external skill installation. Figma and Product Design are optional integrations and are not build prerequisites.

### Proposed frontend stack

| Technology                       | Purpose                                                                       |
| -------------------------------- | ----------------------------------------------------------------------------- |
| React + TypeScript               | Reusable storefront components and typed catalogue/order models               |
| Vite                             | Local development and static production build                                 |
| React Router                     | Customer pages, deep links, query-driven filters, and back/forward navigation |
| CSS variables + component styles | Bespoke design system, responsive layouts, and simple transitions             |
| GSAP + React integration         | A small number of signature editorial animation sequences                     |
| Motion for React                 | Drawers, dialogs, state changes, and other component transitions              |
| Lucide React                     | Consistent interface icons                                                    |
| React Hook Form + Zod            | Form state and validation for checkout and consultation                       |
| Vitest + Testing Library         | Focused tests for bag, totals, filters, and form behaviour                    |
| Playwright, where supported      | End-to-end shopping checks and responsive verification                        |

Verify Node/package-manager compatibility, select compatible stable dependencies at execution time, and commit the lockfile. Use a single package manager. Add dependencies only when they have a defined role. Use accessible primitives for dialogs and drawers if needed rather than rebuilding fragile focus management.

### Proposed structure

```text
src/
  app/             router, providers, route metadata
  components/      shared layout, navigation, buttons, dialogs
  features/
    catalog/       product cards, filters, search, galleries
    wishlist/      saved pieces and persistence
    cart/          bag, variants, totals, persistence
    checkout/      validated demo purchase flow
    account/       demo customer and order views
    consultation/  appointment form and confirmation
  pages/           page compositions
  data/            catalogue, collections, editorial content
  services/        local implementations behind replaceable interfaces
  styles/          tokens, fonts, global styles, motion rules
  lib/             currency, storage, validation utilities
public/assets/     optimised campaign, product, and brand assets
docs/              brief, asset register, QA notes, demo guide
tests/             selected unit and journey tests
```

### Completion check

- Development server and production build work.
- Route shell, error boundary, and not-found screen work.
- A nested route can load directly and survive refresh in the selected hosting setup.
- Installation state and skill sources are documented accurately.

## 5. Phase 3 — Design system, content, and asset production

### Work

- Develop warm ivory surfaces, espresso text, antique-gold details, and selective emerald editorial sections, adjusted to fit the actual logo.
- Choose and locally host appropriately licensed display and body fonts; establish readable mobile type sizes.
- Define spacing, content widths, breakpoints, borders, controls, focus states, and image aspect ratios.
- Establish button, form, card, badge, accordion, breadcrumb, notification, empty-state, drawer, and dialog treatments.
- Prepare a consistent catalogue of approximately 24–36 demo products across the agreed categories, with stable IDs, variants, image references, material descriptions, pricing basis, and stock/availability states.
- Keep purchasable product images internally consistent across cards, gallery, wishlist, bag, and orders. Do not imply a generated jewellery design is a verified Ornate product.
- Produce distinct desktop and mobile campaign crops. Use ImageGen for original campaign concepts where useful, with actual product photography preferred for item detail.
- Write original copy for collections, product descriptions, personal curation, and services. Avoid unsupported certification, delivery, scarcity, and return claims.
- Record asset origin, permitted use, and whether an asset is brand-sourced, licensed, generated, or a placeholder.

### Completion check

- A representative home section, product card, and product-detail section work at mobile and desktop widths.
- No essential copy is embedded only inside a banner image.
- No missing images, inconsistent product identity, or unlabelled placeholder claims.

## 6. Phase 4 — Storefront shell and homepage

### Work

- Build desktop navigation, mobile menu, search access, wishlist/bag counts, footer, breadcrumbs, and responsive content containers.
- Build the homepage story: campaign hero → category discovery → Piyusha's Picks → signature collection → occasion discovery → service reassurance → boutique consultation.
- Make campaign links and editorial calls to action lead to relevant filtered collections or story pages.
- Define responsive image loading and prioritise the opening campaign asset; lazy-load below-the-fold media.
- Build the first complete visual milestone before extending the same system across all routes.

### Completion check

- Homepage feels coherent on a small phone and a wide desktop.
- Header, menu, search, footer, and calls to action work with touch and keyboard.
- Navigation remains useful without hover, and content is visible when reduced motion is enabled.

## 7. Phase 5 — Catalogue, discovery, and product pages

### Work

- Build all-jewellery browsing, category pages, named collection pages, bridal, gifting, and search results.
- Share a catalogue engine supporting appropriate category, material, price, and availability filters.
- Preserve filter, sort, and query state in URLs; show active filters, result counts, clear actions, and useful zero-result states.
- Build product galleries, image zoom, variant/size choices, size guidance, specifications, price presentation, related pieces, and consultation access.
- Model a product as either directly purchasable at a sample fixed price or consultation-led. Do not send an unpriced piece through a fixed-price checkout.
- Support valid, unavailable, and invalid product routes.

### Completion check

- Visitors can find a piece through navigation, search, and filters.
- Product selections and availability rules determine whether adding to the bag is allowed.
- Filters, gallery controls, and important product actions work on mobile.

## 8. Phase 6 — Wishlist, bag, checkout, and customer area

### Work

- Persist wishlist and bag locally; store selected variants as distinct bag lines.
- Support quantity changes, removal, stock limits, subtotal, and a transparent sample order summary.
- Provide useful empty states and recover safely from invalid or stale local data.
- Build validated customer/address entry, delivery selection, order review, and an explicit simulated payment step. Do not collect real card or banking credentials.
- Generate a demo order only on successful completion; avoid duplicate orders from repeated clicks.
- Build demo sign-in, profile, saved addresses, order history, order details, and order tracking, using a clearly designated demo customer rather than real credentials or OTP delivery.
- Add a demo reset action and a simple documented way to repopulate presentation data.

### Completion check

- A visitor can complete browse → product → wishlist/bag → checkout → confirmation → order details.
- Totals remain consistent across bag, checkout, and order records.
- Refreshing preserves the intended local state; reset restores a predictable demo.
- No customer action misleadingly claims a real payment, login message, or placed order.

## 9. Phase 7 — Brand, consultation, and support pages

### Work

- Complete the brand story, Piyusha's curation page, boutique information, contact, consultation, jewellery care, size guide, FAQs, and policy templates.
- Consultation captures occasion, interests, preferred date, and preferred contact method, with validation and a local demo confirmation.
- Use verified public contact/location information when available. A simulated appointment is not represented as a confirmed booking with the boutique.
- Policies are complete demonstration templates identified for client review; do not silently invent business promises.
- Ensure footer and service links never terminate in unfinished pages.

### Completion check

- Every route in the inventory has a deliberate, complete view.
- Supporting pages share the same typography, navigation, and responsive quality as shopping pages.

## 10. Phase 8 — Motion refinement and responsive polish

Motion is introduced during component development and refined here; it is not deferred entirely until the end.

| Area                  | Intended behaviour                                                           |
| --------------------- | ---------------------------------------------------------------------------- |
| Hero                  | One controlled image/text entrance; immediately available navigation and CTA |
| Editorial imagery     | Gentle reveal and at most one signature scroll-driven sequence               |
| Product cards         | Small image transition or alternate view; visible touch actions              |
| Buttons and links     | Brief colour, underline, or position response, including focus states        |
| Menus, filters, bag   | Consistent entry/exit transitions and reliable focus restoration             |
| Wishlist/bag updates  | Immediate, restrained visual feedback and accessible announcement            |
| Mobile/reduced motion | Simplified movement; equivalent content and functionality                    |

Use CSS for simple states, GSAP for editorial sequences, and Motion for component transitions. Never let two animation systems control the same property on the same element. Clean up route-specific animations on navigation. Preserve natural scrolling and avoid decorative delays in checkout.

### Completion check

- Check representative widths: 360, 390, 430, 768, 1024, 1440, and 1920 pixels, including landscape where useful.
- Check text wrapping, menu overflow, sticky elements, mobile safe areas, and readable contrast.
- No essential hover-only action, accidental horizontal page scrolling, or obstructed checkout button.
- Reduced-motion users receive a complete, readable experience.

## 11. Phase 9 — Verification, packaging, and presentation

### Work

- Run TypeScript checks and the production build.
- Test meaningful behaviour: filter combinations, variant identity, quantity limits, totals, validation, persistence recovery, and demo order creation.
- Exercise the full shopping journey, consultation journey, empty states, unknown routes, deep links, browser back/forward, and refresh.
- Inspect keyboard navigation, focus trapping/restoration, accessible labels, status announcements, and reduced motion.
- Visually review representative pages on mobile and desktop; fix visible failures before expanding test coverage.
- Audit browser console errors, missing assets, layout shifts, image sizes, and heavy animation. Record measured results and any unavailable browser coverage rather than claiming universal verification.
- Produce `docs/demo-guide.md`: start/build instructions, presentation sequence, sample products, reset instructions, and frontend-only limitations.
- Prepare the built frontend and working local preview. When using Sites hosting for the review link, follow its static-site packaging workflow and preserve the private default audience.

### Completion check

- All planned routes are implemented; navigation has no dead ends.
- Shopping and consultation journeys pass in the supported test environment.
- The production build succeeds and the demo starts using documented commands.
- A client can review the responsive storefront using the provided local or verified hosted preview.
- Outstanding limitations are specifically documented.

## 12. Customer page inventory

Shared templates intentionally serve multiple categories and collections; they still produce distinct URLs and relevant content.

| Route                     | Page and required behaviour                                |
| ------------------------- | ---------------------------------------------------------- |
| `/`                       | Editorial homepage and collection entry points             |
| `/shop`                   | All jewellery; filters, sorting, result count              |
| `/shop/:category`         | Relevant category content and products                     |
| `/collections`            | Collection directory                                       |
| `/collections/:slug`      | Editorial collection with shoppable pieces                 |
| `/bridal`                 | Bridal story, relevant pieces, consultation entry          |
| `/gifting`                | Discovery by occasion, recipient, and budget               |
| `/search?q=...`           | Search results, clear query, no-result suggestions         |
| `/products/:slug`         | Gallery, specifications, variants, purchase/enquiry action |
| `/wishlist`               | Saved pieces, removal, move to bag where applicable        |
| `/cart`                   | Editable bag, totals, checkout entry                       |
| `/checkout`               | Validated multi-step simulated checkout                    |
| `/order-confirmation/:id` | Local demo order confirmation                              |
| `/account/sign-in`        | Explicit demo account entry                                |
| `/account`                | Demo profile and account overview                          |
| `/account/addresses`      | Locally editable demo addresses                            |
| `/account/orders`         | Local demo order history                                   |
| `/account/orders/:id`     | Order details and simulated tracking                       |
| `/our-story`              | Ornate story and brand positioning                         |
| `/piyushas-edit`          | Personal curation and selected pieces                      |
| `/visit-us`               | Verified boutique details and appointment entry            |
| `/consultation`           | Validated demo consultation request                        |
| `/contact`                | Contact options and simulated enquiry form                 |
| `/care-guide`             | Jewellery care guidance                                    |
| `/size-guide`             | Ring/bangle guidance and measuring instructions            |
| `/faqs`                   | Searchable or grouped service questions                    |
| `/policies/:slug`         | Shipping, returns, privacy, and terms templates            |
| `*`                       | Useful not-found page with shopping recovery links         |

## 13. Presentation milestones and progress tracking

1. **Foundation ready:** skills/dependencies documented, route shell and catalogue model established.
2. **Visual direction tangible:** polished homepage and one product page at mobile and desktop widths.
3. **Shopping complete:** discovery, product selection, wishlist, bag, checkout, and order history connected.
4. **Storefront complete:** brand, consultation, account, and service pages implemented.
5. **Presentation ready:** motion refined, responsive QA complete, build passing, demo guide and preview available.

Track phases as `pending`, `in progress`, `verified`, or `blocked`, with concrete evidence. Phase completion means its checks passed, not just its files were created. Continue through implementation without introducing routine approval gates; seek clarification only for a material unresolved decision.

## 14. Primary implementation risks and responses

- **Insufficient product assets:** establish the image register early; use a smaller coherent catalogue rather than inconsistent cards or invented brand products.
- **Unverified brand or policy details:** retain identified sample content and an assumptions register.
- **Motion hurting usability:** keep it bounded, clean it up on route changes, and test simplified mobile/reduced-motion variants.
- **Demo state becoming confusing:** provide predictable seed data, local persistence, and reset.
- **A polished homepage masking incomplete pages:** use the route manifest and full-journey completion checks throughout.
- **Future backend changes causing rework:** separate catalogue, customer, and order services from page composition; define typed interfaces without building an unnecessary server now.

## Sources for planned tooling

- Vite: https://vite.dev/guide/
- React Router: https://reactrouter.com/start/declarative/installation
- Motion: https://motion.dev/docs/react
- GSAP: https://gsap.com/docs/v3/
- Skill sources are listed in Phase 2; exact installation revisions will be recorded when installed.

## Admin frontend delivery

The `/admin/*` workspace now contains overview, catalogue, collection, inventory, order, customer, consultation, content, media, discount, analytics and settings routes. Forms and transitions operate on versioned browser-local demo state. Same-browser customer orders and consultation requests import into admin records. Backend integration, secure staff identity and real store publishing remain follow-on work. See `docs/admin-design.md`, `docs/admin-demo-guide.md` and the verification notes.

## Account entry delivery

Customer sign-in, registration, simulated password recovery and admin login routes are connected to role-separated browser sessions. Both areas have sign-out and frontend route gates with safe return destinations. Guest checkout remains available with a sign-in entry and identity-matched saved details. These are presentation flows; server authentication, email/OTP delivery and authorization remain backend work.
