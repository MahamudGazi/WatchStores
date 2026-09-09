import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  Trash2,
  RefreshCw,
  ExternalLink,
  Users,
  Package,
  AlertTriangle,
} from "lucide-react";

import api from "../../../api/axios";

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH ADMIN WISHLIST
  // =====================================================

  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/wishlist/admin/");

      const data = response.data;

      const items = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
          ? data.results
          : Array.isArray(data?.data)
            ? data.data
            : [];

      setWishlist(items);
    } catch (err) {
      console.error("Admin wishlist API error:", err);

      const status = err.response?.status;

      if (status === 401) {
        setError("Please login again.");
      } else if (status === 403) {
        setError(
          "You don't have permission to access the admin wishlist."
        );
      } else {
        setError(
          err.response?.data?.detail ||
            err.response?.data?.message ||
            "Failed to load wishlist."
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // =====================================================
  // REMOVE WISHLIST ITEM
  // =====================================================

  const handleRemove = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this wishlist item?"
    );

    if (!confirmed) return;

    try {
      setRemovingId(id);
      setError("");

      await api.delete(`/wishlist/${id}/`);

      setWishlist((prev) =>
        prev.filter((item) => item.id !== id)
      );
    } catch (err) {
      console.error("Remove wishlist error:", err);

      const status = err.response?.status;

      if (status === 401) {
        setError("Please login again.");
      } else if (status === 403) {
        setError(
          "You don't have permission to remove this wishlist item."
        );
      } else {
        setError(
          err.response?.data?.detail ||
            err.response?.data?.message ||
            "Failed to remove wishlist item."
        );
      }
    } finally {
      setRemovingId(null);
    }
  };

  // =====================================================
  // HELPERS
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-BD", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStockStyle = (status) => {
    const value = String(status || "").toLowerCase();

    if (value.includes("out")) {
      return "bg-red-50 text-red-700 border-red-200";
    }

    if (value.includes("low")) {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }

    if (value.includes("in stock")) {
      return "bg-green-50 text-green-700 border-green-200";
    }

    return "bg-gray-50 text-gray-600 border-gray-200";
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-[60vh] bg-gray-50 px-4 py-10">
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
              <RefreshCw
                size={22}
                className="animate-spin text-gray-700"
              />
            </div>

            <p className="mt-4 text-sm text-gray-500">
              Loading admin wishlist...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR + NO DATA
  // =====================================================

  if (error && wishlist.length === 0) {
    return (
      <div className="min-h-[60vh] bg-gray-50 px-4 py-10">
        <div className="mx-auto flex min-h-[50vh] max-w-lg items-center justify-center">
          <div className="w-full rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
              <AlertTriangle
                size={26}
                className="text-red-500"
              />
            </div>

            <h2 className="mt-5 text-xl font-bold text-gray-900">
              Unable to Load Wishlist
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchWishlist}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              <RefreshCw size={17} />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // EMPTY
  // =====================================================

  if (wishlist.length === 0) {
    return (
      <div className="min-h-[60vh] bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm sm:p-16">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
              <Heart
                size={38}
                className="text-red-500"
                fill="currentColor"
              />
            </div>

            <h1 className="mt-6 text-2xl font-bold text-gray-900 sm:text-3xl">
              No Wishlist Items
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
              No customers have added products to their wishlist yet.
            </p>

            <button
              type="button"
              onClick={fetchWishlist}
              className="mt-7 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              <RefreshCw size={17} />
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6 flex flex-col gap-5 sm:mb-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white">
                <Heart
                  size={21}
                  fill="currentColor"
                />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                  Wishlist Management
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Monitor products saved by your customers.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchWishlist}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>

        {/* =================================================
            SUMMARY
        ================================================= */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Wishlist Items
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {wishlist.length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
                <Heart
                  size={21}
                  className="text-red-500"
                  fill="currentColor"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Customers
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {new Set(
                    wishlist.map((item) => item.user_id)
                  ).size}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                <Users
                  size={21}
                  className="text-blue-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            ERROR BANNER
        ================================================= */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertTriangle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <span>{error}</span>
          </div>
        )}

        {/* =================================================
            DESKTOP TABLE
        ================================================= */}

        <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Customer
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Product
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Price
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Stock
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Added
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {wishlist.map((item) => {
                  const productImage =
                    item.product_thumbnail || null;

                  const productName =
                    item.product_name || "Product";

                  const productPrice = Number(
                    item.product_price ?? 0
                  );

                  const stockStatus =
                    item.stock_status || "Unknown";

                  return (
                    <tr
                      key={item.id}
                      className="transition hover:bg-gray-50"
                    >
                      {/* CUSTOMER */}

                      <td className="px-5 py-4 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100">
                            <Users
                              size={17}
                              className="text-gray-500"
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-900">
                              {item.username || "Unknown"}
                            </p>

                            <p className="truncate text-xs text-gray-500">
                              {item.user_email || "No email"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* PRODUCT */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                            {productImage ? (
                              <img
                                src={productImage}
                                alt={productName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Package
                                  size={21}
                                  className="text-gray-300"
                                />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="max-w-[260px] truncate text-sm font-semibold text-gray-900">
                              {productName}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              Product ID: #{item.product}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* PRICE */}

                      <td className="px-5 py-4">
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            ৳{" "}
                            {productPrice.toLocaleString(
                              "en-BD"
                            )}
                          </p>

                          {Number(
                            item.product_original_price
                          ) > productPrice && (
                            <p className="text-xs text-gray-400 line-through">
                              ৳{" "}
                              {Number(
                                item.product_original_price
                              ).toLocaleString("en-BD")}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* STOCK */}

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStockStyle(
                            stockStatus
                          )}`}
                        >
                          {stockStatus}
                        </span>
                      </td>

                      {/* DATE */}

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500">
                        {formatDate(item.created_at)}
                      </td>

                      {/* ACTIONS */}

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/products/${item.product}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                          >
                            <ExternalLink size={14} />
                            View
                          </Link>

                          <button
                            type="button"
                            onClick={() =>
                              handleRemove(item.id)
                            }
                            disabled={
                              removingId === item.id
                            }
                            className="inline-flex items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Remove wishlist item"
                          >
                            {removingId === item.id ? (
                              <RefreshCw
                                size={15}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2 size={15} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* =================================================
            MOBILE / TABLET CARDS
        ================================================= */}

        <div className="grid grid-cols-1 gap-4 lg:hidden">
          {wishlist.map((item) => {
            const productImage =
              item.product_thumbnail || null;

            const productName =
              item.product_name || "Product";

            const productPrice = Number(
              item.product_price ?? 0
            );

            const stockStatus =
              item.stock_status || "Unknown";

            return (
              <div
                key={item.id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
              >
                {/* PRODUCT */}

                <div className="flex gap-4 p-4">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                    {productImage ? (
                      <img
                        src={productImage}
                        alt={productName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package
                          size={26}
                          className="text-gray-300"
                        />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="line-clamp-2 text-base font-semibold text-gray-900">
                      {productName}
                    </h2>

                    <p className="mt-1 text-sm font-bold text-gray-900">
                      ৳{" "}
                      {productPrice.toLocaleString(
                        "en-BD"
                      )}
                    </p>

                    <span
                      className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStockStyle(
                        stockStatus
                      )}`}
                    >
                      {stockStatus}
                    </span>
                  </div>
                </div>

                {/* CUSTOMER */}

                <div className="border-t border-gray-100 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100">
                      <Users
                        size={16}
                        className="text-gray-500"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {item.username || "Unknown"}
                      </p>

                      <p className="truncate text-xs text-gray-500">
                        {item.user_email || "No email"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* META */}

                <div className="grid grid-cols-2 border-t border-gray-100">
                  <div className="px-4 py-3">
                    <p className="text-xs text-gray-400">
                      Added
                    </p>

                    <p className="mt-1 text-sm font-medium text-gray-700">
                      {formatDate(item.created_at)}
                    </p>
                  </div>

                  <div className="border-l border-gray-100 px-4 py-3">
                    <p className="text-xs text-gray-400">
                      Product ID
                    </p>

                    <p className="mt-1 text-sm font-medium text-gray-700">
                      #{item.product}
                    </p>
                  </div>
                </div>

                {/* ACTIONS */}

                <div className="flex gap-2 border-t border-gray-100 p-4">
                  <Link
                    to={`/products/${item.product}`}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                  >
                    <ExternalLink size={16} />
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
                    className="flex items-center justify-center rounded-xl border border-red-200 px-4 py-2.5 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    title="Remove wishlist item"
                  >
                    {removingId === item.id ? (
                      <RefreshCw
                        size={17}
                        className="animate-spin"
                      />
                    ) : (
                      <Trash2 size={17} />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}