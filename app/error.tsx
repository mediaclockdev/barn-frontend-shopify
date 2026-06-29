'use client'; // Error boundaries must be Client Components

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service logically
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
      <h2 className="text-4xl font-bold mb-4 text-gray-800">Something went wrong!</h2>
      <p className="text-gray-600 mb-8 max-w-md text-lg">
        We encountered an unexpected issue while loading the store data. Please try again.
      </p>
      
      <button
        onClick={() => reset()}
        className="bg-primary text-white font-semibold py-3 px-8 rounded-full shadow hover:bg-black transition"
      >
        Try Again
      </button>
    </div>
  );
}
