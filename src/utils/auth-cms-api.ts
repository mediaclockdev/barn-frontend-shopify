import { fetchWcApi } from "./api-client";
import { ENDPOINTS, buildUrl } from "./api-endpoints";

/**
 * Service to fetch dynamic content for the Auth pages.
 */
export async function getAuthPageData() {
  const url = buildUrl(ENDPOINTS.AUTH_PAGE_DATA);

  try {
    // Revalidate every hour
    const { data } = await fetchWcApi<any>(url, { next: { revalidate: 3600 } });

    if (!data || data.length === 0) {
      console.warn(
        "Auth page not found in WordPress. Check slug: 'admin-auth'",
      );
      return null;
    }

    const page = data[0];
    const acf = page.acf || {};

    // ACF image fields may return attachment IDs (numbers) instead of URLs.
    // Strip invalid values so fallback local images are used.
    const imageKeys = [
      "login_image",
      "signup_image",
      "forget_image",
      "reset_image",
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
  } catch (error) {
    console.error("Error fetching Auth page data:", error);
    return null;
  }
}
