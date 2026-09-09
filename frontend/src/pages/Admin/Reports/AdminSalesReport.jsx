import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import api from "../../../api/axios";

export default function AdminSalesReport() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSales = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/dashboard/sales/");

      const result = response.data;

      // Backend normally returns an array
      if (Array.isArray(result)) {
        setData(result);
      } else if (Array.isArray(result?.data)) {
        setData(result.data);
      } else {
        setData([]);
      }
    } catch (err) {
      console.error("Sales Report API Error:", err);

      if (err.response?.status === 401) {
        setError("You are not authenticated.");
      } else if (err.response?.status === 403) {
        setError(
          "You don't have permission to view sales reports."
        );
      } else if (err.response?.status === 404) {
        setError(
          "Sales report API endpoint was not found."
        );
      } else {
        setError(
          err.response?.data?.detail ||
            "Failed to load sales report."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, []);

  // ==========================================
  // Calculate summary from monthly sales data
  // ==========================================

  const summary = useMemo(() => {
    if (!Array.isArray(data)) {
      return {
        orders: 0,
        revenue: 0,
        averageOrder: 0,
      };
    }

    const orders = data.reduce(
      (total, item) =>
        total + Number(item.orders || 0),
      0
    );

    const revenue = data.reduce(
      (total, item) =>
        total + Number(item.revenue || 0),
      0
    );

    const averageOrder =
      orders > 0 ? revenue / orders : 0;

    return {
      orders,
      revenue,
      averageOrder,
    };
  }, [data]);

  // ==========================================
  // Format month
  // ==========================================

  const formatMonth = (value) => {
    if (!value) return "Unknown";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  // ==========================================
  // Loading
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="text-center">
            <Loader2
              size={34}
              className="mx-auto animate-spin text-gray-500"
            />

            <p className="mt-4 text-sm text-gray-500">
              Loading sales report...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // Error
  // ==========================================

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={21}
              className="mt-0.5 shrink-0 text-red-600"
            />

            <div>
              <h3 className="font-semibold text-red-800">
                Unable to load sales report
              </h3>

              <p className="mt-1 text-sm text-red-600">
                {error}
              </p>

              <button
                type="button"
                onClick={loadSales}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // Empty
  // ==========================================

  if (data.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white">
              <BarChart3 size={21} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Sales Report
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Order and sales performance breakdown
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={loadSales}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <ShoppingCart
            size={42}
            className="mx-auto text-gray-300"
          />

          <h2 className="mt-4 text-xl font-semibold text-gray-900">
            No sales data
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Delivered order sales will appear here
            once available.
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // Main Report
  // ==========================================

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
              Sales Report
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Order and sales performance breakdown
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadSales}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-60"
        >
          {loading ? (
            <Loader2
              size={17}
              className="animate-spin"
            />
          ) : (
            <RefreshCw size={17} />
          )}

          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {/* Total Orders */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Total Orders
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {summary.orders.toLocaleString()}
              </p>
            </div>

            <div className="rounded-xl bg-gray-100 p-3">
              <ShoppingCart size={21} />
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Total Sales
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                ৳{" "}
                {summary.revenue.toLocaleString(
                  undefined,
                  {
                    maximumFractionDigits: 2,
                  }
                )}
              </p>
            </div>

            <div className="rounded-xl bg-gray-100 p-3">
              <DollarSign size={21} />
            </div>
          </div>
        </div>

        {/* Average Order */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Average Order
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                ৳{" "}
                {summary.averageOrder.toLocaleString(
                  undefined,
                  {
                    maximumFractionDigits: 2,
                  }
                )}
              </p>
            </div>

            <div className="rounded-xl bg-gray-100 p-3">
              <TrendingUp size={21} />
            </div>
          </div>
        </div>

        {/* Months */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Reporting Months
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {data.length.toLocaleString()}
              </p>
            </div>

            <div className="rounded-xl bg-gray-100 p-3">
              <BarChart3 size={21} />
            </div>
          </div>
        </div>
      </div>

      {/* Sales Breakdown */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

        <div className="border-b border-gray-100 px-6 py-5">
          <h2 className="font-semibold text-gray-900">
            Monthly Sales Breakdown
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Sales generated from delivered orders
          </p>
        </div>

        {/* Desktop Table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left text-sm">

            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-6 py-4 font-medium text-gray-500">
                  Month
                </th>

                <th className="px-6 py-4 font-medium text-gray-500">
                  Orders
                </th>

                <th className="px-6 py-4 font-medium text-gray-500">
                  Revenue
                </th>

                <th className="px-6 py-4 font-medium text-gray-500">
                  Average Order
                </th>
              </tr>
            </thead>

            <tbody>
              {data.map((item, index) => {
                const orders = Number(
                  item.orders || 0
                );

                const revenue = Number(
                  item.revenue || 0
                );

                const average =
                  orders > 0
                    ? revenue / orders
                    : 0;

                return (
                  <tr
                    key={index}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {formatMonth(item.month)}
                    </td>

                    <td className="px-6 py-4 text-gray-700">
                      {orders.toLocaleString()}
                    </td>

                    <td className="px-6 py-4 font-semibold text-gray-900">
                      ৳{" "}
                      {revenue.toLocaleString(
                        undefined,
                        {
                          maximumFractionDigits: 2,
                        }
                      )}
                    </td>

                    <td className="px-6 py-4 text-gray-700">
                      ৳{" "}
                      {average.toLocaleString(
                        undefined,
                        {
                          maximumFractionDigits: 2,
                        }
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="divide-y divide-gray-100 md:hidden">
          {data.map((item, index) => {
            const orders = Number(
              item.orders || 0
            );

            const revenue = Number(
              item.revenue || 0
            );

            const average =
              orders > 0
                ? revenue / orders
                : 0;

            return (
              <div
                key={index}
                className="p-5"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">
                    {formatMonth(item.month)}
                  </h3>

                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                    {orders} orders
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">

                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-xs text-gray-500">
                      Revenue
                    </p>

                    <p className="mt-1 font-bold text-gray-900">
                      ৳{" "}
                      {revenue.toLocaleString(
                        undefined,
                        {
                          maximumFractionDigits: 2,
                        }
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-xs text-gray-500">
                      Avg. Order
                    </p>

                    <p className="mt-1 font-bold text-gray-900">
                      ৳{" "}
                      {average.toLocaleString(
                        undefined,
                        {
                          maximumFractionDigits: 2,
                        }
                      )}
                    </p>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Simple Revenue Visualization */}
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

        <div className="mb-5">
          <h2 className="font-semibold text-gray-900">
            Revenue Trend
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Monthly delivered-order revenue
          </p>
        </div>

        <div className="space-y-4">
          {data.map((item, index) => {
            const revenue = Number(
              item.revenue || 0
            );

            const maxRevenue = Math.max(
              ...data.map((x) =>
                Number(x.revenue || 0)
              ),
              1
            );

            const percentage =
              (revenue / maxRevenue) * 100;

            return (
              <div key={index}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-gray-600">
                    {formatMonth(item.month)}
                  </span>

                  <span className="font-semibold text-gray-900">
                    ৳{" "}
                    {revenue.toLocaleString(
                      undefined,
                      {
                        maximumFractionDigits: 2,
                      }
                    )}
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-black transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

