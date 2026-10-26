export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  collection: string;
  material: string;
  price: number;
  image: string;
  description: string;
  variants: string[];
  stock: number;
  tag?: string;
  purchasable: boolean;
};
const p = (
  id: string,
  name: string,
  category: string,
  collection: string,
  material: string,
  price: number,
  image: string,
  description: string,
  tag?: string,
): Product => ({
  id,
  slug: id,
  name,
  category,
  collection,
  material,
  price,
  image: "/assets/" + image,
  description,
  variants:
    category === "Bangles"
      ? ["2.4", "2.6", "2.8"]
      : category === "Necklaces" || category === "Sets"
        ? ["Standard length", "Long length"]
        : ["One size"],
  stock: id === "rose-drops" ? 0 : 5,
  tag,
  purchasable: id !== "royal-polki",
});
export const products: Product[] = [
  p(
    "emerald-muse",
    "The Emerald Muse",
    "Necklaces",
    "The Modern Muse",
    "Diamond",
    78500,
    "section-necklace-1.jpg",
    "A striking green centre meets a delicate trail of light. For evenings that call for a little more presence.",
    "Piyusha’s pick",
  ),
  p(
    "gulabi-drops",
    "Gulabi Chand Earrings",
    "Earrings",
    "The Heritage Edit",
    "Polki",
    28500,
    "favourite-danglers.jpg",
    "Deep ruby tones, intricate gold detailing, and a graceful silhouette. A celebration in every movement.",
    "Bestseller",
  ),
  p(
    "sunehri-kada",
    "Sunehri Heritage Kada",
    "Bangles",
    "The Heritage Edit",
    "Gold",
    46500,
    "favourite-bangle.jpg",
    "Sculptural gold tones and floral detailing bring a timeless form into the everyday.",
    "The heritage edit",
  ),
  p(
    "emerald-embrace",
    "Emerald Embrace Bracelet",
    "Bracelets",
    "The Modern Muse",
    "Diamond",
    38500,
    "favourite-bracelet.jpg",
    "A beautifully considered bracelet, punctuated by a vivid green centre. Quietly expressive, effortlessly yours.",
    "New arrival",
  ),
  p(
    "royal-polki",
    "The Maharani Polki Set",
    "Sets",
    "The Bridal Room",
    "Polki",
    185000,
    "favourite-heritage-set.jpg",
    "An intricate composition of luminous polki and deep green accents. A piece to plan your celebration around.",
    "By consultation",
  ),
  p(
    "gulmohar-choker",
    "Gulmohar Statement Choker",
    "Necklaces",
    "The Heritage Edit",
    "Kundan",
    92000,
    "section-necklace-3.jpg",
    "A richly detailed choker with delicate droplets, composed for the occasions you will always remember.",
    "Signature piece",
  ),
  p(
    "surya-haar",
    "Surya Celebration Haar",
    "Sets",
    "The Bridal Room",
    "Gold",
    128000,
    "section-necklace-2.jpg",
    "Warm gold tones and intricate layers create a joyful statement. Discover the beauty in every small detail.",
  ),
  p(
    "noor-pendant",
    "Noor Emerald Pendant",
    "Necklaces",
    "The Modern Muse",
    "Diamond",
    32500,
    "sparkle-up-close.jpg",
    "A beautiful green centre, framed in light. The finishing touch that makes a simple outfit feel entirely your own.",
    "Piyusha’s pick",
  ),
  p(
    "rose-drops",
    "The Gulabi Pair",
    "Earrings",
    "The Heritage Edit",
    "Polki",
    24500,
    "favourite-danglers.jpg",
    "A romantic interpretation of a much-loved silhouette, with ruby tones and delicate pearl-like accents.",
    "Currently unavailable",
  ),
  p(
    "meher-necklace",
    "Meher Diamond Necklace",
    "Necklaces",
    "The Modern Muse",
    "Diamond",
    112000,
    "spotlight-diamond.jpg",
    "An elegant neckline of light and rich green detail. Discover the piece that becomes part of your story.",
  ),
  p(
    "aangan-set",
    "The Aangan Bridal Edit",
    "Sets",
    "The Bridal Room",
    "Kundan",
    165000,
    "spotlight-gold.jpg",
    "Heritage-inspired detailing with a contemporary sense of ease. A starting point for your bridal jewellery story.",
  ),
  p(
    "saanjh-cuff",
    "Saanjh Gold Cuff",
    "Bangles",
    "The Heritage Edit",
    "Gold",
    56500,
    "favourite-bangle.jpg",
    "A warm, beautifully detailed cuff to wear through the celebrations and long after them.",
  ),
];
export const categories = [
  { name: "Necklaces", image: "section-necklace-1.jpg" },
  { name: "Earrings", image: "favourite-danglers.jpg" },
  { name: "Bangles", image: "favourite-bangle.jpg" },
  { name: "Bracelets", image: "favourite-bracelet.jpg" },
  { name: "Sets", image: "favourite-heritage-set.jpg" },
];
export const collections = [
  {
    slug: "heritage",
    name: "The Heritage Edit",
    subtitle: "Traditions, beautifully reimagined.",
    image: "favourite-heritage-set.jpg",
    description:
      "Polki, kundan and intricate gold-inspired forms. Discover pieces that carry a sense of where we come from, and the way we celebrate today.",
  },
  {
    slug: "modern-muse",
    name: "The Modern Muse",
    subtitle: "A little extraordinary. Every day.",
    image: "spotlight-diamond.jpg",
    description:
      "Clean silhouettes, luminous details, and rich green accents. A considered edit for the way you live, dress, and make a moment your own.",
  },
  {
    slug: "bridal",
    name: "The Bridal Room",
    subtitle: "For your once-in-a-lifetime kind of love.",
    image: "spotlight-gold.jpg",
    description:
      "Begin your bridal story with jewellery that feels like you. Explore statement pieces and discover a personal, unhurried approach to choosing them.",
  },
];
export const money = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
export function filterProducts(
  items: Product[],
  opts: {
    q?: string;
    category?: string;
    material?: string;
    budget?: string;
    sort?: string;
    collection?: string;
    available?: boolean;
  },
) {
  let result = items.filter(
    (p) =>
      (!opts.q ||
        `${p.name} ${p.category} ${p.material} ${p.collection}`
          .toLowerCase()
          .includes(opts.q.toLowerCase())) &&
      (!opts.category ||
        p.category.toLowerCase() === opts.category.toLowerCase()) &&
      (!opts.material || p.material === opts.material) &&
      (!opts.budget || p.price <= Number(opts.budget)) &&
      (!opts.collection || p.collection === opts.collection) &&
      (!opts.available || p.stock > 0),
  );
  if (opts.sort === "price-asc")
    result = [...result].sort((a, b) => a.price - b.price);
  if (opts.sort === "price-desc")
    result = [...result].sort((a, b) => b.price - a.price);
  if (opts.sort === "name")
    result = [...result].sort((a, b) => a.name.localeCompare(b.name));
  return result;
}
