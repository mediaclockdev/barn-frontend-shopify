"use client";
import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaAngleDown } from "react-icons/fa6";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

const Filters = ({ price = false }: { price: boolean }) => {
  const [openAvailability, setOpenAvailability] = useState(true);
  const [openPrice, setOpenPrice] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const currentStockStatus = searchParams.get("stock_status") || "instock";
  const currentSort = searchParams.get("orderby") || "";

  const [localStockStatus, setLocalStockStatus] = useState(currentStockStatus);
  const [localSort, setLocalSort] = useState(currentSort);
  const stockTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sortTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalStockStatus(searchParams.get("stock_status") || "instock");
    setLocalSort(searchParams.get("orderby") || "");
  }, [searchParams]);

  const handleStockChange = (status: "instock" | "outofstock") => {
    const newStatus = localStockStatus === status ? "all" : status;
    setLocalStockStatus(newStatus);

    if (stockTimeoutRef.current) {
      clearTimeout(stockTimeoutRef.current);
    }

    stockTimeoutRef.current = setTimeout(() => {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set("stock_status", newStatus);
      currentUrl.searchParams.delete("page");
      router.push(`${currentUrl.pathname}${currentUrl.search}`, { scroll: false });
    }, 500);
  };

  const handlePriceSortChange = (sort: "price_desc" | "price_asc") => {
    const newSort = localSort === sort ? "" : sort;
    setLocalSort(newSort);

    if (sortTimeoutRef.current) {
      clearTimeout(sortTimeoutRef.current);
    }

    sortTimeoutRef.current = setTimeout(() => {
      const currentUrl = new URL(window.location.href);
      if (newSort) {
        currentUrl.searchParams.set("orderby", newSort);
      } else {
        currentUrl.searchParams.delete("orderby");
      }
      currentUrl.searchParams.delete("page");
      router.push(`${currentUrl.pathname}${currentUrl.search}`, { scroll: false });
    }, 500);
  };

  return (
    <div>
      <div className="bg-primary-light">
        <h3 className="text-xl py-3 text-left px-4 font-medium mb-6">
          Filters:
        </h3>
      </div>

      {/* Availability */}
      <div className="mb-8">
        <div className="px-2">
          <button
            onClick={() => setOpenAvailability(!openAvailability)}
            className="w-full flex justify-between items-center bg-primary-light py-3 px-4 cursor-pointer"
          >
            Availability
            <motion.span
              animate={{
                rotate: openAvailability ? 180 : 0,
              }}
              transition={{ duration: 0.2 }}
            >
              <FaAngleDown size={13} className="text-text-muted" />
            </motion.span>
          </button>

          <AnimatePresence initial={false}>
            {openAvailability && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="px-4 py-3 space-y-2 bg-gray-100 rounded mt-1">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localStockStatus === "instock"}
                      onChange={() => handleStockChange("instock")}
                    />
                    In Stock
                  </label>

                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localStockStatus === "outofstock"}
                      onChange={() => handleStockChange("outofstock")}
                    />
                    Out Of Stock
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Price */}
      {price && (
        <div className="mb-8">
          <div className="px-2">
            <button
              onClick={() => setOpenPrice(!openPrice)}
              className="w-full flex justify-between items-center bg-primary-light py-3 px-4 cursor-pointer"
            >
              Price
              <motion.span
                animate={{
                  rotate: openPrice ? 180 : 0,
                }}
                transition={{ duration: 0.2 }}
              >
                <FaAngleDown size={13} className="text-text-muted" />
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {openPrice && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 py-3 space-y-2 bg-gray-100 rounded mt-1">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localSort === "price_desc"}
                        onChange={() => handlePriceSortChange("price_desc")}
                      />
                      High To Low
                    </label>

                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localSort === "price_asc"}
                        onChange={() => handlePriceSortChange("price_asc")}
                      />
                      Low To High
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

export default Filters;
