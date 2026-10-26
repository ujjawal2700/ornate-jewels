# Asset register

## Brand photography

Local files in `frontend/public/assets/` with original JPG/PNG names were downloaded from `https://ornatejewels.in/images/` for this client presentation. They are retained with source names. Their use in this concept does not establish rights for unrelated commercial publication.

- Product: `section-necklace-{1,2,3}.jpg`, `favourite-danglers.jpg`, `favourite-bracelet.jpg`, `favourite-heritage-set.jpg`, `favourite-bangle.jpg`.
- Editorial: `spotlight-gold.jpg`, `spotlight-diamond.jpg`, `sparkle-up-close.jpg`, `personalised-heirloom.jpg`, `popup-jewellery-model.jpg`.
- Curator portrait: `piyusha-nyati.jpg`.
- Original brand artwork: `footer-logo.png` is the complete logo used across storefront and admin. `logo-ring.png` supplies the favicon and symbol-only placements. On dark surfaces, a CSS layer reverses only the original lettering to white while preserving the orange ring. `brand-mark.png`, `hero-slider.jpg` and `hero-slider-2.jpg` remain reference assets.

Repeated photographs in the small demo catalogue illustrate alternate sample listings; they are not evidence of distinct actual SKUs. Names, collection assignments, specifications, prices and availability are concept data. Product metadata clearly identifies this.

## Original campaign

`frontend/public/assets/campaign.webp` was generated with the built-in ImageGen tool, then encoded as WebP for delivery. It is a concept fashion campaign, not a verified Ornate product or a photograph of a real customer.

Final generation prompt:

> Use case: ads-marketing. Create a photorealistic luxury Indian fine jewellery campaign photograph, wide landscape 3:2 composition, no text or logo. A beautiful Indian woman about 30 wearing a sculptural antique gold polki and emerald necklace and matching small earrings, ivory silk sari, sleek dark hair, quiet confident expression, upper torso portrait on the RIGHT TWO THIRDS of the frame. Left third is softly shadowed warm sand beige architectural wall with generous negative space for dark website headline. Sunlit Rajasthan palace interior, rich ochre shadows, restrained emerald details, tactile matte sandstone, warm golden late afternoon light. Sophisticated magazine art direction, realistic skin texture and intricate jewellery, medium format fashion editorial, warm cream and sand palette. Not wedding costume, not kitsch, not illustration. Hero for premium boutique jewellery storefront.

## Typography

`display.ttf` and `display-italic.ttf`: Cormorant Garamond. `body.ttf`: Manrope. Downloaded through Google Fonts; both families are distributed under the SIL Open Font License. License texts are retained under `frontend/public/licenses/`.

## Skills

Downloaded using Skill Installer with Git transport because the local Python trust store could not verify the download certificate. Certificate checking was not disabled.

- Anthropic `frontend-design` from `anthropics/skills`.
- GreenSock `gsap-core`, `gsap-scrolltrigger`, and `gsap-react` from `greensock/gsap-skills`.
- Vercel `web-design-guidelines` from `vercel-labs/agent-skills`.

Sources and instructions are retained in `.agents/skills/`. These are available for discovery on subsequent turns. The implementation references the downloaded guidance and uses the available ImageGen/Sites workflows.

## Curated Instagram media

The following assets were retrieved from the public profile/embed pages of `@ornatejewels.kota`. Each post's owner was verified as that account. Full photo files were taken from individual public embeds, rather than cropped profile-grid thumbnails. Original files and their embedded branding were preserved; display uses natural aspect ratios and no image zoom.

| Local asset in `assets/instagram/`             | Original post                               | Use                                          |
| ---------------------------------------------- | ------------------------------------------- | -------------------------------------------- |
| `green-heirloom.jpg`                           | https://www.instagram.com/p/Devxa6jDFTM/    | Model campaign feature and full-image viewer |
| `gold-bangle.jpg`                              | https://www.instagram.com/p/De3tPrnDtII/    | Product photograph                           |
| `heritage-pendant.jpg`                         | https://www.instagram.com/p/Deqni7YgIWM/    | Product photograph                           |
| `pearl-detail.jpg`, `pearl-detail.mp4`         | https://www.instagram.com/reel/De6PWa4N8-I/ | Necklace reel and original poster            |
| `mint-bridal.jpg`, `mint-bridal.mp4`           | https://www.instagram.com/reel/De1WZAzqc1c/ | Bridal necklace reel and original poster     |
| `boutique-reel-cover.jpg`, `boutique-reel.mp4` | https://www.instagram.com/reel/DYWxTWQxv0f/ | Team/boutique reel and original poster       |

These are a curated snapshot, not a live or auto-updating feed. Media is served locally so the pitch does not depend on expiring Instagram CDN URLs or a widget. Videos are inserted only after a visitor opens a reel, use native controls and begin muted; closing the viewer pauses and removes the player. All entries retain original-post links and profile attribution. The photographs/reels are not mapped to sample catalogue SKUs or prices.

Ornate's existing public site contains an Elfsight feed reference; its public widget response reported `WIDGET_DISABLED`. That widget was not embedded or bypassed. No Instagram login, private feed access or account token was used to obtain assets. Media from other creators and the similarly named `ornatefinejewellery` account was excluded. Confirm media reuse and music clearance with the brand for a commercial launch; this remains their client presentation demo.
