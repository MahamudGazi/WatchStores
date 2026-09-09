import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function OrderSuccess() {
  return (
    <div className="container mx-auto flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-xl rounded-xl bg-white p-10 text-center shadow-lg">

        <CheckCircle
          size={90}
          className="mx-auto text-green-500"
        />

        <h1 className="mt-6 text-4xl font-bold">
          Order Successful
        </h1>

        <p className="mt-4 text-gray-500">
          Thank you for your purchase.
          Your order has been placed successfully.
        </p>

        <Link
          to="/"
          className="mt-8 inline-block rounded-lg bg-yellow-500 px-8 py-3 font-bold text-white hover:bg-yellow-600"
        >
          Continue Shopping
        </Link>

      </div>
    </div>
  );
}