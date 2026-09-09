import { useEffect, useState } from "react";
import { getMyOrders } from "../api/order";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        setError("");

        const response = await getMyOrders();

        console.log("My Orders:", response);

        // তোমার API response অনুযায়ী
        setOrders(
          response?.data ||
          response?.results ||
          (Array.isArray(response) ? response : [])
        );

      } catch (err) {
        console.error("Failed to load orders:", err);

        setError(
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load orders."
        );
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold">
          My Orders
        </h1>

        <p className="mt-4 text-gray-500">
          Loading orders...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold">
          My Orders
        </h1>

        <div className="mt-6 rounded-lg bg-red-50 p-4 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">

      <h1 className="mb-8 text-3xl font-bold">
        My Orders
      </h1>

      {orders.length === 0 ? (
        <div className="rounded-xl bg-gray-50 p-10 text-center">
          <h2 className="text-xl font-semibold">
            No Orders Found
          </h2>

          <p className="mt-2 text-gray-500">
            You haven't placed any orders yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">

          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-xl border bg-white p-5 shadow-sm"
            >

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <p className="text-sm text-gray-500">
                    Order
                  </p>

                  <h2 className="text-lg font-bold">
                    #{order.order_number || order.id}
                  </h2>
                </div>

                <span className="w-fit rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold">
                  {order.status}
                </span>

              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">

                <div>
                  <p className="text-sm text-gray-500">
                    Total
                  </p>

                  <p className="font-semibold">
                    ৳{order.grand_total}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Payment
                  </p>

                  <p className="font-semibold">
                    {order.payment_method || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Date
                  </p>

                  <p className="font-semibold">
                    {order.created_at
                      ? new Date(
                          order.created_at
                        ).toLocaleDateString()
                      : "-"
                    }
                  </p>
                </div>

              </div>

              <div className="mt-5">
                <button
                  onClick={() => {
                    window.location.href =
                      `/orders/${order.id}`;
                  }}
                  className="rounded-lg bg-black px-5 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
                >
                  View Details
                </button>
              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}