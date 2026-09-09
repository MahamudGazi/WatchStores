import { Link, useSearchParams } from "react-router-dom";

export default function PaymentCancelled() {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get("order");

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">

        <div className="text-6xl mb-4">⚠️</div>

        <h1 className="text-2xl font-bold mb-3">
          Payment Cancelled
        </h1>

        <p className="text-gray-600 mb-4">
          You cancelled the payment process.
          Your order has been cancelled.
        </p>

        {orderNumber && (
          <p className="text-sm text-gray-500 mb-6">
            Order: <strong>{orderNumber}</strong>
          </p>
        )}

        <div className="flex gap-3 justify-center">
          <Link
            to="/checkout"
            className="px-5 py-2 rounded-lg bg-black text-white hover:opacity-90"
          >
            Try Again
          </Link>

          <Link
            to="/my-orders"
            className="px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            My Orders
          </Link>
        </div>

      </div>
    </div>
  );
}

