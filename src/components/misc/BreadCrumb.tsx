"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface BreadCrumbProps {
  customLabels?: Record<string, string>;
}

const BreadCrumb = ({ customLabels }: BreadCrumbProps) => {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);
  const segments = pathSegments;

  if (segments.length === 0) return null;

  return (
    <div className="mx-auto px-4">
      <div className="flex items-center justify-start text-lg text-gray-600 gap-2 w-fit my-2 mt-5">
        <Link
          href="/"
          className="cursor-pointer hover:text-primary transition-colors"
        >
          Home
        </Link>
        {segments.map((segment, index) => {
          const href = "/" + segments.slice(0, index + 1).join("/");
          const isLast = index === segments.length - 1;

          // Check if there's a custom label for this segment
          const label = customLabels?.[segment] || segment.replace(/-/g, " ");

          return (
            <span key={index} className="flex items-center gap-2">
              <span className="text-gray-400">/</span>
              {isLast ? (
                <span className="capitalize text-black font-medium line-clamp-1">
                  {label}
                </span>
              ) : (
                <Link
                  href={href}
                  className="capitalize text-black cursor-pointer hover:text-primary transition-colors"
                >
                  {label}
                </Link>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default BreadCrumb;
