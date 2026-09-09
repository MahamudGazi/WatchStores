import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
    getOrderDetails,
    cancelOrder,
    createReturnRequest,
} from "../api/order";

export default function OrderDetails() {

    const { id } = useParams();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // RETURN STATES
    const [returnReason, setReturnReason] = useState("");
    const [showReturnForm, setShowReturnForm] = useState(false);
    const [returnLoading, setReturnLoading] = useState(false);
    const [returnImages, setReturnImages] = useState([]);
    const [returnImagePreviews, setReturnImagePreviews] = useState([]);

    // =========================
    // LOAD ORDER
    // =========================

    useEffect(() => {
        loadOrder();
    }, [id]);

    async function loadOrder() {

        try {

            setLoading(true);
            setError("");

            const response =
                await getOrderDetails(id);

            console.log(
                "Order Details API:",
                response
            );

            // Supports:
            // { success: true, data: {...} }
            // OR directly {...}

            setOrder(
                response?.data ?? response
            );

        } catch (err) {

            console.error(
                "Order details error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Failed to load order details."
            );

        } finally {

            setLoading(false);

        }
    }


    // =========================
    // CANCEL ORDER
    // =========================

    async function handleCancel() {

        if (
            !window.confirm(
                "Cancel this order?"
            )
        ) {
            return;
        }

        try {

            await cancelOrder(order.id);

            alert(
                "Order cancelled successfully."
            );

            // Reload order
            await loadOrder();

        } catch (err) {

            console.error(
                "Cancel order error:",
                err
            );

            alert(
                err?.response?.data?.message ||
                "Failed to cancel order."
            );

        }
    }


    // =========================
    // RETURN TIME CALCULATION
    // =========================

    const deliveredHistory =
        order?.status_history?.find(
            (history) =>
                history.status === "Delivered"
        );

    let returnHoursRemaining = 0;

    if (deliveredHistory) {

        const deliveredTime =
            new Date(
                deliveredHistory.changed_at
            ).getTime();

        const deadline =
            deliveredTime +
            48 * 60 * 60 * 1000;

        const remaining =
            deadline - Date.now();

        if (remaining > 0) {

            returnHoursRemaining =
                Math.ceil(
                    remaining /
                    (1000 * 60 * 60)
                );

        }
    }


    // =========================
    // CAN RETURN?
    // =========================

    const canReturnOrder =
        order?.status === "Delivered" &&
        returnHoursRemaining > 0;



    function handleReturnImages(event) {

        const files = Array.from(
            event.target.files || []
        );

        if (!files.length) {
            return;
        }

        // Maximum 5 images
        if (files.length > 5) {

            alert(
                "You can select maximum 5 images."
            );

            return;
        }

        // Only images
        const invalidFile = files.find(
            (file) =>
                !file.type.startsWith("image/")
        );

        if (invalidFile) {

            alert(
                "Please select image files only."
            );

            return;
        }

        setReturnImages(files);

        const previews = files.map(
            (file) => URL.createObjectURL(file)
        );

        setReturnImagePreviews(previews);
    }


    // =========================
    // RETURN REQUEST
    // =========================

    async function handleReturn() {

        if (!returnReason.trim()) {
            alert("Please enter a return reason.");
            return;
        }

        if (!window.confirm("Submit return request?")) {
            return;
        }

        try {

            setReturnLoading(true);

            await createReturnRequest(
                order.id,
                returnReason,
                returnImages
            );

            alert(
                "Return request submitted successfully."
            );

            setShowReturnForm(false);

            setReturnReason("");

            setReturnImages([]);

            setReturnImagePreviews([]);

            await loadOrder();

        } catch (err) {

            console.error(
                "Return request error:",
                err
            );

            console.error(
                "Response:",
                err?.response?.data
            );

            alert(
                err?.response?.data?.message ||
                err?.response?.data?.errors?.reason?.[0] ||
                "Failed to submit return request."
            );

        } finally {

            setReturnLoading(false);

        }
    }

    // =========================
    // LOADING
    // =========================

    if (loading) {

        return (

            <div className="min-h-[60vh] flex items-center justify-center">

                <div className="text-lg font-semibold text-gray-600">

                    Loading order...

                </div>

            </div>

        );
    }


    // =========================
    // ERROR
    // =========================

    if (error) {

        return (

            <div className="min-h-[60vh] flex items-center justify-center px-4">

                <div className="rounded-xl bg-red-50 p-6 text-center">

                    <h2 className="text-lg font-semibold text-red-700">

                        Unable to load order

                    </h2>

                    <p className="mt-2 text-sm text-red-600">

                        {error}

                    </p>

                    <button
                        onClick={loadOrder}
                        className="mt-4 rounded-lg bg-black px-5 py-2 text-sm font-semibold text-white hover:bg-yellow-600"
                    >
                        Try Again
                    </button>

                </div>

            </div>

        );
    }


    // =========================
    // ORDER NOT FOUND
    // =========================

    if (!order) {

        return (

            <div className="min-h-[60vh] flex items-center justify-center">

                <h2 className="text-lg font-semibold text-gray-600">

                    Order not found.

                </h2>

            </div>

        );
    }


    // =========================
    // PENDING ORDER
    // =========================

    const canEditOrder =
        order.status === "Pending";


    // =========================
    // UI
    // =========================

    return (

        <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">

            <div className="mx-auto max-w-7xl">


                {/* =====================================
                    ORDER SUMMARY
                ===================================== */}

                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">


                    {/* HEADER */}

                    <div className="border-b p-6">

                        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">

                            Order Details

                        </h2>

                        <p className="mt-1 text-sm text-gray-500">

                            View and track your order information

                        </p>

                    </div>


                    {/* SUMMARY GRID */}

                    <div className="grid md:grid-cols-3">


                        {/* ORDER NUMBER */}

                        <div className="border-b p-6 md:border-r">

                            <p className="text-sm text-gray-500">

                                Order Number

                            </p>

                            <h3 className="mt-2 break-all font-semibold text-gray-900">

                                #{order.order_number}

                            </h3>

                        </div>


                        {/* STATUS */}

                        <div className="border-b p-6 md:border-r">

                            <p className="text-sm text-gray-500">

                                Status

                            </p>

                            <span
                                className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${order.status === "Delivered"
                                        ? "bg-green-100 text-green-700"
                                        : order.status === "Cancelled"
                                            ? "bg-red-100 text-red-700"
                                            : order.status === "Processing"
                                                ? "bg-blue-100 text-blue-700"
                                                : order.status === "Shipped"
                                                    ? "bg-purple-100 text-purple-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                    }`}
                            >

                                {order.status}

                            </span>

                        </div>


                        {/* ORDER DATE */}

                        <div className="border-b p-6">

                            <p className="text-sm text-gray-500">

                                Order Date

                            </p>

                            <h3 className="mt-2 font-semibold text-gray-900">

                                {new Date(
                                    order.created_at
                                ).toLocaleString()}

                            </h3>

                        </div>


                        {/* PAYMENT */}

                        <div className="border-b p-6 md:border-r">

                            <p className="text-sm text-gray-500">

                                Payment Method

                            </p>

                            <h3 className="mt-2 font-semibold text-gray-900">

                                {order.payment_method}

                            </h3>

                        </div>


                        {/* DELIVERY */}

                        <div className="border-b p-6 md:border-r">

                            <p className="text-sm text-gray-500">

                                Delivery Charge

                            </p>

                            <h3 className="mt-2 font-semibold text-gray-900">

                                ৳ {order.delivery_charge}

                            </h3>

                        </div>


                        {/* TOTAL + ACTIONS */}

                        <div className="border-b p-6">

                            <p className="text-sm text-gray-500">

                                Grand Total

                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-green-600">

                                ৳ {order.grand_total}

                            </h2>


                            {/* =================================
                                PENDING ORDER ACTIONS
                            ================================= */}

                            <div className="mt-6 flex flex-wrap gap-3">

                                {/* =========================
        PENDING ORDER ACTIONS
    ========================= */}

                                {canEditOrder && (

                                    <>
                                        <button
                                            className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                                            onClick={() =>
                                                alert(
                                                    "Edit Address feature will be added in the next step."
                                                )
                                            }
                                        >
                                            Edit Address
                                        </button>


                                        <button
                                            onClick={handleCancel}
                                            className="rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
                                        >
                                            Cancel Order
                                        </button>
                                    </>

                                )}


                                {/* =========================
        DELIVERED ORDER RETURN
    ========================= */}

                                
                            </div>


                            {/* =================================
                                RETURN PRODUCT BUTTON

                                IMPORTANT:
                                NOT INSIDE canEditOrder
                            ================================= */}

                            {canReturnOrder &&
                                !showReturnForm && (

                                    <div className="mt-6">

                                        <button
                                            onClick={() =>
                                                setShowReturnForm(
                                                    true
                                                )
                                            }
                                            disabled={
                                                returnLoading
                                            }
                                            className="rounded-lg bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >

                                            Return Product

                                        </button>


                                        {/* RETURN TIME */}

                                        <p className="mt-2 text-sm text-orange-700">

                                            Return available for approximately{" "}

                                            <strong>
                                                {
                                                    returnHoursRemaining
                                                }{" "}
                                                hours
                                            </strong>

                                        </p>

                                    </div>

                                )}


                            {/* =================================
                                RETURN FORM
                            ================================= */}

                            {showReturnForm && canReturnOrder && (

                                <div className="mt-6 rounded-xl border border-orange-200 bg-orange-50 p-5">

                                    <h3 className="text-lg font-bold text-gray-900">
                                        Return Product
                                    </h3>

                                    <p className="mt-1 text-sm text-gray-600">
                                        You have approximately{" "}
                                        <strong>
                                            {returnHoursRemaining} hours
                                        </strong>{" "}
                                        remaining to request a return.
                                    </p>


                                    {/* =========================
            RETURN REASON
        ========================= */}

                                    <div className="mt-4">

                                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                                            Return Reason
                                        </label>

                                        <textarea
                                            value={returnReason}
                                            onChange={(e) =>
                                                setReturnReason(e.target.value)
                                            }
                                            placeholder="Example: Product damaged, wrong product received, defective product..."
                                            rows={4}
                                            className="w-full rounded-lg border border-gray-300 bg-white p-3 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                        />

                                    </div>


                                    {/* =========================
            IMAGE UPLOAD
        ========================= */}

                                    <div className="mt-5">

                                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                                            Product Damage / Problem Images
                                        </label>

                                        <p className="mb-3 text-xs text-gray-500">
                                            You can upload up to 5 images.
                                        </p>

                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleReturnImages}
                                            className="block w-full cursor-pointer rounded-lg border border-gray-300 bg-white p-3 text-sm"
                                        />

                                    </div>


                                    {/* =========================
            IMAGE PREVIEW
        ========================= */}

                                    {returnImagePreviews.length > 0 && (

                                        <div className="mt-5">

                                            <p className="mb-3 text-sm font-semibold text-gray-700">
                                                Selected Images
                                            </p>

                                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">

                                                {returnImagePreviews.map(
                                                    (preview, index) => (

                                                        <div
                                                            key={index}
                                                            className="relative overflow-hidden rounded-lg border border-gray-200 bg-white"
                                                        >

                                                            <img
                                                                src={preview}
                                                                alt={`Return evidence ${index + 1}`}
                                                                className="h-28 w-full object-cover"
                                                            />

                                                        </div>

                                                    )
                                                )}

                                            </div>

                                        </div>

                                    )}


                                    {/* =========================
            ACTION BUTTONS
        ========================= */}

                                    <div className="mt-6 flex flex-wrap gap-3">

                                        <button
                                            onClick={handleReturn}
                                            disabled={returnLoading}
                                            className="rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >

                                            {returnLoading
                                                ? "Submitting..."
                                                : "Submit Return Request"
                                            }

                                        </button>


                                        <button
                                            onClick={() => {

                                                setShowReturnForm(false);

                                                setReturnReason("");

                                                setReturnImages([]);

                                                setReturnImagePreviews([]);

                                            }}
                                            disabled={returnLoading}
                                            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>

                                    </div>

                                </div>

                            )}

                            {/* =================================
                                RETURN NOT AVAILABLE
                            ================================= */}

                            {order.status ===
                                "Delivered" &&
                                returnHoursRemaining <=
                                0 && (

                                    <div className="mt-5 rounded-lg bg-gray-100 p-4">

                                        <p className="text-sm font-medium text-gray-600">

                                            Return period has expired.

                                        </p>

                                        <p className="mt-1 text-xs text-gray-500">

                                            Returns are available only within 48 hours after delivery.

                                        </p>

                                    </div>

                                )}

                        </div>

                    </div>

                </div>


                {/* =====================================
                    SHIPPING ADDRESS
                ===================================== */}

                <div className="mt-8 rounded-2xl bg-white p-6 shadow-lg">


                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                        <div>

                            <h2 className="text-xl font-bold text-gray-900">

                                Shipping Address

                            </h2>

                            <p className="mt-1 text-sm text-gray-500">

                                Delivery information for this order

                            </p>

                        </div>


                        {/* EDIT ADDRESS */}

                        {canEditOrder && (

                            <button
                                onClick={() =>
                                    alert(
                                        "Edit Address feature will be added in the next step."
                                    )
                                }
                                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-black hover:bg-gray-50"
                            >

                                Edit Address

                            </button>

                        )}

                    </div>


                    {/* ADDRESS */}

                    {order.shipping_address ? (

                        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">


                            {/* NAME */}

                            <div>

                                <p className="text-xs font-medium uppercase text-gray-400">

                                    Full Name

                                </p>

                                <p className="mt-1 font-semibold text-gray-900">

                                    {
                                        order.shipping_address
                                            .full_name
                                    }

                                </p>

                            </div>


                            {/* PHONE */}

                            <div>

                                <p className="text-xs font-medium uppercase text-gray-400">

                                    Phone

                                </p>

                                <p className="mt-1 font-semibold text-gray-900">

                                    {
                                        order.shipping_address
                                            .phone
                                    }

                                </p>

                            </div>


                            {/* ADDRESS */}

                            <div>

                                <p className="text-xs font-medium uppercase text-gray-400">

                                    Address

                                </p>

                                <p className="mt-1 font-semibold text-gray-900">

                                    {
                                        order.shipping_address
                                            .address_line
                                    }

                                </p>

                            </div>


                            {/* CITY */}

                            <div>

                                <p className="text-xs font-medium uppercase text-gray-400">

                                    City

                                </p>

                                <p className="mt-1 font-semibold text-gray-900">

                                    {
                                        order.shipping_address
                                            .city
                                    }

                                </p>

                            </div>


                            {/* DISTRICT */}

                            <div>

                                <p className="text-xs font-medium uppercase text-gray-400">

                                    District

                                </p>

                                <p className="mt-1 font-semibold text-gray-900">

                                    {
                                        order.shipping_address
                                            .district
                                    }

                                </p>

                            </div>


                            {/* POSTAL */}

                            <div>

                                <p className="text-xs font-medium uppercase text-gray-400">

                                    Postal Code

                                </p>

                                <p className="mt-1 font-semibold text-gray-900">

                                    {
                                        order.shipping_address
                                            .postal_code
                                    }

                                </p>

                            </div>


                            {/* COUNTRY */}

                            <div>

                                <p className="text-xs font-medium uppercase text-gray-400">

                                    Country

                                </p>

                                <p className="mt-1 font-semibold text-gray-900">

                                    {
                                        order.shipping_address
                                            .country
                                    }

                                </p>

                            </div>

                        </div>

                    ) : (

                        <div className="mt-6 rounded-lg bg-gray-50 p-5 text-sm text-gray-500">

                            No shipping address available.

                        </div>

                    )}

                </div>


                {/* =====================================
                    ORDERED ITEMS
                ===================================== */}

                <div className="mt-8 rounded-2xl bg-white p-6 shadow-lg">

                    <h2 className="mb-6 text-2xl font-bold text-gray-900">

                        Ordered Items

                    </h2>


                    {order.items?.length > 0 ? (

                        <div className="space-y-4">

                            {order.items.map(
                                (item) => (

                                    <div
                                        key={item.id}
                                        className="flex flex-col gap-5 rounded-xl border p-4 transition hover:shadow-md sm:flex-row"
                                    >


                                        {/* IMAGE */}

                                        <img
                                            src={
                                                item.product_image ||
                                                "https://via.placeholder.com/120x120?text=Product"
                                            }
                                            alt={
                                                item.product_name
                                            }
                                            className="h-28 w-28 rounded-lg border object-cover"
                                        />


                                        {/* INFO */}

                                        <div className="flex-1">

                                            <h3 className="text-lg font-semibold text-gray-900">

                                                {
                                                    item.product_name
                                                }

                                            </h3>

                                            <p className="mt-2 text-sm text-gray-500">

                                                Quantity:{" "}

                                                {
                                                    item.quantity
                                                }

                                            </p>

                                            <p className="text-sm text-gray-500">

                                                Price: ৳{" "}

                                                {
                                                    item.price
                                                }

                                            </p>

                                        </div>


                                        {/* SUBTOTAL */}

                                        <div className="flex items-center">

                                            <h3 className="text-xl font-bold text-green-600">

                                                ৳{" "}

                                                {
                                                    item.subtotal
                                                }

                                            </h3>

                                        </div>

                                    </div>

                                ))}

                        </div>

                    ) : (

                        <div className="rounded-lg bg-gray-50 p-5 text-center text-sm text-gray-500">

                            No items found in this order.

                        </div>

                    )}

                </div>


                {/* =====================================
                    ORDER TIMELINE
                ===================================== */}

                <div className="mt-8 rounded-2xl bg-white p-6 shadow-lg">


                    <h2 className="mb-6 text-xl font-bold text-gray-900">

                        Order Timeline

                    </h2>


                    {order.status_history?.length > 0 ? (

                        <div className="space-y-6">

                            {order.status_history.map(
                                (
                                    history,
                                    index
                                ) => (

                                    <div
                                        key={
                                            history.id
                                        }
                                        className="flex gap-4"
                                    >


                                        {/* DOT */}

                                        <div className="flex flex-col items-center">

                                            <div
                                                className={`h-4 w-4 rounded-full ${index === 0
                                                        ? "bg-green-500"
                                                        : "bg-gray-300"
                                                    }`}
                                            />


                                            {index !==
                                                order
                                                    .status_history
                                                    .length -
                                                1 && (

                                                    <div className="h-16 w-1 bg-gray-200" />

                                                )}

                                        </div>


                                        {/* HISTORY */}

                                        <div>

                                            <h3 className="font-semibold text-gray-900">

                                                {
                                                    history.status
                                                }

                                            </h3>


                                            {history.remarks && (

                                                <p className="mt-1 text-sm text-gray-500">

                                                    {
                                                        history.remarks
                                                    }

                                                </p>

                                            )}


                                            <p className="mt-1 text-xs text-gray-400">

                                                {new Date(
                                                    history.changed_at
                                                ).toLocaleString()}

                                            </p>

                                        </div>

                                    </div>

                                ))}

                        </div>

                    ) : (

                        <p className="text-sm text-gray-500">

                            No status history available.

                        </p>

                    )}

                </div>

            </div>

        </div>
    );
}

