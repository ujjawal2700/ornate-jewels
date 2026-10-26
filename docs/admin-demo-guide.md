# Presenting Ornate Studio

Open `/admin` on the local preview URL. It redirects to `/admin/login`. Select **Fill demo credentials**, then **Sign in to studio**. Demo credentials: `studio@ornate.example` / `OrnateAdmin123!`. This is a frontend session flow, not secured staff authentication.

## Suggested walkthrough

1. **Overview:** show paid order value, orders, the sales chart and attention items. Switch between 7, 30 and 90 days. Reporting ends 25 October 2026 so seeded figures remain reproducible. Select **View data** for exact daily values.
2. **Products:** search `ORN-003`, edit the piece's description or price, save, and reload to show persistence. Add a product with a unique SKU and choose a media-library image. Select products and archive them; restore through the Archived filter and status editor.
3. **Inventory:** search a piece, choose **Adjust stock**, enter a new quantity and a reason. The overview and notifications reflect the new low-stock counts.
4. **Orders:** open `ORN-1044`. Choose Shipped, record the demo payment as Paid and enter `DEMO-TRACK-44`. Save. The dialog blocks shipping without both payment and tracking. Customer address, pieces, totals, notes and record activity are visible together. No payment or shipping service is contacted.
5. **Customers:** open a profile, review its order history and save a preference note or VIP segment. History links open the relevant order.
6. **Consultations:** manage a request, adjust its proposed appointment time in IST, add a note and change its status. Customer storefront requests from this browser import here; a proposed 11:00 time is clearly noted for date-only requests.
7. **Storefront content:** edit a banner headline and show the live preview, then save it. Edit brand/policy copy through Pages. Explain that these edits stay in the admin demo and do not publish to the storefront.
8. **Media library:** upload a JPEG, PNG or WebP (maximum 1 MB each; up to five at once), edit its alt text, then choose it in a product or banner editor. Unused uploaded images can be removed; images used by records are protected from removal. The library has a small local-storage limit.
9. **Discounts:** create `ORNATE10`, choose Percentage, enter 10, set a minimum order and expiry. Duplicate codes and percentages above 100 are rejected. These records do not affect customer checkout.
10. **Analytics and settings:** show product performance, paid order value by city and CSV exports. Adjust the low-stock threshold and notification preferences. Contact and delivery settings are saved locally.

## Reset

Settings → Demo workspace → Reset admin demo. Type `RESET` and confirm. This restores seeded admin records and removes admin uploads. Customer shopping data is kept. Customer demo orders and requests will import again on the next admin visit.

## Frontend boundary

- Changes persist on this browser only; use fictional customer information for the pitch.
- Admin catalogue/content changes are independent of storefront seed data.
- No staff authentication, permission enforcement, API calls, live inventory reservation, payment, refund, dispatch, email or publishing service is implemented.
- Order fulfilment does not automatically reserve/release stock. Use inventory adjustments for the demonstration; a future backend must handle transactional stock and order rules.
- Paid order value includes delivery charges and excludes pending payments and cancelled orders. Tax, returns, conversion and acquisition attribution are not simulated.
- The provider and typed data model are the future API integration boundary. The Express/Mongoose scaffold is unchanged.
