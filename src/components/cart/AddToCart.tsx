"use client";

import { useEffect, useState, useMemo } from "react";
import { useCartStore } from "@/src/store/cartStore";
import { FaArrowLeft } from "react-icons/fa";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Button from "../ui/Button";
import Link from "next/link";
import toast from "react-hot-toast";
import CartMobileItem from "./CartMobileItem";
import CartDesktopTable from "./CartDesktopTable";
import CartTotals from "./CartTotals";
import ProductCard from "../cards/ProductCard";
import BreadCrumb from "../misc/BreadCrumb";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

// Max quantity per item — must match Shopify's backend add-to-cart limit
const MAX_CART_QUANTITY = 50;

const AddToCart = () => {
  const [mounted, setMounted] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [isFetchingRelated, setIsFetchingRelated] = useState(false);
  const {
    items: cart,
    updateQuantity,
    removeItem,
    fetchCart,
    isLoading,
    setShippingInfo,
  } = useCartStore();

  // Clear shipping info whenever the cart items change.
  // This prevents stale shipping costs (e.g. from a previous checkout attempt)
  // from showing up in the cart summary when the contents have changed.
  useEffect(() => {
    setShippingInfo("", null, false);
  }, [cart, setShippingInfo]);

  useEffect(() => {
    setMounted(true);
    fetchCart();
  }, [fetchCart]);

  // Shopify Cart returns fully hydrated items natively — no separate product fetch needed.
  const hydratedCart = useMemo(() => {
    if (!cart) return [];

    return cart.map((item: any) => ({
      product_id: item.product_id,
      variation_id: item.variation_id,
      line_id: item.line_id,
      quantity: item.quantity,
      name: item.name || "Loading...",
      variation_name: item.variation_name || "",
      price: item.price || 0,
      image: item.image || "/images/placeholder.svg",
      slug: item.slug || String(item.product_id),
      maxQuantity: MAX_CART_QUANTITY,
    }));
  }, [cart]);

  // Related products fetching logic kept using cart items
  const cartProductIdsString = useMemo(() => {
    if (!cart || cart.length === 0) return "";
    return Array.from(new Set(cart.map((item) => item.product_id)))
      .sort()
      .join(",");
  }, [cart]);

  useEffect(() => {
    if (!cartProductIdsString) {
      setRelatedProducts([]);
      return;
    }

    const fetchRelated = async () => {
      setIsFetchingRelated(true);
      try {
        const res = await fetch(
          `/api/products/recommended?ids=${cartProductIdsString}`,
        );
        if (res.ok) {
          const data = await res.json();
          setRelatedProducts(data.products || []);
        }
      } catch (error) {
        console.error("Failed to fetch related products:", error);
      } finally {
        setIsFetchingRelated(false);
      }
    };

    fetchRelated();
  }, [cartProductIdsString]);

  const subTotal = useMemo(() => {
    return hydratedCart.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );
  }, [hydratedCart]);

  const handleUpdateQuantity = async (
    product_id: string | number,
    newQuantity: number,
    variation_id: string | number = 0,
    line_id: string = ""
  ) => {
    try {
      await updateQuantity(product_id, newQuantity, variation_id, line_id);
    } catch {
      toast.error("Failed to update quantity");
    }
  };

  const handleRemoveItem = async (
    product_id: string | number,
    variation_id: string | number = 0,
    line_id: string = ""
  ) => {
    try {
      await removeItem(product_id, variation_id, line_id);
      toast.success("Item removed from cart");
    } catch {
      toast.error("Failed to remove item");
    }
  };

  if (!mounted) {
    return (
      <div className="halfSection pt-2! relative">
        <div className="container">
          <div className="mb-2">
            <BreadCrumb />
          </div>
          <h2 className="text-4xl font-bold mb-6">Cart</h2>
          <div className="animate-pulse flex flex-col lg:flex-row gap-8 items-start">
            {/* Left Column Mock */}
            <div className="w-full lg:w-2/3 flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                {/* Table Header mock */}
                <div className="hidden md:flex h-12 bg-gray-100 rounded-xl border border-gray-200 w-full mb-2"></div>

                {/* List items mock */}
                <div className="h-28 bg-gray-100 rounded-xl border border-gray-200 w-full"></div>
                <div className="h-28 bg-gray-100 rounded-xl border border-gray-200 w-full"></div>
              </div>

              {/* Coupon mock */}
              <div className="mt-2 h-12 bg-gray-100 rounded-lg border border-gray-200 w-full max-w-sm"></div>
            </div>

            {/* Right Column Mock */}
            <div className="w-full lg:w-1/3">
              <div className="h-80 bg-gray-100 rounded-3xl border border-gray-200 w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="halfSection pt-2! relative">
      <div className="container">
        <div className="mb-2">
          <BreadCrumb />
        </div>
        <h2 className="text-4xl font-bold mb-6">Cart</h2>

        {hydratedCart.length === 0 ? (
          <div className="text-center py-12 bg-blue-50/30 rounded-lg border border-sky-200 mb-8 mt-4">
            <h3 className="text-2xl font-semibold mb-3">Your cart is empty</h3>
            <p className="text-gray-600 mb-6 text-base">
              Looks like you haven&apos;t added anything to your cart yet.
            </p>
            <Link href="/shop" className="inline-flex justify-center">
              <Button text="Return to Shop" icon={FaArrowLeft} />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left Column: Cart Items & Coupon */}
            <div className="w-full lg:w-2/3 flex flex-col gap-6">
              {/* Mobile Layout */}
              <div className="md:hidden space-y-4">
                {hydratedCart.map((item) => (
                  <CartMobileItem
                    key={`${item.product_id}-${item.variation_id || 0}`}
                    item={item}
                    isLoading={isLoading}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemoveItem={handleRemoveItem}
                  />
                ))}
              </div>

              {/* Desktop Table Layout */}
              <CartDesktopTable
                hydratedCart={hydratedCart}
                isLoading={isLoading}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
              />

              {/* Coupon Section — will be enabled once Shopify cartDiscountCodesUpdate is implemented */}
            </div>

            {/* Right Column: Order Summary */}
            <div className="w-full lg:w-1/3 sticky top-24">
              <CartTotals
                subTotal={subTotal}
                isCartEmpty={hydratedCart.length === 0}
              />
            </div>
          </div>
        )}

        {/* You May Also Like — same design as Shop/Deals pages */}
        {relatedProducts.length > 0 && (
          <div className="bg-gray-50/50 rounded-3xl mt-4 pt-4">
            <div className="max-w-6xl mx-auto w-full">
              <h4 className="text-3xl font-bold w-full text-center mb-4 lg:mb-6">
                {hydratedCart.length === 0 ? (
                  <>Trending <span className="text-primary">Right Now</span></>
                ) : (
                  <>Frequently <span className="text-primary">Bought Together</span></>
                )}
              </h4>
              <div className="block md:hidden relative">
                <Swiper
                  slidesPerView={1}
                  spaceBetween={16}
                  modules={[Pagination, Navigation]}
                  pagination={{ clickable: true }}
                  navigation={{
                    prevEl: ".cart-related-prev",
                    nextEl: ".cart-related-next",
                  }}
                  className="relative group"
                >
                  {relatedProducts.slice(0, 6).map((item) => (
                    <SwiperSlide key={item.id}>
                      <ProductCard product={item} />
                    </SwiperSlide>
                  ))}

                  <button
                    className="cart-related-prev absolute left-0 top-1/2 -translate-y-1/2 bg-primary text-white hover:bg-primary-dark rounded-r-xl py-4 px-1.5 shadow-lg z-20 disabled:opacity-50 cursor-pointer transition-colors"
                    aria-label="Previous slide"
                  >
                    <FiChevronLeft size={24} />
                  </button>
                  <button
                    className="cart-related-next absolute right-0 top-1/2 -translate-y-1/2 bg-primary text-white hover:bg-primary-dark rounded-l-xl py-4 px-1.5 shadow-lg z-20 disabled:opacity-50 cursor-pointer transition-colors"
                    aria-label="Next slide"
                  >
                    <FiChevronRight size={24} />
                  </button>
                </Swiper>
              </div>

              <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-2 lg:gap-4">
                {relatedProducts.slice(0, 4).map((item) => (
                  <ProductCard key={item.id} product={item} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddToCart;
