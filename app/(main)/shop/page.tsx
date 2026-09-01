import ShopLayout from "@/src/components/shop/ShopLayout";
import React, { Suspense } from "react";
import {
  fetchShopifyProducts,
  fetchShopifyCategories,
} from "@/src/utils/shopify-products";
import Loading from "./loading";
import { getShopDealsPageData } from "@/src/utils/shop-deals-api";
import { SHOP_DEALS_FALLBACK } from "@/src/utils/shop-deals-fallback";
import { constructMetadata } from "@/src/utils/seo";

export async function generateMetadata() {
  const shopDealsApiRes = await getShopDealsPageData();
  const pageData = { ...SHOP_DEALS_FALLBACK, ...(shopDealsApiRes?.data || {}) };

  return constructMetadata({
    title: `${pageData.shop_title} ${pageData.shop_highlight_title} | Barn`,
    description:
      "Browse our premium selection of products for your livestock and companions.",
  });
}

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const page = async ({ searchParams }: Props) => {
  const resolvedSearchParams = await searchParams;

  // Format parameters to pass to fetchers
  const apiParams: Record<string, string> = {};
  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    if (typeof value === "string") {
      apiParams[key] = value;
    } else if (Array.isArray(value)) {
      apiParams[key] = value.join(",");
    }
  });

  const currentPage = parseInt(apiParams.page, 10) || 1;

  // Provide default pagination
  if (!apiParams.per_page) apiParams.per_page = "12";
  if (!apiParams.page) apiParams.page = currentPage.toString();

  // Default to instock if not specified, remove if "all"
  // TEMPORARILY DISABLED: since your Shopify products are currently availableForSale: false
  // if (!apiParams.stock_status) apiParams.stock_status = "instock";
  // else if (apiParams.stock_status === "all") delete apiParams.stock_status;

  // Force shop page to exclude Deals (on-sale) products
  apiParams.on_sale = "false";

  let products = [];
  let categories = [];

  const catRes = await fetchShopifyCategories().catch((err) => {
    console.error("Failed to fetch categories:", err);
    return [];
  });
  categories = catRes || [];

  // Category expansion (Metaobject -> Tag) is now handled globally inside fetchShopifyProducts!

  const res = await fetchShopifyProducts(apiParams).catch((err) => {
    console.error("Failed to fetch custom products:", err);
    return { products: [], hasNextPage: false, endCursor: null };
  });

  products = res.products || [];
  const hasNextPage = res.hasNextPage || false;
  const endCursor = res.endCursor || null;

  // Fetch header text from CMS
  const shopDealsApiRes: any = await getShopDealsPageData();
  const pageData = { ...SHOP_DEALS_FALLBACK, ...(shopDealsApiRes?.data || {}) };

  return (
    <>
      <Suspense fallback={<Loading />}>
        <ShopLayout
          initialProducts={products}
          initialCursor={endCursor}
          initialHasNextPage={hasNextPage}
          categories={categories}
          title={pageData.shop_title}
          highlight={pageData.shop_highlight_title}
        />
      </Suspense>
    </>
  );
};

export default page;
