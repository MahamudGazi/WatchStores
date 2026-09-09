import { Heart } from "lucide-react";

export default function WishlistButton({
  active = false,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={
        active
          ? "Remove from wishlist"
          : "Add to wishlist"
      }
      title={
        active
          ? "Remove from wishlist"
          : "Add to wishlist"
      }
      className="
        flex
        h-9
        w-9
        items-center
        justify-center
        rounded-full
        bg-white
        shadow-lg
        transition-all
        duration-200
        hover:scale-110
        active:scale-95
        focus:outline-none
        focus:ring-2
        focus:ring-red-400
        focus:ring-offset-2
        sm:h-10
        sm:w-10
      "
    >
      <Heart
        size={19}
        strokeWidth={2}
        className={`
          transition-colors
          duration-200
          ${
            active
              ? "fill-red-500 text-red-500"
              : "text-gray-500 hover:text-red-500"
          }
        `}
      />
    </button>
  );
}

