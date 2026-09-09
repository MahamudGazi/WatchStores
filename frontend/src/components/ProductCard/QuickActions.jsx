import {
  Eye,
  ShoppingCart,
} from "lucide-react";

export default function QuickActions({
  onView,
  onCart,
}) {
  return (
    <div className="flex items-center gap-2">

      {/* View Product */}
      <button
        type="button"
        onClick={onView}
        aria-label="View product"
        title="View Product"
        className="
          flex
          h-9
          w-9
          items-center
          justify-center
          rounded-full
          bg-white
          text-gray-700
          shadow-lg
          transition-all
          duration-200
          hover:-translate-y-0.5
          hover:bg-yellow-500
          hover:text-white
          active:scale-95
          focus:outline-none
          focus:ring-2
          focus:ring-yellow-400
          focus:ring-offset-2
          sm:h-10
          sm:w-10
        "
      >
        <Eye size={18} />
      </button>


      {/* Add To Cart */}
      <button
        type="button"
        onClick={onCart}
        aria-label="Add to cart"
        title="Add to Cart"
        className="
          flex
          h-9
          w-9
          items-center
          justify-center
          rounded-full
          bg-white
          text-gray-700
          shadow-lg
          transition-all
          duration-200
          hover:-translate-y-0.5
          hover:bg-yellow-500
          hover:text-white
          active:scale-95
          focus:outline-none
          focus:ring-2
          focus:ring-yellow-400
          focus:ring-offset-2
          sm:h-10
          sm:w-10
        "
      >
        <ShoppingCart size={18} />
      </button>

    </div>
  );
}

