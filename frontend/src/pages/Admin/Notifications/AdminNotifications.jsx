import { useEffect, useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Package,
  UserPlus,
  AlertTriangle,
  RefreshCw,
  Loader2,
} from "lucide-react";
import api from "../../../api/axios";

export default function Page() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/dashboard/notifications/"
      );

      const data = response.data;

      setNotifications(
        Array.isArray(data)
          ? data
          : data.results || data.notifications || []
      );
    } catch (err) {
      console.error("Notifications API Error:", err);

      if (err.response?.status === 401) {
        setError("You are not authenticated.");
      } else if (err.response?.status === 403) {
        setError("You don't have permission to view notifications.");
      } else {
        setError("Failed to load notifications.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const getIcon = (notification) => {
    const type = String(
      notification.type ||
        notification.notification_type ||
        ""
    ).toLowerCase();

    if (type.includes("order")) {
      return <Package size={20} />;
    }

    if (type.includes("customer") || type.includes("user")) {
      return <UserPlus size={20} />;
    }

    if (type.includes("stock")) {
      return <AlertTriangle size={20} />;
    }

    return <Bell size={20} />;
  };

  const getTitle = (notification) =>
    notification.title ||
    notification.subject ||
    "Notification";

  const getMessage = (notification) =>
    notification.message ||
    notification.description ||
    "You have a new notification.";

  const getDate = (notification) => {
    const date =
      notification.created_at ||
      notification.timestamp ||
      notification.date;

    if (!date) return "";

    try {
      return new Date(date).toLocaleString();
    } catch {
      return "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white">
              <Bell size={21} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Notifications
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                System and order alerts
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={loadNotifications}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
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
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={20}
              className="mt-0.5 text-red-600"
            />

            <div>
              <h3 className="font-semibold text-red-800">
                Unable to load notifications
              </h3>

              <p className="mt-1 text-sm text-red-600">
                {error}
              </p>

              <button
                onClick={loadNotifications}
                className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
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
            Loading notifications...
          </p>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && notifications.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <Bell size={28} className="text-gray-400" />
          </div>

          <h2 className="mt-5 text-xl font-semibold text-gray-900">
            No notifications
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            You're all caught up. New system and order alerts
            will appear here.
          </p>
        </div>
      )}

      {/* Notifications */}
      {!loading && notifications.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-semibold text-gray-900">
                Recent Notifications
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                {notifications.length} notification
                {notifications.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <CheckCheck size={17} />
              <span className="hidden sm:inline">
                Notification Center
              </span>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {notifications.map((notification, index) => {
              const id =
                notification.id || notification.pk || index;

              const isRead =
                notification.is_read ??
                notification.read ??
                false;

              return (
                <div
                  key={id}
                  className={`flex gap-4 p-5 transition hover:bg-gray-50 sm:px-6 ${
                    !isRead ? "bg-gray-50/70" : "bg-white"
                  }`}
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      !isRead
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {getIcon(notification)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <h3 className="font-semibold text-gray-900">
                        {getTitle(notification)}
                      </h3>

                      {!isRead && (
                        <span className="w-fit rounded-full bg-black px-2.5 py-1 text-[11px] font-semibold text-white">
                          New
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-sm leading-6 text-gray-600">
                      {getMessage(notification)}
                    </p>

                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                      {getDate(notification)}

                      {isRead && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Check size={13} />
                            Read
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

