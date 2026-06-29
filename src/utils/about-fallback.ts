/**
 * Fallback data for the About Us page.
 * Used when the WordPress API is unavailable or returns incomplete data.
 * These values mirror the original hardcoded content from the components.
 */
export const ABOUT_FALLBACK = {
  hero_title: "Quality Care For Every Companion",
  hero_subtitle:
    "Your one-stop shop for all your pet needs, from playful puppies to majestic horses.",
  hero_image: "/images/about/about1.jpg",
  story_title: "Our Story",
  story_content:
    "The Barn Pet Stock and Feed is a family‑run business proudly operating in Heathcote since 2019. We're committed to providing excellent customer service and becoming a valued part of the local community.\r\n\r\nWe stock a wide range of products for farms, horses, and pets. If there's something you need that we don't currently have, just ask — we're always happy to try and source it for you.\r\n\r\nFeel free to drop in, say hello, and meet the dogs and cats. We hope to see you in store soon.",
  story_image: "/images/about/about2.jpg",
  core_value_1: "Quick and reliable delivery to your barnyard or backyard",
  core_value_2: "Friendly & knowledgeable help whenever you need it",
  core_value_3: "Top-notch toys, food, and gear for your pets and farm",
};

export type AboutData = typeof ABOUT_FALLBACK;
