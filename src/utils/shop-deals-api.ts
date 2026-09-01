import { shopifyFetch } from "./shopify-client";
import { cache } from "react";

/**
 * Service to fetch dynamic content for the Shop and Deals page headers from Shopify Metaobjects.
 * Requires two Metaobject definitions: "shop_page" and "deals_page".
 */
export const getShopDealsPageData = cache(async (): Promise<{ data: any } | null> => {
  const query = `
    query getShopDealsPage {
      shop: metaobject(handle: { type: "shop_page", handle: "shop-page" }) {
        shop_title: field(key: "shop_title") { value }
        shop_highlight_title: field(key: "shop_highlight_title") { value }
      }
      deals: metaobject(handle: { type: "deals_page", handle: "deals-page" }) {
        deals_title: field(key: "deals_title") { value }
        deals_highlight_title: field(key: "deals_highlight_title") { value }
      }
    }
  `;

  try {
    const res = await shopifyFetch<any>({ query });
    const shopMetaobject = res?.body?.data?.shop;
    const dealsMetaobject = res?.body?.data?.deals;
    
    // Safely extract values from the metaobject fields
    const rawData = {
      shop_title: shopMetaobject?.shop_title?.value,
      shop_highlight_title: shopMetaobject?.shop_highlight_title?.value,
      deals_title: dealsMetaobject?.deals_title?.value,
      deals_highlight_title: dealsMetaobject?.deals_highlight_title?.value,
    };

    // Remove any undefined or null values so the frontend fallback can fill them in
    const data: Record<string, string> = {};
    Object.entries(rawData).forEach(([key, val]) => {
      if (val) data[key] = val;
    });

    return { data };
  } catch (error) {
    console.error("Failed to fetch Shop/Deals Page data from Shopify:", error);
    return { data: null };
  }
});
