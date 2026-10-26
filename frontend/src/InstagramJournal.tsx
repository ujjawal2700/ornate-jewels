import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Instagram,
  ArrowUpRight,
  ArrowLeft,
  ArrowRight,
  Play,
  Image as ImageIcon,
} from "lucide-react";
import { Modal } from "./ui";
import { Reveal } from "./experience";
import {
  INSTAGRAM_PROFILE,
  instagramModel,
  instagramStories,
  type InstagramStory,
} from "./instagram-data";
import "./instagram.css";
function StoryViewer({
  story,
  onClose,
}: {
  story: InstagramStory | null;
  onClose: () => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
  }, [story?.id]);
  useEffect(() => {
    const player = video.current;
    return () => {
      player?.pause();
    };
  }, [story?.id, failed]);
  return (
    <Modal
      open={!!story}
      onClose={onClose}
      title={story?.title || "The Ornate journal"}
    >
      {story && (
        <div className="ig-viewer">
          <div className="ig-viewer-media">
            {story.video && !failed ? (
              <video
                key={story.id}
                ref={video}
                src={story.video}
                poster={story.image}
                controls
                playsInline
                autoPlay
                muted
                preload="metadata"
                onError={() => setFailed(true)}
                aria-label={story.title}
                aria-describedby="ig-story-description"
              />
            ) : (
              <img
                src={story.image}
                width={story.width}
                height={story.height}
                alt={story.title}
              />
            )}
          </div>
          <div className="ig-viewer-copy">
            <a
              className="ig-profile-inline"
              href={INSTAGRAM_PROFILE}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram size={17} />
              @ornatejewels.kota
              <ArrowUpRight size={14} />
            </a>
            <p id="ig-story-description">{story.description}</p>
            {story.video && (
              <small>
                {failed
                  ? "This video could not be played here. You can watch the original reel on Instagram."
                  : "Sound starts muted. Use the player controls to listen."}
              </small>
            )}
            <div className="ig-viewer-actions">
              <a href={story.source} target="_blank" rel="noopener noreferrer">
                View original {story.kind.toLowerCase()}
                <ArrowUpRight size={15} />
              </a>
              {story.browse && (
                <Link to={story.browse} onClick={onClose}>
                  {story.browseLabel}
                  <ArrowUpRight size={15} />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
export default function InstagramJournal() {
  const [active, setActive] = useState<InstagramStory | null>(null);
  const [filter, setFilter] = useState("All stories");
  const rail = useRef<HTMLDivElement>(null);
  const stories = instagramStories.filter(
    (s) =>
      filter === "All stories" ||
      (filter === "Reels" ? s.kind === "Reel" : s.kind === "Photo"),
  );
  const move = (direction: number) =>
    rail.current?.scrollBy({
      left: direction * rail.current.clientWidth * 0.8,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  return (
    <section
      id="ornate-on-instagram"
      className="instagram-journal"
      aria-labelledby="instagram-heading"
    >
      <div className="ig-model-feature">
        <Reveal className="ig-model-image">
          <button
            aria-label="View Ornate’s model campaign photograph"
            onClick={() => setActive(instagramModel)}
          >
            <img
              src={instagramModel.image}
              width={instagramModel.width}
              height={instagramModel.height}
              alt="An Ornate campaign model wearing layered mint-green necklaces, earrings, bangles and rings"
              loading="lazy"
            />
            <span>
              <ImageIcon size={15} />
              View the full look
              <ArrowUpRight size={16} />
            </span>
          </button>
        </Reveal>
        <Reveal className="ig-feature-copy">
          <a
            href={INSTAGRAM_PROFILE}
            className="ig-profile-inline"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Instagram size={18} />
            @ornatejewels.kota
          </a>
          <h2 id="instagram-heading">
            A closer kind
            <br />
            of beautiful.
          </h2>
          <p>
            The looks you save. The details you replay. The piece you can’t
            quite stop thinking about.
          </p>
          <p>
            Step into Ornate’s world on Instagram, from styled collection
            stories to a little sparkle, up close.
          </p>
          <a
            className="ig-follow-button"
            href={INSTAGRAM_PROFILE}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Instagram size={17} />
            Follow Ornate on Instagram
            <ArrowUpRight size={17} />
          </a>
          <Link className="ig-browse-link" to="/bridal">
            Discover your own bridal story
            <ArrowUpRight size={16} />
          </Link>
          <span className="ig-feature-note">From the Ornate campaign</span>
        </Reveal>
      </div>
      <div className="ig-stories-heading">
        <div>
          <span>The Ornate journal</span>
          <h3>Worth a second look.</h3>
        </div>
        <div className="ig-rail-controls">
          <button
            aria-label="Previous Instagram stories"
            onClick={() => move(-1)}
          >
            <ArrowLeft size={19} />
          </button>
          <button aria-label="Next Instagram stories" onClick={() => move(1)}>
            <ArrowRight size={19} />
          </button>
        </div>
      </div>
      <div
        className="ig-filter"
        role="group"
        aria-label="Filter Instagram stories"
      >
        {["All stories", "Reels", "Photographs"].map((f) => (
          <button
            key={f}
            aria-pressed={filter === f}
            className={filter === f ? "is-active" : ""}
            onClick={() => {
              setFilter(f);
              rail.current?.scrollTo({ left: 0, behavior: "instant" });
            }}
          >
            {f}
          </button>
        ))}
      </div>
      <div
        ref={rail}
        className="ig-story-rail"
        role="region"
        aria-label="Selected Instagram stories"
        tabIndex={0}
      >
        {stories.map((s) => (
          <article className="ig-story-card" key={s.id}>
            <button
              className="ig-story-image"
              onClick={() => setActive(s)}
              aria-label={`${s.kind === "Reel" ? "Watch" : "View"} ${s.title}`}
            >
              <img
                src={s.image}
                width={s.width}
                height={s.height}
                loading="lazy"
                alt={s.title}
              />
            </button>
            <div className="ig-story-meta">
              <span>
                {s.kind === "Reel" ? (
                  <Play size={13} />
                ) : (
                  <ImageIcon size={13} />
                )}{" "}
                {s.kind}
              </span>
              <a
                href={s.source}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View original Instagram post: ${s.title}`}
              >
                <Instagram size={15} />
                <ArrowUpRight size={13} />
              </a>
            </div>
            <h4>
              <button onClick={() => setActive(s)}>{s.title}</button>
            </h4>
            <button className="ig-open-story" onClick={() => setActive(s)}>
              {s.kind === "Reel" ? "Watch the reel" : "View the photograph"}
              <ArrowUpRight size={14} />
            </button>
          </article>
        ))}
      </div>
      <div className="ig-journal-footer">
        <p>
          A few moments from{" "}
          <a href={INSTAGRAM_PROFILE} target="_blank" rel="noopener noreferrer">
            @ornatejewels.kota
          </a>
          . There’s always more to discover.
        </p>
        <a href={INSTAGRAM_PROFILE} target="_blank" rel="noopener noreferrer">
          See more on Instagram
          <ArrowUpRight size={16} />
        </a>
      </div>
      <StoryViewer story={active} onClose={() => setActive(null)} />
    </section>
  );
}
