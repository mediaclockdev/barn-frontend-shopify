"use client";

import React, { useState } from "react";
import Image from "next/image";
import Button from "../ui/Button";
import { FaCartPlus } from "react-icons/fa";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Link from "next/link";
import { ShopifyProduct } from "@/src/utils/shopify-types";
import useCartStore from "@/src/store/cartStore";
import toast from "react-hot-toast";

type Props = {
  product: ShopifyProduct;
};

const OnSaleCard: React.FC<Props> = ({ product }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await addItem(product.id, 1, product.variants?.[0]?.id);
      toast.success("Added to cart!");
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  const validImages =
    product.images && product.images.length > 0
      ? product.images.filter((img: any) => img?.url || img?.src)
      : [];
  const displayImages =
    validImages.length > 0
      ? validImages
      : [{ url: "/images/placeholder.svg" }];
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

  const name = product.title || "Product Name";
  const weight = product.variants?.[0]?.weight ? `${product.variants[0].weight} kg Pack` : "Standard Pack";

  const regularPrice = product.compareAtPriceRange?.minVariantPrice?.amount || product.priceRange?.minVariantPrice?.amount || "0";
  const salePrice = product.priceRange?.minVariantPrice?.amount || "0";

  return (
    <Link
      href={`/shop/${product.handle}`}
      className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition duration-300 flex flex-col overflow-hidden h-full"
    >
      {/* SALE BADGE */}
      <span className="absolute top-2 left-2 bg-primary text-white text-base font-semibold h-12 w-12 flex items-center justify-center rounded-full z-10">
        Sale
      </span>

      {/* IMAGE */}
      <div className="relative w-full aspect-square bg-gray-50 overflow-hidden rounded-t-2xl p-2 md:p-3">
        <div
          className="flex w-full h-full transition-transform duration-300 ease-in-out rounded-xl overflow-hidden"
          style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
        >
          {displayImages.map((img, idx) => (
            <div
              key={idx}
              className="relative w-full h-full shrink-0 flex items-center justify-center"
            >
              <Image
                src={(img as any).url || (img as any).src}
                alt={`${name} - Image ${idx + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover p-2 transition-transform duration-500 rounded-xl mix-blend-multiply"
                priority={true}
              />
            </div>
          ))}
        </div>

        {hasMultipleImages && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 text-gray-800 hover:bg-white rounded-full p-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shadow-sm z-20 cursor-pointer"
              aria-label="Previous image"
            >
              <FiChevronLeft size={18} />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 text-gray-800 hover:bg-white rounded-full p-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shadow-sm z-20 cursor-pointer"
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
      </div>

      {/* CONTENT */}
      <div className="flex flex-col flex-1 p-5 text-center bg-gray-200">
        <h4 className="font-semibold text-lg line-clamp-2 mb-1 min-h-14">
          {name}
        </h4>

        <p className="text-base text-text font-medium mb-2">{weight}</p>

        <div className="mb-4">
          <span className="text-text-muted line-through mr-2 text-sm">
            ${Number(regularPrice).toFixed(2)} AUD
          </span>

          <span className="text-primary font-bold text-lg line-clamp-1 lg:line-clamp-none">
            ${Number(salePrice).toFixed(2)} AUD
          </span>
        </div>

        <div
          className="mt-auto pt-4 flex justify-center w-full"
          onClick={(e) => e.preventDefault()}
        >
          <Button
            text="Add To Cart"
            icon={FaCartPlus}
            onClick={handleAddToCart}
          />
        </div>
      </div>
    </Link>
  );
};

export default OnSaleCard;
