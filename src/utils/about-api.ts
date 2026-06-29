import { fetchWcApi } from "./api-client";
import { ENDPOINTS, buildUrl } from "./api-endpoints";
/**
 * Service to fetch dynamic content for the About Us page.
 */
export async function getAboutPageData() {
  const url = buildUrl(ENDPOINTS.ABOUT_PAGE_DATA);

  try {
    // Revalidate every hour — about page content rarely changes
    const { data } = await fetchWcApi<any>(url, { next: { revalidate: 60 } });
    if (!data || data.length === 0) {
      console.warn(
        "About Us page not found in WordPress. Check slug: 'about-us'",
      );
      return null;
    }

    const page = data[0];
    const acf = page.acf || {};

    // ACF image fields may return attachment IDs (numbers) instead of URLs.
    // Strip invalid values so fallback local images are used.
    const imageKeys = ["hero_image", "story_image"];
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
    console.error("Error fetching About Us page data:", error);
    return null;
  }
}
