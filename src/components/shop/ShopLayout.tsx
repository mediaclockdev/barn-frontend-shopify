"use client";

import { useState, useEffect } from "react";
import TextHeader from "@/src/helper/TextHeader";
import ProductCard from "../cards/ProductCard";
import Button from "../ui/Button";
import SortBy from "../filters/SortBy";
import CategoryFilter from "../filters/CategoryFilter";
import Filters from "../filters/Filters";
import BreadCrumb from "../misc/BreadCrumb";
import MobileFiltersDrawer from "./MobileFilterDrawer";
import { FiFilter } from "react-icons/fi";
import MobileSort from "../filters/MobileSortBy";
import { ShopifyProduct } from "@/src/utils/shopify-types";
import { useProductStore } from "@/src/store/productStore";
import Pagination from "../misc/Pagination";
import { SHOP_DEALS_FALLBACK } from "@/src/utils/shop-deals-fallback";
import { loadMoreProducts } from "@/app/(main)/shop/actions";
import { useSearchParams } from "next/navigation";

interface ShopLayoutProps {
  initialProducts: any[];
  initialCursor: string | null;
  initialHasNextPage: boolean;
  products?: ShopifyProduct[];
  currentPage?: number;
  totalPages?: number;
  categories?: any[];
  title?: string;
  highlight?: string;
}

const ShopLayout = ({
  initialProducts,
  initialCursor,
  initialHasNextPage,
  products,
  currentPage = 1,
  totalPages = 1,
  categories = [],
  title = SHOP_DEALS_FALLBACK.shop_title,
  highlight = SHOP_DEALS_FALLBACK.shop_highlight_title,
}: ShopLayoutProps) => {
  const [openFilters, setOpenFilters] = useState(false);
  const [productsList, setProductsList] = useState(initialProducts);
  const [cursor, setCursor] = useState(initialCursor);
  const [hasMore, setHasMore] = useState(initialHasNextPage);
  const [loading, setLoading] = useState(false);
  
  const searchParams = useSearchParams();

  // Reset state if URL changes (e.g. category filter changes)
  useEffect(() => {
    setProductsList(initialProducts);
    setCursor(initialCursor);
    setHasMore(initialHasNextPage);
  }, [initialProducts, initialCursor, initialHasNextPage]);

  const handleLoadMore = async () => {
    if (!cursor || loading) return;
    setLoading(true);

    try {
      // Build current filters from URL
      const params: Record<string, string> = {};
      searchParams.forEach((val, key) => {
        params[key] = val;
      });
      // Add cursor
      params.cursor = cursor;

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

  // Ensure shop page scrolls to top on load, in case of Next.js router restoring scroll dynamically midway
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <section className="section pt-2! overflow-visible!">
      <div className="container overflow-visible">
        <BreadCrumb />

        <TextHeader
          text={title}
          highlightedText={highlight}
          btn={false}
          center={true}
          isGrid={false}
          lgCenter={true}
        />

        {/* Mobile Controls */}
        <div className="lg:hidden mb-6">
          <div className="flex items-center bg-white rounded-xl shadow-sm border border-gray-300 overflow-hidden">
            {/* Filter Button */}
            <button
              onClick={() => setOpenFilters(true)}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold cursor-pointer"
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

        <div className="grid grid-cols-1 lg:grid-cols-[290px_1fr] lg:gap-8">
          {/* Sidebar (Desktop Only) */}
          <aside className="hidden lg:block rounded-lg h-fit sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto">
            <Filters price={false} />
            <CategoryFilter categories={categories} />
          </aside>

          {/* Products */}
          <div>
            <div className="hidden lg:block">
              <SortBy />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-4">
              {productsList && productsList.length > 0 ? (
                productsList.map((item) => (
                  <div
                    key={item.id}
                    onClick={() =>
                      useProductStore.getState().setSelectedProduct(item)
                    }
                    className="cursor-pointer"
                  >
                    <ProductCard product={item} />
                  </div>
                ))
              ) : (
                <div className="col-span-1 md:col-span-3 py-16 flex flex-col items-center justify-center text-center bg-gray-50 rounded-2xl border border-gray-100">
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
                    No Products Found
                  </h3>
                  <p className="text-gray-500 max-w-sm px-4">
                    We couldn't find any products matching your current filters.
                    Try adjusting your search criteria.
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
            isCategory={true}
            isPrice={false}
            categories={categories}
          />
        </div>
      </div>
    </section>
  );
};

export default ShopLayout;
