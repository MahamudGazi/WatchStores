import { NavLink } from "react-router-dom";
import { useState } from "react";

import { clearTokens } from "../../utils/storage";
import useAuth from "../../hooks/useAuth";
import {
  LayoutDashboard,
  BarChart3,
  Boxes,
  Tags,
  Award,
  Star,
  Warehouse,
  ShoppingBag,
  RotateCcw,
  Wallet,
  Users,
  Heart,
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
  Ticket,
  Zap,
  Megaphone,
  Truck,
  MapPin,
  BadgeDollarSign,
  FileText,
  TrendingUp,
  Package,
  UserRound,
  ClipboardList,
  Bell,
  Store,
  Mail,
  ShieldCheck,
  UserCog,
  KeyRound,
  Activity,
  X,
  ChevronDown,
  LogOut,
  Settings,
} from "lucide-react";

// =====================================================
// SIDEBAR MENU
// =====================================================

const sections = [
  {
    title: "Overview",
    items: [
      {
        name: "Dashboard",
        path: "/admin/dashboard",
        icon: LayoutDashboard,
        color: "text-blue-400",
      },
      {
        name: "Analytics",
        path: "/admin/analytics",
        icon: BarChart3,
        color: "text-purple-400",
      },
    ],
  },

  {
    title: "Catalog",
    items: [
      {
        name: "Products",
        path: "/admin/products",
        icon: Boxes,
        color: "text-cyan-400",
      },
      {
        name: "Categories",
        path: "/admin/categories",
        icon: Tags,
        color: "text-pink-400",
      },
      {
        name: "Brands",
        path: "/admin/brands",
        icon: Award,
        color: "text-yellow-400",
      },
      {
        name: "Reviews",
        path: "/admin/reviews",
        icon: Star,
        color: "text-amber-400",
      },
      {
        name: "Inventory",
        path: "/admin/inventory",
        icon: Warehouse,
        color: "text-emerald-400",
      },
    ],
  },

  {
    title: "Orders",
    items: [
      {
        name: "All Orders",
        path: "/admin/orders",
        icon: ShoppingBag,
        color: "text-orange-400",
      },
      {
        name: "Returns",
        path: "/admin/returns",
        icon: RotateCcw,
        color: "text-blue-400",
        // badge: pendingReturnsCount,
      },
      {
        name: "Refunds",
        path: "/admin/refunds",
        icon: Wallet,
        color: "text-green-400",
      },
    ],
  },

  {
    title: "Customers",
    items: [
      {
        name: "All Customers",
        path: "/admin/customers",
        icon: Users,
        color: "text-violet-400",
      },
      {
        name: "Wishlist",
        path: "/admin/wishlist",
        icon: Heart,
        color: "text-red-400",
      },
    ],
  },

  {
    title: "Payments",
    items: [
      {
        name: "Transactions",
        path: "/admin/payments",
        icon: CreditCard,
        color: "text-indigo-400",
      },
      {
        name: "Successful",
        path: "/admin/payments/successful",
        icon: CheckCircle2,
        color: "text-green-400",
      },
      {
        name: "Pending",
        path: "/admin/payments/pending",
        icon: Clock,
        color: "text-yellow-400",
      },
      {
        name: "Failed",
        path: "/admin/payments/failed",
        icon: XCircle,
        color: "text-red-400",
      },
    ],
  },

  {
    title: "Marketing",
    items: [
      {
        name: "Coupons",
        path: "/admin/coupons",
        icon: Ticket,
        color: "text-pink-400",
      },
      {
        name: "Flash Sales",
        path: "/admin/flash-sales",
        icon: Zap,
        color: "text-yellow-400",
      },
      {
        name: "Promotions",
        path: "/admin/promotions",
        icon: Megaphone,
        color: "text-purple-400",
      },
    ],
  },

  {
    title: "Shipping",
    items: [
      {
        name: "Shipping Methods",
        path: "/admin/shipping/methods",
        icon: Truck,
        color: "text-blue-400",
      },
      {
        name: "Shipping Zones",
        path: "/admin/shipping/zones",
        icon: MapPin,
        color: "text-red-400",
      },
      {
        name: "Delivery Charges",
        path: "/admin/shipping/charges",
        icon: BadgeDollarSign,
        color: "text-green-400",
      },
    ],
  },

  {
    title: "Reports",
    items: [
      {
        name: "Sales Report",
        path: "/admin/reports/sales",
        icon: FileText,
        color: "text-blue-400",
      },
      {
        name: "Revenue Report",
        path: "/admin/reports/revenue",
        icon: TrendingUp,
        color: "text-green-400",
      },
      {
        name: "Product Report",
        path: "/admin/reports/products",
        icon: Package,
        color: "text-orange-400",
      },
      {
        name: "Customer Report",
        path: "/admin/reports/customers",
        icon: UserRound,
        color: "text-purple-400",
      },
      {
        name: "Inventory Report",
        path: "/admin/reports/inventory",
        icon: ClipboardList,
        color: "text-cyan-400",
      },
    ],
  },

  {
    title: "System",
    items: [
      {
        name: "Notifications",
        path: "/admin/notifications",
        icon: Bell,
        color: "text-yellow-400",
      },
      {
        name: "Store Settings",
        path: "/admin/settings/store",
        icon: Store,
        color: "text-blue-400",
      },
      {
        name: "Payment Settings",
        path: "/admin/settings/payment",
        icon: CreditCard,
        color: "text-green-400",
      },
      {
        name: "Shipping Settings",
        path: "/admin/settings/shipping",
        icon: Truck,
        color: "text-orange-400",
      },
      {
        name: "Email Settings",
        path: "/admin/settings/email",
        icon: Mail,
        color: "text-pink-400",
      },
      {
        name: "Notification Settings",
        path: "/admin/settings/notifications",
        icon: Bell,
        color: "text-purple-400",
      },
    ],
  },

  {
    title: "Administration",
    items: [
      {
        name: "Admin Users",
        path: "/admin/users",
        icon: UserCog,
        color: "text-blue-400",
      },
      {
        name: "Roles & Permissions",
        path: "/admin/roles",
        icon: KeyRound,
        color: "text-yellow-400",
      },
      {
        name: "Activity Logs",
        path: "/admin/activity-logs",
        icon: Activity,
        color: "text-emerald-400",
      },
    ],
  },
];

// =====================================================
// COMPONENT
// =====================================================

export default function AdminSidebar({
  isOpen,
  setIsOpen,
}) {
  const { user, logout } = useAuth();
  const [openSections, setOpenSections] = useState({
    Overview: true,
    Catalog: true,
    Orders: true,
    Customers: false,
    Payments: false,
    Marketing: false,
    Shipping: false,
    Reports: false,
    System: false,
    Administration: false,
  });
  const role = user?.role;
  // ===================================================
  // TOGGLE SECTION
  // ===================================================

  const toggleSection = (title) => {
    setOpenSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };


  const visibleSections = sections
    .map((section) => {
      if (section.title === "Administration") {
        if (role !== "SUPER_ADMIN") {
          return null;
        }
      }

      return section;
    })
    .filter(Boolean);



  // ===================================================
  // LOGOUT
  // ===================================================

  const handleLogout = () => {
  const confirmLogout = window.confirm(
    "Are you sure you want to logout?"
  );

  if (!confirmLogout) return;

  logout();

  window.location.href = "/login";
};

  return (
    <>
      {/* =================================================
          MOBILE OVERLAY
      ================================================= */}

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="
            fixed
            inset-0
            z-40
            bg-black/60
            backdrop-blur-sm
            lg:hidden
          "
        />
      )}

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside
        className={`
          fixed
          left-0
          top-0
          z-50

          flex
          h-dvh
          w-[280px]
          max-w-[88vw]
          flex-col

          border-r
          border-zinc-800

          bg-[#09090b]

          text-white

          shadow-2xl

          transition-transform
          duration-300
          ease-in-out

          lg:w-[280px]
          lg:translate-x-0

          ${isOpen
            ? "translate-x-0"
            : "-translate-x-full"
          }
        `}
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="
            relative
            flex
            h-[72px]
            shrink-0
            items-center
            justify-between

            border-b
            border-zinc-800

            bg-zinc-950

            px-5
          "
        >

          {/* Brand */}

          <div className="flex min-w-0 items-center gap-3">

            {/* Logo */}

            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center

                rounded-xl

                bg-gradient-to-br
                from-amber-300
                via-yellow-400
                to-orange-500

                text-black

                shadow-lg
              "
            >
              <span className="text-lg font-black">
                W
              </span>
            </div>

            {/* Name */}

            <div className="min-w-0">

              <h1
                className="
                  truncate
                  text-lg
                  font-bold
                  tracking-wide
                  text-white
                "
              >
                WatchStore
              </h1>

              <p
                className="
                  mt-0.5
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.22em]
                  text-amber-400
                "
              >
                Admin Panel
              </p>

            </div>

          </div>

          {/* Mobile Close */}

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="
              rounded-xl
              p-2

              text-zinc-500

              transition-all

              hover:bg-zinc-800
              hover:text-white

              active:scale-95

              lg:hidden
            "
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>

        </div>

        {/* =================================================
            NAVIGATION
        ================================================= */}

        <nav
          className="
            admin-sidebar-scrollbar

            flex-1
            overflow-y-auto
            overscroll-contain

            px-3
            py-4
          "
        >

          {visibleSections.map((section) => (

            <div
              key={section.title}
              className="mb-5"
            >

              {/* Section Header */}

              <button
                type="button"
                onClick={() =>
                  toggleSection(section.title)
                }
                className="
                  mb-1

                  flex
                  w-full
                  items-center
                  justify-between

                  rounded-lg

                  px-2
                  py-1.5

                  text-left

                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.18em]

                  text-zinc-500

                  transition

                  hover:text-zinc-200
                "
              >

                <span>
                  {section.title}
                </span>

                <ChevronDown
                  size={15}
                  strokeWidth={2}
                  className={`
                    transition-transform
                    duration-200

                    ${openSections[
                      section.title
                    ]
                      ? "rotate-180"
                      : ""
                    }
                  `}
                />

              </button>

              {/* Menu */}

              {openSections[section.title] && (

                <div className="space-y-1">

                  {section.items.map((item) => {

                    const Icon = item.icon;

                    return (
                      <NavLink
                        key={
                          item.path +
                          item.name
                        }
                        to={item.path}
                        end={
                          item.path ===
                          "/admin/dashboard"
                        }
                        onClick={() =>
                          setIsOpen(false)
                        }
                        className={({ isActive }) =>
                          `
                          group
                          relative

                          flex
                          min-h-[42px]
                          w-full
                          items-center
                          gap-3

                          overflow-hidden
                          rounded-xl

                          px-3

                          text-[13px]
                          font-medium

                          transition-all
                          duration-200

                          ${isActive
                            ? `
                                bg-zinc-800

                                text-white

                                shadow-md
                              `
                            : `
                                text-zinc-400

                                hover:bg-zinc-900
                                hover:text-white
                              `
                          }
                        `
                        }
                      >

                        {/* Active Indicator */}

                        <span
                          className="
                            absolute
                            left-0
                            top-1/2

                            h-6
                            w-[3px]

                            -translate-y-1/2

                            rounded-r-full

                            bg-amber-400

                            opacity-0

                            transition
                          "
                        />

                        {/* Icon */}

                        <Icon
                          size={17}
                          strokeWidth={1.9}
                          className={`
                            shrink-0

                            ${item.color}

                            transition-transform
                            duration-200

                            group-hover:scale-110
                          `}
                        />

                        {/* Name */}

                        <span
                          className="
                            min-w-0
                            flex-1
                            truncate
                          "
                        >
                          {item.name}
                        </span>

                        {/* Badge */}

                        {item.badge && (
                          <span
                            className="
                              flex
                              h-5
                              min-w-5
                              items-center
                              justify-center

                              rounded-full

                              bg-red-500

                              px-1.5

                              text-[10px]
                              font-bold

                              text-white

                              shadow-sm
                            "
                          >
                            {item.badge}
                          </span>
                        )}

                      </NavLink>
                    );
                  })}

                </div>
              )}

            </div>
          ))}

        </nav>

        {/* =================================================
            ADMIN PROFILE / FOOTER
        ================================================= */}

        <div
          className="
            shrink-0

            border-t
            border-zinc-800

            bg-zinc-950

            p-3
          "
        >

          {/* Admin Profile */}

          <div
            className="
              mb-2

              flex
              items-center
              gap-3

              rounded-xl

              bg-zinc-900

              px-3
              py-2.5
            "
          >

            {/* Avatar */}

            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center

                rounded-full

                bg-gradient-to-br
                from-blue-500
                to-purple-600

                text-xs
                font-bold
              "
            >
              AD
            </div>

            {/* Info */}

            <div className="min-w-0 flex-1">

              <p
  className="
    truncate
    text-xs
    font-semibold
    text-white
  "
>
  {user?.username || "Administrator"}
</p>

<p
  className="
    truncate
    text-[10px]
    text-zinc-500
  "
>
  {user?.role || "User"}
</p>

            </div>

            <ShieldCheck
              size={16}
              className="shrink-0 text-emerald-400"
            />

          </div>

          {/* Bottom Buttons */}

          <div className="grid grid-cols-2 gap-2">

            <NavLink
              to="/admin/settings/store"
              onClick={() => setIsOpen(false)}
              className="
                flex
                items-center
                justify-center
                gap-2

                rounded-lg

                bg-zinc-900

                px-2
                py-2

                text-[11px]
                font-medium
                text-zinc-400

                transition

                hover:bg-zinc-800
                hover:text-white
              "
            >
              <Settings size={14} />
              Settings
            </NavLink>

            <button
              type="button"
              onClick={handleLogout}
              className="
                flex
                items-center
                justify-center
                gap-2

                rounded-lg

                bg-zinc-900

                px-2
                py-2

                text-[11px]
                font-medium
                text-zinc-400

                transition

                hover:bg-red-500/10
                hover:text-red-400
              "
            >
              <LogOut size={14} />
              Logout
            </button>

          </div>

          {/* Copyright */}

          <div className="mt-3 text-center">

            <p
              className="
                text-[9px]
                text-zinc-600
              "
            >
              © {new Date().getFullYear()} WatchStore
            </p>

          </div>

        </div>

      </aside>

      {/* =================================================
          CUSTOM SCROLLBAR
      ================================================= */}

      <style>
        {`
          .admin-sidebar-scrollbar::-webkit-scrollbar {
            width: 4px;
          }

          .admin-sidebar-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }

          .admin-sidebar-scrollbar::-webkit-scrollbar-thumb {
            background: #27272a;
            border-radius: 999px;
          }

          .admin-sidebar-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #3f3f46;
          }

          .admin-sidebar-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #27272a transparent;
          }

          @media (max-width: 1023px) {
            .admin-sidebar-scrollbar {
              padding-bottom: 20px;
            }
          }
        `}
      </style>
    </>
  );
}