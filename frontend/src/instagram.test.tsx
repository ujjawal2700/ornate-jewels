import { beforeAll, vi, describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import InstagramJournal from "./InstagramJournal";
import {
  instagramModel,
  instagramStories,
  INSTAGRAM_PROFILE,
} from "./instagram-data";
// jsdom does not implement scrolling or media playback. These tests verify
// controls, deferred media creation and cleanup, rather than video decoding.
beforeAll(() => {
  HTMLElement.prototype.scrollTo = vi.fn();
  HTMLElement.prototype.scrollBy = vi.fn();
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
});
function app() {
  return render(
    <MemoryRouter>
      <InstagramJournal />
    </MemoryRouter>,
  );
}
describe("Ornate Instagram journal", () => {
  it("loads video only after a story is opened and keeps original attribution", async () => {
    const user = userEvent.setup();
    const view = app();
    expect(view.container.querySelector("video")).toBeNull();
    expect(view.container.querySelector("iframe")).toBeNull();
    await user.click(
      screen.getByRole("button", {
        name: "Watch The little details, in motion.",
      }),
    );
    const d = within(screen.getByRole("dialog"));
    const video = d.getByLabelText(
      "The little details, in motion.",
    ) as HTMLVideoElement;
    expect(video.getAttribute("src")).toBe(
      "/assets/instagram/pearl-detail.mp4",
    );
    expect(video.controls).toBe(true);
    expect(video.muted).toBe(true);
    expect(
      d.getByRole("link", { name: /View original reel/ }).getAttribute("href"),
    ).toBe(instagramStories[0].source);
    await user.click(d.getByRole("button", { name: "Close dialog" }));
    expect(view.container.querySelector("video")).toBeNull();
    expect(document.body.style.overflow).toBe("");
  });
  it("filters the curated stories without inventing live feed entries", async () => {
    const user = userEvent.setup();
    app();
    const rail = within(
      screen.getByRole("region", { name: "Selected Instagram stories" }),
    );
    expect(rail.getAllByRole("article")).toHaveLength(5);
    await user.click(screen.getByRole("button", { name: "Reels" }));
    expect(rail.getAllByRole("article")).toHaveLength(3);
    expect(
      screen
        .getByRole("button", { name: "Reels" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    await user.click(screen.getByRole("button", { name: "Photographs" }));
    expect(rail.getAllByRole("article")).toHaveLength(2);
    expect(
      rail.queryByRole("button", { name: /Watch The little details/ }),
    ).toBeNull();
    expect(
      screen
        .getByRole("link", { name: "Follow Ornate on Instagram" })
        .getAttribute("href"),
    ).toBe(INSTAGRAM_PROFILE);
  });
  it("shows the original model image and handles unavailable video with a source link", async () => {
    const user = userEvent.setup();
    app();
    await user.click(
      screen.getByRole("button", {
        name: "View Ornate’s model campaign photograph",
      }),
    );
    let d = within(screen.getByRole("dialog"));
    expect(d.getByRole("img").getAttribute("src")).toBe(instagramModel.image);
    expect(
      d.getByRole("link", { name: /View original photo/ }).getAttribute("href"),
    ).toBe(instagramModel.source);
    fireEvent(
      screen.getByRole("dialog"),
      new Event("cancel", { cancelable: true }),
    );
    await user.click(
      screen.getByRole("button", { name: "Watch Step inside our world." }),
    );
    d = within(screen.getByRole("dialog"));
    fireEvent.error(d.getByLabelText("Step inside our world."));
    expect(d.getByText(/could not be played here/)).toBeTruthy();
    expect(
      d.getByRole("link", { name: /View original reel/ }).getAttribute("href"),
    ).toBe("https://www.instagram.com/reel/DYWxTWQxv0f/");
  });
});
