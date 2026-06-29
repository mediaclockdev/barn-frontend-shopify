import { fetchWcApi } from "./api-client";
import { buildUrl, ENDPOINTS } from "./api-endpoints";

export async function getHomePageData(): Promise<{ data: any } | null> {
  const url = buildUrl(ENDPOINTS.HOME_PAGE_DATA);
  try {
    const { data } = await fetchWcApi<any>(url, { next: { revalidate: 60 } });
    if (!data || data.length === 0) {
      console.warn("Home page not found in WordPress. Check slug: 'home-page'");
      return null;
    }

    const page = data[0];
    const acf = page.acf || {};

    // ACF image fields may return attachment IDs (numbers) instead of URLs.
    // Strip out any image field whose value isn't a valid path/URL string
    // so the fallback local images are used instead.
    const imageKeys = [
      "slide_1_img",
      "slide_2_img",
      "slide_3_img",
      "home_about_image",
    ];
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
  } catch (error: any) {
    console.warn(`Home page data fetch failed (using fallback). Reason: ${error.message}`);
    return null;
  }
}
