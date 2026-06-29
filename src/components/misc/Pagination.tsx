"use client";

import Link from "next/link";
import React from "react";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import { JSX } from "react/jsx-runtime";
import { useSearchParams, usePathname } from "next/navigation";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

const Pagination = ({ currentPage, totalPages }: PaginationProps) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  if (totalPages <= 1) return null;

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const renderPageNumbers = () => {
    const pages: JSX.Element[] = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = startPage + maxVisiblePages - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pages.push(
        <Link
          key={1}
          href={createPageUrl(1)}
          className="w-10 h-10 flex items-center justify-center rounded border border-gray-200 hover:bg-primary hover:text-white transition-colors cursor-pointer"
        >
          1
        </Link>,
      );
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis-start" className="px-2">
            ...
          </span>,
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Link
          key={i}
          href={createPageUrl(i)}
          className={`w-10 h-10 flex items-center justify-center rounded border transition-colors cursor-pointer ${
            currentPage === i
              ? "bg-primary text-white border-primary"
              : "border-gray-200 hover:bg-primary hover:text-white"
          }`}
        >
          {i}
        </Link>,
      );
    }

    // Add last page and ellipsis if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis-end" className="px-2">
            ...
          </span>,
        );
      }
      pages.push(
        <Link
          key={totalPages}
          href={createPageUrl(totalPages)}
          className="w-10 h-10 flex items-center justify-center rounded border border-gray-200 hover:bg-primary hover:text-white transition-colors cursor-pointer"
        >
          {totalPages}
        </Link>,
      );
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-12 mb-8">
      {/* Previous Button */}
      {currentPage > 1 ? (
        <Link
          href={createPageUrl(currentPage - 1)}
          className="w-10 h-10 flex items-center justify-center rounded border border-gray-200 hover:bg-primary hover:text-white transition-colors cursor-pointer"
        >
          <FaAngleLeft />
        </Link>
      ) : (
        <button
          disabled
          className="w-10 h-10 flex items-center justify-center rounded border border-gray-200 text-gray-400 cursor-not-allowed"
        >
          <FaAngleLeft />
        </button>
      )}

      {/* Page Numbers */}
      {renderPageNumbers()}

      {/* Next Button */}
      {currentPage < totalPages ? (
        <Link
          href={createPageUrl(currentPage + 1)}
          className="w-10 h-10 flex items-center justify-center rounded border border-gray-200 hover:bg-primary hover:text-white transition-colors cursor-pointer"
        >
          <FaAngleRight />
        </Link>
      ) : (
        <button
          disabled
          className="w-10 h-10 flex items-center justify-center rounded border border-gray-200 text-gray-400 cursor-not-allowed"
        >
          <FaAngleRight />
        </button>
      )}
    </div>
  );
};

export default Pagination;
