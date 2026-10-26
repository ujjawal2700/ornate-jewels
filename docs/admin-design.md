# Ornate Studio — admin frontend

## Direction

A working jeweller's desk: clear stock, order and client information with the restraint of the Ornate brand. The storefront's campaign drama gives way to operational clarity here.

Palette: wine #381d26 for navigation and primary actions, porcelain #f6f7f9 for the workspace, white #ffffff for records, graphite #252631 for text, brass #9a793f for emphasis, sage #27735a for successful states. Manrope carries controls and data; Ornate Display is reserved for page titles. Branding uses the original supplied Ornate logo, with Studio as a separate descriptor.

Layout: a fixed desktop navigation rail, compact context bar and left-aligned workspace. On mobile, a modal navigation drawer replaces the rail and dense tables scroll within labelled regions. Detail drawers become full-width; form fields stack.

    Navigation | Context / search / storefront
               | Title + primary action
               | Summary / filters
               | Records              | Focused detail

The memorable element is the wine studio rail with a restrained brand signature. Charts communicate actual seeded demo calculations; decorative gradients, animated counters and competing card effects are omitted. Motion responds to opening a drawer or changing a page and respects reduced-motion preferences.

## Scope and phases

1. Isolate `/admin/*` from the storefront shell. Define typed, versioned browser-local state, seed records and reusable dialogs/tables/forms.
2. Build overview and analytics from demo order records. Build products, inventory and collections with editable records and recovery states.
3. Build order details, fulfilment transitions, customer records, consultation scheduling and discounts.
4. Build banner/page editors, local image library, settings, CSV exports and demo reset.
5. Verify meaningful state transitions, validation and persistence, production build and responsive browser checks where available.

## Boundary

Frontend only. No real staff authentication, live payment/refund, shipping, publishing, email, or database operations. Admin edits belong to an isolated demo workspace; existing customer storefront seed data stays independent. Real backend integration can later replace the local provider. Same-browser storefront orders and consultation requests are imported into admin lists as demo records. Demo access is clearly labelled; no simulated security claims.

## Account entry

Customer sign-in/sign-up use a jewellery image beside a clear form; recovery is a visible email → demo code → new-password sequence. Admin login uses the original logo and wine studio palette in a separate layout. Both sessions are frontend demo state; there is no public staff registration. Protected page destinations are retained through login.
