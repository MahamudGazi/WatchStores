import { deleteCartItem, updateCart } from "../../api/cart";
import { Trash2, Plus, Minus } from "lucide-react";

export default function CartItem({ item, reloadCart }) {

  async function increaseQuantity() {
    try {
      await updateCart(item.id, item.quantity + 1);
      reloadCart();
    } catch (err) {
      console.error(err);
    }
  }

  async function decreaseQuantity() {
    if (item.quantity <= 1) return;

    try {
      await updateCart(item.id, item.quantity - 1);
      reloadCart();
    } catch (err) {
      console.error(err);
    }
  }

  async function removeItem() {
    try {
      await deleteCartItem(item.id);
      reloadCart();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="flex flex-col gap-6 rounded-xl border bg-white p-6 shadow-sm transition hover:shadow-md md:flex-row">

      <div className="h-40 w-40 flex-shrink-0 overflow-hidden rounded-lg border">
        <img
          src={item.product_thumbnail}
          alt={item.product_name}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col justify-between">

        <div>
          <h2 className="text-2xl font-bold">
            {item.product_name}
          </h2>

          <p className="mt-2 text-gray-500">
            Luxury Watch
          </p>

          <p className="mt-4 text-2xl font-bold text-yellow-600">
            ৳ {item.product_price}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">

          <div className="flex items-center rounded-lg border">

            <button
              onClick={decreaseQuantity}
              className="p-3 hover:bg-gray-100"
            >
              <Minus size={18} />
            </button>

            <span className="w-12 text-center font-bold">
              {item.quantity}
            </span>

            <button
              onClick={increaseQuantity}
              className="p-3 hover:bg-gray-100"
            >
              <Plus size={18} />
            </button>

          </div>

          <div>
            <p className="text-gray-500">
              Subtotal
            </p>

            <h3 className="text-xl font-bold text-green-600">
              ৳ {item.subtotal}
            </h3>
          </div>

          <button
            onClick={removeItem}
            className="flex items-center gap-2 rounded-lg border border-red-500 px-4 py-2 text-red-500 transition hover:bg-red-500 hover:text-white"
          >
            <Trash2 size={18} />
            Remove
          </button>

        </div>

      </div>

    </div>
  );
}