import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  ShoppingCart,
  Trash2,
  Loader2,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

import {
  getWishlist,
  removeFromWishlist,
} from "../api/wishlist";

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState("");

  // ============================
  // Fetch Wishlist
  // ============================
  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getWishlist();

      console.log("Wishlist API:", response);

      const items = Array.isArray(response)
        ? response
        : Array.isArray(response?.results)
          ? response.results
          : Array.isArray(response?.data)
            ? response.data
            : [];

      setWishlist(items);
    } catch (err) {
      console.error("Wishlist fetch error:", err);

      if (err.response?.status === 401) {
        setError("Please login to view your wishlist.");
      } else if (err.response?.status === 403) {
        setError("You don't have permission to access your wishlist.");
      } else {
        setError(
          err.response?.data?.message ||
          err.response?.data?.detail ||
          "Failed to load wishlist."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // Initial Load
  // ============================
  useEffect(() => {
    fetchWishlist();
  }, []);

  // ============================
  // Remove Wishlist
  // ============================
  const handleRemove = async (id) => {
    try {
      setRemovingId(id);

      await removeFromWishlist(id);

      setWishlist((prev) =>
        prev.filter((item) => item.id !== id)
      );
    } catch (err) {
      console.error("Remove wishlist error:", err);

      alert(
        err.response?.data?.detail ||
        "Failed to remove item from wishlist."
      );
    } finally {
      setRemovingId(null);
    }
  };

  // ============================
  // Loading
  // ============================
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2
            size={38}
            className="mx-auto animate-spin text-zinc-500"
          />

          <p className="mt-4 text-sm text-zinc-500">
            Loading wishlist...
          </p>
        </div>
      </div>
    );
  }

  // ============================
  // Error
  // ============================
  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle
              size={26}
              className="text-red-500"
            />
          </div>

          <h1 className="mt-5 text-xl font-semibold text-zinc-900">
            Wishlist
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            {error}
          </p>

          <button
            type="button"
            onClick={fetchWishlist}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            <RefreshCw size={17} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ============================
  // Empty Wishlist
  // ============================
  if (wishlist.length === 0) {
    return (
      <div className="min-h-[60vh] px-4 py-10 sm:py-16">
        <div className="mx-auto max-w-3xl rounded-2xl border border-zinc-200 bg-white px-6 py-12 text-center shadow-sm sm:px-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
            <Heart
              size={38}
              className="text-red-500"
            />
          </div>

          <h1 className="mt-6 text-2xl font-bold text-zinc-900 sm:text-3xl">
            Your Wishlist is Empty
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500 sm:text-base">
            Save your favorite watches here and come
            back whenever you are ready to buy.
          </p>

          <Link
            to="/products"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            <ShoppingCart size={17} />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // ============================
  // Wishlist
  // ============================
  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white">
                <Heart size={21} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">
                  My Wishlist
                </h1>

                <p className="mt-1 text-sm text-zinc-500">
                  {wishlist.length}{" "}
                  {wishlist.length === 1
                    ? "item"
                    : "items"}{" "}
                  saved
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/products"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            <ShoppingCart size={17} />
            Continue Shopping
          </Link>
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {wishlist.map((item) => {
            const image = item.product_thumbnail || null;
            const name =
              item.product_name || "Product";
            const price = Number(
              item.product_price ?? 0
            );

            return (
              <div
                key={item.id}
                className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-zinc-100">
                  {image ? (
                    <img
                      src={image}
                      alt={name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Heart
                        size={58}
                        className="text-zinc-300"
                      />
                    </div>
                  )}

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() =>
                      handleRemove(item.id)
                    }
                    disabled={
                      removingId === item.id
                    }
                    title="Remove from wishlist"
                    className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-red-500 shadow-md backdrop-blur transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {removingId === item.id ? (
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                    ) : (
                      <Trash2 size={18} />
                    )}
                  </button>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h2 className="min-h-[48px] line-clamp-2 text-base font-semibold text-zinc-900">
                    {name}
                  </h2>

                  <p className="mt-2 text-xl font-bold text-zinc-900">
                    ৳ {price.toLocaleString()}
                  </p>

                  {/* Actions */}
                  <div className="mt-4 flex gap-2">
                    <Link
                      to={`/products/${item.product}`}
                      className="flex-1 rounded-xl bg-black px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-zinc-800"
                    >
                      View Product
                    </Link>

                    <button
                      type="button"
                      onClick={() =>
                        handleRemove(item.id)
                      }
                      disabled={
                        removingId === item.id
                      }
                      className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-60"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}