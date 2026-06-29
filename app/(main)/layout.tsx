import TopBanner from "@/src/components/ui/TopBanner";
import { getBannerData } from "@/src/utils/banner-api";
import { BANNER_FALLBACK } from "@/src/utils/banner-fallback";
import React from "react";

export default async function MainLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const bannerRes = await getBannerData();
  const bannerData = { ...BANNER_FALLBACK, ...(bannerRes?.data || {}) };

  return (
    <>
      <TopBanner data={bannerData} />
      {children}
    </>
  );
}
