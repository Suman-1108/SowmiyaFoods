import React from 'react';

/**
 * Standard Normal Loading Animation (Clean Spinner)
 */
export const ProductLoadingSpinner = ({ message = "Loading products...", className = "" }) => {
  return (
    <div className={`py-12 flex flex-col items-center justify-center ${className}`}>
      <div className="w-10 h-10 border-4 border-amber-500/20 border-t-[#e8703b] rounded-full animate-spin mb-3" />
      {message && <p className="text-gray-500 font-medium text-xs sm:text-sm">{message}</p>}
    </div>
  );
};

export default ProductLoadingSpinner;
