import { useEffect, useState } from "react";
import {
  DollarSign,
  TrendingUp,
  CalendarDays,
  BarChart3,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import { getRevenueAnalytics } from "../../../api/admin";

export default function Revenue() {
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // LOAD REVENUE
  // ==========================================

  const loadRevenue = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getRevenueAnalytics();

      console.log("REVENUE ANALYTICS:", data);

      setRevenue(data);
    } catch (err) {
      console.error("Revenue loading error:", err);

      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to load revenue analytics."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRevenue();
  }, []);

  // ==========================================
  // FORMAT CURRENCY
  // ==========================================

  const formatCurrency = (value) => {
    return `৳ ${Number(value || 0).toLocaleString("en-BD", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // ==========================================
  // REVENUE CARDS
  // ==========================================

  const revenueCards = [
    {
      title: "Today",
      value: revenue?.today,
      icon: CalendarDays,
      color: "bg-blue-500",
      lightColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Last 7 Days",
      value: revenue?.last_7_days,
      icon: TrendingUp,
      color: "bg-green-500",
      lightColor: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "Last 30 Days",
      value: revenue?.last_30_days,
      icon: BarChart3,
      color: "bg-purple-500",
      lightColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      title: "Last 6 Months",
      value: revenue?.last_6_months,
      icon: CalendarDays,
      color: "bg-orange-500",
      lightColor: "bg-orange-50",
      iconColor: "text-orange-600",
    },
    {
      title: "Last Year",
      value: revenue?.last_year,
      icon: TrendingUp,
      color: "bg-pink-500",
      lightColor: "bg-pink-50",
      iconColor: "text-pink-600",
    },
    {
      title: "Total Revenue",
      value: revenue?.total_revenue,
      icon: DollarSign,
      color: "bg-black",
      lightColor: "bg-gray-100",
      iconColor: "text-gray-900",
    },
  ];

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
          lg:py-7

          xl:px-8
          xl:py-8

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
                w-44
                animate-pulse
                rounded-lg
                bg-gray-200

                sm:h-8
                sm:w-52

                lg:h-9
                lg:w-56
              "
            />

            <div
              className="
                mt-2
                h-4
                w-72
                max-w-full
                animate-pulse
                rounded
                bg-gray-200
              "
            />
          </div>

          {/* Cards Skeleton */}

          <div
            className="
              grid
              w-full
              min-w-0
              grid-cols-1
              gap-4

              sm:grid-cols-2
              sm:gap-5

              lg:grid-cols-2
              lg:gap-5

              xl:gap-6

              2xl:gap-7
            "
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="
                  h-[180px]
                  w-full
                  min-w-0
                  animate-pulse
                  rounded-2xl
                  bg-white
                  shadow-sm

                  sm:h-[190px]

                  lg:h-[200px]

                  2xl:h-[210px]
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

          lg:px-6
          lg:py-7

          xl:px-8
          xl:py-8

          2xl:px-10
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
              bg-white
              p-4
              shadow-sm

              sm:p-6

              lg:p-7
            "
          >
            <div className="flex min-w-0 items-start gap-3 sm:gap-4">
              {/* Error Icon */}

              <div
                className="
                  shrink-0
                  rounded-xl
                  bg-red-100
                  p-2.5
                  text-red-600

                  sm:p-3
                "
              >
                <AlertCircle
                  size={22}
                  className="sm:h-6 sm:w-6"
                />
              </div>

              {/* Error Content */}

              <div className="min-w-0 flex-1">
                <h2
                  className="
                    text-base
                    font-bold
                    text-gray-900

                    sm:text-lg
                  "
                >
                  Failed to load revenue
                </h2>

                <p
                  className="
                    mt-1
                    break-words
                    text-xs
                    leading-5
                    text-gray-500

                    sm:text-sm
                  "
                >
                  {error}
                </p>

                <button
                  onClick={loadRevenue}
                  className="
                    mt-4
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    bg-black
                    px-3.5
                    py-2
                    text-xs
                    font-semibold
                    text-white
                    transition
                    hover:bg-gray-800
                    active:scale-95

                    sm:px-4
                    sm:text-sm
                  "
                >
                  <RefreshCw size={15} />
                  Try Again
                </button>
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
      "
    >
      <main
        className="
          w-full
          min-w-0
          px-3
          py-4

          sm:px-5
          sm:py-6

          md:px-6
          md:py-7

          lg:px-6
          lg:py-7

          xl:px-8
          xl:py-8

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

          <section
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
                  "
                >
                  Revenue Analytics
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
                  Compare revenue across different time periods.
                </p>
              </div>

              {/* Total Revenue Summary */}

              {revenue && (
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
                    sm:min-w-[190px]

                    lg:min-w-[200px]

                    xl:min-w-[215px]
                  "
                >
                  <p className="text-xs font-medium text-gray-500">
                    Total Revenue
                  </p>

                  <p
                    className="
                      mt-1
                      break-all
                      text-lg
                      font-bold
                      leading-tight
                      text-gray-900

                      sm:text-xl
                    "
                  >
                    {formatCurrency(
                      revenue?.total_revenue
                    )}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* =====================================
              REVENUE CARDS
          ====================================== */}

          <section className="w-full min-w-0">
            <div
              className="
                grid
                w-full
                min-w-0
                grid-cols-1
                gap-4

                sm:grid-cols-2
                sm:gap-4

                lg:grid-cols-3
                lg:gap-4

                xl:grid-cols-3
                xl:gap-5

                2xl:grid-cols-3
                2xl:gap-7
              "
            >
              {revenueCards.map((card) => {
                const Icon = card.icon;

                return (
                  <div
                    key={card.title}
                    className="
                      group
                      flex
                      w-full
                      min-w-0
                      min-h-[170px]
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

                      sm:min-h-[180px]
                      sm:p-5

                      lg:min-h-[185px]
                      lg:p-5

                      xl:min-h-[190px]
                      xl:p-6

                      2xl:min-h-[210px]
                      2xl:p-6
                    "
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
                      <div
                        className="
                          min-w-0
                          flex-1
                        "
                      >
                        <p
                          className="
                            truncate
                            text-xs
                            font-medium
                            text-gray-500

                            sm:text-sm
                          "
                        >
                          {card.title}
                        </p>

                        <h3
                          className="
                            mt-2
                            max-w-full
                            break-all
                            text-xl
                            font-bold
                            leading-tight
                            text-gray-900

                            sm:mt-3
                            sm:text-2xl

                            lg:text-2xl

                            xl:text-3xl
                          "
                        >
                          {formatCurrency(card.value)}
                        </h3>
                      </div>

                      {/* ICON */}

                      <div
                        className={`
                          ${card.lightColor}
                          flex
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          p-2.5

                          sm:p-3
                        `}
                      >
                        <Icon
                          size={20}
                          className={card.iconColor}
                        />
                      </div>
                    </div>

                    {/* PROGRESS BAR */}

                    <div
                      className="
                        mt-auto
                        min-w-0
                        pt-5

                        sm:pt-6
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
                        "
                      >
                        <span
                          className="
                            shrink-0
                            text-[11px]
                            text-gray-400

                            sm:text-xs
                          "
                        >
                          Revenue
                        </span>

                        <span
                          className="
                            min-w-0
                            truncate
                            text-right
                            text-[11px]
                            font-medium
                            text-gray-500

                            sm:text-xs
                          "
                        >
                          {formatCurrency(card.value)}
                        </span>
                      </div>

                      <div
                        className="
                          h-1.5
                          w-full
                          overflow-hidden
                          rounded-full
                          bg-gray-100

                          sm:h-2
                        "
                      >
                        <div
                          className={`
                            ${card.color}
                            h-full
                            w-full
                            rounded-full
                            transition-all
                            duration-500
                            group-hover:opacity-80
                          `}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}