import { FaAngleDown } from "react-icons/fa6";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

const MobileSort = () => {
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
    params.delete("page");
    
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="relative w-full">
      <select 
        value={currentSort}
        onChange={handleSortChange}
        className="w-full pl-3 pr-8 py-3 text-sm font-medium bg-transparent appearance-none focus:outline-none cursor-pointer"
      >
        <option value="">Featured</option>
        <option value="price_asc">Price Low to High</option>
        <option value="price_desc">Price High to Low</option>
      </select>

      <FaAngleDown
        size={14}
        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"
      />
    </div>
  );
};

export default MobileSort;
