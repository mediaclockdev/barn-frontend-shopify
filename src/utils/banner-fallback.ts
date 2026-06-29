/**
 * Fallback data for the Top Banner announcements.
 * Used when the WordPress API is unavailable or returns incomplete data.
 */
export const BANNER_FALLBACK = {
  banner_1_text:
    "🎉 Click and Collect is now available! Shop online and pick up in store.",
  banner_1_link_text: "Shop Now",
  banner_1_link_url: "/shop",
  banner_2_text: "🛒 Better deals, better feed, better for your animals",
  banner_2_link_text: "View Deals",
  banner_2_link_url: "/deals",
  banner_3_text:
    "⭐ Join The Barn family and give your animals the quality they deserve.",
  banner_3_link_text: "Learn More",
  banner_3_link_url: "/about-us",
};

export type BannerData = typeof BANNER_FALLBACK;
