"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import {
  FaStar,
  FaRegStar,
  FaCartPlus,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Button from "../ui/Button";
import ProductCard from "../cards/ProductCard";
import BreadCrumb from "../misc/BreadCrumb";
import { useCartStore } from "@/src/store/cartStore";
import toast from "react-hot-toast";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";


interface ProductLayoutProps {
  id?: number | string;
  title?: string;
  price?: number;
  image?: string;
  images?: any[];
  description?: string;
  descriptionHtml?: string;
  stars?: number;
  type?: string;
  attributes?: any[];
  variations?: any[];
  stockStatus?: string;
  relatedIds?: number[];
  relatedProducts?: any[];
  manageStock?: boolean;
  stockQuantity?: number | null;
  slug?: string;
}

const ProductLayout: React.FC<ProductLayoutProps> = ({
  id = null,
  title = "N/A",
  price = 0,
  image = "/images/placeholder.svg",
  images,
  description = "No description available",
  descriptionHtml,
  stars = 0,
  type = "simple",
  attributes = [],
  variations = [],
  stockStatus = "instock",
  relatedIds = [],
  relatedProducts = [],
  manageStock = false,
  stockQuantity = null,
  slug = "",
}) => {
  const [selectedImage, setSelectedImage] = useState<string>(
    images?.[0]?.url || images?.[0]?.src || image || "/images/placeholder.svg",
  );
  const [quantity, setQuantity] = useState(1);
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string>
  >({});
  const [currentVariation, setCurrentVariation] = useState<any>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);
  const isCartLoading = useCartStore((state) => state.isLoading);

  const variationId = currentVariation ? currentVariation.id : (variations?.[0]?.id || 0);
  const inCartItem = cartItems.find(
    (i) => String(i.product_id) === String(id) && String(i.variation_id || "") === String(variationId || "")
  );
  const inCart = inCartItem?.quantity || 0;

  // [REMOVED WOOCOMMERCE CLIENT FETCH]: Related products are now passed down fully resolved from the server via Shopify's Recommendations API

  const displayPrice = currentVariation
    ? parseFloat(
        currentVariation.price?.amount ||
          currentVariation.price ||
          currentVariation.regular_price ||
          price,
      )
    : price;

  const isOutOfStock = currentVariation
    ? currentVariation.availableForSale === false || currentVariation.stock_status === "outofstock"
    : stockStatus === "outofstock";

  // True when a variable product's selected attributes don't match any existing variation
  const noVariationMatch =
    type === "variable" && variations && variations.length > 0 && !currentVariation;

  const maxAvailable = currentVariation
    ? currentVariation.quantityAvailable !== null &&
      currentVariation.quantityAvailable !== undefined
      ? currentVariation.quantityAvailable
      : currentVariation.stock_quantity !== null &&
        currentVariation.stock_quantity !== undefined
        ? currentVariation.stock_quantity
        : currentVariation.stock_qty !== null &&
            currentVariation.stock_qty !== undefined
          ? currentVariation.stock_qty
          : 0
    : stockQuantity !== null && stockQuantity !== undefined
      ? stockQuantity
      : 0;

  const currentLimit = maxAvailable !== null ? Math.min(maxAvailable, 50) - inCart : 0;
  const hasReachedMax = currentLimit <= 0;

  React.useEffect(() => {
    setSelectedImage(images?.[0]?.url || images?.[0]?.src || image || "/images/placeholder.svg");
  }, [id, image, images]);

  // Set default attributes for variable products
  React.useEffect(() => {
    if (type === "variable" && attributes && attributes.length > 0) {
      const initialAttrs: Record<string, string> = {};

      // Default to first options
      attributes.forEach((attr) => {
        if (attr.values && attr.values.length > 0) {
          initialAttrs[attr.name] = attr.values[0];
        }
      });

      // 1. Try to find the variation specified in the URL query parameters
      const urlVariantId = searchParams.get("variant");
      let targetVariation = null;
      
      if (urlVariantId) {
        targetVariation = variations?.find((v) => String(v.id) === urlVariantId);
      }

      // 2. Fall back to the first in-stock variation if no URL variant or if invalid
      if (!targetVariation) {
        targetVariation = variations?.find(
          (v) => v.availableForSale !== false && v.selectedOptions,
        );
      }

      if (targetVariation) {
        attributes.forEach((attr) => {
          let foundOption = "";
          const normalize = (str: any) =>
            String(str)
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "");
          const attrNameNorm = normalize(attr.name);

          const findMatch = (key: string, value: any) => {
            const possibleKeys = [key, key.replace("pa_", ""), `pa_${key}`].map(
              normalize,
            );
            if (possibleKeys.includes(attrNameNorm) && value !== "") {
              const valNorm = normalize(value);
              const valNormWithoutSuffix = normalize(
                String(value).replace(/-\d+$/, ""),
              );
              const matchingOpt = attr.values.find(
                (o: string) =>
                  normalize(o) === valNorm ||
                  normalize(o) === valNormWithoutSuffix,
              );
              if (matchingOpt) foundOption = matchingOpt;
            }
          };

          if (Array.isArray(targetVariation.selectedOptions)) {
            targetVariation.selectedOptions.forEach((a: any) =>
              findMatch(a.name || a.attribute || "", a.value),
            );
          } else {
            Object.entries(targetVariation.selectedOptions).forEach(([k, v]) =>
              findMatch(k, v),
            );
          }

          if (foundOption) {
            initialAttrs[attr.name] = foundOption;
          }
        });
      }

      setSelectedAttributes(initialAttrs);
    }
  }, [type, attributes, variations]);

  // Match current variation
  React.useEffect(() => {
    if (type === "variable" && variations && variations.length > 0) {
      const matched = variations.find((v) => {
        if (!v.selectedOptions) return false;

        // Support WooCommerce Array format: [{ id: 0, name: "pa_colour", option: "red" }]
        if (Array.isArray(v.selectedOptions)) {
          return v.selectedOptions.every((attrItem: any) => {
            const nameKey = attrItem.name || attrItem.attribute || "";
            const possibleKeys = [
              nameKey,
              nameKey.replace("pa_", ""),
              `pa_${nameKey}`,
            ].map((k) =>
              String(k)
                .toLowerCase()
                .replace(/[^a-z0-9]/g, ""),
            );

            // Look for matching key in selectedAttributes
            const selectedEntry = Object.entries(selectedAttributes).find(
              ([k]) =>
                possibleKeys.includes(
                  String(k)
                    .toLowerCase()
                    .replace(/[^a-z0-9]/g, ""),
                ),
            );
            const selectedVal = selectedEntry ? selectedEntry[1] : "";
            const option = attrItem.value || "";

            if (option === "") return true;

            const normalizeWcSlug = (str: string) => {
              return String(str)
                .toLowerCase()
                .replace(/&amp;/g, "")
                .replace(/[^a-z0-9]/g, "");
            };

            const normSelected = normalizeWcSlug(selectedVal);
            const normOption = normalizeWcSlug(option);
            const normOptionWithoutSuffix = normalizeWcSlug(
              String(option).replace(/-\d+$/, ""),
            );

            return (
              normSelected === normOption ||
              normSelected === normOptionWithoutSuffix ||
              String(selectedVal).toLowerCase() === String(option).toLowerCase()
            );
          });
        }

        // Support string/object Map fallback: { "pa_colour": "red" }
        return Object.entries(v.selectedOptions).every(([key, value]) => {
          const possibleKeys = [key, key.replace("pa_", ""), `pa_${key}`].map(
            (k) =>
              String(k)
                .toLowerCase()
                .replace(/[^a-z0-9]/g, ""),
          );
          const selectedEntry = Object.entries(selectedAttributes).find(([k]) =>
            possibleKeys.includes(
              String(k)
                .toLowerCase()
                .replace(/[^a-z0-9]/g, ""),
            ),
          );
          const selectedVal = selectedEntry ? selectedEntry[1] : "";

          if (value === "") return true;

          const normalizeWcSlug = (str: string) => {
            return String(str)
              .toLowerCase()
              .replace(/&amp;/g, "")
              .replace(/[^a-z0-9]/g, "");
          };

          const normSelected = normalizeWcSlug(selectedVal);
          let normValue = "";
          let normValueWithoutSuffix = "";
          if (typeof value === "string") {
            normValue = normalizeWcSlug(value);
            normValueWithoutSuffix = normalizeWcSlug(
              value.replace(/-\d+$/, ""),
            );
          }

          return (
            normSelected === normValue ||
            (normValueWithoutSuffix &&
              normSelected === normValueWithoutSuffix) ||
            String(selectedVal).toLowerCase() === String(value).toLowerCase()
          );
        });
      });

      setCurrentVariation(matched || null);

      if (matched && matched.image) {
        const imgUrl =
          typeof matched.image === "string"
            ? matched.image
            : matched.image?.url || matched.image?.src;

        if (imgUrl) {
          setSelectedImage(imgUrl);
        } else {
          setSelectedImage(images?.[0]?.url || images?.[0]?.src || image || "/images/placeholder.svg");
        }
      } else {
        setSelectedImage(images?.[0]?.url || images?.[0]?.src || image || "/images/placeholder.svg");
      }
    }
  }, [selectedAttributes, variations, type]);

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  // Ensure quantity resets if variation changes and limit < quantity
  useEffect(() => {
    if (quantity > currentLimit && currentLimit > 0) {
      setQuantity(currentLimit);
    } else if (currentLimit <= 0) {
      setQuantity(1);
    }
  }, [currentLimit, quantity]);

  const displayImages = React.useMemo(() => {
    if (currentVariation && currentVariation.image) {
      const imgUrl =
        typeof currentVariation.image === "string"
          ? currentVariation.image
          : currentVariation.image?.url || currentVariation.image?.src;

      if (imgUrl) {
        const varImages = [{ id: "var-main", src: imgUrl }];
        if (
          currentVariation.gallery &&
          Array.isArray(currentVariation.gallery)
        ) {
          currentVariation.gallery.forEach((g: any, idx: number) => {
            const gUrl = typeof g === "string" ? g : g.src;
            if (gUrl) {
              varImages.push({ id: `var-gal-${idx}`, src: gUrl });
            }
          });
        }
        return varImages;
      }
    }
    return images || [];
  }, [currentVariation, images]);

  const handleNextImage = () => {
    if (!displayImages || displayImages.length <= 1) return;
    const currentIndex = displayImages.findIndex(
      (img) => (img.url || img.src) === selectedImage,
    );
    const nextIndex = (currentIndex + 1) % displayImages.length;
    setSelectedImage(displayImages[nextIndex].url || displayImages[nextIndex].src);
  };

  const handlePrevImage = () => {
    if (!displayImages || displayImages.length <= 1) return;
    const currentIndex = displayImages.findIndex(
      (img) => (img.url || img.src) === selectedImage,
    );
    const prevIndex =
      (currentIndex - 1 + displayImages.length) % displayImages.length;
    setSelectedImage(displayImages[prevIndex].url || displayImages[prevIndex].src);
  };

  const handleIncreaseQuantity = () => {
    if (quantity < currentLimit) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleAddToCart = async () => {
    if (isOutOfStock || hasReachedMax || noVariationMatch) return;
    try {
      const variationId = currentVariation 
        ? currentVariation.id 
        : (variations?.[0]?.id || 0);
      let variationName = "";
      let variationAttributes: Record<string, string> = {};

      // Format attribute name: "Pack Size" → "Pack Size"
      const formatAttrName = (name: string) =>
        name
          .replace(/[-_]/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());

      // Format attribute value: "500mls" → "500mls", "pony" → "Pony", "dark-red" → "Dark Red"
      const formatAttrValue = (val: string) =>
        val
          .replace(/[-_]/g, " ")
          .replace(/\b([a-zA-Z])/g, (c) => c.toUpperCase());

      if (currentVariation && currentVariation.selectedOptions) {
        if (Array.isArray(currentVariation.selectedOptions)) {
          variationName = currentVariation.selectedOptions
            .map((a: any) => formatAttrValue(a.value))
            .join(" / ");
          // Build a flat object: { "Size": "500mls", "Color": "Red" }
          currentVariation.selectedOptions.forEach((a: any) => {
            const key = formatAttrName(a.name || a.attribute);
            variationAttributes[key] = formatAttrValue(a.value);
          });
        } else {
          variationName = Object.values(currentVariation.selectedOptions)
            .map((v) => formatAttrValue(v as string))
            .join(" / ");
          // Format keys and values
          Object.entries(currentVariation.selectedOptions).forEach(([key, val]) => {
            variationAttributes[formatAttrName(key)] = formatAttrValue(
              val as string,
            );
          });
        }
      }

      await addItem(
        id as string | number,
        quantity,
        variationId,
        variationName,
        variationAttributes,
      );
      setQuantity(1);
      toast.success(`${title} added to cart!`);
    } catch {
      toast.error("Failed to add item to cart");
    }
  };

  const handleBuyItNow = async () => {
    if (isOutOfStock || hasReachedMax || noVariationMatch) return;
    try {
      const variationId = currentVariation 
        ? currentVariation.id 
        : (variations?.[0]?.id || 0);
      let variationName = "";
      let variationAttributes: Record<string, string> = {};

      if (currentVariation && currentVariation.selectedOptions) {
        if (Array.isArray(currentVariation.selectedOptions)) {
          variationName = currentVariation.selectedOptions
            .map((a: any) => a.value)
            .join(" / ");
          // Build a flat object
          currentVariation.selectedOptions.forEach((a: any) => {
            const key = a.name || a.attribute;
            variationAttributes[key] = a.value;
          });
        } else {
          variationName = Object.values(currentVariation.selectedOptions).join(
            " / ",
          );
          variationAttributes = { ...currentVariation.selectedOptions };
        }
      }

      await addItem(
        id as string | number,
        quantity,
        variationId,
        variationName,
        variationAttributes,
      );
      
      const { checkoutUrl } = useCartStore.getState();
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        router.push("/cart"); // Fallback to cart if no checkout URL
      }
    } catch {
      toast.error("Failed to process Buy It Now");
    }
  };

  const handleAttributeChange = (name: string, val: string) => {
    setSelectedAttributes((prev) => ({ ...prev, [name]: val }));
  };


  return (
    <section className="overflow-hidden">
      <div className="container px-4 lg:px-0 mx-auto">
        <div className="max-w-6xl mx-auto w-full">
          <BreadCrumb
            customLabels={slug ? { [slug]: title.replace(/&amp;/g, "and") } : {}}
          />
        </div>

        {/* Product Card */}
        <div className="grid md:grid-cols-12 gap-8 lg:gap-10 items-start justify-center max-w-6xl mx-auto my-6">
          {/* Image Hub */}
          <div className="flex flex-col gap-4 relative md:col-span-5">
            {isOutOfStock && (
              <span className="absolute top-4 left-4 bg-gray-800 text-white text-xs md:text-sm font-bold px-4 py-2 rounded-full z-10 shadow-sm tracking-wide uppercase">
                Out of Stock
              </span>
            )}
            {!isOutOfStock && noVariationMatch && (
              <span className="absolute top-4 left-4 bg-gray-500 text-white text-xs md:text-sm font-bold px-4 py-2 rounded-full z-10 shadow-sm tracking-wide uppercase">
                Unavailable
              </span>
            )}
            <div
              className={`p-2 border border-gray-200 rounded-2xl bg-gray-50/50 flex flex-col items-center justify-center shadow-sm ${isOutOfStock || noVariationMatch ? "opacity-75 grayscale-30" : ""}`}
            >
              <div className="relative w-full aspect-square overflow-hidden rounded-xl bg-gray-100/50 group">
                <Image
                  src={selectedImage}
                  alt={title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 rounded-xl mix-blend-multiply group-hover:scale-105"
                  priority
                  placeholder="blur"
                  blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mO88OjxfwAJ7gPNxE0xwgAAAABJRU5ErkJggg=="
                />
                {displayImages && displayImages.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition z-10"
                    >
                      <FaChevronLeft className="text-gray-600" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition z-10"
                    >
                      <FaChevronRight className="text-gray-600" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Thumbnails */}
            {displayImages && displayImages.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3 pt-2">
                {displayImages.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    onClick={() => setSelectedImage(img.url || img.src)}
                    className={`relative aspect-square rounded-lg border-2 overflow-hidden transition-all bg-gray-100/50 group ${
                      selectedImage === (img.url || img.src)
                        ? "border-primary"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img.url || img.src || "/images/placeholder.svg"}
                      alt={`${title} thumbnail ${idx + 1}`}
                      fill
                      sizes="100px"
                      className="object-cover p-1.5 transition-transform duration-500 rounded-lg mix-blend-multiply group-hover:scale-110"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex flex-col gap-4 lg:py-4 md:col-span-7">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              {title.replace(/&amp;/g, "and")}
            </h1>

            {/* Variable Product Attributes */}
            {type === "variable" && attributes && attributes.length > 0 && (
              <div className="flex flex-col gap-4 mt-2">
                {attributes.map((attr, idx) => (
                  <div key={idx} className="w-full max-w-xs">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      {attr.name
                        .replace("pa_", "")
                        .replace(/[-_]/g, " ")
                        .toLowerCase()
                        .replace(/\b\w/g, (c: string) => c.toUpperCase())}
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 text-gray-800 font-medium focus:ring-2 focus:ring-primary focus:border-primary outline-none cursor-pointer appearance-none shadow-sm hover:border-gray-400 transition"
                      style={{
                        backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 1rem top 50%",
                        backgroundSize: "0.65rem auto",
                      }}
                      value={selectedAttributes[attr.name] || ""}
                      onChange={(e) =>
                        handleAttributeChange(attr.name, e.target.value)
                      }
                    >
                      {(attr.options || attr.values || []).map((opt: string, j: number) => (
                        <option
                          key={j}
                          value={opt}
                          className="bg-white text-gray-800"
                        >
                          {opt
                            .replace(/&amp;/g, "and")
                            .replace(/[-_]/g, " ")
                            .toLowerCase()
                            .replace(/\b\w/g, (c) => c.toUpperCase())}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-baseline gap-2">
              <p className="text-primary font-bold text-3xl">
                ${(displayPrice * quantity).toFixed(2)}{" "}
                <span className="text-lg text-gray-400 font-semibold">AUD</span>
              </p>
              {quantity > 1 && (
                <span className="text-sm text-gray-400 ml-2">
                  (${displayPrice.toFixed(2)} each)
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap md:flex-nowrap gap-6 items-end mt-4">
              <div className="flex flex-col items-start gap-3 w-fit">
                <p className="font-semibold text-gray-700">Quantity</p>
                <div className="flex items-center border border-gray-300 rounded-full bg-white h-12">
                  <button
                    onClick={handleDecreaseQuantity}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="w-12 h-full flex items-center justify-center text-xl hover:bg-gray-100 rounded-l-full disabled:opacity-50 transition cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-medium text-lg">
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncreaseQuantity}
                    disabled={
                      quantity >= currentLimit || isOutOfStock || hasReachedMax
                    }
                    className="w-12 h-full flex items-center justify-center text-xl hover:bg-gray-100 rounded-r-full disabled:opacity-50 transition cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex-1 w-full flex flex-col gap-3 min-w-50">
                <Button
                  text={
                    isCartLoading 
                      ? "Adding..."
                      : isOutOfStock
                        ? "Out of Stock"
                        : noVariationMatch
                          ? "Unavailable"
                          : hasReachedMax
                            ? "Max in Cart"
                            : "Add to Cart"
                  }
                  icon={
                    isCartLoading || isOutOfStock || hasReachedMax || noVariationMatch
                      ? undefined
                      : FaCartPlus
                  }
                  onClick={handleAddToCart}
                  disabled={isCartLoading || isOutOfStock || hasReachedMax || noVariationMatch}
                  className={`w-full justify-center h-12 text-lg shadow-md ${
                    isOutOfStock || hasReachedMax || noVariationMatch || isCartLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : ""
                  }`}
                />
              </div>
            </div>

            <div className="mt-2 w-full">
              <Button
                text={isCartLoading ? "Processing..." : "Buy It Now"}
                onClick={handleBuyItNow}
                disabled={isCartLoading || isOutOfStock || hasReachedMax || noVariationMatch}
                className={`w-full justify-center h-12 text-lg shadow-md ${
                  isOutOfStock || hasReachedMax || noVariationMatch
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed hidden"
                    : isCartLoading
                      ? "bg-gray-400 cursor-not-allowed text-white"
                      : "bg-gray-900 hover:bg-gray-800 text-white"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="max-w-6xl mx-auto border-t border-gray-200 py-4">
          <h4 className="text-4xl font-bold mb-4 text-gray-900">
            Product <span className="text-primary">Description</span>
          </h4>

          <div
            className="text-lg text-gray-700 leading-relaxed prose prose-lg prose-gray max-w-none prose-p:text-gray-700 prose-headings:text-gray-900 prose-a:text-primary"
            dangerouslySetInnerHTML={{
              __html:
                currentVariation?.description &&
                currentVariation.description.trim() !== ""
                  ? currentVariation.description
                  : (descriptionHtml || description),
            }}
          />
        </div>

        {/* You may also like */}
        {relatedProducts.length > 0 && (
          <div className="bg-gray-50/50 rounded-3xl my-4 pb-4">
            <div className="max-w-6xl mx-auto w-full">
              <h4 className="text-3xl font-bold w-full text-center mb-4 lg:mb-6">
                You May <span className="text-primary">Also Like</span>
              </h4>

              {/* Mobile Slider */}
              <div className="block md:hidden relative">
                <Swiper
                  slidesPerView={1}
                  spaceBetween={16}
                  modules={[Pagination, Navigation]}
                  pagination={{ clickable: true }}
                  navigation={{
                    prevEl: ".related-prev",
                    nextEl: ".related-next",
                  }}
                  className="pb-5 relative group"
                >
                  {relatedProducts.slice(0, 4).map((item) => (
                    <SwiperSlide key={item.id}>
                      <ProductCard product={item} />
                    </SwiperSlide>
                  ))}

                  <button
                    className="related-prev absolute left-0 top-1/2 -translate-y-1/2 bg-primary text-white hover:bg-primary-dark rounded-r-xl py-4 px-1.5 shadow-lg z-20 disabled:opacity-50 cursor-pointer transition-colors"
                    aria-label="Previous slide"
                  >
                    <FiChevronLeft size={24} />
                  </button>
                  <button
                    className="related-next absolute right-0 top-1/2 -translate-y-1/2 bg-primary text-white hover:bg-primary-dark rounded-l-xl py-4 px-1.5 shadow-lg z-20 disabled:opacity-50 cursor-pointer transition-colors"
                    aria-label="Next slide"
                  >
                    <FiChevronRight size={24} />
                  </button>
                </Swiper>
              </div>

              {/* Desktop Grid */}
              <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-2 lg:gap-4">
                {relatedProducts.slice(0, 4).map((item) => (
                  <ProductCard key={item.id} product={item} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductLayout;
