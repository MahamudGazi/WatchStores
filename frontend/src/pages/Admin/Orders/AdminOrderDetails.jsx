import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    getAdminOrderDetail,
    updateOrderStatus,
} from "../../../api/admin";

export default function AdminOrderDetails() {
    const { id } = useParams();

    const [order, setOrder] = useState(null);
    const [status, setStatus] = useState("");
    const [remarks, setRemarks] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        loadOrder();
    }, [id]);

    async function loadOrder() {
        try {
            setLoading(true);
            setError("");

            const data = await getAdminOrderDetail(id);

            setOrder(data);
            setStatus(data.status);
        } catch (err) {
            console.error("Order details error:", err);

            setError(
                err.response?.data?.detail ||
                err.response?.data?.error ||
                "Failed to load order."
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleStatusUpdate() {
        if (status === order.status) return;

        try {
            setSaving(true);

            await updateOrderStatus(id, {
                status,
                remarks,
            });

            setRemarks("");
            await loadOrder();
        } catch (err) {
            console.error("Status update error:", err);

            alert(
                err.response?.data?.error ||
                err.response?.data?.detail ||
                "Failed to update order status."
            );

            setStatus(order.status);
        } finally {
            setSaving(false);
        }
    }

    const statusColor = {
        Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
        Processing: "bg-indigo-100 text-indigo-700 border-indigo-200",
        Shipped: "bg-purple-100 text-purple-700 border-purple-200",
        Delivered: "bg-green-100 text-green-700 border-green-200",
        Cancelled: "bg-red-100 text-red-700 border-red-200",
        OutForDelivery: "bg-red-100 text-red-700 border-red-200",
        Comfirmed: "bg-red-100 text-red-700 border-red-200",
    };



    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleString("en-BD", {
            dateStyle: "medium",
            timeStyle: "short",
        });
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4" />

                    <p className="text-gray-500 text-sm sm:text-base">
                        Loading order...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 sm:p-5">
                    <p className="font-semibold mb-1">
                        Unable to load order
                    </p>

                    <p className="text-sm break-words">
                        {error}
                    </p>

                    <button
                        onClick={loadOrder}
                        className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!order) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">

                {/* ================= HEADER ================= */}

                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col gap-4">

                        <div>
                            <Link
                                to="/admin/orders"
                                className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-lg hover:bg-gray-700 transition text-sm font-medium"
                            >
                                ← Back to Orders
                            </Link>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                            <div className="min-w-0">
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                                    Order Details
                                </h1>

                                <p className="text-gray-500 mt-1 text-sm sm:text-base break-all">
                                    #{order.order_number}
                                </p>
                            </div>

                            <span
                                className={`self-start px-4 py-2 rounded-full border text-sm font-semibold whitespace-nowrap ${statusColor[order.status] ||
                                    "bg-gray-100 text-gray-700 border-gray-200"
                                    }`}
                            >
                                {order.status}
                            </span>

                        </div>
                    </div>
                </div>


                {/* ================= CUSTOMER + PAYMENT ================= */}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 mb-6">

                    {/* Customer */}

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-5">
                            Customer
                        </h2>

                        <div className="space-y-4">

                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">
                                    Username
                                </p>

                                <p className="font-medium text-gray-900 mt-1 break-words">
                                    {order.customer?.username || "-"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">
                                    Email
                                </p>

                                <p className="font-medium text-gray-900 mt-1 break-all">
                                    {order.customer?.email || "-"}
                                </p>
                            </div>

                        </div>
                    </div>


                    {/* Payment */}

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-5">
                            Payment
                        </h2>

                        <div className="space-y-4">

                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">
                                    Payment Method
                                </p>

                                <p className="font-medium text-gray-900 mt-1">
                                    {order.payment_method || "-"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">
                                    Order Date
                                </p>

                                <p className="font-medium text-gray-900 mt-1">
                                    {formatDate(order.created_at)}
                                </p>
                            </div>

                        </div>
                    </div>

                </div>


                {/* ================= SHIPPING ================= */}

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 mb-6">

                    <h2 className="text-lg font-bold text-gray-900 mb-5">
                        Shipping Address
                    </h2>

                    {order.shipping_address ? (

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">

                            <div>
                                <p className="text-gray-500">
                                    Name
                                </p>

                                <p className="font-medium mt-1 break-words">
                                    {order.shipping_address.full_name || "-"}
                                </p>
                            </div>

                            <div>
                                <p className="text-gray-500">
                                    Phone
                                </p>

                                <p className="font-medium mt-1">
                                    {order.shipping_address.phone || "-"}
                                </p>
                            </div>

                            <div className="sm:col-span-2">
                                <p className="text-gray-500">
                                    Address
                                </p>

                                <p className="font-medium mt-1 break-words">
                                    {order.shipping_address.address_line || "-"}
                                </p>
                            </div>

                            <div>
                                <p className="text-gray-500">
                                    City
                                </p>

                                <p className="font-medium mt-1">
                                    {order.shipping_address.city || "-"}
                                </p>
                            </div>

                            <div>
                                <p className="text-gray-500">
                                    District
                                </p>

                                <p className="font-medium mt-1">
                                    {order.shipping_address.district || "-"}
                                </p>
                            </div>

                            <div>
                                <p className="text-gray-500">
                                    Postal Code
                                </p>

                                <p className="font-medium mt-1">
                                    {order.shipping_address.postal_code || "-"}
                                </p>
                            </div>

                            <div>
                                <p className="text-gray-500">
                                    Country
                                </p>

                                <p className="font-medium mt-1">
                                    {order.shipping_address.country || "-"}
                                </p>
                            </div>

                        </div>

                    ) : (

                        <p className="text-gray-500 text-sm">
                            No shipping address available.
                        </p>

                    )}

                </div>


                {/* ================= ORDER ITEMS ================= */}

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">

                    <div className="p-5 sm:p-6 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900">
                            Order Items
                        </h2>
                    </div>


                    {/* Mobile horizontal scroll */}

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[650px]">

                            <thead className="bg-gray-50">

                                <tr>
                                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">
                                        Product
                                    </th>

                                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">
                                        Price
                                    </th>

                                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">
                                        Quantity
                                    </th>

                                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">
                                        Subtotal
                                    </th>
                                </tr>

                            </thead>


                            <tbody>

                                {order.items?.length > 0 ? (

                                    order.items.map((item) => (

                                        <tr
                                            key={item.id}
                                            className="border-t border-gray-100 hover:bg-gray-50 transition"
                                        >

                                            <td className="p-4">
                                                <span className="font-medium text-gray-900">
                                                    {item.product_name || "-"}
                                                </span>
                                            </td>

                                            <td className="p-4 whitespace-nowrap">
                                                ৳ {item.price}
                                            </td>

                                            <td className="p-4">
                                                {item.quantity}
                                            </td>

                                            <td className="p-4 font-semibold whitespace-nowrap">
                                                ৳ {item.subtotal}
                                            </td>

                                        </tr>

                                    ))

                                ) : (

                                    <tr>
                                        <td
                                            colSpan="4"
                                            className="p-8 text-center text-gray-500"
                                        >
                                            No items found.
                                        </td>
                                    </tr>

                                )}

                            </tbody>

                        </table>

                    </div>


                    {/* ================= TOTALS ================= */}

                    <div className="border-t border-gray-100 p-5 sm:p-6">

                        <div className="w-full sm:w-96 ml-auto space-y-3">

                            <div className="flex justify-between gap-4 text-sm sm:text-base">
                                <span className="text-gray-600">
                                    Subtotal
                                </span>

                                <span className="font-medium whitespace-nowrap">
                                    ৳ {order.total_price}
                                </span>
                            </div>

                            <div className="flex justify-between gap-4 text-sm sm:text-base">
                                <span className="text-gray-600">
                                    Delivery
                                </span>

                                <span className="font-medium whitespace-nowrap">
                                    ৳ {order.delivery_charge}
                                </span>
                            </div>

                            <div className="border-t border-gray-200 pt-3 flex justify-between gap-4 text-base sm:text-lg font-bold">
                                <span>
                                    Grand Total
                                </span>

                                <span className="whitespace-nowrap">
                                    ৳ {order.grand_total}
                                </span>
                            </div>

                        </div>

                    </div>

                </div>


                {/* ================= UPDATE STATUS ================= */}

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 mb-6">

                    <h2 className="text-lg font-bold text-gray-900 mb-5">
                        Update Order Status
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Order Status
                            </label>

                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                disabled={saving}
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100"
                            >
                                <option value="Pending">
                                    Pending
                                </option>

                                <option value="Confirmed">
                                    Confirmed
                                </option>

                                <option value="Processing">
                                    Processing
                                </option>

                                <option value="Shipped">
                                    Shipped
                                </option>

                                <option value="Out for Delivery">
                                    Out for Delivery
                                </option>

                                <option value="Delivered">
                                    Delivered
                                </option>

                                <option value="Cancelled">
                                    Cancelled
                                </option>
                            </select>
                        </div>


                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Remarks
                            </label>

                            <input
                                type="text"
                                placeholder="Remarks (optional)"
                                value={remarks}
                                onChange={(e) =>
                                    setRemarks(e.target.value)
                                }
                                disabled={saving}
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100"
                            />
                        </div>

                    </div>


                    <button
                        onClick={handleStatusUpdate}
                        disabled={
                            saving ||
                            status === order.status
                        }
                        className="w-full sm:w-auto mt-5 bg-black text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving
                            ? "Updating..."
                            : "Update Status"}
                    </button>

                </div>


                {/* ================= STATUS HISTORY ================= */}

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">

                    <h2 className="text-lg font-bold text-gray-900 mb-6">
                        Status History
                    </h2>

                    {order.status_history?.length > 0 ? (

                        <div className="relative space-y-6">

                            {order.status_history.map(
                                (history, index) => (

                                    <div
                                        key={history.id || index}
                                        className="relative pl-6 sm:pl-8 border-l-2 border-gray-200"
                                    >

                                        <div className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-black border-2 border-white" />

                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">

                                            <span
                                                className={`self-start px-3 py-1 rounded-full border text-xs sm:text-sm font-semibold ${statusColor[
                                                    history.status
                                                    ] ||
                                                    "bg-gray-100 text-gray-700 border-gray-200"
                                                    }`}
                                            >
                                                {history.status}
                                            </span>

                                            <span className="text-xs sm:text-sm text-gray-500">
                                                {formatDate(
                                                    history.changed_at
                                                )}
                                            </span>

                                        </div>


                                        {history.remarks && (
                                            <p className="text-sm sm:text-base text-gray-600 mt-2 break-words">
                                                {history.remarks}
                                            </p>
                                        )}


                                        {history.changed_by && (
                                            <p className="text-xs text-gray-400 mt-1">
                                                Changed by:{" "}
                                                {history.changed_by}
                                            </p>
                                        )}

                                    </div>

                                )
                            )}

                        </div>

                    ) : (

                        <p className="text-gray-500 text-sm">
                            No status history yet.
                        </p>

                    )}

                </div>

            </div>
        </div>
    );
}

