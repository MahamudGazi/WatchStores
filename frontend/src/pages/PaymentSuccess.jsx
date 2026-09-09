import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api/axios";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  const orderNumber = searchParams.get("order");

  useEffect(() => {
    const checkPayment = async () => {
      if (!orderNumber) {
        setMessage("Order number was not found.");
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(
          `/orders/track/${orderNumber}/`
        );

        const data = response?.data || response;

        if (
          data?.payment?.status === "Success" ||
          data?.payment_status === "Success"
        ) {
          setSuccess(true);
          setMessage("Your payment was successful.");
        } else {
          setMessage(
            "Payment is being verified. Please check your order status."
          );
        }
      } catch (error) {
        console.error("Payment verification error:", error);

        setMessage(
          "Payment was received, but verification is still in progress."
        );
      } finally {
        setLoading(false);
      }
    };

    checkPayment();
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <h2 className="text-xl font-semibold">
            Verifying your payment...
          </h2>
          <p className="text-gray-500 mt-2">
            Please wait.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">

        <div className="text-6xl mb-4">
          {success ? "✅" : "⏳"}
        </div>

        <h1 className="text-2xl font-bold mb-3">
          {success
            ? "Payment Successful!"
            : "Payment Verification"}
        </h1>

        <p className="text-gray-600 mb-4">
          {message}
        </p>

        {orderNumber && (
          <p className="text-sm text-gray-500 mb-6">
            Order: <strong>{orderNumber}</strong>
          </p>
        )}

        <div className="flex gap-3 justify-center">
          <Link
            to="/my-orders"
            className="px-5 py-2 rounded-lg bg-black text-white hover:opacity-90"
          >
            My Orders
          </Link>

          <Link
            to="/"
            className="px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            Continue Shopping
          </Link>
        </div>

      </div>
    </div>
  );
}

