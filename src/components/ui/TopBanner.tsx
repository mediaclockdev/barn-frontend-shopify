"use client";

import Link from "next/link";
import React from "react";
import { FaShoppingBag, FaTruck, FaStar } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import type { BannerData } from "@/src/utils/banner-fallback";

// Icons mapped by index position (design decision, not CMS-controlled)
const BANNER_ICONS = [
  <FaShoppingBag key="shop" />,
  <FaTruck key="truck" />,
  <FaStar key="star" />,
];

interface TopBannerProps {
  data: BannerData;
}

const TopBanner = ({ data }: TopBannerProps) => {
  // Build announcements from flat CMS fields, filter out empty entries
  const announcements = [1, 2, 3]
    .map((i) => ({
      text: data[`banner_${i}_text` as keyof BannerData] as string,
      linkText: data[`banner_${i}_link_text` as keyof BannerData] as string,
      linkUrl: data[`banner_${i}_link_url` as keyof BannerData] as string,
      icon: BANNER_ICONS[i - 1],
    }))
    .filter((item) => item.text && item.linkText && item.linkUrl);

  if (announcements.length === 0) return null;

  return (
    <div id="top-banner" className="bg-primary text-white w-full">
      <Swiper
        modules={[Autoplay]}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        speed={1200}
        loop={true}
        allowTouchMove={true}
        className="w-full"
      >
        {announcements.map((item, idx) => (
          <SwiperSlide key={idx}>
            <div className="py-3 px-4 w-full flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-center sm:text-left text-sm sm:text-base font-medium">
              <span>{item.text}</span>
              <Link
                href={item.linkUrl}
                className="inline-flex items-center gap-2 bg-white text-primary px-4 py-1.5 rounded-full text-sm font-bold hover:bg-gray-100 transition-colors shadow-sm shrink-0 cursor-pointer"
              >
                {item.icon}
                {item.linkText}
              </Link>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default TopBanner;
