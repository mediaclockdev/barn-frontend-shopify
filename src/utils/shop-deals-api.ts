import { fetchWcApi } from "./api-client";
import { ENDPOINTS, buildUrl } from "./api-endpoints";

/**
 * Service to fetch dynamic content for the Shop and Deals page headers.
 */
export async function getShopDealsPageData(): Promise<{ data: any } | null> {
  // Bypassing WooCommerce API to prevent 403 errors during Shopify migration.
  // The frontend will automatically use SHOP_DEALS_FALLBACK.
  return null;
}
