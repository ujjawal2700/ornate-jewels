import { useState } from "react";
import {
  Link,
  useParams,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import { SlidersHorizontal, X, Search, ArrowUpRight } from "lucide-react";
import {
  products,
  categories,
  collections,
  filterProducts,
  money,
} from "./data";
import {
  ProductGrid,
  PageIntro,
  Breadcrumb,
  Modal,
  EmptyState,
  ButtonLink,
} from "./components";
export default function Catalog() {
  const { category, slug } = useParams();
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const [filterOpen, setFilterOpen] = useState(false);
  const [search, setSearch] = useState(params.get("q") || "");
  const isSearch = location.pathname === "/search";
  const isGifting = location.pathname === "/gifting";
  const collection = collections.find((c) => c.slug === slug);
  if (slug && !collection)
    return (
      <EmptyState
        title="This collection is still a story to be told."
        description="Discover our current edits instead."
        to="/collections"
        action="Explore collections"
      />
    );
  if (
    category &&
    !categories.some((c) => c.name.toLowerCase() === category.toLowerCase())
  )
    return (
      <EmptyState
        title="Let’s find you another piece."
        description="This category is not part of our current edit."
      />
    );
  const cat = category
    ? categories.find((c) => c.name.toLowerCase() === category.toLowerCase())
        ?.name
    : params.get("category") || "";
  const opts = {
    q: params.get("q") || "",
    category: cat,
    material: params.get("material") || "",
    budget: params.get("budget") || "",
    sort: params.get("sort") || "",
    collection: collection?.name,
    available: params.get("available") === "true",
  };
  const items = filterProducts(products, opts);
  const update = (key: string, value: string) =>
    setParams((old) => {
      const next = new URLSearchParams(old);
      if (value) next.set(key, value);
      else next.delete(key);
      return next;
    });
  const title = isSearch
    ? opts.q
      ? `Results for “${opts.q}”`
      : "Find your next favourite"
    : isGifting
      ? "A little gesture. A lasting feeling."
      : collection?.name || cat || "Jewellery, with a little more meaning.";
  const desc = isGifting
    ? "For the people who make your world a little brighter. Discover a thoughtful gift, chosen with love."
    : collection?.description ||
      "Discover gold, diamonds, polki, and the pieces that feel like they were waiting just for you.";
  const filterFields = (
    <div className="filter-fields">
      {!category && (
        <label>
          Jewellery type
          <select
            value={opts.category}
            onChange={(e) => update("category", e.target.value)}
          >
            <option value="">All jewellery</option>
            {categories.map((c) => (
              <option key={c.name}>{c.name}</option>
            ))}
          </select>
        </label>
      )}
      <label>
        Material edit
        <select
          value={opts.material}
          onChange={(e) => update("material", e.target.value)}
        >
          <option value="">All materials</option>
          {["Gold", "Diamond", "Polki", "Kundan"].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </label>
      <label>
        Explore by budget
        <select
          value={opts.budget}
          onChange={(e) => update("budget", e.target.value)}
        >
          <option value="">Any budget</option>
          {[30000, 50000, 100000, 200000].map((v) => (
            <option key={v} value={v}>
              Under {money(v)}
            </option>
          ))}
        </select>
      </label>
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={opts.available}
          onChange={(e) => update("available", e.target.checked ? "true" : "")}
        />{" "}
        Available pieces only
      </label>
    </div>
  );
  const clear = () =>
    setParams((old) => {
      const next = new URLSearchParams();
      if (old.get("q")) next.set("q", old.get("q")!);
      return next;
    });
  const active = [
    opts.material,
    opts.budget && "Under " + money(Number(opts.budget)),
    !category && opts.category,
    opts.available && "Available only",
  ].filter(Boolean);
  return (
    <>
      <Breadcrumb
        items={[
          {
            label: collection ? "Collections" : "Shop",
            to: collection ? "/collections" : "/shop",
          },
          {
            label:
              collection?.name ||
              cat ||
              (isGifting ? "Gifting" : isSearch ? "Search" : "All jewellery"),
          },
        ]}
      />
      {collection ? (
        <section className="collection-hero container">
          <div>
            <p className="eyebrow">The Ornate collections</p>
            <h1>{title}</h1>
            <p>{desc}</p>
          </div>
          <img src={"/assets/" + collection.image} alt={collection.name} />
        </section>
      ) : isSearch ? (
        <PageIntro eyebrow="Discover Ornate" title={title} description={desc} />
      ) : (
        <section
          className={`catalog-editorial container ${isGifting ? "is-gifting" : ""}`}
        >
          <div className="catalog-editorial-copy">
            <span className="chapter-marker">
              {isGifting
                ? "A beautiful way to say it"
                : cat
                  ? "The Ornate edit / " + cat
                  : "The pieces. The possibilities."}
            </span>
            <h1>
              {isGifting ? (
                <>
                  Some feelings
                  <br />
                  deserve a little gold.
                </>
              ) : (
                cat || (
                  <>
                    Something
                    <br />
                    will speak to you.
                  </>
                )
              )}
            </h1>
            <p>{desc}</p>
            <span className="catalog-editorial-note">
              {isGifting
                ? "For them. From the heart."
                : "Gold. Diamonds. A point of view that is yours."}
            </span>
          </div>
          <div className="catalog-editorial-image">
            <img
              src={
                isGifting
                  ? "/assets/favourite-danglers.jpg"
                  : category
                    ? "/assets/" +
                      (categories.find(
                        (c) => c.name.toLowerCase() === category.toLowerCase(),
                      )?.image || "spotlight-diamond.jpg")
                    : "/assets/spotlight-diamond.jpg"
              }
              alt={
                isGifting
                  ? "A pair of beautiful polki earrings, ready to become a meaningful gift"
                  : cat
                    ? cat + " from the Ornate edit"
                    : "A closer look at the contemporary Ornate jewellery edit"
              }
              width="550"
              height="650"
            />
            <span aria-hidden="true">
              {isGifting ? "with love." : "The edit."}
            </span>
          </div>
        </section>
      )}
      {isGifting && (
        <div className="container gift-filters">
          <span>Find a gift for</span>
          {["Birthday", "Anniversary", "Just because"].map((x, i) => (
            <button
              key={x}
              className={`chip ${params.get("occasion") === x ? "selected" : ""}`}
              onClick={() => {
                update("occasion", x);
                update(
                  "budget",
                  i === 0 ? "50000" : i === 1 ? "100000" : "30000",
                );
              }}
            >
              {x}
            </button>
          ))}
        </div>
      )}
      {isSearch && (
        <form
          className="container catalog-search"
          onSubmit={(e) => {
            e.preventDefault();
            update("q", search);
          }}
        >
          <Search size={20} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search catalogue"
            placeholder="Search for a piece, material, or category"
          />
          <button className="button">Search</button>
        </form>
      )}
      <section className="container catalog-section">
        <div className="catalog-toolbar">
          <button className="filter-toggle" onClick={() => setFilterOpen(true)}>
            <SlidersHorizontal size={17} /> Filters{" "}
            {active.length > 0 && `(${active.length})`}
          </button>
          <span className="result-count">
            {items.length} beautiful {items.length === 1 ? "piece" : "pieces"}
          </span>
          <label className="sort-label">
            Sort by
            <select
              aria-label="Sort products"
              value={opts.sort}
              onChange={(e) => update("sort", e.target.value)}
            >
              <option value="">Our favourites</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </label>
        </div>
        <div className="catalog-body">
          <aside className="desktop-filters">
            <h2>Refine your edit</h2>
            {filterFields}
            {active.length > 0 && (
              <button className="text-link" onClick={clear}>
                Clear all filters <X size={13} />
              </button>
            )}
          </aside>
          <div className="catalog-results">
            {active.length > 0 && (
              <div className="active-filters">
                {active.map((x) => (
                  <span className="chip" key={String(x)}>
                    {x}
                  </span>
                ))}
                <button onClick={clear}>Clear all</button>
              </div>
            )}
            {items.length ? (
              <ProductGrid items={items} />
            ) : (
              <div className="empty-state">
                <Search size={32} />
                <h2>A different direction, perhaps?</h2>
                <p>
                  Try another search or clear your filters to discover more
                  pieces.
                </p>
                <button
                  className="button"
                  onClick={() => {
                    setParams({});
                    setSearch("");
                  }}
                >
                  Explore all pieces
                </button>
              </div>
            )}
            <p className="catalogue-note">
              A curated demo catalogue. Names, specifications, and prices are
              illustrative.
            </p>
          </div>
        </div>
      </section>
      <Modal
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Refine your edit"
        side
      >
        {filterFields}
        <button className="button full" onClick={() => setFilterOpen(false)}>
          View {items.length} pieces
        </button>
        <button className="text-link" onClick={clear}>
          Clear filters
        </button>
      </Modal>
    </>
  );
}
