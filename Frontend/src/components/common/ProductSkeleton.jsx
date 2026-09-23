import React from 'react';

/**
 * Single Product Card Skeleton
 * Matches the layout and dimensions of the store's product cards.
 */
export const ProductCardSkeleton = ({ warm = false, className = "" }) => {
  const shimmerClass = warm ? "skeleton-shimmer-warm" : "skeleton-shimmer";
  const bgCard = warm ? "bg-white/90 border-amber-200/60" : "bg-white border-gray-200/80";

  return (
    <div
      className={`rounded-2xl border ${bgCard} shadow-2xs p-3 sm:p-3.5 flex flex-col justify-between overflow-hidden relative ${className}`}
    >
      {/* 1. Square Image Container Skeleton */}
      <div className="relative w-full aspect-square bg-slate-100 rounded-xl overflow-hidden mb-3 flex items-center justify-center">
        <div className={`absolute inset-0 ${shimmerClass}`} />
        {/* Subtle decorative placeholder icon */}
        <svg
          className="w-10 h-10 text-slate-300/70 relative z-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>

        {/* Top-left badge placeholder */}
        <div className="absolute top-2.5 left-2.5 z-10 w-12 h-4 rounded-full bg-slate-200/80 overflow-hidden">
          <div className={`w-full h-full ${shimmerClass}`} />
        </div>
      </div>

      {/* 2. Text Details Skeleton */}
      <div className="flex flex-col flex-grow space-y-2">
        {/* Category tag skeleton */}
        <div className="h-3 w-1/3 rounded bg-slate-200/80 overflow-hidden">
          <div className={`w-full h-full ${shimmerClass}`} />
        </div>

        {/* Product Title skeleton */}
        <div className="h-4 w-5/6 rounded-md bg-slate-200/90 overflow-hidden">
          <div className={`w-full h-full ${shimmerClass}`} />
        </div>

        {/* Secondary Title / Tamil name skeleton */}
        <div className="h-3 w-1/2 rounded bg-slate-200/70 overflow-hidden">
          <div className={`w-full h-full ${shimmerClass}`} />
        </div>

        {/* Price & Action Row Skeleton */}
        <div className="pt-2 mt-auto flex items-center justify-between gap-2 border-t border-slate-100">
          <div className="space-y-1">
            <div className="h-5 w-16 rounded bg-slate-200/90 overflow-hidden">
              <div className={`w-full h-full ${shimmerClass}`} />
            </div>
            <div className="h-2.5 w-10 rounded bg-slate-200/60 overflow-hidden">
              <div className={`w-full h-full ${shimmerClass}`} />
            </div>
          </div>
          <div className="h-8 w-20 rounded-lg bg-slate-200/85 overflow-hidden">
            <div className={`w-full h-full ${shimmerClass}`} />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Grid Skeleton for AllProducts and SearchResults
 */
export const ProductGridSkeleton = ({
  count = 8,
  columns = "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4",
  warm = false,
}) => {
  return (
    <div className={columns}>
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={`grid-skel-${index}`} warm={warm} />
      ))}
    </div>
  );
};

/**
 * Horizontal Carousel Row Skeleton
 * Used for FeaturedCollections, LatestProducts, TrendingProducts
 */
export const ProductCarouselSkeleton = ({
  count = 5,
  hasHeader = true,
  title = "Products",
  subtitle = "Loading our handpicked products...",
  warm = false,
}) => {
  const shimmerClass = warm ? "skeleton-shimmer-warm" : "skeleton-shimmer";

  return (
    <div className="py-2">
      {hasHeader && (
        <div className="flex items-center justify-between mb-6 pb-2">
          <div className="space-y-1.5">
            <div className="h-6 w-48 sm:w-60 rounded-md bg-slate-200/90 overflow-hidden">
              <div className={`w-full h-full ${shimmerClass}`} />
            </div>
            <div className="h-3.5 w-32 sm:w-44 rounded bg-slate-200/70 overflow-hidden">
              <div className={`w-full h-full ${shimmerClass}`} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-slate-200/80 overflow-hidden">
              <div className={`w-full h-full ${shimmerClass}`} />
            </div>
            <div className="h-8 w-8 rounded-full bg-slate-200/80 overflow-hidden">
              <div className={`w-full h-full ${shimmerClass}`} />
            </div>
          </div>
        </div>
      )}

      {/* Horizontal Carousel Track */}
      <div className="flex gap-4 overflow-hidden py-1">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={`caro-skel-${index}`}
            className="flex-shrink-0 w-[210px] sm:w-[230px] md:w-[245px]"
          >
            <ProductCardSkeleton warm={warm} />
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Full Section Skeleton for ProductRangeCarousel (Our Range Of Products)
 * Renders multiple category rows with category headers inside the textured section
 */
export const ProductRangeSectionSkeleton = ({ count = 2 }) => {
  return (
    <div className="space-y-12">
      {Array.from({ length: count }).map((_, catIdx) => (
        <div
          key={`range-skel-cat-${catIdx}`}
          className="bg-white/70 backdrop-blur-xs rounded-2xl p-4 sm:p-6 border border-amber-200/50 shadow-xs"
        >
          {/* Category Header Skeleton */}
          <div className="flex items-center justify-between mb-5 border-b border-amber-100/70 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100/80 overflow-hidden">
                <div className="w-full h-full skeleton-shimmer-warm" />
              </div>
              <div className="space-y-1">
                <div className="h-5 w-36 sm:w-48 rounded-md bg-amber-200/70 overflow-hidden">
                  <div className="w-full h-full skeleton-shimmer-warm" />
                </div>
                <div className="h-3 w-24 rounded bg-amber-100/80 overflow-hidden">
                  <div className="w-full h-full skeleton-shimmer-warm" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-8 w-24 hidden sm:block rounded-xl bg-amber-100/80 overflow-hidden">
                <div className="w-full h-full skeleton-shimmer-warm" />
              </div>
              <div className="h-8 w-8 rounded-full bg-amber-100/80 overflow-hidden">
                <div className="w-full h-full skeleton-shimmer-warm" />
              </div>
              <div className="h-8 w-8 rounded-full bg-amber-100/80 overflow-hidden">
                <div className="w-full h-full skeleton-shimmer-warm" />
              </div>
            </div>
          </div>

          {/* Cards Track */}
          <div className="flex gap-4 overflow-hidden py-1">
            {Array.from({ length: 5 }).map((_, itemIdx) => (
              <div
                key={`range-card-${catIdx}-${itemIdx}`}
                className="flex-shrink-0 w-[205px] sm:w-[225px] md:w-[235px]"
              >
                <ProductCardSkeleton warm={true} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Product Detail Skeleton
 * Used for /product/:id page while product details are loading
 */
export const ProductDetailSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2 mb-8">
        <div className="h-4 w-16 rounded bg-slate-200 overflow-hidden">
          <div className="w-full h-full skeleton-shimmer" />
        </div>
        <span className="text-slate-300">/</span>
        <div className="h-4 w-24 rounded bg-slate-200 overflow-hidden">
          <div className="w-full h-full skeleton-shimmer" />
        </div>
        <span className="text-slate-300">/</span>
        <div className="h-4 w-36 rounded bg-slate-200 overflow-hidden">
          <div className="w-full h-full skeleton-shimmer" />
        </div>
      </div>

      {/* Main Grid: Gallery on left, Details on right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Column: Image Gallery Skeleton */}
        <div className="space-y-4">
          <div className="relative w-full aspect-square bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 flex items-center justify-center">
            <div className="absolute inset-0 skeleton-shimmer" />
            <svg
              className="w-16 h-16 text-slate-300 relative z-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>

          {/* Thumbnails strip */}
          <div className="flex gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={`thumb-skel-${i}`}
                className="w-20 h-20 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden relative"
              >
                <div className="w-full h-full skeleton-shimmer" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Details Skeleton */}
        <div className="space-y-6">
          {/* Badge & Category */}
          <div className="flex items-center gap-3">
            <div className="h-6 w-20 rounded-full bg-slate-200 overflow-hidden">
              <div className="w-full h-full skeleton-shimmer" />
            </div>
            <div className="h-4 w-28 rounded bg-slate-200 overflow-hidden">
              <div className="w-full h-full skeleton-shimmer" />
            </div>
          </div>

          {/* Title & Tamil name */}
          <div className="space-y-2">
            <div className="h-8 w-4/5 rounded-lg bg-slate-200 overflow-hidden">
              <div className="w-full h-full skeleton-shimmer" />
            </div>
            <div className="h-5 w-1/2 rounded-md bg-slate-200/80 overflow-hidden">
              <div className="w-full h-full skeleton-shimmer" />
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="h-5 w-24 rounded bg-slate-200 overflow-hidden">
              <div className="w-full h-full skeleton-shimmer" />
            </div>
            <div className="h-4 w-16 rounded bg-slate-200/70 overflow-hidden">
              <div className="w-full h-full skeleton-shimmer" />
            </div>
          </div>

          {/* Price Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-baseline gap-3">
            <div className="h-8 w-24 rounded-lg bg-slate-200 overflow-hidden">
              <div className="w-full h-full skeleton-shimmer" />
            </div>
            <div className="h-5 w-16 rounded bg-slate-200/60 overflow-hidden">
              <div className="w-full h-full skeleton-shimmer" />
            </div>
            <div className="h-6 w-20 rounded-full bg-slate-200/80 overflow-hidden">
              <div className="w-full h-full skeleton-shimmer" />
            </div>
          </div>

          {/* Weight Options */}
          <div className="space-y-2">
            <div className="h-4 w-24 rounded bg-slate-200 overflow-hidden">
              <div className="w-full h-full skeleton-shimmer" />
            </div>
            <div className="flex gap-2">
              <div className="h-10 w-24 rounded-xl bg-slate-200 overflow-hidden">
                <div className="w-full h-full skeleton-shimmer" />
              </div>
              <div className="h-10 w-24 rounded-xl bg-slate-200 overflow-hidden">
                <div className="w-full h-full skeleton-shimmer" />
              </div>
            </div>
          </div>

          {/* Quantity & CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="h-12 w-32 rounded-xl bg-slate-200 overflow-hidden">
              <div className="w-full h-full skeleton-shimmer" />
            </div>
            <div className="h-12 flex-1 rounded-xl bg-slate-200 overflow-hidden">
              <div className="w-full h-full skeleton-shimmer" />
            </div>
            <div className="h-12 flex-1 rounded-xl bg-slate-200 overflow-hidden">
              <div className="w-full h-full skeleton-shimmer" />
            </div>
          </div>

          {/* Feature Badges Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-200">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={`feat-skel-${i}`}
                className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center space-y-1"
              >
                <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                  <div className="w-full h-full skeleton-shimmer" />
                </div>
                <div className="h-3 w-16 rounded bg-slate-200 overflow-hidden">
                  <div className="w-full h-full skeleton-shimmer" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
