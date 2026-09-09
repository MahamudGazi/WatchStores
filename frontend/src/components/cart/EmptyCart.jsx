import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

export default function EmptyCart() {
  return (
    <div className="container mx-auto flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">

      <div className="mb-8 rounded-full bg-yellow-100 p-8">

        <ShoppingCart
          size={80}
          className="text-yellow-500"
        />

      </div>

      <h1 className="mb-4 text-4xl font-bold">
        Your Cart is Empty
      </h1>

      <p className="mb-8 max-w-md text-gray-500">
        Looks like you haven't added any products yet.
        Browse our collection and find your favorite watch.
      </p>

      <Link
        to="/products"
        className="rounded-lg bg-yellow-500 px-8 py-4 font-bold text-white transition hover:bg-yellow-600"
      >
        Continue Shopping
      </Link>

    </div>
  );
}