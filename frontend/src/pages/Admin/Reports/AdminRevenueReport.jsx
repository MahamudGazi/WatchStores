import { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  RefreshCw,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import api from "../../../api/axios";

export default function AdminRevenueReport() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRevenue = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/dashboard/revenue/"
      );

      setData(response.data);
    } catch (err) {
      console.error("Revenue Report API Error:", err);

      if (err.response?.status === 401) {
        setError("You are not authenticated.");
      } else if (err.response?.status === 403) {
        setError(
          "You don't have permission to view revenue reports."
        );
      } else {
        setError("Failed to load revenue report.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRevenue();
  }, []);

  const getNumber = (...values) => {
    for (const value of values) {
      if (value !== undefined && value !== null) {
        const number = Number(value);

        if (!Number.isNaN(number)) {
          return number;
        }
      }
    }

    return 0;
  };

  const getRevenue = () => {
    if (!data) return 0;

    return getNumber(
      data.revenue,
      data.total_revenue,
      data.totalRevenue,
      data.amount
    );
  };

  const getOrders = () => {
    if (!data) return 0;

    return getNumber(
      data.orders,
      data.total_orders,
      data.totalOrders,
      data.order_count
    );
  };

  const getGrowth = () => {
    if (!data) return 0;

    return getNumber(
      data.growth,
      data.revenue_growth,
      data.growth_percentage,
      data.percentage
    );
  };

  const revenue = getRevenue();
  const orders = getOrders();
  const growth = getGrowth();

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
              Revenue Report
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Revenue trends and sales performance
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadRevenue}
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
              Unable to load revenue report
            </h3>

            <p className="mt-1 text-sm text-red-600">
              {error}
            </p>

            <button
              onClick={loadRevenue}
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
            Loading revenue report...
          </p>
        </div>
      )}

      {/* Dashboard */}
      {!loading && !error && data && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Revenue */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Total Revenue
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-gray-900">
                    ৳ {revenue.toLocaleString()}
                  </h2>
                </div>

                <div className="rounded-xl bg-gray-100 p-3">
                  <DollarSign size={22} />
                </div>
              </div>
            </div>

            {/* Orders */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Total Orders
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-gray-900">
                    {orders.toLocaleString()}
                  </h2>
                </div>

                <div className="rounded-xl bg-gray-100 p-3">
                  <BarChart3 size={22} />
                </div>
              </div>
            </div>

            {/* Growth */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Revenue Growth
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-gray-900">
                    {growth.toLocaleString()}%
                  </h2>
                </div>

                <div className="rounded-xl bg-gray-100 p-3">
                  <TrendingUp size={22} />
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Data */}
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-5">
              <h2 className="font-semibold text-gray-900">
                Revenue Overview
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Data returned from the dashboard revenue API
              </p>
            </div>

            <div className="p-6">
              {Array.isArray(data) ? (
                <div className="space-y-3">
                  {data.map((item, index) => (
                    <div
                      key={item.id || index}
                      className="flex items-center justify-between rounded-xl border border-gray-100 p-4"
                    >
                      <span className="text-sm text-gray-600">
                        {item.month ||
                          item.date ||
                          item.label ||
                          `Period ${index + 1}`}
                      </span>

                      <span className="font-semibold text-gray-900">
                        ৳{" "}
                        {getNumber(
                          item.revenue,
                          item.total_revenue,
                          item.amount
                        ).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-gray-50 p-5">
                    <p className="text-xs text-gray-500">
                      Revenue
                    </p>

                    <p className="mt-2 text-xl font-bold text-gray-900">
                      ৳ {revenue.toLocaleString()}
                    </p>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-5">
                    <p className="text-xs text-gray-500">
                      Orders
                    </p>

                    <p className="mt-2 text-xl font-bold text-gray-900">
                      {orders.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

