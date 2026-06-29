import React from "react";

export default function Loading() {
  return (
    <div className="container px-4 lg:px-0 mx-auto pb-20 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="h-6 bg-gray-200 rounded w-48 mt-8 mb-4"></div>

      {/* Product Skeleton */}
      <div className="grid md:grid-cols-12 gap-8 lg:gap-10 items-start justify-center max-w-6xl mx-auto my-6">
        {/* Left: Image Skeleton (Col Span 5) */}
        <div className="flex flex-col gap-4 md:col-span-5 w-full">
          <div className="w-full aspect-square bg-gray-200 rounded-2xl"></div>
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="aspect-square bg-gray-200 rounded-lg"
              ></div>
            ))}
          </div>
        </div>

        {/* Right: Info Skeleton (Col Span 7) */}
        <div className="flex flex-col gap-5 lg:py-4 md:col-span-7 w-full">
          {/* Title */}
          <div className="h-10 bg-gray-200 rounded w-full md:w-3/4 mb-2"></div>

          {/* Attributes/Variations */}
          <div className="space-y-4 mt-2">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-12 bg-gray-200 rounded-lg w-full max-w-xs"></div>
          </div>

          {/* Price */}
          <div className="h-12 bg-gray-200 rounded w-40 mt-4"></div>

          {/* Actions: Quantity and Add to Cart */}
          <div className="flex flex-wrap md:flex-nowrap gap-6 items-end mt-4">
            <div className="flex flex-col gap-3">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-12 bg-gray-200 rounded-full w-36"></div>
            </div>
            <div className="flex-1 w-full">
              <div className="h-12 bg-gray-200 rounded-xl w-full"></div>
            </div>
          </div>

          {/* Buy It Now */}
          <div className="h-12 bg-gray-200 rounded-xl w-full mt-2"></div>
        </div>
      </div>

      {/* Description Skeleton */}
      <div className="max-w-6xl mx-auto border-t border-gray-200 py-10 mt-10">
        <div className="h-10 bg-gray-200 rounded w-64 mb-8"></div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    </div>
  );
}
