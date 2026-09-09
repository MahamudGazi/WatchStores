import { useEffect, useState } from "react";
import {
  BarChart3,
  ShoppingCart,
  Package,
  Users,
  Clock3,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import api from "../../../api/axios";

export default function AdminReports() {
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [topProducts, setTopProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadReports = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [statsResponse, revenueResponse, productsResponse] =
        await Promise.all([
          api.get("/dashboard/stats/"),
          api.get("/dashboard/revenue/"),
          api.get("/dashboard/top-products/"),
        ]);

      const statsData =
        statsResponse.data?.data ?? statsResponse.data ?? {};

      const revenueData =
        revenueResponse.data?.data ?? revenueResponse.data ?? {};

      const productsData =
        productsResponse.data?.data ??
        productsResponse.data ??
        [];

      setStats(statsData);
      setRevenue(revenueData);
      setTopProducts(
        Array.isArray(productsData)
          ? productsData
          : productsData?.results || []
      );
    } catch (err) {
      console.error("Reports API Error:", err);

      if (err.response?.status === 401) {
        setError("You are not authenticated. Please login again.");
      } else if (err.response?.status === 403) {
        setError(
          "You don't have permission to view reports."
        );
      } else if (err.response?.status === 404) {
        setError(
          "One or more report API endpoints were not found."
        );
      } else {
        setError(
          err.response?.data?.detail ||
            "Failed to load reports."
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const formatNumber = (value) => {
    const number = Number(value ?? 0);

    return Number.isNaN(number)
      ? "0"
      : number.toLocaleString();
  };

  const formatMoney = (value) => {
    const number = Number(value ?? 0);

    if (Number.isNaN(number)) {
      return "৳ 0";
    }

    return `৳ ${number.toLocaleString()}`;
  };

  const getProductSold = (product) => {
    return (
      product.sold ??
      product.quantity ??
      product.total_sold ??
      product.units_sold ??
      0
    );
  };

  const getProductRevenue = (product) => {
    return (
      product.revenue ??
      product.total_revenue ??
      product.sales ??
      0
    );
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <Loader2
            size={34}
            className="mx-auto animate-spin text-zinc-500"
          />

          <p className="mt-4 text-sm text-zinc-500">
            Loading reports...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white">
              <BarChart3 size={21} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-zinc-900">
                Reports
              </h1>

              <p className="mt-1 text-sm text-zinc-500">
                Sales, revenue and inventory overview
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => loadReports(true)}
          disabled={refreshing}
          className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {refreshing ? (
            <Loader2
              size={17}
              className="animate-spin"
            />
          ) : (
            <RefreshCw size={17} />
          )}

          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5">
          <AlertTriangle
            size={20}
            className="mt-0.5 shrink-0 text-red-600"
          />

          <div className="flex-1">
            <h3 className="font-semibold text-red-800">
              Unable to load reports
            </h3>

            <p className="mt-1 text-sm text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={() => loadReports(true)}
              className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      {!error && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Total Orders */}
            <ReportCard
              label="Total Orders"
              value={formatNumber(
                stats?.total_orders
              )}
              icon={ShoppingCart}
            />

            {/* Pending */}
            <ReportCard
              label="Pending Orders"
              value={formatNumber(
                stats?.pending_orders
              )}
              icon={Clock3}
            />

            {/* Delivered */}
            <ReportCard
              label="Delivered Orders"
              value={formatNumber(
                stats?.delivered_orders
              )}
              icon={CheckCircle2}
            />

            {/* Products */}
            <ReportCard
              label="Total Products"
              value={formatNumber(
                stats?.total_products
              )}
              icon={Package}
            />

            {/* Customers */}
            <ReportCard
              label="Total Customers"
              value={formatNumber(
                stats?.total_customers
              )}
              icon={Users}
            />

            {/* Revenue */}
            <ReportCard
              label="Total Revenue"
              value={formatMoney(
                stats?.revenue
              )}
              icon={DollarSign}
            />
          </div>

          {/* Revenue Analytics */}
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-zinc-100 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100">
                  <TrendingUp size={19} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-zinc-900">
                    Revenue Analytics
                  </h2>

                  <p className="text-xs text-zinc-500">
                    Revenue data from dashboard API
                  </p>
                </div>
              </div>
            </div>

            <RevenueSection
              revenue={revenue}
              formatMoney={formatMoney}
              formatNumber={formatNumber}
            />
          </div>

          {/* Top Products */}
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-zinc-100 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100">
                <BarChart3 size={19} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-zinc-900">
                  Top Products
                </h2>

                <p className="text-xs text-zinc-500">
                  Best performing products by sales
                </p>
              </div>
            </div>

            {topProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-100 bg-zinc-50">
                      <th className="px-5 py-3 font-medium text-zinc-500">
                        #
                      </th>

                      <th className="px-5 py-3 font-medium text-zinc-500">
                        Product
                      </th>

                      <th className="px-5 py-3 font-medium text-zinc-500">
                        Sold
                      </th>

                      <th className="px-5 py-3 font-medium text-zinc-500">
                        Revenue
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {topProducts.map((product, index) => {
                      const sold =
                        getProductSold(product);

                      const productRevenue =
                        getProductRevenue(product);

                      return (
                        <tr
                          key={
                            product.id ??
                            product.product_id ??
                            index
                          }
                          className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50"
                        >
                          <td className="px-5 py-4">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-xs font-semibold text-zinc-600">
                              {index + 1}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              {product.image ||
                              product.product_image ? (
                                <img
                                  src={
                                    product.image ||
                                    product.product_image
                                  }
                                  alt={
                                    product.name ||
                                    product.product_name ||
                                    "Product"
                                  }
                                  className="h-11 w-11 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-zinc-100">
                                  <Package
                                    size={18}
                                    className="text-zinc-400"
                                  />
                                </div>
                              )}

                              <div>
                                <p className="font-medium text-zinc-900">
                                  {product.name ||
                                    product.product_name ||
                                    "Unknown Product"}
                                </p>

                                {product.brand && (
                                  <p className="text-xs text-zinc-500">
                                    {product.brand}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4 font-medium text-zinc-900">
                            {formatNumber(sold)}
                          </td>

                          <td className="px-5 py-4 font-semibold text-zinc-900">
                            {formatMoney(
                              productRevenue
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-10 text-center">
                <Package
                  size={36}
                  className="mx-auto text-zinc-300"
                />

                <p className="mt-3 text-sm text-zinc-500">
                  No product sales data yet.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}


/* =====================================================
   REPORT CARD
===================================================== */

function ReportCard({
  label,
  value,
  icon: Icon,
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold text-zinc-900">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-100">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}


/* =====================================================
   REVENUE SECTION
===================================================== */

function RevenueSection({
  revenue,
  formatMoney,
  formatNumber,
}) {
  if (!revenue) {
    return (
      <div className="p-10 text-center">
        <TrendingUp
          size={36}
          className="mx-auto text-zinc-300"
        />

        <p className="mt-3 text-sm text-zinc-500">
          No revenue analytics available.
        </p>
      </div>
    );
  }

  const totalRevenue =
    revenue.total_revenue ??
    revenue.revenue ??
    revenue.totalRevenue ??
    0;

  const totalOrders =
    revenue.total_orders ??
    revenue.orders ??
    revenue.order_count ??
    0;

  const averageOrder =
    revenue.average_order_value ??
    revenue.averageOrderValue ??
    revenue.avg_order_value ??
    0;

  const growth =
    revenue.growth ??
    revenue.revenue_growth ??
    revenue.growth_percentage ??
    null;

  const isArray = Array.isArray(revenue);

  return (
    <div className="p-5">
      {/* Revenue Summary */}
      {!isArray && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AnalyticsCard
            label="Revenue"
            value={formatMoney(totalRevenue)}
          />

          <AnalyticsCard
            label="Orders"
            value={formatNumber(totalOrders)}
          />

          <AnalyticsCard
            label="Average Order"
            value={formatMoney(averageOrder)}
          />

          <AnalyticsCard
            label="Growth"
            value={
              growth !== null
                ? `${formatNumber(growth)}%`
                : "—"
            }
          />
        </div>
      )}

      {/* Monthly / Period Revenue */}
      {isArray && revenue.length > 0 && (
        <div className="space-y-3">
          {revenue.map((item, index) => (
            <div
              key={item.id ?? index}
              className="flex flex-col gap-2 rounded-xl border border-zinc-100 bg-zinc-50 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-zinc-900">
                  {item.month ||
                    item.date ||
                    item.period ||
                    item.label ||
                    `Period ${index + 1}`}
                </p>

                {item.orders != null && (
                  <p className="mt-1 text-xs text-zinc-500">
                    {formatNumber(item.orders)} orders
                  </p>
                )}
              </div>

              <p className="font-bold text-zinc-900">
                {formatMoney(
                  item.revenue ??
                    item.total_revenue ??
                    item.amount ??
                    0
                )}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* No Array Data */}
      {isArray && revenue.length === 0 && (
        <p className="py-6 text-center text-sm text-zinc-500">
          No revenue records available.
        </p>
      )}
    </div>
  );
}


/* =====================================================
   ANALYTICS CARD
===================================================== */

function AnalyticsCard({
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>

      <p className="mt-2 text-xl font-bold text-zinc-900">
        {value}
      </p>
    </div>
  );
}

