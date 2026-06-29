"use client";

import TextHeader from "@/src/helper/TextHeader";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import BlogCard from "../cards/BlogCard";
import type { BlogPost } from "@/src/utils/blog-api";

interface BlogProps {
  /** Pre-fetched blog posts (from homepage API or static fallback) */
  blogs?: BlogPost[];
  title: string;
  highlight: string;
}

const Blog = ({ blogs = [], title, highlight }: BlogProps) => {
  if (!blogs || blogs.length === 0) return null;

  return (
    <section className="halfSection pt-0!">
      <div className="container">
        <TextHeader
          text={title}
          highlightedText={highlight}
          url="/blog"
          center={true}
          lgCenter={false}
        />

        <div className="my-5 w-full">
          {/* Mobile Slider */}
          <div className="md:hidden relative">
            <Swiper
              slidesPerView={1}
              spaceBetween={16}
              modules={[Pagination, Navigation]}
              pagination={{ clickable: true }}
              navigation={{
                prevEl: ".blog-prev",
                nextEl: ".blog-next",
              }}
              className="pb-10 relative group"
              wrapperClass="items-stretch"
            >
              {blogs.map((item) => (
                <SwiperSlide key={item.id} className="h-auto flex">
                  <BlogCard item={item} />
                </SwiperSlide>
              ))}

              {/* Custom Navigation Arrows */}
              <button
                className="blog-prev absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 text-gray-800 hover:bg-white rounded-full p-2 shadow-md z-20 disabled:opacity-50 cursor-pointer"
                aria-label="Previous slide"
              >
                <FiChevronLeft size={20} />
              </button>
              <button
                className="blog-next absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 text-gray-800 hover:bg-white rounded-full p-2 shadow-md z-20 disabled:opacity-50 cursor-pointer"
                aria-label="Next slide"
              >
                <FiChevronRight size={20} />
              </button>
            </Swiper>
          </div>

          {/* Desktop Grid */}
          <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-3 gap-5">
            {blogs.map((item) => (
              <BlogCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Blog;
