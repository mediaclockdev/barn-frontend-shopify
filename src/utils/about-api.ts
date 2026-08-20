/**
 * Service to fetch dynamic content for the About Us page.
 * (Migrated to Shopify - currently using local fallback data until Shopify CMS is integrated)
 */
export async function getAboutPageData() {
  // We no longer call WooCommerce.
  // Returning null here forces the about-us page to use the ABOUT_FALLBACK data.
  // In the future, this can be updated to fetch from a Shopify Metaobject or Page.
  return { data: null };
}

