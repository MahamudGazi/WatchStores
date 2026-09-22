import { Link } from "react-router-dom";

export default function CartSummary({ cart, coupon }) {
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

  // Coupon discount
  const discountAmount = coupon?.discount
    ? Math.min(
        subtotal * (Number(coupon.discount) / 100),
        subtotal
      )
    : 0;

  const total = subtotal - discountAmount;

  return (
    <div className="rounded-xl border p-6 shadow">
      <h2 className="mb-6 text-2xl font-bold">
        Order Summary
      </h2>

      <div className="mb-3 flex justify-between">
        <span>Subtotal</span>
        <span>৳ {subtotal.toFixed(2)}</span>
      </div>

      {coupon && discountAmount > 0 && (
        <div className="mb-3 flex justify-between text-green-600">
          <span>
            Discount ({coupon.discount}%)
          </span>
          <span>
            -৳ {discountAmount.toFixed(2)}
          </span>
        </div>
      )}

      <div className="mb-3 flex justify-between">
        <span>Shipping</span>
        <span>Free</span>
      </div>

      <hr className="my-4" />

      <div className="flex justify-between text-xl font-bold">
        <span>Total</span>
        <span>৳ {total.toFixed(2)}</span>
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