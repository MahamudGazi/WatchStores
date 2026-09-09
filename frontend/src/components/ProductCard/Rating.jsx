export default function Rating({ rating = 0 }) {
  const numericRating = Number(rating) || 0;

  const roundedRating = Math.round(
    Math.min(5, Math.max(0, numericRating))
  );

  return (
    <div
      className="flex items-center gap-1"
      aria-label={`Rating ${numericRating} out of 5`}
    >
      {/* Stars */}
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`
              text-base
              leading-none
              transition-colors
              sm:text-lg
              ${
                star <= roundedRating
                  ? "text-yellow-500"
                  : "text-gray-300"
              }
            `}
          >
            ★
          </span>
        ))}
      </div>

      {/* Rating Number */}
      <span className="ml-1 text-xs text-gray-500 sm:ml-2 sm:text-sm">
        ({numericRating.toFixed(1)})
      </span>
    </div>
  );
}

