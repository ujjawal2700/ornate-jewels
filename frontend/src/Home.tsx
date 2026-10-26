import TrendingRunway from "./runway/TrendingRunway";
import InstagramJournal from "./InstagramJournal";
import { LogoSymbol } from "./Logo";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Plus,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { categories, collections } from "./data";
import { ButtonLink, TextLink, PageIntro } from "./components";
import { Reveal, scrollToPosition } from "./experience";
gsap.registerPlugin(ScrollTrigger, useGSAP);
const chapters = [
  {
    name: "The warmth of gold",
    word: "A feeling.",
    copy: "The glow you remember from your mother’s jewellery box. The piece you reach for on an ordinary Tuesday. Some things feel like home, long before they become yours.",
    image: "favourite-bangle.jpg",
    to: "/shop?material=Gold",
    link: "Explore the gold edit",
    note: "Gold · A familiar kind of extraordinary",
  },
  {
    name: "The soul of polki",
    word: "A memory.",
    copy: "Light, held a little differently. Intricate settings. A beautiful imperfection. The art of polki brings the past into the present—and leaves room for your own story.",
    image: "favourite-heritage-set.jpg",
    to: "/collections/heritage",
    link: "Discover the heritage edit",
    note: "Polki & kundan · Stories in every detail",
  },
  {
    name: "The light of diamonds",
    word: "A possibility.",
    copy: "A quiet flash of light. A colour that catches your eye. For the version of you that doesn’t wait for a special occasion to feel extraordinary.",
    image: "section-necklace-1.jpg",
    to: "/shop?material=Diamond",
    link: "Meet the diamond edit",
    note: "Diamonds · A little light, entirely yours",
  },
];
const manifesto =
  "Before it becomes a piece you wear, it is a feeling you recognise. A memory. A little courage. A story that could only be yours.";
export default function Home() {
  const root = useRef<HTMLDivElement>(null);
  const gallery = useRef<HTMLDivElement>(null);
  const [chapter, setChapter] = useState(0);
  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
        intro
          .from(".cinema-image", { scale: 1.12, duration: 1.8 })
          .from(
            ".hero-line > span",
            { yPercent: 115, rotate: 3, duration: 1.25, stagger: 0.13 },
            0.15,
          )
          .from(
            ".cinema-meta, .cinema-bottom",
            { opacity: 0, y: 15, duration: 0.8 },
            0.85,
          );
        gsap.to(".cinema-image", {
          yPercent: 15,
          ease: "none",
          scrollTrigger: {
            trigger: ".cinema-hero",
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        });
        gsap.to(".cinema-title", {
          yPercent: 18,
          opacity: 0.2,
          ease: "none",
          scrollTrigger: {
            trigger: ".cinema-hero",
            start: "20% top",
            end: "bottom top",
            scrub: 0.8,
          },
        });
        gsap.fromTo(
          ".manifesto-word",
          { opacity: 0.18 },
          {
            opacity: 1,
            stagger: 0.09,
            ease: "none",
            scrollTrigger: {
              trigger: ".manifesto",
              start: "top 65%",
              end: "bottom 65%",
              scrub: 0.6,
            },
          },
        );
        gsap.utils.toArray<HTMLElement>(".editorial-reveal").forEach((el) => {
          gsap.from(el, {
            y: 60,
            opacity: 0,
            duration: 1.1,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          });
        });
        gsap.utils.toArray<HTMLElement>(".parallax-frame").forEach((el) => {
          const image = el.querySelector("img");
          if (image)
            gsap.fromTo(
              image,
              { yPercent: -5, scale: 1.1 },
              {
                yPercent: 5,
                scale: 1.1,
                ease: "none",
                scrollTrigger: {
                  trigger: el,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 1,
                },
              },
            );
        });
      });
      media.add(
        "(min-width: 901px) and (min-height: 740px) and (prefers-reduced-motion: no-preference)",
        () => {
          const trigger = ScrollTrigger.create({
            id: "ornate-craft-chapters",
            trigger: ".chapter-stage",
            start: "top 80px",
            end: () => "+=" + window.innerHeight * 2.3,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) =>
              setChapter(Math.min(2, Math.floor(self.progress * 3))),
          });
          return () => trigger.kill();
        },
      );
      const refresh = () => ScrollTrigger.refresh();
      document.fonts.ready.then(refresh);
      root.current
        ?.querySelectorAll("img")
        .forEach((im) => im.addEventListener("load", refresh, { once: true }));
      return () => {
        media.revert();
        root.current
          ?.querySelectorAll("img")
          .forEach((im) => im.removeEventListener("load", refresh));
      };
    },
    { scope: root },
  );
  function selectChapter(index: number) {
    setChapter(index);
    const trigger = ScrollTrigger.getById("ornate-craft-chapters");
    if (trigger)
      scrollToPosition(
        trigger.start + (trigger.end - trigger.start) * ((index + 0.1) / 3),
      );
  }
  return (
    <div className="ornate-chapters" ref={root}>
      <section className="cinema-hero">
        <div className="cinema-image-wrap">
          <img
            className="cinema-image"
            src="/assets/campaign.webp"
            alt="An emerald and polki necklace, caught in the golden light of Rajasthan"
            fetchPriority="high"
            width="1536"
            height="1024"
          />
        </div>
        <div className="cinema-shade" />
        <div className="cinema-meta">
          <span>A jewellery story, by Ornate</span>
          <span>Kota, Rajasthan</span>
        </div>
        <div className="cinema-title">
          <h1>
            <span className="hero-line">
              <span>More than</span>
            </span>
            <span className="hero-line">
              <span>meets the eye.</span>
            </span>
          </h1>
          <p>
            A little of where you come from.
            <br />A little of who you’re becoming.
          </p>
        </div>
        <div className="cinema-bottom">
          <a
            href="#the-feeling"
            className="scroll-invitation"
            aria-label="Discover the story in every piece"
          >
            <span className="scroll-ring">
              <ArrowDown size={18} />
            </span>
            <span>
              There’s a story
              <br />
              in every piece.
            </span>
          </a>
          <Link className="hero-shop" to="/shop">
            <span>Find the piece that feels like you</span>
            <span className="circle-arrow">
              <ArrowUpRight size={25} />
            </span>
          </Link>
        </div>
        <span className="hero-edition">The Ornate chapters / I</span>
      </section>
      <section id="the-feeling" className="manifesto">
        <div className="manifesto-margin">
          <span className="chapter-marker">I / The feeling</span>
          <span className="manifesto-star" aria-hidden="true">
            ✳
          </span>
        </div>
        <div className="manifesto-main">
          <p className="manifesto-text" aria-label={manifesto}>
            {manifesto.split(" ").map((word, i) => (
              <span aria-hidden="true" className="manifesto-word" key={i}>
                {word}{" "}
              </span>
            ))}
          </p>
          <div className="manifesto-foot">
            <p>
              We bring together extraordinary jewellery.
              <br />
              You bring the meaning.
            </p>
            <TextLink to="/our-story">The heart of Ornate</TextLink>
          </div>
        </div>
        <img
          className="manifesto-detail"
          src="/assets/favourite-danglers.jpg"
          alt="An intimate detail of polki earrings"
          loading="lazy"
          width="300"
          height="380"
        />
      </section>
      <section className="chapter-section" aria-label="The material stories">
        <div className="chapter-stage">
          <div className="chapter-heading">
            <span className="chapter-marker">II / The craft</span>
            <p>
              Old soul.
              <br />
              Endless new stories.
            </p>
          </div>
          <div className="chapter-composition">
            <div className="chapter-copy">
              <div
                className="chapter-tabs"
                role="tablist"
                aria-label="Discover a material story"
              >
                {chapters.map((c, i) => (
                  <button
                    key={c.name}
                    role="tab"
                    aria-label={c.name}
                    id={"chapter-tab-" + i}
                    aria-controls={"chapter-panel-" + i}
                    aria-selected={chapter === i}
                    tabIndex={chapter === i ? 0 : -1}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                        e.preventDefault();
                        const next =
                          (chapter + (e.key === "ArrowRight" ? 1 : 2)) % 3;
                        selectChapter(next);
                        document.getElementById("chapter-tab-" + next)?.focus();
                      }
                    }}
                    onClick={() => selectChapter(i)}
                  >
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    {c.name}
                  </button>
                ))}
              </div>
              <div className="chapter-panels">
                {chapters.map((c, i) => (
                  <div
                    key={c.name}
                    id={"chapter-panel-" + i}
                    role="tabpanel"
                    aria-labelledby={"chapter-tab-" + i}
                    className={`chapter-panel ${chapter === i ? "is-active" : ""}`}
                    hidden={chapter !== i}
                  >
                    <span className="chapter-count">
                      {String(i + 1).padStart(2, "0")} / 03
                    </span>
                    <h2>{c.word}</h2>
                    <p>{c.copy}</p>
                    <TextLink to={c.to}>{c.link}</TextLink>
                  </div>
                ))}
              </div>
              <div className="chapter-progress" aria-hidden="true">
                {chapters.map((_, i) => (
                  <i key={i} className={chapter >= i ? "filled" : ""} />
                ))}
              </div>
            </div>
            <div className="chapter-object">
              <div className="object-halo" aria-hidden="true" />
              {chapters.map((c, i) => (
                <img
                  key={c.image}
                  src={"/assets/" + c.image}
                  alt={c.name}
                  className={chapter === i ? "is-active" : ""}
                  aria-hidden={chapter !== i}
                  loading="lazy"
                  width="700"
                  height="850"
                />
              ))}
              <span className="object-caption">{chapters[chapter].note}</span>
              <span className="object-corner" aria-hidden="true">
                ✧
              </span>
            </div>
          </div>
        </div>
      </section>
      <section className="collection-journey">
        <div className="journey-heading container editorial-reveal">
          <span className="chapter-marker">III / Your chapter</span>
          <h2>
            Every version of you.
            <br />
            An entirely different story.
          </h2>
          <div>
            <p>
              For your ordinary days.
              <br />
              Your extraordinary ones.
              <br />
              And everything in between.
            </p>
            <div className="gallery-controls">
              <button
                aria-label="Previous collection"
                onClick={() =>
                  gallery.current?.scrollBy({ left: -450, behavior: "smooth" })
                }
              >
                <ArrowLeft size={19} />
              </button>
              <button
                aria-label="Next collection"
                onClick={() =>
                  gallery.current?.scrollBy({ left: 450, behavior: "smooth" })
                }
              >
                <ArrowRight size={19} />
              </button>
            </div>
          </div>
        </div>
        <div
          className="journey-track"
          ref={gallery}
          tabIndex={0}
          aria-label="Collection gallery"
        >
          <Link
            to="/collections/heritage"
            className="journey-card journey-heritage"
          >
            <div className="parallax-frame">
              <img
                src="/assets/spotlight-gold.jpg"
                alt="Heritage jewellery, reimagined for today"
                loading="lazy"
                width="600"
                height="800"
              />
            </div>
            <div className="journey-card-copy">
              <span>For the soul that remembers</span>
              <h3>The Heritage Edit</h3>
              <ArrowUpRight />
            </div>
          </Link>
          <Link
            to="/collections/modern-muse"
            className="journey-card journey-modern"
          >
            <div className="parallax-frame">
              <img
                src="/assets/spotlight-diamond.jpg"
                alt="Emerald and diamond jewellery with a contemporary point of view"
                loading="lazy"
                width="600"
                height="800"
              />
            </div>
            <div className="journey-card-copy">
              <span>For your kind of everyday</span>
              <h3>The Modern Muse</h3>
              <ArrowUpRight />
            </div>
          </Link>
          <Link to="/bridal" className="journey-card journey-bridal">
            <div className="parallax-frame">
              <img
                src="/assets/popup-jewellery-model.jpg"
                alt="A statement in gold for your celebration"
                loading="lazy"
                width="600"
                height="800"
              />
            </div>
            <div className="journey-card-copy">
              <span>For a once-in-a-lifetime feeling</span>
              <h3>The Bridal Room</h3>
              <ArrowUpRight />
            </div>
          </Link>
        </div>
        <div className="journey-end container">
          <span>Three edits. Countless ways to make them yours.</span>
          <TextLink to="/collections">Discover all collections</TextLink>
        </div>
      </section>
      <section
        id="trending-products"
        className="curated-shopping container"
        aria-label="The trending edit"
      >
        <div className="curated-heading editorial-reveal">
          <div>
            <span className="chapter-marker">IV / The trending edit</span>
            <h2>Worth falling for.</h2>
          </div>
          <div>
            <p>
              Six pieces. Each with a story. Select the one that speaks to you,
              and let the details draw you in.
            </p>
            <TextLink to="/shop">Find your piece</TextLink>
          </div>
        </div>
        <TrendingRunway />
        <div className="browse-categories">
          <span>A little direction?</span>
          {categories.map((c) => (
            <Link key={c.name} to={"/shop/" + c.name.toLowerCase()}>
              {c.name}
              <Plus size={13} />
            </Link>
          ))}
        </div>
      </section>
      <InstagramJournal />
      <section className="personal-chapter">
        <div className="personal-art">
          <div className="personal-portrait">
            <img
              className="owner-portrait"
              src="/assets/piyusha-nyati.jpg"
              alt="Piyusha Nyati, the personal eye behind Ornate"
              loading="lazy"
              width="800"
              height="717"
            />
          </div>
          <span className="personal-handwriting">
            A little intuition.
            <br />A lot of heart.
          </span>
        </div>
        <div className="personal-story editorial-reveal">
          <span className="chapter-marker">V / A personal eye</span>
          <h2>
            The right piece
            <br />
            doesn’t change you.
            <br />
            It feels like you.
          </h2>
          <p>
            Some people have an eye for beautiful things. Piyusha has an eye for
            what’s beautiful on you.
          </p>
          <p>
            A conversation about your taste. A little understanding of your
            budget. And a carefully chosen piece that makes everything fall into
            place.
          </p>
          <div className="personal-signoff">
            <span className="signature">Piyusha</span>
            <span>
              Piyusha Nyati
              <br />
              The heart behind the curation
            </span>
          </div>
          <TextLink to="/consultation">Find your piece, together</TextLink>
        </div>
      </section>
      <section className="closing-chapter">
        <div className="closing-image parallax-frame">
          <img
            src="/assets/personalised-heirloom.jpg"
            alt="A jewellery story taking shape, from sketch to treasured piece"
            loading="lazy"
            width="700"
            height="700"
          />
        </div>
        <div className="closing-copy editorial-reveal">
          <span className="chapter-marker">Your story is next.</span>
          <h2>
            Come for a piece.
            <br />
            Leave with
            <br />a feeling.
          </h2>
          <p>
            Step inside Ornate, Kota.
            <br />
            Let’s discover something beautiful, together.
          </p>
          <ButtonLink to="/consultation" outline>
            Begin a conversation
          </ButtonLink>
          <Link className="closing-visit" to="/visit-us">
            Visit the boutique <ArrowUpRight size={16} />
          </Link>
        </div>
        <LogoSymbol className="closing-brand-symbol" />
      </section>
    </div>
  );
}
export function Collections() {
  return (
    <>
      <PageIntro
        eyebrow="The Ornate chapters"
        title="A world within each piece."
        description="Tradition. A new perspective. A feeling you’ll remember forever. Choose the story that speaks to you."
      />
      <div className="container collection-list">
        {collections.map((c, i) => (
          <Reveal key={c.slug}>
            <Link to={"/collections/" + c.slug} className="collection-feature">
              <div className="collection-feature-image">
                <img src={"/assets/" + c.image} alt={c.name} loading="lazy" />
                <span>{String(i + 1).padStart(2, "0")}</span>
              </div>
              <div>
                <span className="chapter-marker">
                  The collection / {String(i + 1).padStart(2, "0")}
                </span>
                <h2>{c.name}</h2>
                <p>{c.description}</p>
                <span className="text-link">
                  Enter this chapter <ArrowUpRight size={18} />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </>
  );
}
