import { useEffect, useState } from "react";
import {
  BarChart3,
  Package,
  TrendingUp,
  DollarSign,
  RefreshCw,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import api from "../../../api/axios";

export default function AdminProductReport() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/dashboard/top-products/"
      );

      const data = response.data;

      setProducts(
        Array.isArray(data)
          ? data
          : data.results ||
              data.products ||
              data.top_products ||
              []
      );
    } catch (err) {
      console.error("Product Report API Error:", err);

      if (err.response?.status === 401) {
        setError("You are not authenticated.");
      } else if (err.response?.status === 403) {
        setError(
          "You don't have permission to view product reports."
        );
      } else {
        setError("Failed to load product report.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const getName = (product) =>
    product.product_name ||
    product.name ||
    product.title ||
    "Unknown Product";

  const getImage = (product) =>
    product.product_image ||
    product.image ||
    product.image_url ||
    null;

  const getSales = (product) =>
    Number(
      product.total_sold ||
        product.sold ||
        product.quantity_sold ||
        product.sales ||
        0
    );

  const getRevenue = (product) =>
    Number(
      product.revenue ||
        product.total_revenue ||
        product.sales_amount ||
        0
    );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white">
            <BarChart3 size={21} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Product Report
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Best sellers and product performance
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadProducts}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-60"
        >
          {loading ? (
            <Loader2 size={17} className="animate-spin" />
          ) : (
            <RefreshCw size={17} />
          )}
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5">
          <AlertTriangle
            size={20}
            className="mt-0.5 text-red-600"
          />

          <div>
            <h3 className="font-semibold text-red-800">
              Unable to load report
            </h3>

            <p className="mt-1 text-sm text-red-600">
              {error}
            </p>

            <button
              onClick={loadProducts}
              className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <Loader2
            size={32}
            className="mx-auto animate-spin text-gray-500"
          />

          <p className="mt-4 text-sm text-gray-500">
            Loading product report...
          </p>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && products.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <Package
            size={40}
            className="mx-auto text-gray-300"
          />

          <h2 className="mt-4 text-xl font-semibold text-gray-900">
            No product data
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Product sales data will appear here once available.
          </p>
        </div>
      )}

      {/* Product Report */}
      {!loading && products.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* Table Header */}
          <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">
                  Best Selling Products
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  {products.length} products
                </p>
              </div>

              <TrendingUp
                size={20}
                className="text-gray-400"
              />
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-6 py-4">#</th>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Units Sold</th>
                  <th className="px-6 py-4">Revenue</th>
                  <th className="px-6 py-4">Performance</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {products.map((product, index) => {
                  const sales = getSales(product);
                  const revenue = getRevenue(product);

                  const maxSales = Math.max(
                    ...products.map(getSales),
                    1
                  );

                  const percentage = Math.min(
                    100,
                    (sales / maxSales) * 100
                  );

                  return (
                    <tr
                      key={product.id || index}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-6 py-5 text-sm font-semibold text-gray-500">
                        {index + 1}
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 overflow-hidden rounded-xl bg-gray-100">
                            {getImage(product) ? (
                              <img
                                src={getImage(product)}
                                alt={getName(product)}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Package
                                  size={20}
                                  className="text-gray-400"
                                />
                              </div>
                            )}
                          </div>

                          <div>
                            <p className="font-semibold text-gray-900">
                              {getName(product)}
                            </p>

                            {product.brand && (
                              <p className="mt-1 text-xs text-gray-500">
                                {product.brand}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span className="font-semibold text-gray-900">
                          {sales.toLocaleString()}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <span className="font-semibold text-gray-900">
                          ৳ {revenue.toLocaleString()}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="w-40">
                          <div className="mb-1 flex justify-between text-xs text-gray-500">
                            <span>Sales</span>
                            <span>
                              {Math.round(percentage)}%
                            </span>
                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className="h-full rounded-full bg-black transition-all"
                              style={{
                                width: `${percentage}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="divide-y divide-gray-100 md:hidden">
            {products.map((product, index) => {
              const sales = getSales(product);
              const revenue = getRevenue(product);

              return (
                <div
                  key={product.id || index}
                  className="p-5"
                >
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black text-sm font-bold text-white">
                      {index + 1}
                    </div>

                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                      {getImage(product) ? (
                        <img
                          src={getImage(product)}
                          alt={getName(product)}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Package
                            size={20}
                            className="text-gray-400"
                          />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-gray-900">
                        {getName(product)}
                      </h3>

                      <p className="mt-1 text-xs text-gray-500">
                        {sales.toLocaleString()} units sold
                      </p>

                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        ৳ {revenue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary */}
      {!loading && products.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gray-100 p-3">
                <Package size={20} />
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Products
                </p>

                <p className="text-xl font-bold text-gray-900">
                  {products.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gray-100 p-3">
                <TrendingUp size={20} />
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Total Units Sold
                </p>

                <p className="text-xl font-bold text-gray-900">
                  {products
                    .reduce(
                      (sum, product) =>
                        sum + getSales(product),
                      0
                    )
                    .toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gray-100 p-3">
                <DollarSign size={20} />
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Total Revenue
                </p>

                <p className="text-xl font-bold text-gray-900">
                  ৳{" "}
                  {products
                    .reduce(
                      (sum, product) =>
                        sum + getRevenue(product),
                      0
                    )
                    .toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

