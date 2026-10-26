# Presenting The Ornate Edit

## Five-minute walkthrough

1. Begin at `/`. Let the campaign headline settle, then scroll into the manifesto. On a tall desktop, continue slowly through the pinned gold, polki and diamond chapters. On mobile, tap the chapter tabs instead. Show the collection gallery, curated pieces, Piyusha’s edit and boutique invitation.
2. Open **Explore** to present the full-screen navigation, expandable jewellery categories and editorial imagery.
3. Open `/shop`. Filter by Gold or a category, change the price sort, then show the search overlay. Filters and sorting are reflected in the URL.
4. Open `/products/sunehri-kada`. Choose size 2.6, save the piece to the wishlist, and add it to the bag. Show quantity changes in the bag drawer.
5. Continue to checkout with sample details: Demo Customer, demo@example.com, 9876543210, 12 Demo Lane, Kota, Rajasthan, 324005. Select standard or priority delivery, review, and confirm the demo order. No payment details are required.
6. Open the order from the confirmation screen, then the demo account. Show the saved order, address, and wishlist.
7. Open the bridal room and consultation page. Submit a sample request, showing how personal guidance can complement direct purchases.

## Reset

Open the demo account and select **Reset demo data**, then confirm. This clears the local shopping state. For a completely clean browser, including sample consultation requests, clear site data. Private windows start clean and discard data when closed.

## What to explain accurately

- This is the customer frontend of a MERN project. Express and Mongoose scaffolding are present; the admin frontend is available at `/admin`, while live commerce endpoints remain future work.
- Products, pricing, specifications, policies, and stock are illustrative. Product photos come from the brand's public site for this pitch. The opening campaign is an original AI-generated concept.
- The customer profile is a local demonstration identity, not secure sign-in.
- Checkout and consultation confirmations do not send orders or messages to Ornate.
- Visit/contact details reflect the public site; confirm boutique address and opening hours directly.

## Preview

Run `npm run dev` and use the printed Local URL. The production build is in `dist/` and needs a static host with SPA history fallback. A private Sites deployment, when available, hosts only the static React frontend; the MERN backend remains a separate service for later development.

## Customer account walkthrough

Open `/account/sign-up`, use fictional details and a made-up password of at least eight characters including a letter and number, confirm it, and create the demo account. Sign out, then sign in with the same details. The sample customer is `diya@example.com` / `OrnateDemo123!`.

Open **Forgot password?**, enter a registered demo email, copy the code displayed on screen, verify it and choose a new demo password. No email or SMS is sent. Password reset changes that local demo verifier. Sign in with the updated password.

Account pages and admin pages have separate demo sessions. Direct account links retain their destination through sign-in; checkout has a sign-in link and remains accessible to guests. Admin starts at `/admin/login`.

## Instagram walkthrough

On home, scroll to **A closer kind of beautiful** (or use `/#ornate-on-instagram`). Show the original model campaign image and open it full-frame. Continue to **Worth a second look**, filter Reels and play a product-detail video. Native controls can enable audio; closing the dialog stops playback. Filter Photographs to show original product photography without cropping embedded branding. Each item links to its original Instagram post; the follow CTA, menu and footer link to `@ornatejewels.kota`.

The gallery is curated. It does not auto-sync, auto-follow users, submit comments or claim current follower counts. Similar-style shopping links lead to catalogue categories, rather than claiming an exact Instagram piece matches a sample SKU.

## Trending edit walkthrough

On home, scroll past the collection gallery to **The trending edit**. Watch the foreground piece leave to the right while the remaining pieces advance in size and position. The product panel settles on the new foreground piece. Use Previous to reverse the procession and Pause autoplay to hold a piece. Focus or hover inside the showcase pauses automatic advances; explicit pause remains until Play is selected.

On mobile, the panel stacks below the stage. Swipe horizontally across the display or use the buttons; normal vertical page scrolling remains available. Reduced-motion preferences disable autoplay and use immediate manual changes. Save the featured piece to the wishlist, or choose the product to continue through the existing size/fit and bag flow.

The edit uses sample catalogue metadata and the existing rectangular brand photographs. It is not a live sales-ranked list, and the imagery is not a transparent cutout collection.
