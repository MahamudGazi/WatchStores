import { useEffect, useState } from "react";
import {
    getRefunds,
    getRefundSummary,
} from "../../../api/admin";

export default function AdminRefunds() {
    const [refunds, setRefunds] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadRefunds();
    }, []);

    async function loadRefunds() {
        try {
            setLoading(true);
            setError("");

            const [refundData, summaryData] =
                await Promise.all([
                    getRefunds(),
                    getRefundSummary(),
                ]);

            const refundList = Array.isArray(refundData)
                ? refundData
                : refundData?.results || [];

            setRefunds(refundList);
            setSummary(summaryData);
        } catch (error) {
            console.error(
                "Failed to load refunds:",
                error
            );

            setError(
                error.response?.data?.detail ||
                error.response?.data?.error ||
                "Failed to load refunds."
            );
        } finally {
            setLoading(false);
        }
    }

    function getStatusClass(status) {
        switch (status) {
            case "Completed":
                return "bg-green-100 text-green-700";

            case "Pending":
                return "bg-yellow-100 text-yellow-700";

            case "Processing":
                return "bg-blue-100 text-blue-700";

            case "Rejected":
                return "bg-red-100 text-red-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    }

    function formatDate(date) {
        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    }

    function getOrderNumber(refund) {
        return (
            refund.order_number ||
            refund.return_request?.order_number ||
            refund.return_request ||
            "-"
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl">
                    <div className="rounded-xl bg-white p-8 text-center shadow-sm sm:p-12">
                        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black" />

                        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                            Refund Management
                        </h1>

                        <p className="mt-2 text-sm text-gray-500">
                            Loading refunds...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">

                {/* =====================================
                    HEADER
                ====================================== */}

                <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                            Refund Management
                        </h1>

                        <p className="mt-1 text-sm text-gray-500 sm:text-base">
                            Manage customer refunds
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={loadRefunds}
                        className="w-full rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 sm:w-auto"
                    >
                        Refresh
                    </button>
                </div>


                {/* =====================================
                    ERROR
                ====================================== */}

                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        <p className="font-semibold">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={loadRefunds}
                            className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                        >
                            Try Again
                        </button>
                    </div>
                )}


                {/* =====================================
                    SUMMARY
                ====================================== */}

                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                    {/* Total Refunds */}

                    <div className="rounded-xl bg-white p-5 shadow-sm sm:p-6">
                        <p className="text-sm font-medium text-gray-500">
                            Total Refunds
                        </p>

                        <h2 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                            {summary?.total_refunds ?? 0}
                        </h2>
                    </div>


                    {/* Completed */}

                    <div className="rounded-xl bg-green-50 p-5 shadow-sm sm:p-6">
                        <p className="text-sm font-medium text-gray-500">
                            Completed
                        </p>

                        <h2 className="mt-2 text-2xl font-bold text-green-600 sm:text-3xl">
                            {summary?.completed ?? 0}
                        </h2>
                    </div>


                    {/* Pending */}

                    <div className="rounded-xl bg-yellow-50 p-5 shadow-sm sm:p-6">
                        <p className="text-sm font-medium text-gray-500">
                            Pending
                        </p>

                        <h2 className="mt-2 text-2xl font-bold text-yellow-600 sm:text-3xl">
                            {summary?.pending ?? 0}
                        </h2>
                    </div>


                    {/* Total Amount */}

                    <div className="rounded-xl bg-white p-5 shadow-sm sm:p-6">
                        <p className="text-sm font-medium text-gray-500">
                            Total Refund Amount
                        </p>

                        <h2 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                            ৳ {summary?.total_amount ?? 0}
                        </h2>
                    </div>

                </div>


                {/* =====================================
                    REFUND HISTORY
                ====================================== */}

                <div className="overflow-hidden rounded-xl bg-white shadow-sm">

                    <div className="border-b border-gray-200 p-4 sm:p-5">
                        <div className="flex items-center justify-between gap-3">

                            <div>
                                <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                                    Refund History
                                </h2>

                                <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                                    {refunds.length} refund record
                                    {refunds.length !== 1
                                        ? "s"
                                        : ""}
                                </p>
                            </div>

                        </div>
                    </div>


                    {/* =====================================
                        EMPTY
                    ====================================== */}

                    {refunds.length === 0 ? (

                        <div className="p-8 text-center sm:p-12">

                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                                <span className="text-2xl">
                                    💰
                                </span>
                            </div>

                            <h3 className="mt-4 text-lg font-semibold text-gray-900">
                                No Refunds
                            </h3>

                            <p className="mt-2 text-sm text-gray-500">
                                No refund records found.
                            </p>

                        </div>

                    ) : (

                        <>
                            {/* =====================================
                                DESKTOP TABLE
                            ====================================== */}

                            <div className="hidden overflow-x-auto md:block">

                                <table className="w-full min-w-[800px]">

                                    <thead className="bg-black text-white">

                                        <tr>

                                            <th className="p-4 text-left text-sm font-semibold">
                                                Refund ID
                                            </th>

                                            <th className="p-4 text-left text-sm font-semibold">
                                                Order
                                            </th>

                                            <th className="p-4 text-left text-sm font-semibold">
                                                Amount
                                            </th>

                                            <th className="p-4 text-left text-sm font-semibold">
                                                Status
                                            </th>

                                            <th className="p-4 text-left text-sm font-semibold">
                                                Date
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {refunds.map(
                                            (refund) => (

                                                <tr
                                                    key={
                                                        refund.id
                                                    }
                                                    className="border-b border-gray-100 transition hover:bg-gray-50"
                                                >

                                                    {/* Refund ID */}

                                                    <td className="p-4">
                                                        <span className="font-semibold text-gray-900">
                                                            #
                                                            {
                                                                refund.id
                                                            }
                                                        </span>
                                                    </td>


                                                    {/* Order */}

                                                    <td className="p-4">
                                                        <span className="font-medium text-gray-700">
                                                            #
                                                            {getOrderNumber(
                                                                refund
                                                            )}
                                                        </span>
                                                    </td>


                                                    {/* Amount */}

                                                    <td className="p-4">
                                                        <span className="font-semibold text-gray-900">
                                                            ৳{" "}
                                                            {
                                                                refund.amount
                                                            }
                                                        </span>
                                                    </td>


                                                    {/* Status */}

                                                    <td className="p-4">

                                                        <span
                                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                                                                refund.status
                                                            )}`}
                                                        >
                                                            {
                                                                refund.status
                                                            }
                                                        </span>

                                                    </td>


                                                    {/* Date */}

                                                    <td className="p-4 text-sm text-gray-600">
                                                        {formatDate(
                                                            refund.refunded_at ||
                                                            refund.created_at
                                                        )}
                                                    </td>

                                                </tr>

                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>


                            {/* =====================================
                                MOBILE CARDS
                            ====================================== */}

                            <div className="space-y-3 p-3 md:hidden">

                                {refunds.map(
                                    (refund) => (

                                        <div
                                            key={
                                                refund.id
                                            }
                                            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                                        >

                                            {/* Top */}

                                            <div className="flex items-start justify-between gap-3">

                                                <div>

                                                    <p className="text-xs font-medium text-gray-500">
                                                        Refund ID
                                                    </p>

                                                    <p className="mt-1 text-base font-bold text-gray-900">
                                                        #
                                                        {
                                                            refund.id
                                                        }
                                                    </p>

                                                </div>


                                                <span
                                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                                                        refund.status
                                                    )}`}
                                                >
                                                    {
                                                        refund.status
                                                    }
                                                </span>

                                            </div>


                                            {/* Details */}

                                            <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">

                                                {/* Order */}

                                                <div className="flex items-center justify-between gap-4">

                                                    <span className="text-sm text-gray-500">
                                                        Order
                                                    </span>

                                                    <span className="max-w-[60%] truncate text-right text-sm font-semibold text-gray-900">
                                                        #
                                                        {getOrderNumber(
                                                            refund
                                                        )}
                                                    </span>

                                                </div>


                                                {/* Amount */}

                                                <div className="flex items-center justify-between gap-4">

                                                    <span className="text-sm text-gray-500">
                                                        Amount
                                                    </span>

                                                    <span className="text-sm font-bold text-gray-900">
                                                        ৳{" "}
                                                        {
                                                            refund.amount
                                                        }
                                                    </span>

                                                </div>


                                                {/* Date */}

                                                <div className="flex items-center justify-between gap-4">

                                                    <span className="text-sm text-gray-500">
                                                        Date
                                                    </span>

                                                    <span className="text-right text-sm text-gray-700">
                                                        {formatDate(
                                                            refund.refunded_at ||
                                                            refund.created_at
                                                        )}
                                                    </span>

                                                </div>

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>
                        </>
                    )}

                </div>

            </div>
        </div>
    );
}

