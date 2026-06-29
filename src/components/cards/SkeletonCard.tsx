import React from "react";

const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden h-full">
      <div className="flex flex-col h-full">
        {/* Image skeleton */}
        <div className="w-full aspect-square bg-gray-200 animate-pulse" />
        
        {/* Content skeleton */}
        <div className="flex flex-col justify-between flex-1 p-3 md:p-4 mt-2">
          <div>
            {/* Title skeleton lines */}
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse mb-2" />
            <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse mb-4" />
            
            {/* Stars skeleton */}
            <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse mb-4" />
          </div>
          
          {/* Price skeleton */}
          <div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse mb-2" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
