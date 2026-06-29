/**
 * Fallback data for the Footer.
 * Used when the WordPress API is unavailable or returns incomplete data.
 */
export const FOOTER_FALLBACK = {
  business_name: "The Barn Pet Stock and Feed",
  business_description:
    "At Barn, we believe every animal deserves quality care, attention, and supplies.",
  phone: "0412713501",
  address: "62–76 Kilmore Road, Heathcote VIC 3523, Australia",
  address_map_url: "https://maps.app.goo.gl/eakWiGZmiMJntaLH8",
  hours_mon_thu: "10am – 6pm",
  hours_fri: "8:30am – 7pm",
  hours_sat: "9am – 2pm",
  hours_sun: "Closed",
  social_instagram: "https://instagram.com",
  social_facebook: "https://facebook.com",
  social_linkedin: "https://linkedin.com",
  quick_link_1_label: "About Us",
  quick_link_1_url: "/about-us",
  quick_link_2_label: "Shop",
  quick_link_2_url: "/shop",
  quick_link_3_label: "Deals",
  quick_link_3_url: "/deals",
  quick_link_4_label: "Blog",
  quick_link_4_url: "/blog",
  quick_link_5_label: "Contact Us",
  quick_link_5_url: "/contact-us",
};

export type FooterData = typeof FOOTER_FALLBACK;
