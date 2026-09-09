import { useEffect, useState } from "react";
import { getMyOrders } from "../api/order";
import { Link } from "react-router-dom";

export default function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrders();
    }, []);

    async function loadOrders() {
        try {
            const response = await getMyOrders();

            console.log("My Orders API:", response);

            setOrders(response.data || []);
        } catch (err) {
            console.error("Orders error:", err);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-lg font-semibold text-gray-600">
                    Loading orders...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">

            <div className="mx-auto max-w-7xl">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                        My Orders
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        View and manage all your orders.
                    </p>
                </div>

                {/* Empty Orders */}
                {orders.length === 0 ? (
                    <div className="rounded-2xl bg-white p-10 text-center shadow-sm">

                        <h2 className="text-xl font-semibold text-gray-800">
                            No Orders Found
                        </h2>

                        <p className="mt-2 text-gray-500">
                            You haven't placed any orders yet.
                        </p>

                        <Link
                            to="/products"
                            className="mt-6 inline-block rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-yellow-600"
                        >
                            Start Shopping
                        </Link>

                    </div>
                ) : (

                    <>
                        {/* ================= DESKTOP TABLE ================= */}
                        <div className="hidden overflow-hidden rounded-2xl bg-white shadow-sm md:block">

                            <div className="overflow-x-auto">

                                <table className="w-full min-w-[850px]">

                                    <thead>
                                        <tr className="border-b bg-gray-100 text-left text-sm text-gray-600">

                                            <th className="px-6 py-4 font-semibold">
                                                Order
                                            </th>

                                            <th className="px-6 py-4 font-semibold">
                                                Total
                                            </th>

                                            <th className="px-6 py-4 font-semibold">
                                                Payment
                                            </th>

                                            <th className="px-6 py-4 font-semibold">
                                                Status
                                            </th>

                                            <th className="px-6 py-4 font-semibold">
                                                Date
                                            </th>

                                            <th className="px-6 py-4 font-semibold">
                                                Action
                                            </th>

                                        </tr>
                                    </thead>

                                    <tbody>

                                        {orders.map((order) => (

                                            <tr
                                                key={order.id}
                                                className="border-b last:border-0 hover:bg-gray-50"
                                            >

                                                <td className="px-6 py-5">
                                                    <span className="font-semibold text-gray-900">
                                                        #{order.order_number}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-5 font-semibold">
                                                    ৳ {order.grand_total}
                                                </td>

                                                <td className="px-6 py-5 text-gray-600">
                                                    {order.payment_method}
                                                </td>

                                                <td className="px-6 py-5">

                                                    <span
                                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                                            order.status === "Confirmed"
                                                                ? "bg-green-100 text-green-700"
                                                                : order.status === "Cancelled"
                                                                ? "bg-red-100 text-red-700"
                                                                : "bg-yellow-100 text-yellow-700"
                                                        }`}
                                                    >
                                                        {order.status}
                                                    </span>

                                                </td>

                                                <td className="px-6 py-5 text-gray-600">
                                                    {new Date(
                                                        order.created_at
                                                    ).toLocaleDateString()}
                                                </td>

                                                <td className="px-6 py-5">

                                                    <Link
                                                        to={`/orders/${order.id}`}
                                                        className="inline-block rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-yellow-600"
                                                    >
                                                        View Details
                                                    </Link>

                                                </td>

                                            </tr>

                                        ))}

                                    </tbody>

                                </table>

                            </div>

                        </div>


                        {/* ================= MOBILE CARDS ================= */}
                        <div className="space-y-4 md:hidden">

                            {orders.map((order) => (

                                <div
                                    key={order.id}
                                    className="rounded-2xl bg-white p-5 shadow-sm"
                                >

                                    {/* Order Header */}
                                    <div className="flex items-start justify-between gap-4">

                                        <div>
                                            <p className="text-xs text-gray-500">
                                                Order
                                            </p>

                                            <h2 className="mt-1 break-all font-semibold text-gray-900">
                                                #{order.order_number}
                                            </h2>
                                        </div>

                                        <span
                                            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                                                order.status === "Confirmed"
                                                    ? "bg-green-100 text-green-700"
                                                    : order.status === "Cancelled"
                                                    ? "bg-red-100 text-red-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                            }`}
                                        >
                                            {order.status}
                                        </span>

                                    </div>


                                    {/* Order Information */}
                                    <div className="mt-5 grid grid-cols-2 gap-4 border-t border-gray-100 pt-5">

                                        <div>
                                            <p className="text-xs text-gray-500">
                                                Total
                                            </p>

                                            <p className="mt-1 font-semibold text-gray-900">
                                                ৳ {order.grand_total}
                                            </p>
                                        </div>


                                        <div>
                                            <p className="text-xs text-gray-500">
                                                Payment
                                            </p>

                                            <p className="mt-1 font-medium text-gray-800">
                                                {order.payment_method}
                                            </p>
                                        </div>


                                        <div>
                                            <p className="text-xs text-gray-500">
                                                Date
                                            </p>

                                            <p className="mt-1 text-sm text-gray-800">
                                                {new Date(
                                                    order.created_at
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>

                                    </div>


                                    {/* Button */}
                                    <Link
                                        to={`/orders/${order.id}`}
                                        className="mt-5 block w-full rounded-lg bg-black py-3 text-center text-sm font-semibold text-white transition hover:bg-yellow-600"
                                    >
                                        View Order Details
                                    </Link>

                                </div>

                            ))}

                        </div>

                    </>

                )}

            </div>

        </div>
    );
}
