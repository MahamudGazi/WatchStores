import { useMemo, useState } from "react";
import {
  Activity,
  Search,
  Filter,
  User,
  Package,
  ShoppingCart,
  Settings,
  Trash2,
  LogIn,
  RefreshCw,
} from "lucide-react";

export default function Page() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [logs] = useState([
    {
      id: 1,
      action: "Created Product",
      description: "Added Rolex Submariner Date to products.",
      user: "Administrator",
      type: "Product",
      date: "Today, 10:42 AM",
    },
    {
      id: 2,
      action: "Updated Order",
      description: "Order #WS-10025 status changed to Delivered.",
      user: "Administrator",
      type: "Order",
      date: "Today, 09:35 AM",
    },
    {
      id: 3,
      action: "Customer Login",
      description: "Administrator logged into the dashboard.",
      user: "Administrator",
      type: "Authentication",
      date: "Today, 08:21 AM",
    },
    {
      id: 4,
      action: "Updated Settings",
      description: "Shipping settings were updated.",
      user: "Administrator",
      type: "Settings",
      date: "Yesterday, 06:15 PM",
    },
    {
      id: 5,
      action: "Deleted Product",
      description: "Product #24 was removed from the store.",
      user: "Administrator",
      type: "Product",
      date: "Yesterday, 04:30 PM",
    },
    {
      id: 6,
      action: "Updated Customer",
      description: "Customer account information was updated.",
      user: "Administrator",
      type: "Customer",
      date: "Yesterday, 02:10 PM",
    },
  ]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        log.action
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        log.description
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        log.user
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesFilter =
        filter === "All" || log.type === filter;

      return matchesSearch && matchesFilter;
    });
  }, [logs, search, filter]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Activity Logs
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Track administrator actions and system activity.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          icon={Activity}
          label="Total Activities"
          value={logs.length}
        />

        <SummaryCard
          icon={Package}
          label="Product Actions"
          value={
            logs.filter((log) => log.type === "Product").length
          }
        />

        <SummaryCard
          icon={ShoppingCart}
          label="Order Actions"
          value={
            logs.filter((log) => log.type === "Order").length
          }
        />

        <SummaryCard
          icon={Settings}
          label="Settings Actions"
          value={
            logs.filter((log) => log.type === "Settings").length
          }
        />
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search activity..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-black focus:bg-white focus:ring-2 focus:ring-black/10"
            />
          </div>

          {/* Filter */}
          <div className="relative lg:w-56">
            <Filter
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pl-11 text-sm outline-none transition focus:border-black focus:bg-white"
            >
              <option value="All">All Activities</option>
              <option value="Product">Products</option>
              <option value="Order">Orders</option>
              <option value="Customer">Customers</option>
              <option value="Settings">Settings</option>
              <option value="Authentication">
                Authentication
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-5">
          <h2 className="font-bold text-gray-900">
            Recent Activity
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            {filteredLogs.length} activity
            {filteredLogs.length !== 1 ? "ies" : "y"} found
          </p>
        </div>

        {filteredLogs.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filteredLogs.map((log) => {
              const Icon = getLogIcon(log.type);

              return (
                <div
                  key={log.id}
                  className="flex gap-4 px-6 py-5 transition hover:bg-gray-50"
                >
                  {/* Icon */}
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                    <Icon
                      size={19}
                      className="text-gray-700"
                    />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {log.action}
                      </h3>

                      <span className="text-xs text-gray-400">
                        {log.date}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-gray-500">
                      {log.description}
                    </p>

                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                      <User size={14} />
                      {log.user}

                      <span>•</span>

                      <span>{log.type}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center">
            <Activity
              size={40}
              className="mx-auto text-gray-300"
            />

            <h3 className="mt-4 font-semibold text-gray-900">
              No activity found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Try changing your search or filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* =====================================================
   SUMMARY CARD
===================================================== */

function SummaryCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
          <Icon size={20} className="text-gray-700" />
        </div>

        <div>
          <p className="text-xs text-gray-500">
            {label}
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-900">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   LOG ICON
===================================================== */

function getLogIcon(type) {
  switch (type) {
    case "Product":
      return Package;

    case "Order":
      return ShoppingCart;

    case "Customer":
      return User;

    case "Settings":
      return Settings;

    case "Authentication":
      return LogIn;

    default:
      return Activity;
  }
}

