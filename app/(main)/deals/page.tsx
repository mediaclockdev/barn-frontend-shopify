import DealsLayout from "@/src/components/deals/DealsLayout";
import React, { Suspense } from "react";
import { fetchShopifyProducts } from "@/src/utils/shopify-products";
import Loading from "./loading";
import { getShopDealsPageData } from "@/src/utils/shop-deals-api";
import { SHOP_DEALS_FALLBACK } from "@/src/utils/shop-deals-fallback";
import { constructMetadata } from "@/src/utils/seo";

export async function generateMetadata() {
  const shopDealsApiRes = await getShopDealsPageData();
  const pageData = { ...SHOP_DEALS_FALLBACK, ...(shopDealsApiRes?.data || {}) };

  return constructMetadata({
    title: `${pageData.deals_title} ${pageData.deals_highlight} | Barn`,
    description:
      "Discover our hottest deals and discounts on animal feed, pet stock, and farm supplies.",
  });
}

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function DealsPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;

  const apiParams: Record<string, string> = {};
  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    if (typeof value === "string") {
      apiParams[key] = value;
    } else if (Array.isArray(value)) {
      apiParams[key] = value.join(",");
    }
  });

  const currentPage = parseInt(apiParams.page, 10) || 1;

  if (!apiParams.per_page) apiParams.per_page = "12";
  if (!apiParams.page) apiParams.page = currentPage.toString();

  // Default to instock if not specified, remove if "all"
  if (!apiParams.stock_status) apiParams.stock_status = "instock";
  else if (apiParams.stock_status === "all") delete apiParams.stock_status;

  // Force deals page to only fetch products on sale
  apiParams.on_sale = "true";

  const res = await fetchShopifyProducts(apiParams).catch((err) => {
    console.error("Failed to fetch sale products:", err);
    return { products: [], hasNextPage: false, endCursor: null };
  });

  // Fetch header text from CMS
  const shopDealsApiRes = await getShopDealsPageData();
  const pageData = { ...SHOP_DEALS_FALLBACK, ...(shopDealsApiRes?.data || {}) };

  return (
    <div>
      <Suspense fallback={<Loading />}>
        <DealsLayout
          initialProducts={res.products}
          initialCursor={res.endCursor}
          initialHasNextPage={res.hasNextPage}
          title={pageData.deals_title}
          highlight={pageData.deals_highlight}
        />
      </Suspense>
    </div>
  );
}
