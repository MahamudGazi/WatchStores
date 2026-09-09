import { useEffect, useState } from "react";
import {
  CheckCircle,
  Clock,
  XCircle,
  Package,
} from "lucide-react";

import { getOrderStatusChart } from "../../../api/admin";

export default function OrderStatus() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // LOAD ORDER STATUS
  // ==========================================

  useEffect(() => {
    async function loadOrderStatus() {
      try {
        setLoading(true);
        setError("");

        const response = await getOrderStatusChart();

        console.log("ORDER STATUS:", response);

        const result =
          response?.data?.results ||
          response?.data ||
          response?.results ||
          response ||
          [];

        setData(Array.isArray(result) ? result : []);
      } catch (err) {
        console.error("Order status error:", err);

        setError(
          err.response?.data?.detail ||
            err.response?.data?.message ||
            "Failed to load order status."
        );
      } finally {
        setLoading(false);
      }
    }

    loadOrderStatus();
  }, []);

  // ==========================================
  // TOTAL ORDERS
  // ==========================================

  const totalOrders = data.reduce(
    (total, item) => total + Number(item.total || 0),
    0
  );

  // ==========================================
  // STATUS CONFIG
  // ==========================================

  const getStatusConfig = (status) => {
    const normalized = String(status || "").toLowerCase();

    if (
      normalized.includes("deliver") ||
      normalized.includes("complete")
    ) {
      return {
        icon: CheckCircle,
        iconBg: "bg-green-100",
        iconColor: "text-green-600",
        bar: "bg-green-500",
        badge: "bg-green-100 text-green-700",
      };
    }

    if (
      normalized.includes("pending") ||
      normalized.includes("processing")
    ) {
      return {
        icon: Clock,
        iconBg: "bg-yellow-100",
        iconColor: "text-yellow-600",
        bar: "bg-yellow-500",
        badge: "bg-yellow-100 text-yellow-700",
      };
    }

    if (
      normalized.includes("cancel") ||
      normalized.includes("reject")
    ) {
      return {
        icon: XCircle,
        iconBg: "bg-red-100",
        iconColor: "text-red-600",
        bar: "bg-red-500",
        badge: "bg-red-100 text-red-700",
      };
    }

    return {
      icon: Package,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      bar: "bg-blue-500",
      badge: "bg-blue-100 text-blue-700",
    };
  };

  // ==========================================
  // COMMON CARD CLASSES
  // ==========================================

  const cardClass = `
  group
  flex
  w-full
  min-w-0
  h-[200px]
  flex-col
  overflow-hidden
  rounded-2xl
  bg-white
  p-4
  shadow-sm
  transition-all
  duration-300
  hover:-translate-y-1
  hover:shadow-lg

  sm:h-[205px]
  sm:p-5

  lg:h-[210px]
  lg:p-5

  xl:h-[210px]
  xl:p-6

  2xl:h-[210px]
  2xl:p-6
`;

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div
        className="
          w-full
          min-w-0
          max-w-full
          overflow-hidden
          bg-gray-100
          px-3
          py-4

          sm:px-5
          sm:py-6

          md:px-6
          md:py-7

          lg:px-8
          lg:py-8

          xl:px-6
          xl:py-7

          2xl:px-10
          2xl:py-9
        "
      >
        <div className="mx-auto w-full min-w-0 max-w-full">
          {/* Header Skeleton */}

          <div className="mb-5 sm:mb-7 lg:mb-8">
            <div
              className="
                h-7
                w-40
                animate-pulse
                rounded
                bg-gray-200

                sm:h-8
                sm:w-48

                lg:h-9
                lg:w-52
              "
            />

            <div
              className="
                mt-2
                h-4
                w-64
                max-w-full
                animate-pulse
                rounded
                bg-gray-200
              "
            />
          </div>

          {/* Card Skeleton */}

          <div
            className="
              grid
              w-full
              min-w-0
              grid-cols-1
              gap-4

              sm:grid-cols-2
              sm:gap-5

              lg:grid-cols-3
              lg:gap-5

              xl:grid-cols-2
              xl:gap-5

              2xl:grid-cols-3
              2xl:gap-7
            "
          >
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="
                  h-[210px]
                  w-full
                  min-w-0
                  animate-pulse
                  rounded-2xl
                  bg-white
                  shadow-sm

                  sm:h-[210px]

                  lg:min-h-[210px]

                  2xl:min-h-[210px]
                "
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div
        className="
          w-full
          min-w-0
          max-w-full
          overflow-hidden
          bg-gray-100
          px-3
          py-4

          sm:px-5
          sm:py-6

          md:px-6
          md:py-7

          lg:px-8
          lg:py-8

          xl:px-6
          xl:py-7

          2xl:px-10
          2xl:py-9
        "
      >
        <div className="mx-auto w-full min-w-0 max-w-full">
          <div
            className="
              w-full
              min-w-0
              rounded-2xl
              border
              border-red-200
              bg-red-50
              p-4

              sm:p-5

              lg:p-6
            "
          >
            <div className="flex min-w-0 items-start gap-3">
              <XCircle
                className="mt-0.5 shrink-0 text-red-500"
                size={22}
              />

              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-red-700">
                  Failed to load order status
                </h2>

                <p className="mt-1 break-words text-sm text-red-600">
                  {error}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <div
      className="
        w-full
        min-w-0
        max-w-full
        overflow-hidden
        bg-gray-100
        px-3
        py-4

        sm:px-5
        sm:py-6

        md:px-6
        md:py-7

        lg:px-8
        lg:py-8

        xl:px-6
        xl:py-7

        2xl:px-10
        2xl:py-9
      "
    >
      <div
        className="
          mx-auto
          w-full
          min-w-0
          max-w-full
        "
      >
        {/* =====================================
            HEADER
        ====================================== */}

        <div
          className="
            mb-5
            min-w-0

            sm:mb-7

            lg:mb-8

            2xl:mb-9
          "
        >
          <div
            className="
              flex
              min-w-0
              flex-col
              gap-4

              sm:flex-row
              sm:items-end
              sm:justify-between
              sm:gap-5
            "
          >
            {/* TITLE */}

            <div className="min-w-0 flex-1">
              <h1
                className="
                  truncate
                  text-xl
                  font-bold
                  text-gray-900

                  sm:text-2xl

                  lg:text-3xl

                  2xl:text-3xl
                "
              >
                Order Status
              </h1>

              <p
                className="
                  mt-1
                  max-w-2xl
                  break-words
                  text-xs
                  leading-5
                  text-gray-500

                  sm:text-sm

                  lg:text-base
                "
              >
                Overview of your store's order status.
              </p>
            </div>

            {/* TOTAL ORDERS */}

            {data.length > 0 && (
              <div
                className="
                  w-full
                  shrink-0
                  rounded-xl
                  bg-white
                  px-4
                  py-3
                  shadow-sm

                  sm:w-auto
                  sm:min-w-[150px]

                  lg:min-w-[165px]

                  xl:min-w-[175px]
                "
              >
                <p className="text-xs text-gray-500">
                  Total Orders
                </p>

                <p
                  className="
                    mt-1
                    truncate
                    text-xl
                    font-bold
                    text-gray-900

                    sm:text-2xl
                  "
                >
                  {totalOrders.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* =====================================
            EMPTY STATE
        ====================================== */}

        {data.length === 0 ? (
          <div
            className="
              w-full
              min-w-0
              rounded-2xl
              bg-white
              px-4
              py-10
              text-center
              shadow-sm

              sm:px-6
              sm:py-12

              lg:px-8
              lg:py-14

              xl:py-16
            "
          >
            <Package
              size={40}
              className="mx-auto text-gray-300"
            />

            <h3
              className="
                mt-4
                text-sm
                font-semibold
                text-gray-700

                sm:text-base
              "
            >
              No order status data
            </h3>

            <p
              className="
                mx-auto
                mt-1
                max-w-sm
                text-xs
                leading-5
                text-gray-500

                sm:text-sm
              "
            >
              There are currently no orders available.
            </p>
          </div>
        ) : (
          /* =====================================
             STATUS CARDS
          ====================================== */

          <div
            className="
              grid
              w-full
              min-w-0
              grid-cols-1
              gap-4

              sm:grid-cols-2
              sm:gap-5

              lg:grid-cols-3
              lg:gap-5

              xl:grid-cols-2
              xl:gap-5

              2xl:grid-cols-3
              2xl:gap-7
            "
          >
            {data.map((item, index) => {
              const status = item.status || "Unknown";

              const count = Number(item.total || 0);

              const percentage =
                totalOrders > 0
                  ? (count / totalOrders) * 100
                  : 0;

              const config =
                getStatusConfig(status);

              const Icon = config.icon;

              return (
                <div
                  key={`${status}-${index}`}
                  className={cardClass}
                >
                  {/* CARD HEADER */}

                  <div
                    className="
                      flex
                      min-w-0
                      items-start
                      justify-between
                      gap-3
                    "
                  >
                    {/* LEFT */}

                    <div
                      className="
                        flex
                        min-w-0
                        flex-1
                        items-center
                        gap-3
                      "
                    >
                      {/* ICON */}

                      <div
                        className={`
                          flex
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          p-1.5

                          sm:p-3

                          ${config.iconBg}
                        `}
                      >
                        <Icon
                          size={20}
                          className={config.iconColor}
                        />
                      </div>

                      {/* STATUS */}

                      <div className="min-w-0 flex-1">
                        <p
                          className="
                            text-[11px]
                            text-gray-500

                            sm:text-xs
                          "
                        >
                          Order Status
                        </p>

                        <h3
                          className="
                            mt-0.5
                            truncate
                            text-sm
                            font-bold
                            capitalize
                            text-gray-900

                            sm:text-base
                          "
                        >
                          {status}
                        </h3>
                      </div>
                    </div>

                    {/* PERCENTAGE */}

                    <span
                      className={`
                        shrink-0
                        whitespace-nowrap
                        rounded-full
                        px-2.5
                        py-1
                        text-[10px]
                        font-semibold

                        sm:px-3
                        sm:text-xs

                        ${config.badge}
                      `}
                    >
                      {percentage.toFixed(1)}%
                    </span>
                  </div>

                  {/* COUNT */}

                  <div
                    className="
                      mt-auto
                      min-w-0
                     
                      pt-3

                      sm:mt-4
                    "
                  >
                    <span
                      className="
                        truncate
                        text-2xl
                        font-bold
                        text-gray-900

                        sm:text-3xl
                      "
                    >
                      {count.toLocaleString()}
                    </span>

                    <span
                      className="
                        shrink-0
                        text-xs
                        text-gray-500

                        sm:text-sm
                      "
                    >
                      orders
                    </span>
                  </div>

                  {/* PROGRESS */}

                  <div
                    className="
                      mt-auto
                      min-w-0
                      pt-3

                      sm:pt-4
                    "
                  >
                    <div
                      className="
                        mb-2
                        flex
                        min-w-0
                        items-center
                        justify-between
                        gap-2
                        text-[11px]
                        text-gray-500

                        sm:text-xs
                      "
                    >
                      <span className="truncate">
                        Order share
                      </span>

                      <span className="shrink-0">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>

                    <div
                      className="
                        h-2
                        w-full
                        overflow-hidden
                        rounded-full
                        bg-gray-100

                        sm:h-2.5
                      "
                    >
                      <div
                        className={`
                          ${config.bar}
                          h-full
                          rounded-full
                          transition-all
                          duration-700
                        `}
                        style={{
                          width: `${Math.min(
                            percentage,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}