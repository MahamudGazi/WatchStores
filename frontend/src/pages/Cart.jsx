import { useEffect, useState } from "react";

import { getCart } from "../api/cart";
import { Link } from "react-router-dom";
import Loading from "../components/common/Loading";
import CartItem from "../components/cart/CartItem";
import CartSummary from "../components/cart/CartSummary";

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadCart() {
    try {
      setLoading(true);

      const data = await getCart();
      setCart(data);
    } catch (err) {
      console.error("Failed to load cart:", err);
      setCart(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCart();
  }, []);

  if (loading) {
    return <Loading />;
  }

  const cartItems = cart?.results || [];

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] bg-gray-50 px-4 py-16 sm:py-20">
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-center text-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 text-5xl">
            🛒
          </div>

          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Your Cart is Empty
          </h1>

          <p className="mt-3 max-w-md text-sm leading-6 text-gray-500 sm:text-base">
            Looks like you haven't added anything to your cart yet.
            Start shopping and add your favorite products.
          </p>

          <Link
            to="/products"
            className="
              mt-7
              inline-flex
              items-center
              justify-center
              rounded-xl
              bg-black
              px-6
              py-3
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-gray-800
              focus:outline-none
              focus:ring-2
              focus:ring-black
              focus:ring-offset-2
            "
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">

        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
                Shopping Cart
              </h1>

              <p className="mt-2 text-sm text-gray-500 sm:text-base">
                Review your items before completing your purchase.
              </p>
            </div>

            <div className="text-sm text-gray-500">
              {cartItems.length}{" "}
              {cartItems.length === 1 ? "item" : "items"}
            </div>
          </div>
        </div>

        {/* Cart Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">

          {/* Cart Items */}
          <section className="min-w-0 lg:col-span-2">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

              {/* Section Header */}
              <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
                <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
                  Cart Items
                </h2>
              </div>

              {/* Items */}
              <div className="divide-y divide-gray-100">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="
                      p-4
                      transition
                      hover:bg-gray-50
                      sm:p-6
                    "
                  >
                    <CartItem
                      item={item}
                      reloadCart={loadCart}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Continue Shopping */}
            <div className="mt-5">
              <a
                href="/products"
                className="
                  inline-flex
                  items-center
                  gap-2
                  text-sm
                  font-semibold
                  text-gray-700
                  transition
                  hover:text-black
                "
              >
                ← Continue Shopping
              </a>
            </div>
          </section>

          {/* Summary */}
          <aside className="min-w-0 lg:col-span-1">
            <div className="lg:sticky lg:top-6">
              <CartSummary cart={cart} />
            </div>
          </aside>

        </div>
      </div>
    </main>
  );
}

