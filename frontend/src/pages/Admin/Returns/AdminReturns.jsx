import { useEffect, useState } from "react";

import {
    getPendingReturns,
    approveReturn,
    rejectReturn,
} from "../../../api/admin";

export default function AdminReturns() {
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null);

    useEffect(() => {
        loadReturns();
    }, []);

    // =====================================================
    // LOAD PENDING RETURNS
    // =====================================================

    async function loadReturns() {
        try {
            setLoading(true);

            const data = await getPendingReturns();

            setReturns(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(
                "Failed to load return requests:",
                error
            );

            setReturns([]);
        } finally {
            setLoading(false);
        }
    }

    // =====================================================
    // APPROVE RETURN
    // =====================================================

    async function handleApprove(orderId) {
        const confirmApprove = window.confirm(
            "Are you sure you want to approve this return?"
        );

        if (!confirmApprove) return;

        try {
            setProcessing(orderId);

            await approveReturn(orderId);

            alert("Return approved successfully.");

            await loadReturns();
        } catch (error) {
            console.error(
                "Approve return error:",
                error
            );

            alert(
                error?.response?.data?.error ||
                    error?.response?.data?.message ||
                    "Failed to approve return."
            );
        } finally {
            setProcessing(null);
        }
    }

    // =====================================================
    // REJECT RETURN
    // =====================================================

    async function handleReject(orderId) {
        const confirmReject = window.confirm(
            "Are you sure you want to reject this return?"
        );

        if (!confirmReject) return;

        try {
            setProcessing(orderId);

            await rejectReturn(orderId);

            alert("Return rejected successfully.");

            await loadReturns();
        } catch (error) {
            console.error(
                "Reject return error:",
                error
            );

            alert(
                error?.response?.data?.error ||
                    error?.response?.data?.message ||
                    "Failed to reject return."
            );
        } finally {
            setProcessing(null);
        }
    }

    // =====================================================
    // IMAGE URL
    // =====================================================

    function getImageUrl(image) {
        if (!image) return "";

        if (image.startsWith("http")) {
            return image;
        }

        return `http://127.0.0.1:8000${image}`;
    }

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
                <div className="mx-auto w-full max-w-7xl">

                    <div className="mb-5 sm:mb-7 lg:mb-8">
                        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl">
                            Return Management
                        </h1>

                        <p className="mt-1 text-xs text-gray-500 sm:text-sm lg:text-base">
                            Manage customer return requests
                        </p>
                    </div>

                    <div className="flex min-h-[280px] items-center justify-center rounded-xl bg-white px-4 shadow-sm sm:min-h-[350px]">
                        <div className="text-center">
                            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-black sm:h-10 sm:w-10" />

                            <p className="mt-4 text-xs text-gray-500 sm:text-sm">
                                Loading return requests...
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        );
    }

    // =====================================================
    // PAGE
    // =====================================================

    return (
        <div className="min-h-screen bg-gray-100 px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8">

            <div className="mx-auto w-full max-w-7xl">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="mb-5 flex flex-col gap-3 sm:mb-7 sm:flex-row sm:items-center sm:justify-between lg:mb-8">

                    <div className="min-w-0">
                        <h1 className="text-xl font-bold leading-tight text-gray-900 sm:text-2xl lg:text-3xl">
                            Return Management
                        </h1>

                        <p className="mt-1 text-xs text-gray-500 sm:text-sm lg:text-base">
                            Manage customer return requests
                        </p>
                    </div>

                    <div className="w-fit rounded-full bg-yellow-100 px-3 py-1.5 text-xs font-semibold text-yellow-700 sm:px-4 sm:py-2 sm:text-sm">
                        {returns.length} Pending
                    </div>

                </div>

                {/* =================================================
                    EMPTY STATE
                ================================================= */}

                {returns.length === 0 ? (

                    <div className="rounded-xl bg-white px-4 py-8 text-center shadow-sm sm:px-8 sm:py-10">

                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl sm:h-16 sm:w-16">
                            ↩
                        </div>

                        <h2 className="mt-4 text-lg font-semibold text-gray-900 sm:text-xl">
                            No Pending Returns
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-xs text-gray-500 sm:text-sm lg:text-base">
                            There are currently no return requests.
                        </p>

                    </div>

                ) : (

                    <>

                        {/* =================================================
                            DESKTOP / TABLET TABLE
                        ================================================= */}

                        <div className="hidden overflow-hidden rounded-xl bg-white shadow-sm md:block">

                            <div className="overflow-x-auto">

                                <table className="w-full min-w-[1050px]">

                                    <thead className="bg-black text-white">

                                        <tr>

                                            <th className="whitespace-nowrap p-3 text-left text-xs font-semibold lg:p-4 lg:text-sm">
                                                Return ID
                                            </th>

                                            <th className="whitespace-nowrap p-3 text-left text-xs font-semibold lg:p-4 lg:text-sm">
                                                Customer
                                            </th>

                                            <th className="whitespace-nowrap p-3 text-left text-xs font-semibold lg:p-4 lg:text-sm">
                                                Order
                                            </th>

                                            <th className="whitespace-nowrap p-3 text-left text-xs font-semibold lg:p-4 lg:text-sm">
                                                Reason
                                            </th>

                                            <th className="whitespace-nowrap p-3 text-left text-xs font-semibold lg:p-4 lg:text-sm">
                                                Images
                                            </th>

                                            <th className="whitespace-nowrap p-3 text-left text-xs font-semibold lg:p-4 lg:text-sm">
                                                Status
                                            </th>

                                            <th className="whitespace-nowrap p-3 text-left text-xs font-semibold lg:p-4 lg:text-sm">
                                                Date
                                            </th>

                                            <th className="whitespace-nowrap p-3 text-left text-xs font-semibold lg:p-4 lg:text-sm">
                                                Action
                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody>

                                        {returns.map((item) => (

                                            <tr
                                                key={item.id}
                                                className="border-b transition hover:bg-gray-50"
                                            >

                                                {/* RETURN ID */}

                                                <td className="p-3 lg:p-4">
                                                    <span className="text-sm font-bold text-gray-900 lg:text-base">
                                                        #{item.id}
                                                    </span>
                                                </td>

                                                {/* CUSTOMER */}

                                                <td className="p-3 lg:p-4">

                                                    <div className="min-w-[160px] max-w-[220px]">

                                                        <p className="truncate text-sm font-semibold text-gray-900 lg:text-base">
                                                            {item.customer?.username ||
                                                                item.customer?.name ||
                                                                "Unknown Customer"}
                                                        </p>

                                                        {item.customer?.email && (
                                                            <p className="mt-1 truncate text-xs text-gray-500 lg:text-sm">
                                                                {item.customer.email}
                                                            </p>
                                                        )}

                                                    </div>

                                                </td>

                                                {/* ORDER */}

                                                <td className="p-3 lg:p-4">
                                                    <span className="whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {item.order_number ||
                                                            `#${item.order}`}
                                                    </span>
                                                </td>

                                                {/* REASON */}

                                                <td className="p-3 lg:p-4">

                                                    <div className="w-[180px] rounded-lg bg-gray-50 p-2.5 lg:w-[220px] lg:p-3">

                                                        <p
                                                            className="line-clamp-3 text-xs leading-5 text-gray-700 lg:text-sm"
                                                            title={item.reason}
                                                        >
                                                            {item.reason || "-"}
                                                        </p>

                                                    </div>

                                                </td>

                                                {/* IMAGES */}

                                                <td className="p-3 lg:p-4">

                                                    {item.images?.length > 0 ? (

                                                        <div className="flex max-w-[180px] flex-wrap gap-1.5 lg:max-w-[220px] lg:gap-2">

                                                            {item.images.map((img) => {

                                                                const imageUrl =
                                                                    getImageUrl(
                                                                        img.image
                                                                    );

                                                                return (
                                                                    <a
                                                                        key={img.id}
                                                                        href={imageUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        title="Open image"
                                                                    >
                                                                        <img
                                                                            src={imageUrl}
                                                                            alt="Return evidence"
                                                                            className="h-12 w-12 rounded-lg border border-gray-200 object-cover transition hover:scale-105 hover:shadow-md lg:h-14 lg:w-14 xl:h-16 xl:w-16"
                                                                        />
                                                                    </a>
                                                                );
                                                            })}

                                                        </div>

                                                    ) : (

                                                        <span className="text-xs text-gray-400 lg:text-sm">
                                                            No images
                                                        </span>

                                                    )}

                                                </td>

                                                {/* STATUS */}

                                                <td className="p-3 lg:p-4">

                                                    <span className="inline-flex whitespace-nowrap rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-700 lg:px-3">
                                                        {item.status}
                                                    </span>

                                                </td>

                                                {/* DATE */}

                                                <td className="whitespace-nowrap p-3 text-xs text-gray-600 lg:p-4 lg:text-sm">

                                                    {item.created_at
                                                        ? new Date(
                                                              item.created_at
                                                          ).toLocaleString()
                                                        : "-"}

                                                </td>

                                                {/* ACTION */}

                                                <td className="p-3 lg:p-4">

                                                    <div className="flex flex-col gap-1.5 xl:flex-row xl:gap-2">

                                                        <button
                                                            onClick={() =>
                                                                handleApprove(
                                                                    item.order
                                                                )
                                                            }
                                                            disabled={
                                                                processing ===
                                                                item.order
                                                            }
                                                            className="min-w-[80px] rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400 lg:px-4 lg:text-sm"
                                                        >
                                                            {processing ===
                                                            item.order
                                                                ? "Processing..."
                                                                : "Approve"}
                                                        </button>

                                                        <button
                                                            onClick={() =>
                                                                handleReject(
                                                                    item.order
                                                                )
                                                            }
                                                            disabled={
                                                                processing ===
                                                                item.order
                                                            }
                                                            className="min-w-[70px] rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400 lg:px-4 lg:text-sm"
                                                        >
                                                            {processing ===
                                                            item.order
                                                                ? "Processing..."
                                                                : "Reject"}
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        ))}

                                    </tbody>

                                </table>

                            </div>

                        </div>

                        {/* =================================================
                            MOBILE CARDS
                        ================================================= */}

                        <div className="space-y-3 md:hidden">

                            {returns.map((item) => (

                                <div
                                    key={item.id}
                                    className="overflow-hidden rounded-xl bg-white shadow-sm"
                                >

                                    {/* TOP */}

                                    <div className="flex items-start justify-between gap-3 border-b p-3 sm:p-4">

                                        <div className="min-w-0">

                                            <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500 sm:text-xs">
                                                Return ID
                                            </p>

                                            <p className="mt-0.5 text-base font-bold text-gray-900 sm:text-lg">
                                                #{item.id}
                                            </p>

                                        </div>

                                        <span className="shrink-0 rounded-full bg-yellow-100 px-2.5 py-1 text-[10px] font-semibold text-yellow-700 sm:px-3 sm:text-xs">
                                            {item.status}
                                        </span>

                                    </div>

                                    {/* CUSTOMER */}

                                    <div className="border-b p-3 sm:p-4">

                                        <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500 sm:text-xs">
                                            Customer
                                        </p>

                                        <p className="mt-1 truncate text-sm font-semibold text-gray-900 sm:text-base">
                                            {item.customer?.username ||
                                                item.customer?.name ||
                                                "Unknown Customer"}
                                        </p>

                                        {item.customer?.email && (
                                            <p className="mt-1 truncate text-xs text-gray-500 sm:text-sm">
                                                {item.customer.email}
                                            </p>
                                        )}

                                    </div>

                                    {/* DETAILS */}

                                    <div className="space-y-4 p-3 sm:p-4">

                                        {/* ORDER */}

                                        <div className="flex items-start justify-between gap-4">

                                            <span className="shrink-0 text-xs text-gray-500 sm:text-sm">
                                                Order
                                            </span>

                                            <span className="break-all text-right text-xs font-semibold text-gray-900 sm:text-sm">
                                                {item.order_number ||
                                                    `#${item.order}`}
                                            </span>

                                        </div>

                                        {/* REASON */}

                                        <div>

                                            <span className="text-xs text-gray-500 sm:text-sm">
                                                Reason
                                            </span>

                                            <p className="mt-1 rounded-lg bg-gray-50 p-3 text-xs leading-5 text-gray-700 sm:text-sm">
                                                {item.reason || "-"}
                                            </p>

                                        </div>

                                        {/* IMAGES */}

                                        <div>

                                            <span className="text-xs text-gray-500 sm:text-sm">
                                                Evidence Images
                                            </span>

                                            {item.images?.length > 0 ? (

                                                <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">

                                                    {item.images.map((img) => {

                                                        const imageUrl =
                                                            getImageUrl(
                                                                img.image
                                                            );

                                                        return (
                                                            <a
                                                                key={img.id}
                                                                href={imageUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                <img
                                                                    src={imageUrl}
                                                                    alt="Return evidence"
                                                                    className="aspect-square w-full rounded-lg border border-gray-200 object-cover transition hover:scale-[1.02]"
                                                                />
                                                            </a>
                                                        );
                                                    })}

                                                </div>

                                            ) : (

                                                <div className="mt-2 rounded-lg bg-gray-50 p-3 text-xs text-gray-400 sm:text-sm">
                                                    No images uploaded.
                                                </div>

                                            )}

                                        </div>

                                        {/* DATE */}

                                        <div className="flex items-start justify-between gap-4">

                                            <span className="shrink-0 text-xs text-gray-500 sm:text-sm">
                                                Date
                                            </span>

                                            <span className="max-w-[70%] break-words text-right text-xs text-gray-700 sm:text-sm">
                                                {item.created_at
                                                    ? new Date(
                                                          item.created_at
                                                      ).toLocaleString()
                                                    : "-"}
                                            </span>

                                        </div>

                                    </div>

                                    {/* ACTIONS */}

                                    <div className="grid grid-cols-2 gap-2 border-t bg-gray-50 p-3 sm:p-4">

                                        <button
                                            onClick={() =>
                                                handleApprove(
                                                    item.order
                                                )
                                            }
                                            disabled={
                                                processing ===
                                                item.order
                                            }
                                            className="min-h-[42px] rounded-lg bg-green-600 px-2 py-2.5 text-xs font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400 sm:text-sm"
                                        >
                                            {processing === item.order
                                                ? "Processing..."
                                                : "Approve"}
                                        </button>

                                        <button
                                            onClick={() =>
                                                handleReject(
                                                    item.order
                                                )
                                            }
                                            disabled={
                                                processing ===
                                                item.order
                                            }
                                            className="min-h-[42px] rounded-lg bg-red-600 px-2 py-2.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400 sm:text-sm"
                                        >
                                            {processing === item.order
                                                ? "Processing..."
                                                : "Reject"}
                                        </button>

                                    </div>

                                </div>

                            ))}

                        </div>

                    </>
                )}

            </div>

        </div>
    );
}

