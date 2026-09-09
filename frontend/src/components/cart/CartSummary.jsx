import { Link } from "react-router-dom";

export default function CartSummary({ cart }) {
  if (!cart || !cart.results) {
    return (
      <div className="rounded-xl border p-6 shadow">
        Loading...
      </div>
    );
  }

  const subtotal = cart.results.reduce(
    (sum, item) => sum + Number(item.subtotal),
    0
  );

  return (
    <div className="rounded-xl border p-6 shadow">
      <h2 className="mb-6 text-2xl font-bold">
        Order Summary
      </h2>

      <div className="mb-3 flex justify-between">
        <span>Subtotal</span>
        <span>৳ {subtotal}</span>
      </div>

      <div className="mb-3 flex justify-between">
        <span>Shipping</span>
        <span>Free</span>
      </div>

      <hr className="my-4" />

      <div className="flex justify-between text-xl font-bold">
        <span>Total</span>
        <span>৳ {subtotal}</span>
      </div>

      <Link
        to="/checkout"
        className="mt-6 block w-full rounded bg-yellow-500 py-3 text-center font-bold text-white"
      >
        Proceed To Checkout
      </Link>
    </div>
  );
}