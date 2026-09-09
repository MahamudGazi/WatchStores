import { useEffect, useState } from "react";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

import { getTopProducts } from "../../../api/admin";

export default function TopProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTopProducts() {
      try {
        setLoading(true);
        setError("");

        const response = await getTopProducts();

        console.log("TOP PRODUCTS:", response);

        const result =
          response?.data ||
          response?.results ||
          response ||
          [];

        setProducts(
          Array.isArray(result) ? result : []
        );
      } catch (err) {
        console.error("Top products error:", err);

        setError(
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to load top products."
        );
      } finally {
        setLoading(false);
      }
    }

    loadTopProducts();
  }, []);

  // ===============================
  // TOTAL SOLD
  // ===============================

  const totalSold = products.reduce(
    (total, product) =>
      total + Number(product.sold || 0),
    0
  );

  // ===============================
  // LOADING
  // ===============================

  if (loading) {
    return (
      <div
        className="
          w-full
          min-w-0
          max-w-full
          overflow-hidden
          bg-gray-100
          p-3
          sm:p-4
          md:p-5
          lg:p-6
          xl:p-7
          2xl:p-8
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
          <div className="animate-pulse">

            <div className="h-8 w-48 max-w-full rounded bg-gray-200 sm:w-52" />

            <div className="mt-2 h-4 w-64 max-w-full rounded bg-gray-200 sm:w-72" />

            <div
              className="
                mt-6
                w-full
                min-w-0
                overflow-hidden
                rounded-2xl
                bg-white
                p-5
                shadow-sm
                sm:mt-8
                sm:p-6
                lg:p-7
                xl:p-8
              "
            >
              <div className="space-y-5">

                {[1, 2, 3, 4, 5].map((item) => (
                  <div
                    key={item}
                    className="
                      flex
                      min-w-0
                      items-center
                      gap-3
                      sm:gap-4
                    "
                  >
                    <div
                      className="
                        h-10
                        w-10
                        shrink-0
                        rounded-xl
                        bg-gray-200
                      "
                    />

                    <div className="min-w-0 flex-1">
                      <div className="h-4 w-40 max-w-full rounded bg-gray-200" />
                      <div className="mt-2 h-3 w-24 max-w-full rounded bg-gray-200" />
                    </div>
                  </div>
                ))}

              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ===============================
  // ERROR
  // ===============================

  if (error) {
    return (
      <div
        className="
          w-full
          min-w-0
          max-w-full
          overflow-hidden
          bg-gray-100
          p-3
          sm:p-4
          md:p-5
          lg:p-6
          xl:p-7
          2xl:p-8
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
          <div
            className="
              w-full
              min-w-0
              overflow-hidden
              rounded-2xl
              border
              border-red-200
              bg-red-50
              p-4
              sm:p-5
              lg:p-6
              xl:p-7
            "
          >
            <div className="flex min-w-0 items-start gap-3">

              <AlertCircle
                size={24}
                className="mt-0.5 shrink-0 text-red-500"
              />

              <div className="min-w-0 flex-1">

                <h2
                  className="
                    break-words
                    font-semibold
                    text-red-700
                  "
                >
                  Failed to load top products
                </h2>

                <p
                  className="
                    mt-1
                    break-words
                    text-sm
                    text-red-600
                  "
                >
                  {error}
                </p>

              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="
        w-full
        min-w-0
        max-w-full
        overflow-hidden
        bg-gray-100
        p-3
        sm:p-4
        md:p-5
        lg:p-6
        xl:p-7
        2xl:p-8
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
            sm:mb-6
            lg:mb-7
            xl:mb-8
          "
        >
          <h1
            className="
              break-words
              text-xl
              font-bold
              text-gray-900
              sm:text-2xl
              lg:text-3xl
              xl:text-3xl
            "
          >
            Top Products
          </h1>

          <p
            className="
              mt-1
              break-words
              text-xs
              text-gray-500
              sm:text-sm
              lg:text-base
            "
          >
            Best-selling products in your WatchStore.
          </p>
        </div>

        {/* =====================================
            SUMMARY
        ====================================== */}

        <div
          className="
            mb-5
            grid
            w-full
            min-w-0
            grid-cols-1
            gap-4
            sm:mb-6
            sm:grid-cols-2
            sm:gap-5
            xl:gap-6
            2xl:gap-7
          "
        >

          {/* TOTAL PRODUCTS */}

          <div
            className="
              w-full
              min-w-0
              overflow-hidden
              rounded-2xl
              bg-white
              p-5
              shadow-sm
              sm:p-6
              lg:p-7
              xl:p-8
            "
          >
            <div
              className="
                flex
                min-w-0
                items-center
                justify-between
                gap-4
              "
            >
              <div className="min-w-0 flex-1">

                <p
                  className="
                    truncate
                    text-sm
                    text-gray-500
                  "
                >
                  Top Products
                </p>

                <h2
                  className="
                    mt-2
                    text-2xl
                    font-bold
                    text-gray-900
                    sm:text-3xl
                  "
                >
                  {products.length}
                </h2>

              </div>

              <div
                className="
                  shrink-0
                  rounded-xl
                  bg-purple-100
                  p-2.5
                  sm:p-3
                "
              >
                <Package
                  size={24}
                  className="text-purple-600 sm:h-[26px] sm:w-[26px]"
                />
              </div>

            </div>
          </div>

          {/* TOTAL SOLD */}

          <div
            className="
              w-full
              min-w-0
              overflow-hidden
              rounded-2xl
              bg-black
              p-5
              text-white
              shadow-sm
              sm:p-6
              lg:p-7
              xl:p-8
            "
          >
            <div
              className="
                flex
                min-w-0
                items-center
                justify-between
                gap-4
              "
            >
              <div className="min-w-0 flex-1">

                <p
                  className="
                    truncate
                    text-sm
                    text-white/60
                  "
                >
                  Total Items Sold
                </p>

                <h2
                  className="
                    mt-2
                    break-all
                    text-2xl
                    font-bold
                    sm:text-3xl
                  "
                >
                  {totalSold.toLocaleString()}
                </h2>

              </div>

              <div
                className="
                  shrink-0
                  rounded-xl
                  bg-white/10
                  p-2.5
                  sm:p-3
                "
              >
                <TrendingUp
                  size={24}
                  className="sm:h-[26px] sm:w-[26px]"
                />
              </div>

            </div>
          </div>

        </div>

        {/* =====================================
            PRODUCTS
        ====================================== */}

        <div
          className="
            w-full
            min-w-0
            overflow-hidden
            rounded-2xl
            bg-white
            shadow-sm
          "
        >

          {/* HEADER */}

          <div
            className="
              w-full
              min-w-0
              border-b
              p-4
              sm:p-5
              md:p-6
              lg:p-7
              xl:p-8
            "
          >
            <div
              className="
                flex
                min-w-0
                items-center
                gap-3
              "
            >

              <div
                className="
                  flex
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-blue-100
                  p-2.5
                  sm:p-3
                "
              >
                <ShoppingCart
                  size={21}
                  className="text-blue-600 sm:h-[22px] sm:w-[22px]"
                />
              </div>

              <div className="min-w-0 flex-1">

                <h2
                  className="
                    truncate
                    text-base
                    font-bold
                    text-gray-900
                    sm:text-lg
                    lg:text-xl
                  "
                >
                  Best Selling Products
                </h2>

                <p
                  className="
                    truncate
                    text-xs
                    text-gray-500
                    sm:text-sm
                  "
                >
                  Top 10 products by sales.
                </p>

              </div>

            </div>
          </div>

          {/* EMPTY */}

          {products.length === 0 ? (

            <div
              className="
                w-full
                min-w-0
                p-8
                text-center
                sm:p-10
                lg:p-12
                xl:p-14
              "
            >
              <Package
                size={45}
                className="mx-auto text-gray-300"
              />

              <h3
                className="
                  mt-4
                  break-words
                  font-semibold
                  text-gray-700
                "
              >
                No product sales found
              </h3>

              <p
                className="
                  mt-1
                  break-words
                  text-sm
                  text-gray-500
                "
              >
                Product sales will appear here.
              </p>
            </div>

          ) : (

            /* =====================================
                PRODUCT LIST
            ====================================== */

            <div
              className="
                w-full
                min-w-0
                divide-y
                divide-gray-100
              "
            >

              {products.map((product, index) => {

                const sold = Number(
                  product.sold || 0
                );

                const percentage =
                  totalSold > 0
                    ? (sold / totalSold) * 100
                    : 0;

                return (
                  <div
                    key={`${product.name}-${index}`}
                    className="
                      w-full
                      min-w-0
                      overflow-hidden
                      p-4
                      transition
                      hover:bg-gray-50
                      sm:p-5
                      lg:p-6
                      xl:p-7
                      2xl:p-8
                    "
                  >

                    {/* PRODUCT ROW */}

                    <div
                      className="
                        flex
                        min-w-0
                        items-start
                        gap-3
                        sm:gap-4
                      "
                    >

                      {/* RANK */}

                      <div
                        className={`
                          flex
                          h-9
                          w-9
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          text-xs
                          font-bold
                          sm:h-10
                          sm:w-10
                          sm:text-sm

                          ${
                            index === 0
                              ? "bg-yellow-100 text-yellow-700"
                              : index === 1
                                ? "bg-gray-200 text-gray-700"
                                : index === 2
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-blue-50 text-blue-600"
                          }
                        `}
                      >
                        #{index + 1}
                      </div>

                      {/* PRODUCT INFO */}

                      <div
                        className="
                          min-w-0
                          flex-1
                        "
                      >

                        <div
                          className="
                            flex
                            min-w-0
                            flex-col
                            gap-2
                            lg:flex-row
                            lg:items-center
                            lg:justify-between
                            lg:gap-4
                          "
                        >

                          <div
                            className="
                              min-w-0
                              flex-1
                            "
                          >

                            <h3
                              className="
                                truncate
                                font-semibold
                                text-gray-900
                                sm:text-base
                              "
                              title={
                                product.name ||
                                "Unknown Product"
                              }
                            >
                              {product.name ||
                                "Unknown Product"}
                            </h3>

                            <p
                              className="
                                mt-1
                                truncate
                                text-xs
                                text-gray-500
                              "
                            >
                              Product sales performance
                            </p>

                          </div>

                          <div
                            className="
                              min-w-0
                              shrink-0
                            "
                          >
                            <span
                              className="
                                inline-flex
                                max-w-full
                                rounded-full
                                bg-green-100
                                px-2.5
                                py-1
                                text-xs
                                font-semibold
                                text-green-700
                                sm:px-3
                              "
                            >
                              {sold.toLocaleString()} sold
                            </span>
                          </div>

                        </div>

                        {/* PROGRESS */}

                        <div
                          className="
                            mt-3
                            w-full
                            min-w-0
                            sm:mt-4
                          "
                        >

                          <div
                            className="
                              mb-2
                              flex
                              min-w-0
                              items-center
                              justify-between
                              gap-3
                              text-xs
                              text-gray-500
                            "
                          >
                            <span className="shrink-0">
                              Sales share
                            </span>

                            <span className="shrink-0 whitespace-nowrap">
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
                            "
                          >
                            <div
                              className="
                                h-full
                                max-w-full
                                rounded-full
                                bg-blue-500
                                transition-all
                                duration-700
                              "
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

                    </div>

                  </div>
                );
              })}

            </div>

          )}

        </div>

      </div>
    </div>
  );
}