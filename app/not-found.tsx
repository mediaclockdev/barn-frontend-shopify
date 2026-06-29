"use client";
import Link from "next/link";
import { FiHome, FiArrowLeft } from "react-icons/fi";

const NotFound = () => {
  return (
    <div className="min-h-[calc(100vh-60px)] flex items-center justify-center bg-gray-50 px-6">
      <div className="text-center max-w-xl">
        {/* 404 Big Text */}
        <h1 className="text-8xl font-bold text-[#26CFF7]">404</h1>

        {/* Title */}
        <h2 className="mt-6 text-2xl font-semibold text-gray-800">
          Oops! Page not found
        </h2>

        {/* Description */}
        <p className="mt-4 text-gray-600">
          The page you’re looking for doesn’t exist or has been moved. Let’s get
          you back on track.
        </p>

        {/* Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* Go Home */}
          <Link
            href="/"
            className="flex items-center gap-2 bg-[#26CFF7] text-white px-6 py-3 rounded-full font-medium hover:opacity-90 transition"
          >
            <FiHome />
            Go Home
          </Link>

          {/* Go Back */}
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 border border-gray-300 px-6 py-3 rounded-full font-medium text-gray-700 hover:bg-gray-100 transition"
          >
            <FiArrowLeft />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
