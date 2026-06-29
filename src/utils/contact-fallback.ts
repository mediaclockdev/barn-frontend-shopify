/**
 * Fallback data for the Contact Us page.
 * Used when the WordPress API is unavailable or returns incomplete data.
 */
export const CONTACT_FALLBACK = {
  hero_title: "Contact Us",
  hero_subtitle: "We'd love to hear from you. Reach out anytime.",
  hero_image: "/images/contact/contact.jpg",
  address: "62–76 Kilmore Road, Heathcote VIC 3523, Australia",
  address_map_url: "https://maps.app.goo.gl/eakWiGZmiMJntaLH8",
  phone: "0412713501",
  business_hours:
    "Mon – Thu: 10am–6pm\nFri: 8:30am – 7:00pm\nSat: 9am – 2pm\nSun: Closed",
  email: "barn@gmail.com",
  map_embed_url:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d942.172924331471!2d144.72474327295217!3d-36.94144883548362!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad77d5b559ce235%3A0x82c9183634af623!2sTHE%20BARN%20PET%20STOCK%20AND%20FEED!5e1!3m2!1sen!2sin!4v1773636072069!5m2!1sen!2sin",
};

export type ContactData = typeof CONTACT_FALLBACK;
