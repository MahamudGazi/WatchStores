import { useEffect, useState } from "react";
import {
  Bell,
  ShoppingBag,
  Package,
  Users,
  DollarSign,
  ArrowRight,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  getDashboardStats,
  getRecentOrders,
  getRevenueAnalytics,
  getOrderStatusChart,
  getTopProducts,
  getTopCustomers,
  getDashboardNotifications,
  getLowStockProducts,
} from "../../../api/admin";

// Dashboard components
import Revenue from "./Revenue";
import OrderStatus from "./OrderStatus";
import TopProducts from "./TopProducts";
import TopCustomers from "./TopCustomers";
import Notifications from "./Notifications";

export default function AdminDashboard() {
  const [statsData, setStatsData] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [revenueData, setRevenueData] = useState(null);
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // LOAD ALL DASHBOARD DATA
  // ==========================================

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        statsResponse,
        ordersResponse,
        revenueResponse,
        orderStatusResponse,
        productsResponse,
        customersResponse,
        notificationsResponse,
        lowStockResponse,
      ] = await Promise.all([
        getDashboardStats(),
        getRecentOrders(),
        getRevenueAnalytics(),
        getOrderStatusChart(),
        getTopProducts(),
        getTopCustomers(),
        getDashboardNotifications(),
        getLowStockProducts(),
      ]);

      console.log("STATS:", statsResponse);
      console.log("ORDERS:", ordersResponse);
      console.log("REVENUE:", revenueResponse);
      console.log("ORDER STATUS:", orderStatusResponse);
      console.log("TOP PRODUCTS:", productsResponse);
      console.log("TOP CUSTOMERS:", customersResponse);
      console.log("NOTIFICATIONS:", notificationsResponse);
      console.log("LOW STOCK:", lowStockResponse);

      // ==========================================
      // SET DATA
      // ==========================================

      setStatsData(
        statsResponse?.data || statsResponse || null
      );

      setRecentOrders(
        ordersResponse?.data ||
        ordersResponse?.results ||
        ordersResponse ||
        []
      );

      setRevenueData(
        revenueResponse?.data ||
        revenueResponse ||
        null
      );

      setOrderStatusData(
        orderStatusResponse?.data ||
        orderStatusResponse?.results ||
        orderStatusResponse ||
        []
      );

      setTopProducts(
        productsResponse?.data ||
        productsResponse?.results ||
        productsResponse ||
        []
      );

      setTopCustomers(
        customersResponse?.data ||
        customersResponse?.results ||
        customersResponse ||
        []
      );

      setNotifications(
        notificationsResponse?.data ||
        notificationsResponse?.results ||
        notificationsResponse ||
        []
      );

      setLowStockProducts(
        lowStockResponse?.data ||
        lowStockResponse?.results ||
        lowStockResponse ||
        []
      );

    } catch (err) {
      console.error(
        "========== DASHBOARD ERROR =========="
      );

      console.error("Status:", err.response?.status);
      console.error("Data:", err.response?.data);
      console.error("Full error:", err);

      setError(
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Failed to load dashboard data."
      );

    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    loadDashboard();
  }, []);

  const stats = [
    {
      title: "Total Orders",
      value: statsData?.total_orders ?? 0,
      icon: ShoppingBag,
      color: "bg-blue-500",
      link: "/admin/orders",
    },

    {
      title: "Pending Orders",
      value: statsData?.pending_orders ?? 0,
      icon: Bell,
      color: "bg-yellow-500",
      link: "/admin/orders",
    },

    {
      title: "Delivered Orders",
      value: statsData?.delivered_orders ?? 0,
      icon: Package,
      color: "bg-green-500",
      link: "/admin/orders",
    },

    {
      title: "Products",
      value: statsData?.total_products ?? 0,
      icon: Package,
      color: "bg-purple-500",
      link: "/admin/products",
    },

    {
      title: "Customers",
      value: statsData?.total_customers ?? 0,
      icon: Users,
      color: "bg-pink-500",
      link: "/admin/customers",
    },

    {
      title: "Revenue",
      value: `৳ ${Number(
        statsData?.revenue ?? 0
      ).toLocaleString()}`,
      icon: DollarSign,
      color: "bg-black",
      link: "/admin/reports/revenue",
    },
  ];

  // ==========================================
  // QUICK ACTIONS
  // ==========================================

  const quickActions = [
    {
      title: "Orders",
      description: "Manage customer orders",
      link: "/admin/orders",
      color: "bg-blue-500",
    },

    {
      title: "Returns",
      description: "Manage returned products",
      link: "/admin/returns",
      color: "bg-yellow-500",
    },

    {
      title: "Refunds",
      description: "Manage customer refunds",
      link: "/admin/refunds",
      color: "bg-purple-500",
    },

    {
      title: "Inventory",
      description: "Manage product stock",
      link: "/admin/inventory",
      color: "bg-green-500",
    },
  ];

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 lg:ml-64">
        <main className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="text-center">
              <RefreshCw
                size={36}
                className="mx-auto animate-spin text-gray-500"
              />

              <p className="mt-4 text-sm text-gray-500">
                Loading dashboard...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ==========================================
  // MAIN
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-100 lg:ml-3">

      <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

        {/* =====================================
            HEADER
        ===================================== */}

        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Dashboard
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Overview of your WatchStore business.
            </p>
          </div>

          <button
            onClick={loadDashboard}
            className="
              inline-flex
              w-fit
              items-center
              gap-2
              rounded-lg
              bg-black
              px-4
              py-2
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-gray-800
            "
          >
            <RefreshCw size={16} />
            Refresh
          </button>

        </div>

        {/* =====================================
            ERROR
        ===================================== */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">

            <div className="flex items-start gap-3">

              <AlertTriangle
                size={20}
                className="mt-0.5 text-red-500"
              />

              <div>
                <h3 className="font-semibold text-red-700">
                  Dashboard Error
                </h3>

                <p className="mt-1 text-sm text-red-600">
                  {error}
                </p>
              </div>

            </div>
          </div>
        )}

        {/* =====================================
            STATS
        ===================================== */}

        <section>

          <div className="
            grid
            grid-cols-1
            gap-4
            sm:grid-cols-2
            xl:grid-cols-3
          ">

            {stats.map((stat) => {

              const Icon = stat.icon;

              return (
                <Link
                  key={stat.title}
                  to={stat.link}
                  className={`
                    ${stat.color}
                    group
                    rounded-2xl
                    p-5
                    text-white
                    shadow-md
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:shadow-xl
                    sm:p-6
                  `}
                >

                  <div className="flex items-start justify-between">

                    <div>

                      <p className="text-sm font-medium text-white/80">
                        {stat.title}
                      </p>

                      <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                        {stat.value}
                      </h2>

                    </div>

                    <div className="
                      rounded-xl
                      bg-white/20
                      p-3
                      backdrop-blur
                    ">
                      <Icon size={24} />
                    </div>

                  </div>

                  <div className="
                    mt-5
                    flex
                    items-center
                    justify-between
                    text-xs
                    text-white/70
                  ">

                    <span>
                      View details
                    </span>

                    <ArrowRight
                      size={16}
                      className="
                        transition-transform
                        group-hover:translate-x-1
                      "
                    />

                  </div>

                </Link>
              );
            })}

          </div>

        </section>

        {/* =====================================
            REVENUE + ORDER STATUS
        ===================================== */}

        <section className="
          mt-8
          grid
          grid-cols-1
          gap-6
          xl:grid-cols-2
        ">

          <Revenue
            data={revenueData}
          />

          <OrderStatus
            data={orderStatusData}
          />

        </section>

        {/* =====================================
            QUICK ACTIONS
        ===================================== */}

        <section className="
          mt-8
          rounded-2xl
          bg-white
          p-5
          shadow-sm
          sm:p-6
        ">

          <div className="mb-5">

            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Quickly manage your store.
            </p>

          </div>

          <div className="
            grid
            grid-cols-1
            gap-4
            sm:grid-cols-2
            xl:grid-cols-4
          ">

            {quickActions.map((action) => (

              <Link
                key={action.title}
                to={action.link}
                className={`
                  ${action.color}
                  group
                  rounded-xl
                  p-5
                  text-white
                  transition
                  duration-300
                  hover:-translate-y-1
                  hover:shadow-lg
                `}
              >

                <div className="flex items-center justify-between">

                  <div>

                    <h3 className="font-bold">
                      {action.title}
                    </h3>

                    <p className="mt-1 text-xs text-white/80">
                      {action.description}
                    </p>

                  </div>

                  <ArrowRight
                    size={20}
                    className="
                      transition-transform
                      group-hover:translate-x-1
                    "
                  />

                </div>

              </Link>

            ))}

          </div>

        </section>

        {/* =====================================
            RECENT ORDERS
        ===================================== */}

        <section className="
          mt-8
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-sm
        ">

          <div className="
            flex
            flex-col
            gap-3
            border-b
            px-5
            py-5
            sm:flex-row
            sm:items-center
            sm:justify-between
            sm:px-6
          ">

            <div>

              <h2 className="text-xl font-bold text-gray-900">
                Recent Orders
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Latest customer orders.
              </p>

            </div>

            <Link
              to="/admin/orders"
              className="
                inline-flex
                w-fit
                items-center
                gap-2
                rounded-lg
                bg-black
                px-4
                py-2
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-gray-800
              "
            >
              View All
              <ArrowRight size={16} />
            </Link>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[700px]">

              <thead>

                <tr className="bg-gray-50 text-left text-sm text-gray-500">

                  <th className="px-5 py-4">
                    Order
                  </th>

                  <th className="px-5 py-4">
                    Customer
                  </th>

                  <th className="px-5 py-4">
                    Amount
                  </th>

                  <th className="px-5 py-4">
                    Status
                  </th>

                  <th className="px-5 py-4">
                    Date
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y">

                {recentOrders.length === 0 ? (

                  <tr>

                    <td
                      colSpan="5"
                      className="px-5 py-10 text-center text-gray-500"
                    >
                      No recent orders found.
                    </td>

                  </tr>

                ) : (

                  recentOrders.map((order) => (

                    <tr
                      key={order.id}
                      className="text-sm transition hover:bg-gray-50"
                    >

                      <td className="px-5 py-4 font-semibold">

                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          #{order.order_number || order.id}
                        </Link>

                      </td>

                      <td className="px-5 py-4">

                        {order.customer?.username ||
                          order.customer?.email ||
                          order.user?.username ||
                          order.user?.email ||
                          "Customer"}

                      </td>

                      <td className="px-5 py-4 font-semibold">

                        ৳{" "}
                        {Number(
                          order.grand_total ?? 0
                        ).toLocaleString()}

                      </td>

                      <td className="px-5 py-4">

                        <span
                          className={`
                            inline-flex
                            rounded-full
                            px-3
                            py-1
                            text-xs
                            font-semibold

                            ${order.status === "Delivered"
                              ? "bg-green-100 text-green-700"
                              : order.status === "Pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : order.status === "Cancelled"
                                  ? "bg-red-100 text-red-700"
                                  : order.status === "Shipped"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-gray-100 text-gray-700"
                            }
                          `}
                        >
                          {order.status || "Unknown"}
                        </span>

                      </td>

                      <td className="px-5 py-4 text-gray-500">

                        {order.created_at
                          ? new Date(
                            order.created_at
                          ).toLocaleDateString()
                          : "-"}

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        </section>

        {/* =====================================
            TOP PRODUCTS + TOP CUSTOMERS
        ===================================== */}

        <section className="
          mt-8
          grid
          grid-cols-1
          gap-6
          xl:grid-cols-2
        ">

          <TopProducts
            products={topProducts}
          />

          <TopCustomers
            customers={topCustomers}
          />

        </section>

        {/* =====================================
            NOTIFICATIONS + LOW STOCK
        ===================================== */}

        <section className="
          mt-8
          grid
          grid-cols-1
          gap-6
          xl:grid-cols-2
        ">

          <Notifications
            notifications={notifications}
          />

          {/* ================= LOW STOCK ================= */}

          <section className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm lg:mt-10">

            {/* Header */}
            <div className="flex flex-col gap-3 border-b px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">

              <div>
                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                  Low Stock
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Products that need attention.
                </p>
              </div>

              <Link
                to="/admin/inventory"
                className="
        inline-flex
        w-fit
        items-center
        rounded-lg
        bg-black
        px-4
        py-2
        text-sm
        font-semibold
        text-white
        transition
        hover:bg-gray-800
      "
              >
                Inventory
              </Link>

            </div>


            {/* Low Stock List */}

            <div className="p-4 sm:p-6">

              {lowStockProducts.length === 0 ? (

                <div className="rounded-xl bg-green-50 p-6 text-center">

                  <p className="font-semibold text-green-700">
                    Stock looks good
                  </p>

                  <p className="mt-1 text-sm text-green-600">
                    No low-stock products found.
                  </p>

                </div>

              ) : (

                <div className="space-y-3">

                  {lowStockProducts
                    .slice(0, 10)
                    .map((product) => (

                      <Link
                        key={product.id}
                        to="/admin/inventory"
                        className="
                group
                flex
                flex-col
                gap-3
                rounded-xl
                border
                border-red-100
                bg-red-50
                px-4
                py-4
                transition
                hover:border-red-200
                hover:bg-red-100

                sm:flex-row
                sm:items-center
                sm:justify-between
                sm:px-5
              "
                      >

                        {/* Product Info */}

                        <div className="min-w-0">

                          <h3
                            className="
                    truncate
                    text-sm
                    font-semibold
                    text-gray-900

                    sm:text-base
                  "
                          >
                            {product.name}
                          </h3>

                          <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                            Stock:{" "}
                            <span className="font-semibold text-red-600">
                              {product.stock}
                            </span>
                          </p>

                        </div>


                        {/* Warning */}

                        <div
                          className="
                  flex
                  items-center
                  justify-between
                  sm:justify-end
                "
                        >

                          <span
                            className="
                    rounded-full
                    bg-red-100
                    px-3
                    py-1
                    text-xs
                    font-semibold
                    text-red-700
                  "
                          >
                            Low Stock
                          </span>

                          <span className="ml-3 text-xl">
                            ⚠️
                          </span>

                        </div>

                      </Link>

                    ))}

                </div>

              )}

            </div>

          </section>

        </section>

      </main>

    </div>
  );
}