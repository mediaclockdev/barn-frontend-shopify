import { fetchWcApi } from "./api-client";
import { buildUrl, ENDPOINTS } from "./api-endpoints";

/**
 * Service to fetch dynamic content for the Contact Us page.
 */
export async function getContactPageData() {
  const url = buildUrl(ENDPOINTS.CONTACT_PAGE_DATA);
  try {
    const { data } = await fetchWcApi<any>(url, { next: { revalidate: 3600 } });
    if (!data || data.length === 0) {
      console.warn(
        "Contact Us page not found in WordPress. Check slug: 'contact-us'",
      );
      return null;
    }

    const page = data[0];
    const acf = page.acf || {};

    // ACF image fields may return attachment IDs (numbers) instead of URLs.
    // Strip invalid values so fallback local images are used.
    const imageKeys = ["hero_image"];
    const cleaned: Record<string, any> = { ...acf };
    for (const key of imageKeys) {
      if (
        typeof cleaned[key] !== "string" ||
        (!cleaned[key].startsWith("/") && !cleaned[key].startsWith("http"))
      ) {
        delete cleaned[key];
      }
    }

    return {
      data: cleaned,
    };
  } catch (error) {
    console.error("Error fetching Contact Us page data:", error);
    return null;
  }
}
