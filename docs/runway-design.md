# The trending edit — interactive runway

The homepage runway sits between the collection gallery and Instagram journal. It uses the page’s parchment background with no enclosing box, dark panel, decorative border or rail. Four photographs recede across a shallow diagonal on desktop, three on tablet and two on mobile. The enlarged ramp spans the full section width. Portrait 3:4 frames use subtle rounded corners and cover-fit crops. Product name, material, price and purchase/wishlist actions occupy a compact row below the ramp, stacking on mobile. Descriptions, per-image captions and the thumbnail index have been removed.

Every visible piece is a native button. Selecting a supporting piece advances it along the runway into the foreground. Arrow controls and swipe navigation reveal the rest of the edit. Hover lifts only the inner photograph, leaving the shared GSAP geometry intact. Focus outlines, keyboard activation and 44px control targets support accessible navigation.

A single GSAP progress tween drives position, scale and opacity for all unique products. Multi-piece selection traverses consecutive runway segments in one eased movement, lasting 0.9–1.35 seconds. No product is duplicated. Input locks during travel; the product name, price, wishlist state and product link update together on settlement. Swipe-generated clicks are briefly suppressed to prevent accidental second selection.

Autoplay waits for viewport presence, dwells for five seconds and pauses on hover, focus, touch interaction or document hiding. Explicit pause persists across manual navigation. Reduced-motion users start paused and select immediately. Responsive position presets preserve the selected product on resize. Observers, timers and GSAP animation are cleaned up on unmount.

The edit uses existing demo catalogue records. It makes no live sales-ranking claim and adds no backend service or dependency.
