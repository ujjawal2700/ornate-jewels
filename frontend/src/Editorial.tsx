import { useState, type FormEvent } from "react";
import {
  Link,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  MapPin,
  Phone,
  Mail,
  Heart,
  Gem,
  Search,
  CalendarDays,
} from "lucide-react";
import {
  PageIntro,
  ButtonLink,
  TextLink,
  ProductGrid,
  EmptyState,
} from "./components";
import { products } from "./data";
import { useStore } from "./store";
export function Story() {
  return (
    <>
      <section className="story-hero container">
        <div>
          <p className="eyebrow">The heart of Ornate</p>
          <h1>
            Beautiful jewellery.
            <br />A more personal story.
          </h1>
          <p>
            Some pieces catch your eye. The right one feels like it has always
            belonged to you.
          </p>
          <TextLink to="/consultation">Let’s find yours</TextLink>
        </div>
        <img
          src="/assets/sparkle-up-close.jpg"
          alt="Emerald and diamond jewellery from the Ornate collection"
        />
      </section>
      <section className="reading-width section">
        <p className="eyebrow">Rooted in Kota. Inspired by you.</p>
        <h2>
          We have been different
          <br />
          from the very beginning.
        </h2>
        <p>
          From timeless diamonds to intricate polki and heritage kundan, Ornate
          brings together jewellery from across India and its celebrated craft
          traditions.
        </p>
        <p>
          Our approach begins with a conversation. Your taste, your budget, the
          occasion, the way you like to feel. Because the piece you choose
          should be more than beautiful. It should feel like yours.
        </p>
        <p>
          At the heart of that experience is Piyusha Nyati, whose eye for detail
          and thoughtful personal guidance shape the Ornate edit.
        </p>
      </section>
      <section className="piyusha-section container">
        <div className="piyusha-photo">
          <img
            className="owner-portrait"
            width={800}
            height={717}
            src="/assets/piyusha-nyati.jpg"
            alt="Piyusha Nyati"
          />
        </div>
        <div className="piyusha-copy">
          <p className="eyebrow">A belief we hold close</p>
          <h2>
            “Everyone deserves
            <br />
            something beautiful.”
          </h2>
          <p>
            Discover a considered approach to jewellery, with room for your own
            style, your own story, and a little unexpected delight.
          </p>
          <span className="signature">Piyusha</span>
          <ButtonLink to="/piyushas-edit" outline>
            Explore Piyusha’s edit
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
export function PiyushaEdit() {
  return (
    <>
      <section className="curator-hero container">
        <img
          className="owner-portrait"
          width={800}
          height={717}
          src="/assets/piyusha-nyati.jpg"
          alt="Piyusha Nyati at Ornate"
        />
        <div>
          <p className="eyebrow">A personal point of view</p>
          <h1>
            A good eye.
            <br />A little intuition.
            <br />A piece that’s you.
          </h1>
          <p>
            Meet Piyusha’s edit: beautiful details, unexpected favourites, and
            pieces to make your own.
          </p>
          <span className="signature">Piyusha</span>
          <ButtonLink to="/consultation">Find your piece together</ButtonLink>
        </div>
      </section>
      <section className="container section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">The personal edit</p>
            <h2>A few beautiful places to begin.</h2>
          </div>
        </div>
        <ProductGrid
          items={[products[0], products[1], products[3], products[7]]}
        />
        <p className="catalogue-note">
          Concept selection for the demo; not a verified live recommendation
          from the boutique.
        </p>
      </section>
    </>
  );
}
export function Bridal() {
  return (
    <>
      <section className="bridal-hero">
        <img
          src="/assets/popup-jewellery-model.jpg"
          alt="Traditional jewellery for a bridal celebration"
        />
        <div>
          <p className="eyebrow">The bridal room</p>
          <h1>
            For the day.
            <br />
            For the memories.
            <br />
            For you.
          </h1>
          <p>
            A celebration of your story, in pieces that feel entirely your own.
          </p>
          <ButtonLink to="/consultation?occasion=Wedding">
            Begin your bridal story
          </ButtonLink>
        </div>
      </section>
      <section className="container section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Your forever edit</p>
            <h2>Every detail, deeply personal.</h2>
          </div>
          <TextLink to="/collections/bridal">
            Explore the bridal collection
          </TextLink>
        </div>
        <ProductGrid
          items={products.filter((p) => p.collection === "The Bridal Room")}
        />
      </section>
      <section className="bridal-note reading-width">
        <h2>
          The most meaningful piece
          <br />
          begins with you.
        </h2>
        <p>
          Bring your ideas, your outfit inspiration, or simply a feeling. We’ll
          help you explore what works together, what feels comfortable, and what
          makes the moment yours.
        </p>
        <ButtonLink to="/consultation?occasion=Wedding" outline>
          Plan a personal consultation
        </ButtonLink>
      </section>
    </>
  );
}
export function Consultation() {
  const [params] = useSearchParams();
  const [done, setDone] = useState(false);
  const [request, setRequest] = useState("");
  const [error, setError] = useState("");
  const { wishlist } = useStore();
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const date = String(data.date);
    if (
      date <
      new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" })
    ) {
      setError("Please choose today or a future date.");
      return;
    }
    const id = "CONS-" + crypto.randomUUID().slice(0, 6).toUpperCase();
    try {
      const old = JSON.parse(
        localStorage.getItem("ornate:consultations") || "[]",
      );
      localStorage.setItem(
        "ornate:consultations",
        JSON.stringify([
          ...(Array.isArray(old) ? old : []),
          { ...data, id, wishlist, createdAt: new Date().toISOString() },
        ]),
      );
    } catch {
      /* Confirmation remains available for this session. */
    }
    setRequest(id);
    setDone(true);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  return (
    <>
      <PageIntro
        eyebrow="A little guidance. A beautiful discovery."
        title="Let’s find what feels like you."
        description="An unhurried conversation about your style, your occasion, and the pieces you’ll love."
      />
      <section className="container consultation-layout">
        <aside>
          <img
            className="owner-portrait"
            width={800}
            height={717}
            src="/assets/piyusha-nyati.jpg"
            alt="Piyusha Nyati"
          />
          <h2>
            A personal experience,
            <br />
            from the very beginning.
          </h2>
          <p>
            Whether it’s a wedding, a gift, or a little something for yourself,
            begin with a conversation.
          </p>
          <div className="consultation-benefits">
            <span>
              <Check size={16} /> Guidance for your style and budget
            </span>
            <span>
              <Check size={16} /> Help putting a jewellery look together
            </span>
            <span>
              <Check size={16} /> A chance to explore your saved favourites
            </span>
          </div>
        </aside>
        {done ? (
          <div className="form-success">
            <span className="confirmation-icon">
              <Check />
            </span>
            <h2>A lovely place to start.</h2>
            <p>
              Your sample consultation request has been saved on this device.
            </p>
            <span className="status-chip">{request}</span>
            <p className="muted">
              This is a demo confirmation. The boutique has not received a
              message and no appointment has been booked.
            </p>
            <ButtonLink to="/piyushas-edit">Discover Piyusha’s edit</ButtonLink>
            <button className="underlined" onClick={() => setDone(false)}>
              Create another demo request
            </button>
          </div>
        ) : (
          <form className="editorial-form" onSubmit={submit}>
            <h2>A little about you.</h2>
            <p className="small muted">
              Try the demo with sample details. No request will be sent.
            </p>
            <div className="form-grid">
              <label className="field">
                Your name
                <input name="name" required minLength={2} autoComplete="name" />
              </label>
              <label className="field">
                Email address
                <input
                  name="email"
                  required
                  type="email"
                  autoComplete="email"
                />
              </label>
              <label className="field">
                Mobile number
                <input
                  name="phone"
                  type="tel"
                  required
                  pattern="[6-9][0-9]{9}"
                  maxLength={10}
                  title="10-digit Indian mobile number"
                />
              </label>
              <label className="field">
                The occasion
                <select
                  name="occasion"
                  defaultValue={params.get("occasion") || "Just for me"}
                >
                  {[
                    "Just for me",
                    "Wedding",
                    "Anniversary",
                    "Birthday",
                    "Gifting",
                  ].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                Preferred date
                <input
                  name="date"
                  type="date"
                  required
                  min={new Date().toLocaleDateString("en-CA", {
                    timeZone: "Asia/Kolkata",
                  })}
                />
              </label>
              <label className="field">
                Preferred contact
                <select name="method">
                  <option>Phone call</option>
                  <option>WhatsApp</option>
                  <option>Email</option>
                  <option>Boutique visit</option>
                </select>
              </label>
              <label className="field field-wide">
                Your budget
                <select name="budget">
                  <option>I’d like some guidance</option>
                  <option>Under ₹50,000</option>
                  <option>₹50,000–₹1,00,000</option>
                  <option>₹1,00,000–₹2,00,000</option>
                  <option>Above ₹2,00,000</option>
                </select>
              </label>
              <label className="field field-wide">
                What do you have in mind?
                <textarea
                  name="message"
                  rows={4}
                  defaultValue={
                    params.get("piece")
                      ? "I would love to know more about " +
                        params.get("piece") +
                        "."
                      : ""
                  }
                  placeholder="A piece you’ve seen, a style you love, or a feeling you’re looking for…"
                />
              </label>
            </div>
            {wishlist.length > 0 && (
              <p className="small muted">
                <Heart size={13} /> Your {wishlist.length} saved favourites will
                be included in this local demo request.
              </p>
            )}
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button className="button full">
              Save demo consultation request <ArrowUpRight size={18} />
            </button>
          </form>
        )}
      </section>
    </>
  );
}
export function Visit() {
  return (
    <>
      <section className="visit-hero container">
        <div>
          <p className="eyebrow">We’d love to meet you</p>
          <h1>
            Step into
            <br />
            something beautiful.
          </h1>
          <p>
            Discover the collection in person, take your time, and find your
            favourite with a little personal guidance.
          </p>
          <div className="visit-details">
            <span>
              <MapPin size={20} /> Ornate Jewels, Kota, Rajasthan
            </span>
            <a href="tel:+919829730966">
              <Phone size={20} /> +91 9829 730 966
            </a>
            <a href="mailto:ornatejewel@gmail.com">
              <Mail size={20} /> ornatejewel@gmail.com
            </a>
          </div>
          <p className="small muted">
            Please contact the boutique to confirm its current address and
            opening hours before visiting.
          </p>
          <ButtonLink to="/consultation">Plan your personal visit</ButtonLink>
        </div>
        <img
          src="/assets/personalised-heirloom.jpg"
          alt="Jewellery design and personal curation"
        />
      </section>
      <section className="reading-width section">
        <h2>Come with a little curiosity.</h2>
        <p>
          Bring an occasion, an idea, or no plan at all. Explore heritage
          details, discover contemporary styling, and enjoy choosing a piece
          that feels right.
        </p>
        <TextLink to="/contact">Get in touch</TextLink>
      </section>
    </>
  );
}
export function Contact() {
  const [done, setDone] = useState(false);
  return (
    <>
      <PageIntro
        eyebrow="A conversation away"
        title="We’re here for you."
        description="A question about a piece? A special occasion in mind? Let’s begin."
      />
      <section className="container contact-layout">
        <div>
          <h2>Connect with Ornate.</h2>
          <div className="contact-options">
            <a href="tel:+919829730966">
              <Phone />
              <span>
                Call the boutique<strong>+91 9829 730 966</strong>
              </span>
              <ArrowUpRight size={18} />
            </a>
            <a href="mailto:ornatejewel@gmail.com">
              <Mail />
              <span>
                Write to us<strong>ornatejewel@gmail.com</strong>
              </span>
              <ArrowUpRight size={18} />
            </a>
            <Link to="/visit-us">
              <MapPin />
              <span>
                Meet us in person<strong>Kota, Rajasthan</strong>
              </span>
              <ArrowUpRight size={18} />
            </Link>
          </div>
          <TextLink to="/faqs">You might find your answer here</TextLink>
        </div>
        {done ? (
          <div className="form-success">
            <Check size={32} />
            <h2>Thank you for your note.</h2>
            <p>
              Your enquiry has been captured for this demo session. No message
              was sent to Ornate.
            </p>
            <button
              className="button button-outline"
              onClick={() => setDone(false)}
            >
              Write another demo enquiry
            </button>
          </div>
        ) : (
          <form
            className="editorial-form"
            onSubmit={(e) => {
              e.preventDefault();
              setDone(true);
            }}
          >
            <h2>Leave a little note.</h2>
            <p className="muted small">
              A demo enquiry form. Please use sample details.
            </p>
            <label className="field">
              Your name
              <input required minLength={2} />
            </label>
            <label className="field">
              Email address
              <input required type="email" />
            </label>
            <label className="field">
              How can we help?
              <select>
                <option>A piece I love</option>
                <option>My demo order</option>
                <option>Bridal consultation</option>
                <option>Something else</option>
              </select>
            </label>
            <label className="field">
              Your message
              <textarea required minLength={10} rows={4} />
            </label>
            <button className="button full">
              Preview enquiry confirmation <ArrowUpRight size={17} />
            </button>
          </form>
        )}
      </section>
    </>
  );
}
const questions = [
  {
    q: "Can I buy jewellery through this website?",
    a: "This is a client-presentation storefront. You can explore the catalogue and complete a simulated checkout, but no real payment or order takes place. Contact Ornate directly for current products and prices.",
  },
  {
    q: "Can Piyusha help me choose a piece?",
    a: "Personal curation is central to Ornate’s existing website. Explore the consultation page to try the request flow, or contact the boutique directly to arrange a real conversation.",
  },
  {
    q: "Are these the final product prices and specifications?",
    a: "No. Names, prices, sizes, material descriptions, and availability in this demo are illustrative. The boutique must confirm the exact details of any piece before a real purchase.",
  },
  {
    q: "How do I find the right bangle or necklace size?",
    a: "Begin with our size guide and a piece you already wear comfortably. The boutique can confirm actual dimensions and available adjustments for a specific design.",
  },
  {
    q: "What are the delivery and return policies?",
    a: "The demo includes sample delivery choices and policy templates. Actual shipping, insurance, returns, exchanges, and cancellation terms will be confirmed by Ornate before launch.",
  },
  {
    q: "Where are my favourites and demo orders saved?",
    a: "They are stored locally in this browser. They do not sync across devices. You can clear them with Reset demo data in your demo account.",
  },
  {
    q: "Can I visit Ornate in Kota?",
    a: "Yes, you can contact the boutique using the public phone and email listed on the Visit us page. Confirm the current address, opening hours, and appointment availability directly before visiting.",
  },
  {
    q: "Can I explore bridal jewellery?",
    a: "The bridal room brings together statement pieces and an entry point for personal guidance. Use the demo consultation form to explore how a bridal enquiry could work.",
  },
];
export function FAQs() {
  const [q, setQ] = useState("");
  const filtered = questions.filter((x) =>
    (x.q + " " + x.a).toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <>
      <PageIntro
        eyebrow="The little things, answered"
        title="A little clarity."
        description="Here are a few things you might be wondering about."
      />
      <section className="reading-width support-section">
        <div className="faq-search">
          <Search size={18} />
          <input
            aria-label="Search frequently asked questions"
            placeholder="Find an answer…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        {filtered.map((x) => (
          <details key={x.q} className="faq">
            <summary>
              {x.q}
              <ChevronDown size={18} />
            </summary>
            <p>{x.a}</p>
          </details>
        ))}
        {!filtered.length && (
          <p>No matching questions. Try another word or get in touch.</p>
        )}
        <div className="support-callout">
          <h2>Still wondering?</h2>
          <p>We’d be happy to help you find your answer.</p>
          <ButtonLink to="/contact" outline>
            Let’s talk
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
export function Guide() {
  const size = useLocation().pathname === "/size-guide";
  return (
    <>
      <PageIntro
        eyebrow="The considered details"
        title={
          size
            ? "A fit that feels right."
            : "Beautiful today. Beautiful tomorrow."
        }
        description={
          size
            ? "A little measuring makes a world of difference."
            : "A little care goes a long way in keeping your jewellery beautiful."
        }
      />
      <section className="container guide-layout">
        <img
          src={
            "/assets/" +
            (size ? "favourite-bangle.jpg" : "personalised-heirloom.jpg")
          }
          alt={
            size ? "An ornate gold bangle" : "A jewellery design in progress"
          }
        />
        <div>
          {size ? (
            <>
              <h2>Find your bangle size.</h2>
              <p>
                Measure the inside diameter of a bangle that fits comfortably.
                Compare the measurement below; do not include the metal itself.
              </p>
              <table className="size-table">
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Inner diameter</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>2.4</td>
                    <td>57.2 mm</td>
                  </tr>
                  <tr>
                    <td>2.6</td>
                    <td>60.3 mm</td>
                  </tr>
                  <tr>
                    <td>2.8</td>
                    <td>63.5 mm</td>
                  </tr>
                </tbody>
              </table>
              <h3>A necklace that sits just so.</h3>
              <p>
                Use a soft measuring tape to try your preferred length against
                your neckline. Consider the neckline of your outfit and whether
                you’ll layer other pieces.
              </p>
              <p className="small muted">
                These are general measuring tips. Confirm the dimensions of your
                specific piece with the boutique; sample demo fit options are
                not a product guarantee.
              </p>
            </>
          ) : (
            <>
              <h2>Keep the little rituals.</h2>
              <h3>Last on. First off.</h3>
              <p>
                Put jewellery on after perfume, skincare, and hairspray. Remove
                it before bathing, exercise, or household tasks.
              </p>
              <h3>A soft place to rest.</h3>
              <p>
                Store pieces separately in soft pouches or lined compartments to
                reduce scratches and tangling. Keep necklaces fastened when
                storing.
              </p>
              <h3>Gentle is beautiful.</h3>
              <p>
                Wipe with a clean, soft, dry cloth after wear. Avoid harsh
                cleaners and soaking; ask for specific advice for polki, pearls,
                delicate settings, and treated stones.
              </p>
              <h3>Check in from time to time.</h3>
              <p>
                If a setting feels loose or a clasp changes, stop wearing the
                piece and ask a jeweller to inspect it.
              </p>
            </>
          )}
          <ButtonLink to="/consultation" outline>
            Ask for personal guidance
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
const policyContent: Record<
  string,
  { title: string; sections: { h: string; p: string }[] }
> = {
  shipping: {
    title: "Shipping & delivery",
    sections: [
      {
        h: "A thoughtful journey to you",
        p: "This presentation offers complimentary standard delivery and a sample ₹499 priority delivery option. Estimates shown are illustrative and do not represent a live service commitment.",
      },
      {
        h: "Before a real order",
        p: "Ornate will confirm serviceable locations, dispatch times, insured delivery arrangements, charges, handling requirements, and delivery verification before the live store launches.",
      },
      {
        h: "Tracking your demo order",
        p: "Your confirmation and tracking screens are stored in this browser. No package is dispatched and no tracking email is sent.",
      },
    ],
  },
  returns: {
    title: "Returns & exchanges",
    sections: [
      {
        h: "Find the right piece with confidence",
        p: "The final return, exchange, and cancellation policy will be provided by Ornate. This template does not promise a return window, refund eligibility, buyback value, or exchange rate.",
      },
      {
        h: "Details to confirm before purchase",
        p: "Ask the boutique about eligible items, custom-made pieces, condition requirements, proof of purchase, packaging, inspection, and any shipping or handling fees.",
      },
      {
        h: "For this demo",
        p: "No real purchase takes place. You can edit your bag before confirmation and reset local demo data from your account.",
      },
    ],
  },
  privacy: {
    title: "Privacy & your details",
    sections: [
      {
        h: "This demonstration",
        p: "The storefront stores your sample wishlist, bag, profile, addresses, orders, and consultation requests in this browser’s local storage. It does not provide secure authentication or synchronise this data to a customer database.",
      },
      {
        h: "Use sample information",
        p: "Please use fictional contact and address details when trying the demo. Do not enter banking or sensitive personal information. Contact and newsletter confirmations do not send a message.",
      },
      {
        h: "Clear your local data",
        p: "The account reset action clears the demo shopping data. Browser site-data controls can remove all locally stored information, including consultation samples.",
      },
      {
        h: "Before launch",
        p: "A production privacy policy will need to describe the actual systems, data processing, service providers, retention, customer rights, and contact arrangements approved by the business.",
      },
    ],
  },
  terms: {
    title: "Terms of service",
    sections: [
      {
        h: "A client-presentation concept",
        p: "This website demonstrates a proposed customer experience for Ornate Jewels, Kota. It is not a live jewellery shop, and a demo checkout does not create a commercial transaction.",
      },
      {
        h: "Catalogue content",
        p: "Names, prices, specifications, sizes, stock, and collection assignments are illustrative. Product photography is drawn from the brand’s public website; campaign imagery may be generated for the concept.",
      },
      {
        h: "Real product enquiries",
        p: "Contact the boutique directly to confirm a product, its certification and materials, the applicable price, and the terms of sale.",
      },
      {
        h: "Final business terms",
        p: "The live business must approve purchase, cancellation, delivery, liability, dispute, and customer-service terms before accepting real transactions.",
      },
    ],
  },
};
export function Policy() {
  const { slug } = useParams();
  const p = policyContent[slug || ""];
  if (!p)
    return (
      <EmptyState
        title="This page isn’t in our edit."
        description="Find the information you need in our FAQs."
        to="/faqs"
        action="Explore FAQs"
      />
    );
  return (
    <>
      <PageIntro eyebrow="The finer details" title={p.title} />
      <article className="reading-width policy-content">
        <div className="demo-notice">
          Demonstration policy template · For client review before launch.
        </div>
        {p.sections.map((s) => (
          <section key={s.h}>
            <h2>{s.h}</h2>
            <p>{s.p}</p>
          </section>
        ))}
        <TextLink to="/contact">A question? Let’s talk.</TextLink>
      </article>
    </>
  );
}
