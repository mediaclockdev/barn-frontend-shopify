import SkeletonCard from "@/src/components/cards/SkeletonCard";
import BreadCrumb from "@/src/components/misc/BreadCrumb";
import TextHeader from "@/src/helper/TextHeader";

export default function Loading() {
  return (
    <section className="section pt-2! relative z-0">
      <div className="container">
        <BreadCrumb />

        <TextHeader
          text="Shop"
          highlightedText="Products"
          btn={false}
          center={true}
          isGrid={false}
          lgCenter={true}
        />

        {/* Mobile Controls Skeleton */}
        <div className="lg:hidden mb-6">
          <div className="h-12 bg-gray-100 animate-pulse rounded-xl w-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[290px_1fr] lg:gap-10">
          {/* Sidebar Skeleton (Desktop Only) */}
          <aside className="hidden lg:block rounded-lg h-fit space-y-8 mt-2">
            <div className="h-37.5 bg-gray-100 animate-pulse rounded-xl w-full" />
            <div className="h-137.5 bg-gray-100 animate-pulse rounded-xl w-full" />
          </aside>

          {/* Products Skeleton */}
          <div>
            <div className="hidden lg:block mb-5">
              <div className="h-16 bg-gray-100 animate-pulse rounded-lg lg:w-full ml-auto" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
