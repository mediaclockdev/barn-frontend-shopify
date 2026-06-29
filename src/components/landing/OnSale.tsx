"use client";

import TextHeader from "@/src/helper/TextHeader";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import ProductCard from "../cards/ProductCard";
import { ShopifyProduct } from "@/src/utils/shopify-types";
import { useProductStore } from "@/src/store/productStore";

interface OnSaleProp {
  products: ShopifyProduct[];
  title: string;
  highlight: string;
}

const OnSale = ({ products, title, highlight }: OnSaleProp) => {
  return (
    <section className="halfSection pt-0!">
      <div className="container">
        <TextHeader
          text={title}
          highlightedText={highlight}
          url="/deals"
          center={true}
          lgCenter={false}
        />

        {/* 🔥 MOBILE SLIDER */}
        <div className="block md:hidden mt-8 relative">
          <Swiper
            slidesPerView={1}
            spaceBetween={16}
            modules={[Pagination, Navigation]}
            pagination={{ clickable: true }}
            navigation={{
              prevEl: ".onsale-prev",
              nextEl: ".onsale-next",
            }}
            className="pb-10 relative group"
          >
            {products.slice(0, 8).map((product) => (
              <SwiperSlide key={product.id}>
                <div
                  onClick={() =>
                    useProductStore.getState().setSelectedProduct(product)
                  }
                  className="cursor-pointer"
                >
                  <ProductCard product={product} />
                </div>
              </SwiperSlide>
            ))}

            {/* Custom Navigation Arrows */}
            <button
              className="onsale-prev absolute left-0 top-1/2 -translate-y-1/2 bg-primary text-white hover:bg-primary-dark rounded-r-xl py-4 px-1.5 shadow-lg z-20 disabled:opacity-50 cursor-pointer transition-colors"
              aria-label="Previous slide"
            >
              <FiChevronLeft size={24} />
            </button>
            <button
              className="onsale-next absolute right-0 top-1/2 -translate-y-1/2 bg-primary text-white hover:bg-primary-dark rounded-l-xl py-4 px-1.5 shadow-lg z-20 disabled:opacity-50 cursor-pointer transition-colors"
              aria-label="Next slide"
            >
              <FiChevronRight size={24} />
            </button>
          </Swiper>
        </div>

        {/* 💻 DESKTOP GRID */}
        <div className="hidden md:grid mt-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.slice(0, 4).map((product) => (
            <div
              key={product.id}
              onClick={() =>
                useProductStore.getState().setSelectedProduct(product)
              }
              className="cursor-pointer"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OnSale;
