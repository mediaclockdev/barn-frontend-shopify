"use client";

import TextHeader from "@/src/helper/TextHeader";
import ProductCard from "../cards/ProductCard";
import Button from "../ui/Button";
import Filters from "../filters/Filters";
import SortBy from "../filters/SortBy";
import BreadCrumb from "../misc/BreadCrumb";
import { useState } from "react";
import { FiFilter } from "react-icons/fi";
import MobileFiltersDrawer from "../shop/MobileFilterDrawer";
import MobileSort from "../filters/MobileSortBy";
import { useProductStore } from "@/src/store/productStore";
import Pagination from "../misc/Pagination";
import { ShopifyProduct } from "@/src/utils/shopify-types";
import { SHOP_DEALS_FALLBACK } from "@/src/utils/shop-deals-fallback";
import { loadMoreProducts } from "@/app/(main)/shop/actions";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

interface DealsLayoutProps {
  initialProducts: any[];
  initialCursor: string | null;
  initialHasNextPage: boolean;
  title?: string;
  highlight?: string;
}

const DealsLayout = ({
  initialProducts,
  initialCursor,
  initialHasNextPage,
  title = SHOP_DEALS_FALLBACK.deals_title,
  highlight = SHOP_DEALS_FALLBACK.deals_highlight,
}: DealsLayoutProps) => {
  const [openFilters, setOpenFilters] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [productsList, setProductsList] = useState(initialProducts);
  const [cursor, setCursor] = useState(initialCursor);
  const [hasMore, setHasMore] = useState(initialHasNextPage);
  const [loading, setLoading] = useState(false);
  
  const searchParams = useSearchParams();

  // Reset state if URL changes
  useEffect(() => {
    setProductsList(initialProducts);
    setCursor(initialCursor);
    setHasMore(initialHasNextPage);
  }, [initialProducts, initialCursor, initialHasNextPage]);

  const handleLoadMore = async () => {
    if (!cursor || loading) return;
    setLoading(true);

    try {
      const params: Record<string, string> = {};
      searchParams.forEach((val, key) => {
        params[key] = val;
      });
      params.cursor = cursor;
      // Force deals page rule just in case
      params.on_sale = "true";

      const res = await loadMoreProducts(params);
      
      setProductsList((prev) => {
        const existingIds = new Set(prev.map(p => p.id));
        const newProducts = res.products.filter(p => !existingIds.has(p.id));
        return [...prev, ...newProducts];
      });
      setCursor(res.endCursor);
      setHasMore(res.hasNextPage);
    } catch (error) {
      console.error("Failed to load more products:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section pt-2! overflow-visible!">
      <div className="container overflow-visible">
        <BreadCrumb />

        <TextHeader
          text={title}
          highlightedText={highlight}
          btn={false}
          center={true}
          lgCenter={true}
        />

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] xl:grid-cols-[290px_1fr] lg:gap-8">
          <div className="lg:hidden mb-6">
            <div className="flex items-center bg-white rounded-xl shadow-sm border overflow-hidden">
              {/* Filter */}
              <button
                onClick={() => setOpenFilters(true)}
                className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold active:bg-gray-100 transition"
              >
                <FiFilter size={16} />
                Filters
              </button>

              {/* Divider */}
              <div className="w-px h-6 bg-gray-200" />

              {/* Sort */}
              <div className="flex-1">
                <MobileSort />
              </div>
            </div>
          </div>

          <aside className="hidden lg:block rounded-lg h-fit sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto">
            <Filters price={true} />
          </aside>

          <div>
            <div className="hidden lg:block">
              <SortBy />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-4">
              {productsList && productsList.length > 0 ? (
                productsList.map((item) => (
                  <div
                    key={item.id}
                    onClick={
                      isDisabled
                        ? undefined
                        : () =>
                            useProductStore.getState().setSelectedProduct(item)
                    }
                    className={
                      isDisabled ? "pointer-events-none opacity-50" : ""
                    }
                  >
                    <ProductCard product={item} />
                  </div>
                ))
              ) : (
                <div className="col-span-2 md:col-span-3 py-16 flex flex-col items-center justify-center text-center bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="w-20 h-20 mb-4 rounded-full bg-gray-200 flex items-center justify-center">
                    <svg
                      className="w-10 h-10 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    No Deals Found
                  </h3>
                  <p className="text-gray-500 max-w-sm px-4">
                    There are currently no hot deals matching your filters. Try
                    adjusting your search criteria.
                  </p>
                  <button
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        window.location.href = window.location.pathname;
                      }
                    }}
                    className="mt-6 px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 cursor-pointer transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
            {/* Pagination Controls */}
            {hasMore && (
              <div className="flex justify-center mt-12 mb-8">
                <Button
                  onClick={handleLoadMore}
                  disabled={loading}
                  text={loading ? "Loading..." : "Load More Products"}
                />
              </div>
            )}
          </div>
        </div>
        <div className="relative">
          <MobileFiltersDrawer
            open={openFilters}
            onClose={() => setOpenFilters(false)}
            isCategory={false}
            isPrice={true}
          />
        </div>
      </div>
    </section>
  );
};

export default DealsLayout;
