"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import Button from "../ui/Button";
import { FaStar, FaRegStar, FaCartPlus, FaList } from "react-icons/fa";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { motion } from "framer-motion";
import { useCartStore } from "@/src/store/cartStore";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import { ShopifyProduct } from "@/src/utils/shopify-types";

interface Prop {
  product: ShopifyProduct;
}

const ProductCard: React.FC<Prop> = ({ product }) => {
  const { title, handle, id, availableForSale, totalInventory, images, variants, options } = product;
  
  const isVariable =
    variants?.length > 1 ||
    (options && options.length > 0 && options[0]?.name !== "Title");

  const firstVariant = variants?.[0];
  const price = firstVariant?.compareAtPrice ? parseFloat(firstVariant.compareAtPrice.amount) : parseFloat(firstVariant?.price?.amount || "0");
  const discountedPrice = firstVariant?.compareAtPrice ? parseFloat(firstVariant.price.amount) : undefined;
  const image = images?.[0]?.url || "/images/placeholder.svg";
  
  const stockStatus = availableForSale ? "instock" : "outofstock";
  const stockQuantity = totalInventory;
  const stars = 5;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);
  const router = useRouter();

  const isOutOfStock = stockStatus === "outofstock";
  const inCart =
    cartItems.find((i) => String(i.product_id) === String(id))?.quantity || 0;
  const currentLimit =
    stockQuantity !== null && stockQuantity !== undefined
      ? stockQuantity - inCart
      : 0;
  const hasReachedMax = currentLimit <= 0;

  // Route directly to handle to ensure correct single product API fetching
  const productLink = `/shop/${handle}`;

  const fallbackImage = "/images/placeholder.svg";
  const safeImage = image || fallbackImage;
  const displayImages = (
    images && images.length > 0 ? images : [{ src: safeImage, url: safeImage }]
  ).slice(0, 5);
  const hasMultipleImages = displayImages.length > 1;

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(
      (prev) => (prev - 1 + displayImages.length) % displayImages.length,
    );
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    if (isVariable) {
      router.push(productLink);
      return;
    }

    if (hasReachedMax) {
      toast.error("You have reached the maximum stock limit for this item.");
      return;
    }

    try {
      await addItem(id, 1, firstVariant?.id);
      toast.success(`${title} added to cart!`);
    } catch {
      toast.error("Failed to add item to cart");
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }).map((_, i) =>
      i < stars ? (
        <FaStar key={i} className="text-yellow-400 w-3.5 h-3.5" />
      ) : (
        <FaRegStar key={i} className="text-gray-300 w-3.5 h-3.5" />
      ),
    );
  };

  return (
    <div
      className={`group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden h-full flex flex-col border border-gray-100 ${isOutOfStock ? "opacity-75 grayscale-30" : ""}`}
    >
      {isOutOfStock ? (
        <span className="absolute top-3 left-3 bg-gray-800 text-white text-[12px] sm:text-md font-bold px-3 py-1 rounded-full z-10 shadow-sm tracking-wide uppercase">
          Out of Stock
        </span>
      ) : (
        discountedPrice && (
          <span className="absolute top-3 right-3 bg-red-500 text-white text-[12px] sm:text-md font-bold px-2 py-1 rounded-full z-10 shadow-sm tracking-wide uppercase">
            SALE
          </span>
        )
      )}

      <Link href={productLink} className="flex flex-col flex-1 relative">
        {/* Image Hub */}
        <motion.div
          initial="hidden"
          whileHover="show"
          className="relative w-full aspect-square bg-gray-50/50 overflow-hidden border-b border-gray-100 p-2 pb-6 md:p-3 md:pb-6"
        >
          <div className="relative w-full h-full rounded-xl overflow-hidden bg-gray-100/50">
            {displayImages.map((img, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 w-full h-full transition-opacity duration-500 ease-in-out ${
                  idx === currentImageIndex
                    ? "opacity-100"
                    : "opacity-0 pointer-events-none"
                }`}
              >
                <Image
                  src={(img as any).url || (img as any).src || (typeof img === 'string' ? img : fallbackImage)}
                  alt={`${title} - Image ${idx + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 mix-blend-multiply group-hover:scale-105"
                  priority={true}
                  placeholder="blur"
                  blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mO88OjxfwAJ7gPNxE0xwgAAAABJRU5ErkJggg=="
                />
              </div>
            ))}
          </div>

          {hasMultipleImages && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 text-gray-900 hover:bg-white rounded-full p-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shadow-sm z-20 cursor-pointer"
                aria-label="Previous image"
              >
                <FiChevronLeft size={18} />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 text-gray-900 hover:bg-white rounded-full p-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shadow-sm z-20 cursor-pointer"
                aria-label="Next image"
              >
                <FiChevronRight size={18} />
              </button>

              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-20 pointer-events-none">
                {displayImages.slice(0, 5).map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      idx === currentImageIndex ? "bg-primary" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 15 },
              show: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.2 }}
            className="absolute inset-x-0 bottom-4 hidden md:flex justify-center px-4"
          >
            <Button
              text={
                isOutOfStock
                  ? "Out of Stock"
                  : hasReachedMax && !isVariable
                    ? "Max in Cart"
                    : isVariable
                      ? "Select Options"
                      : "Add To Cart"
              }
              icon={
                isOutOfStock || (hasReachedMax && !isVariable)
                  ? undefined
                  : isVariable
                    ? FaList
                    : FaCartPlus
              }
              onClick={handleAddToCart}
              disabled={isOutOfStock || (hasReachedMax && !isVariable)}
              className={`w-full justify-center shadow-md bg-opacity-95 ${isOutOfStock || (hasReachedMax && !isVariable) ? "bg-gray-400 cursor-not-allowed" : "bg-primary"}`}
            />
          </motion.div>
        </motion.div>

        {/* Content */}
        <div className="flex flex-col justify-between flex-1 p-4 md:p-5">
          <div>
            {/* <div className="flex items-center gap-1 mb-2">{renderStars()}</div> */}
            <h3 className="text-md md:text-lg font-semibold text-gray-800 line-clamp-2 transition-colors group-hover:text-primary">
              {title.replace(/&amp;/g, "and")}
            </h3>
          </div>

          <div className="mt-2 text-left">
            {discountedPrice ? (
              <p className="flex items-baseline gap-2 flex-wrap">
                <span className="text-gray-400 line-through text-xs md:text-md font-medium">
                  ${Number(price).toFixed(2)}
                </span>
                <span className="text-primary font-bold text-base md:text-lg">
                  ${Number(discountedPrice).toFixed(2)}{" "}
                  <span className="text-xs font-semibold">AUD</span>
                </span>
              </p>
            ) : (
              <p className="font-bold text-gray-800 text-base md:text-lg">
                ${Number(price).toFixed(2)}{" "}
                <span className="text-xs text-gray-500 font-semibold">AUD</span>
              </p>
            )}
          </div>

          <div className="mt-4 md:hidden">
            <Button
              text={
                isOutOfStock
                  ? "Out of Stock"
                  : hasReachedMax && !isVariable
                    ? "Max in Cart"
                    : isVariable
                      ? "Select Options"
                      : "Add To Cart"
              }
              icon={
                isOutOfStock || (hasReachedMax && !isVariable)
                  ? undefined
                  : isVariable
                    ? FaList
                    : FaCartPlus
              }
              onClick={handleAddToCart}
              disabled={isOutOfStock || (hasReachedMax && !isVariable)}
              className={`w-full justify-center py-2 text-md shadow-md ${isOutOfStock || (hasReachedMax && !isVariable) ? "bg-gray-400 cursor-not-allowed" : "bg-primary"}`}
            />
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
