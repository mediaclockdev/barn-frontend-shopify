import Image from "next/image";
import React from "react";
import { FaAngleDown } from "react-icons/fa6";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

const SortBy = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const currentSort = searchParams.get("orderby") || "";

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams);

    if (value) {
      params.set("orderby", value);
    } else {
      params.delete("orderby");
    }
    // reset to page 1 when sort changes
    params.delete("page");

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="bg-primary-light px-6 py-3 rounded lg:mb-8 flex justify-center items-center relative">
      {/* <div className="absolute right-10 bottom-1/2 hidden lg:block">
        <Image alt="Cat" src={"/images/catdog.png"} width={200} height={200} />
      </div> */}
      <div className="flex items-center flex-col lg:flex-row gap-3 text-sm">
        <span className="text-base">Sort:</span>

        <div className="relative">
          <select
            value={currentSort}
            onChange={handleSortChange}
            className="border pl-3 pr-10 py-1 rounded bg-white appearance-none cursor-pointer"
          >
            <option value="">Featured</option>
            <option value="price_asc">Price Low to High</option>
            <option value="price_desc">Price High to Low</option>
          </select>

          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none">
            <FaAngleDown size={13} className="" />
          </span>
        </div>
      </div>
    </div>
  );
};

export default SortBy;
