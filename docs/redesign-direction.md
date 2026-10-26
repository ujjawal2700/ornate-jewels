# The Ornate Chapters — creative redesign

The first version put too much emphasis on a conventional catalogue layout: three-row navigation, an image-and-copy hero, evenly sized grids, and a plain mobile link list. This iteration makes the brand experience distinctive while retaining the shopping journey.

## Visual system

- Oxblood `#381d26`: navigation, intimate editorial moments, closing invitation.
- Parchment `#f4efe6`: galleries and readable commerce surfaces.
- Antique gold `#b89b70`: quiet highlights and fine details.
- Ink `#30232a`: reading and product content.
- Rose stone `#d8c5b8`: intermediate editorial surfaces.

Cormorant Garamond carries large, sculptural display typography. Manrope carries controls and useful detail. Headlines are treated as complete typographic compositions rather than an italic word pasted into a template.

## Narrative

First glance (immersive campaign) → The meaning (scroll-lit manifesto) → The craft (three material chapters) → Your chapter (collection gallery) → Your piece (shoppable edit) → A personal eye (Piyusha) → An invitation (boutique/consultation).

The story moves between portrait and object, close detail and open space. Product browsing remains easy to find at every stage.

## Motion

- Masked, staggered headline entrance and an image settling into frame.
- Hero image parallax and copy receding with scroll.
- Word-by-word illumination of the manifesto.
- Desktop pinned craft story with image changes tied to the selected chapter. Mobile uses a shorter, natural-flow presentation with explicit chapter controls.
- Horizontally composed collection gallery; native scroll snapping on touch devices.
- Full-screen menu with orchestrated link reveals, a category accordion and an editorial preview.
- Animated drawers, interaction feedback, and short page entrances.
- Optional Lenis smoothing on desktop only; natural touch scroll and a static reduced-motion variant.

## Inspiration reviewed

- https://www.awwwards.com/sites/indigo-laboratory — jewellery framed as a series of tales; inspiration for narrative pacing, not a copied design.
- https://www.annapolishchuk.com/oberig — the boutique interpreted as a digital experience; inspiration for material-led art direction.
- https://mcp.21st.dev/@unlumen/components/motion-navigation-menu — coordinated menu state transitions; our navigation is built specifically for Ornate and does not copy a SaaS component style.

## Review against brief

The memorable device is the chapter progression, supported by an immersive campaign and a changing craft composition. This replaces repetitive eyebrow/heading/card sections. A compact shopping navigation, clear product actions and accessible mobile controls protect the commercial task. No sound, cursor replacement, or mandatory loading gate is added.

## Implementation notes

The homepage now has distinct chapter sections instead of the first version's repeating storefront rows. `Home.tsx` owns GSAP animation contexts and responsive pinning; `experience.tsx` owns optional desktop smoothing, route-scroll synchronization, and shared reveal behaviour. `Navigation.tsx` owns the modal menu and search. `studio.css` implements the new art direction while retaining the existing commerce layout foundations in `styles.css`.

Desktop pinning is limited to sufficiently tall, wide viewports with motion enabled. Short desktop windows and mobile retain normal document flow. The menu remains readable if animation frames pause in a background tab, uses a native modal dialog, focuses its close control on opening, and has a timed close fallback independent of Motion completion callbacks. Menu categories support direct links; material story tabs support arrow keys and explicit selected states.

The design takes interaction and pacing inspiration from the linked sources. No 21st.dev component source or third-party design has been copied into the project.
