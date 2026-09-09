import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import {
  FiSearch,
  FiHeart,
  FiShoppingCart,
  FiUser,
  FiMenu,
  FiX,
} from "react-icons/fi";

import { getCart } from "../../api/cart";

export default function Navbar() {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState("");
  const [cartCount, setCartCount] = useState(0);

  // ==============================
  // Load Cart Count
  // ==============================

  async function loadCartCount() {
    try {
      const response = await getCart();

      const data = response?.data ?? response;

      const items = Array.isArray(data)
        ? data
        : data?.items || data?.results || [];

      const count = items.reduce((total, item) => {
        return total + Number(item.quantity || 0);
      }, 0);

      setCartCount(count);
    } catch (error) {
      console.error("Cart count error:", error);
      setCartCount(0);
    }
  }

  // ==============================
  // Initial Cart Load
  // ==============================

  useEffect(() => {
    loadCartCount();
  }, []);

  // ==============================
  // Listen Cart Update
  // ==============================

  useEffect(() => {
    function handleCartUpdate() {
      loadCartCount();
    }

    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, []);

  // ==============================
  // Search
  // ==============================

  function handleSearch(e) {
    e.preventDefault();

    const keyword = search.trim();

    if (!keyword) {
      return;
    }

    setShowSearch(false);

    navigate(
      `/products?search=${encodeURIComponent(keyword)}`
    );
  }

  // ==============================
  // Navigation
  // ==============================

  const navLinkClass = ({ isActive }) =>
    `transition ${
      isActive
        ? "font-semibold text-yellow-600"
        : "text-gray-700 hover:text-yellow-600"
    }`;

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4">
        {/* ==============================
            NAVBAR
        ============================== */}

        <div className="flex h-16 items-center justify-between">
          {/* Logo */}

          <Link
            to="/"
            onClick={closeMenu}
            className="text-xl font-bold text-yellow-600 sm:text-2xl"
          >
            WatchStore
          </Link>

          {/* ==============================
              DESKTOP MENU
          ============================== */}

          <nav className="hidden items-center gap-6 lg:flex xl:gap-8">
            <NavLink
              to="/"
              className={navLinkClass}
            >
              Home
            </NavLink>

            <NavLink
              to="/products"
              className={navLinkClass}
            >
              Products
            </NavLink>

            <NavLink
              to="/wishlist"
              className={navLinkClass}
            >
              Wishlist
            </NavLink>

            <NavLink
              to="/profile"
              className={navLinkClass}
            >
              Profile
            </NavLink>

            <NavLink
              to="/my-orders"
              className={navLinkClass}
            >
              My Orders
            </NavLink>
          </nav>

          {/* ==============================
              RIGHT SIDE
          ============================== */}

          <div className="flex items-center gap-3 sm:gap-4">
            {/* ==============================
                SEARCH
            ============================== */}

            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setShowSearch((prev) => !prev)
                }
                className="text-gray-700 transition hover:text-yellow-600"
                aria-label="Search"
              >
                {showSearch ? (
                  <FiX size={22} />
                ) : (
                  <FiSearch size={21} />
                )}
              </button>

              {showSearch && (
                <div
                  className="
                    absolute
                    right-0
                    top-10
                    z-50
                    w-[280px]
                    max-w-[calc(100vw-2rem)]
                    rounded-lg
                    border
                    border-gray-200
                    bg-white
                    p-3
                    shadow-xl
                  "
                >
                  <form onSubmit={handleSearch}>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={search}
                        onChange={(e) =>
                          setSearch(e.target.value)
                        }
                        placeholder="Search products..."
                        autoFocus
                        className="
                          min-w-0
                          flex-1
                          rounded-md
                          border
                          border-gray-300
                          px-3
                          py-2
                          text-sm
                          outline-none
                          focus:border-yellow-500
                        "
                      />

                      <button
                        type="submit"
                        className="
                          shrink-0
                          rounded-md
                          bg-yellow-500
                          px-3
                          text-white
                          transition
                          hover:bg-yellow-600
                        "
                      >
                        <FiSearch size={18} />
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* ==============================
                WISHLIST
            ============================== */}

            <Link
              to="/wishlist"
              className="text-gray-700 transition hover:text-yellow-600"
              aria-label="Wishlist"
            >
              <FiHeart size={21} />
            </Link>

            {/* ==============================
                CART
            ============================== */}

            <Link
              to="/cart"
              className="
                relative
                text-gray-700
                transition
                hover:text-yellow-600
              "
              aria-label="Shopping Cart"
            >
              <FiShoppingCart size={21} />

              {cartCount > 0 && (
                <span
                  className="
                    absolute
                    -right-2.5
                    -top-2
                    flex
                    h-5
                    min-w-5
                    items-center
                    justify-center
                    rounded-full
                    bg-red-500
                    px-1
                    text-[10px]
                    font-semibold
                    text-white
                  "
                >
                  {cartCount}
                </span>
              )}
            </Link>

            {/* ==============================
                PROFILE
            ============================== */}

            <Link
              to="/profile"
              className="text-gray-700 transition hover:text-yellow-600"
              aria-label="Profile"
            >
              <FiUser size={21} />
            </Link>

            {/* ==============================
                MOBILE MENU
            ============================== */}

            <button
              type="button"
              onClick={() =>
                setMenuOpen((prev) => !prev)
              }
              className="
                text-gray-700
                transition
                hover:text-yellow-600
                lg:hidden
              "
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <FiX size={25} />
              ) : (
                <FiMenu size={25} />
              )}
            </button>
          </div>
        </div>

        {/* ==============================
            MOBILE MENU
        ============================== */}

        {menuOpen && (
          <div className="border-t border-gray-100 py-4 lg:hidden">
            <nav className="flex flex-col gap-1">
              <NavLink
                to="/"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `rounded-lg px-4 py-3 ${
                    isActive
                      ? "bg-yellow-50 font-semibold text-yellow-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`
                }
              >
                Home
              </NavLink>

              <NavLink
                to="/products"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `rounded-lg px-4 py-3 ${
                    isActive
                      ? "bg-yellow-50 font-semibold text-yellow-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`
                }
              >
                Products
              </NavLink>

              <NavLink
                to="/wishlist"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `rounded-lg px-4 py-3 ${
                    isActive
                      ? "bg-yellow-50 font-semibold text-yellow-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`
                }
              >
                Wishlist
              </NavLink>

              <NavLink
                to="/profile"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `rounded-lg px-4 py-3 ${
                    isActive
                      ? "bg-yellow-50 font-semibold text-yellow-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`
                }
              >
                Profile
              </NavLink>

              <NavLink
                to="/my-orders"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `rounded-lg px-4 py-3 ${
                    isActive
                      ? "bg-yellow-50 font-semibold text-yellow-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`
                }
              >
                My Orders
              </NavLink>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}