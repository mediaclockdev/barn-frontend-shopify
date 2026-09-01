import { shopifyFetch } from "./shopify-client";
import { cache } from "react";

/**
 * Service to fetch dynamic content for the Top Banner.
 * Requires a Metaobject definition with type "top_banner" and handle "top-banner".
 */
export const getBannerData = cache(async (): Promise<{ data: any } | null> => {
  const query = `
    query getTopBanner {
      metaobject(handle: { type: "top_banner", handle: "top-banner" }) {
        banner_1_text: field(key: "banner_1_text") { value }
        banner_1_link_text: field(key: "banner_1_link_text") { value }
        banner_1_link_url: field(key: "banner_1_link_url") { value }
        banner_2_text: field(key: "banner_2_text") { value }
        banner_2_link_text: field(key: "banner_2_link_text") { value }
        banner_2_link_url: field(key: "banner_2_link_url") { value }
        banner_3_text: field(key: "banner_3_text") { value }
        banner_3_link_text: field(key: "banner_3_link_text") { value }
        banner_3_link_url: field(key: "banner_3_link_url") { value }
      }
    }
  `;

  try {
    const res = await shopifyFetch<any>({ query });
    const metaobject = res?.body?.data?.metaobject;
    
    if (!metaobject) {
      return { data: null };
    }

    // Safely extract values from the metaobject fields
    const rawData = {
      banner_1_text: metaobject.banner_1_text?.value,
      banner_1_link_text: metaobject.banner_1_link_text?.value,
      banner_1_link_url: metaobject.banner_1_link_url?.value,
      banner_2_text: metaobject.banner_2_text?.value,
      banner_2_link_text: metaobject.banner_2_link_text?.value,
      banner_2_link_url: metaobject.banner_2_link_url?.value,
      banner_3_text: metaobject.banner_3_text?.value,
      banner_3_link_text: metaobject.banner_3_link_text?.value,
      banner_3_link_url: metaobject.banner_3_link_url?.value,
    };

    // Remove any undefined or null values so the frontend fallback can fill them in
    const data: Record<string, string> = {};
    Object.entries(rawData).forEach(([key, val]) => {
      if (val) data[key] = val;
    });

    return { data };
  } catch (error) {
    console.error("Failed to fetch Top Banner data from Shopify:", error);
    return { data: null };
  }
});
