"use client";

import { AnimatePresence, motion } from "framer-motion";
import { IoClose } from "react-icons/io5";
import Filters from "../filters/Filters";
import CategoryFilter from "../filters/CategoryFilter";
import { useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  isPrice: boolean;
  isCategory: boolean;
  categories?: any[];
};

const MobileFiltersDrawer: React.FC<Props> = ({
  open,
  onClose,
  isPrice,
  isCategory,
  categories = [],
}) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "-100%", opacity: 0.8 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0.8 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 30,
            }}
            className="fixed top-0 left-0 h-full w-[85%] max-w-85 bg-white z-50 shadow-[8px_0_30px_rgba(0,0,0,0.12)] flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200">
              <h3 className="text-2xl font-semibold tracking-wide">Filters</h3>

              <button
                onClick={onClose}
                className="rounded-full hover:bg-gray-100 transition cursor-pointer"
              >
                <IoClose size={25} />
              </button>
            </div>

            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex-1 overflow-y-auto px-3 py-6 space-y-8 scrollbar-hide"
            >
              <Filters price={isPrice} />
              {isCategory && <CategoryFilter categories={categories} />}
            </motion.div>

            {/* Buttons */}
            <div className="border-t p-2 flex gap-3 bg-white border-gray-200">
              <button
                className="flex-1 border border-gray-300 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition cursor-pointer"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.location.href = window.location.pathname;
                  }
                }}
              >
                Clear
              </button>

              <button
                className="flex-1 bg-primary text-white py-2.5 rounded-lg text-sm font-semibold shadow-sm hover:opacity-90 transition cursor-pointer"
                onClick={onClose}
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileFiltersDrawer;
