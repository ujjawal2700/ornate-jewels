export const INSTAGRAM_PROFILE = "https://www.instagram.com/ornatejewels.kota/";
export type InstagramStory = {
  id: string;
  title: string;
  description: string;
  image: string;
  width: number;
  height: number;
  kind: "Reel" | "Photo";
  video?: string;
  source: string;
  browse?: string;
  browseLabel?: string;
};
export const instagramModel: InstagramStory = {
  id: "Devxa6jDFTM",
  title: "A heritage feeling. A modern muse.",
  description:
    "Mint-green layers, intricate gold-toned details and a look that feels entirely your own. A moment from Ornate’s own campaign.",
  image: "/assets/instagram/green-heirloom.jpg",
  width: 1638,
  height: 2048,
  kind: "Photo",
  source: "https://www.instagram.com/p/Devxa6jDFTM/",
  browse: "/bridal",
  browseLabel: "Explore the bridal room",
};
export const instagramStories: InstagramStory[] = [
  {
    id: "De6PWa4N8-I",
    title: "The little details, in motion.",
    description:
      "A close look at the pearl, green and light-catching details of a necklace, filmed in the boutique.",
    image: "/assets/instagram/pearl-detail.jpg",
    video: "/assets/instagram/pearl-detail.mp4",
    width: 1179,
    height: 2096,
    kind: "Reel",
    source: "https://www.instagram.com/reel/De6PWa4N8-I/",
    browse: "/shop/necklaces",
    browseLabel: "Explore necklace styles",
  },
  {
    id: "De3tPrnDtII",
    title: "A finishing touch to remember.",
    description:
      "A beautifully detailed bangle from the Ornate Instagram edit. Discover the design in its original, full frame.",
    image: "/assets/instagram/gold-bangle.jpg",
    width: 1638,
    height: 2048,
    kind: "Photo",
    source: "https://www.instagram.com/p/De3tPrnDtII/",
    browse: "/shop/bangles",
    browseLabel: "Explore bangle styles",
  },
  {
    id: "De1WZAzqc1c",
    title: "Something borrowed from a dream.",
    description:
      "Soft mint-green strands, delicate drops and a bridal mood. See the piece move and catch the light.",
    image: "/assets/instagram/mint-bridal.jpg",
    video: "/assets/instagram/mint-bridal.mp4",
    width: 1215,
    height: 2160,
    kind: "Reel",
    source: "https://www.instagram.com/reel/De1WZAzqc1c/",
    browse: "/bridal",
    browseLabel: "Explore the bridal room",
  },
  {
    id: "Deqni7YgIWM",
    title: "Old soul. Beautiful new stories.",
    description:
      "Deep green beads and a richly detailed pendant set, photographed for Ornate’s own collection stories.",
    image: "/assets/instagram/heritage-pendant.jpg",
    width: 1638,
    height: 2048,
    kind: "Photo",
    source: "https://www.instagram.com/p/Deqni7YgIWM/",
    browse: "/collections/heritage",
    browseLabel: "Explore the heritage edit",
  },
  {
    id: "DYWxTWQxv0f",
    title: "Step inside our world.",
    description:
      "Meet the people and the boutique behind Ornate Jewels, Kota. A welcome from the team, in their own words.",
    image: "/assets/instagram/boutique-reel-cover.jpg",
    video: "/assets/instagram/boutique-reel.mp4",
    width: 640,
    height: 1136,
    kind: "Reel",
    source: "https://www.instagram.com/reel/DYWxTWQxv0f/",
    browse: "/visit-us",
    browseLabel: "Plan your boutique visit",
  },
];
