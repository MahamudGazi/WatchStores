function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

      {/* Image Skeleton */}
      <div className="h-56 w-full animate-pulse bg-gray-200 sm:h-64" />

      {/* Content */}
      <div className="space-y-4 p-4">

        {/* Title */}
        <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />

        {/* Description */}
        <div className="space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-gray-200" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-gray-200" />
        </div>

        {/* Price + Stock */}
        <div className="flex items-center justify-between pt-2">

          <div className="h-6 w-24 animate-pulse rounded bg-gray-200" />

          <div className="h-6 w-16 animate-pulse rounded bg-gray-200" />

        </div>

      </div>
    </div>
  );
}

export default function Skeleton({ count = 8 }) {
  return (
    <div
      className="
        grid
        grid-cols-1
        gap-4
        sm:grid-cols-2
        sm:gap-5
        lg:grid-cols-2
        xl:grid-cols-3
        2xl:grid-cols-4
      "
    >
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}

