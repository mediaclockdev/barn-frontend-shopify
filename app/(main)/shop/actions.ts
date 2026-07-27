"use server";
import { fetchShopifyProducts } from "@/src/utils/shopify-products";

export async function loadMoreProducts(params: Record<string, string>) {
  return await fetchShopifyProducts(params);
}
