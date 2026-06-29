"use client";

import TextHeader from "@/src/helper/TextHeader";
import CategoryCard from "../cards/CategoryCard";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";

const ShopBy = ({ categories = [] }: { categories?: any[] }) => {
  // Take up to 8 categories to show on the landing page
  const displayCategories = categories.slice(0, 8);

  return (
    <section className="halfSection">
      <div className="container">
        <TextHeader
          text="Shop By"
          highlightedText="Category"
          url="/categories"
        />

        {/* 🔥 MOBILE SLIDER */}
        <div className="block md:hidden my-5">
          <Swiper
            slidesPerView={1.2}
            spaceBetween={16}
            modules={[Pagination]}
            pagination={{ clickable: true }}
            className=""
          >
            {displayCategories.map((item) => {
              const imgUrl =
                item?.image?.src ||
                (typeof item.image === "string"
                  ? item.image
                  : "/images/category/cat1.png");
              return (
                <SwiperSlide key={item.id} className="">
                  <CategoryCard
                    id={item.id}
                    name={item.name}
                    image={imgUrl}
                    to={`/shop?category=${item.id}`}
                  />
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>

        {/* 💻 DESKTOP GRID */}
        <div className="hidden md:block my-5">
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-5">
            {displayCategories.map((item) => {
              const imgUrl =
                item?.image?.src ||
                (typeof item.image === "string"
                  ? item.image
                  : "/images/category/cat1.png");
              return (
                <CategoryCard
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  image={imgUrl}
                  to={`/shop?category=${item.id}`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopBy;
