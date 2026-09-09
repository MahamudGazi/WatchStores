import { useEffect, useState } from "react";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Package,
  ShoppingBag,
  RefreshCw,
  Clock,
} from "lucide-react";

import { getDashboardNotifications } from "../../../api/admin";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    try {
      setLoading(true);
      setError("");

      const response = await getDashboardNotifications();

      console.log("NOTIFICATIONS RESPONSE:", response);

      // Supports different backend response formats
      const data =
        response?.data ||
        response?.results ||
        response ||
        [];

      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(
        "Notifications loading error:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Failed to load notifications."
      );
    } finally {
      setLoading(false);
    }
  }

  function getNotificationIcon(type) {
    switch (type) {
      case "order":
      case "new_order":
        return <ShoppingBag size={20} />;

      case "stock":
      case "low_stock":
        return <Package size={20} />;

      case "warning":
        return <AlertTriangle size={20} />;

      case "success":
        return <CheckCircle size={20} />;

      case "return":
      case "refund":
        return <RefreshCw size={20} />;

      default:
        return <Bell size={20} />;
    }
  }

  function getNotificationStyle(type) {
    switch (type) {
      case "order":
      case "new_order":
        return {
          icon: "bg-blue-100 text-blue-600",
          border: "border-blue-100",
        };

      case "stock":
      case "low_stock":
        return {
          icon: "bg-yellow-100 text-yellow-600",
          border: "border-yellow-100",
        };

      case "warning":
        return {
          icon: "bg-red-100 text-red-600",
          border: "border-red-100",
        };

      case "success":
        return {
          icon: "bg-green-100 text-green-600",
          border: "border-green-100",
        };

      case "return":
      case "refund":
        return {
          icon: "bg-purple-100 text-purple-600",
          border: "border-purple-100",
        };

      default:
        return {
          icon: "bg-gray-100 text-gray-600",
          border: "border-gray-100",
        };
    }
  }

  function formatDate(date) {
    if (!date) return "Just now";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleString();
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
      {/* ================= CONTENT ================= */}

      <div
        className="
          mx-auto
          w-full
          min-w-0
          max-w-full
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-sm
        "
      >
        {/* ================= CARD HEADER ================= */}

        <div
          className="
            flex
            w-full
            min-w-0
            flex-col
            gap-4
            border-b
            px-4
            py-4

            sm:px-5
            sm:py-5

            md:px-6

            lg:flex-row
            lg:items-center
            lg:justify-between
            lg:px-7

            xl:px-8
            xl:py-6

            2xl:px-9
          "
        >
          {/* TITLE */}

          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-3">
              {/* ICON */}

              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-black
                  p-2.5
                  text-white

                  sm:h-11
                  sm:w-11
                  sm:p-3
                "
              >
                <Bell size={20} />
              </div>

              {/* TEXT */}

              <div className="min-w-0">
                <h1
                  className="
                    truncate
                    text-base
                    font-bold
                    text-gray-900

                    sm:text-lg
                    md:text-xl

                    lg:text-xl
                    xl:text-2xl
                  "
                >
                  Recent Notifications
                </h1>

                <p
                  className="
                    mt-1
                    text-xs
                    text-gray-500

                    sm:text-sm
                  "
                >
                  {notifications.length} notification
                  {notifications.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          {/* LATEST UPDATES */}

          <div
            className="
              flex
              shrink-0
              items-center
              gap-2
              text-xs
              text-gray-500

              sm:text-sm
            "
          >
            <Clock size={16} />
            <span className="whitespace-nowrap">
              Latest updates
            </span>
          </div>
        </div>

        {/* ================= LOADING ================= */}

        {loading && (
          <div
            className="
              w-full
              min-w-0
              space-y-3
              p-4

              sm:space-y-4
              sm:p-5

              md:p-6

              lg:p-7

              xl:p-8
            "
          >
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="
                  w-full
                  min-w-0
                  animate-pulse
                  rounded-xl
                  border
                  border-gray-100
                  p-4

                  sm:p-5
                "
              >
                <div className="flex min-w-0 gap-3 sm:gap-4">
                  <div
                    className="
                      h-10
                      w-10
                      shrink-0
                      rounded-xl
                      bg-gray-200

                      sm:h-11
                      sm:w-11
                    "
                  />

                  <div className="min-w-0 flex-1">
                    <div
                      className="
                        mb-2
                        h-4
                        w-1/2
                        max-w-[260px]
                        rounded
                        bg-gray-200
                      "
                    />

                    <div
                      className="
                        h-3
                        w-3/4
                        max-w-[500px]
                        rounded
                        bg-gray-200
                      "
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================= ERROR ================= */}

        {!loading && error && (
          <div
            className="
              w-full
              min-w-0
              p-4

              sm:p-5

              md:p-6

              lg:p-7

              xl:p-8
            "
          >
            <div
              className="
                w-full
                rounded-xl
                border
                border-red-200
                bg-red-50
                p-5
                text-center

                sm:p-6
              "
            >
              <AlertTriangle
                className="mx-auto mb-3 text-red-500"
                size={28}
              />

              <p className="break-words font-semibold text-red-700">
                {error}
              </p>

              <button
                onClick={loadNotifications}
                className="
                  mt-4
                  rounded-lg
                  bg-red-600
                  px-4
                  py-2
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-red-700
                "
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* ================= EMPTY ================= */}

        {!loading &&
          !error &&
          notifications.length === 0 && (
            <div
              className="
                w-full
                p-8
                text-center

                sm:p-10

                md:p-12

                lg:p-14

                xl:p-16
              "
            >
              <div
                className="
                  mx-auto
                  mb-4
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-full
                  bg-gray-100
                "
              >
                <Bell
                  size={28}
                  className="text-gray-400"
                />
              </div>

              <h3 className="text-lg font-semibold text-gray-900">
                No notifications
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                You're all caught up.
              </p>
            </div>
          )}

        {/* ================= NOTIFICATIONS ================= */}

        {!loading &&
          !error &&
          notifications.length > 0 && (
            <div
              className="
                w-full
                min-w-0
                divide-y
                divide-gray-100
              "
            >
              {notifications.map(
                (notification, index) => {
                  const type =
                    notification.type ||
                    notification.notification_type ||
                    "default";

                  const style =
                    getNotificationStyle(type);

                  return (
                    <div
                      key={
                        notification.id ||
                        notification.pk ||
                        index
                      }
                      className="
                        w-full
                        min-w-0
                        p-4
                        transition
                        hover:bg-gray-50

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
                          items-start
                          gap-3

                          sm:gap-4

                          lg:gap-5
                        "
                      >
                        {/* ================= ICON ================= */}

                        <div
                          className={`
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl

                            sm:h-11
                            sm:w-11

                            lg:h-12
                            lg:w-12

                            ${style.icon}
                          `}
                        >
                          {getNotificationIcon(type)}
                        </div>

                        {/* ================= CONTENT ================= */}

                        <div
                          className="
                            min-w-0
                            flex-1
                            overflow-hidden
                          "
                        >
                          {/* TITLE + DATE */}

                          <div
                            className="
                              flex
                              min-w-0
                              flex-col
                              gap-1

                              md:flex-row
                              md:items-start
                              md:justify-between
                              md:gap-4
                            "
                          >
                            <h3
                              className="
                                min-w-0
                                break-words
                                text-sm
                                font-semibold
                                text-gray-900

                                sm:text-base

                                lg:text-base

                                xl:text-lg
                              "
                            >
                              {notification.title ||
                                notification.subject ||
                                "Notification"}
                            </h3>

                            <span
                              className="
                                shrink-0
                                whitespace-nowrap
                                text-xs
                                text-gray-400

                                lg:text-sm
                              "
                            >
                              {formatDate(
                                notification.created_at ||
                                  notification.created ||
                                  notification.timestamp
                              )}
                            </span>
                          </div>

                          {/* MESSAGE */}

                          <p
                            className="
                              mt-1
                              max-w-full
                              break-words
                              text-sm
                              leading-6
                              text-gray-600

                              lg:pr-4
                            "
                          >
                            {notification.message ||
                              notification.description ||
                              notification.text ||
                              "No additional information."}
                          </p>

                          {/* OPTIONAL ORDER NUMBER */}

                          {(notification.order_number ||
                            notification.order_id) && (
                            <div className="mt-3">
                              <span
                                className="
                                  inline-flex
                                  max-w-full
                                  break-all
                                  rounded-full
                                  bg-gray-100
                                  px-3
                                  py-1
                                  text-xs
                                  font-medium
                                  text-gray-600
                                "
                              >
                                Order #
                                {notification.order_number ||
                                  notification.order_id}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
      </div>
    </div>
  );
}