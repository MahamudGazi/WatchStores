import { useEffect, useMemo, useState } from "react";
import { getPaymentTransactions } from "../../../api/admin";

export default function Page() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    async function loadSuccessfulPayments() {
        try {
            setLoading(true);
            setError("");

            const data = await getPaymentTransactions();

            let items = [];

            if (Array.isArray(data)) {
                items = data;
            } else if (Array.isArray(data?.results)) {
                items = data.results;
            } else if (Array.isArray(data?.data)) {
                items = data.data;
            } else if (Array.isArray(data?.transactions)) {
                items = data.transactions;
            }

            const successful = items.filter((payment) => {
                const status = String(
                    payment.status ||
                    payment.payment_status ||
                    ""
                ).toUpperCase();

                return [
                    "SUCCESS",
                    "SUCCESSFUL",
                    "COMPLETED",
                    "PAID",
                    "CONFIRMED",
                    "CAPTURED",
                ].includes(status);
            });

            setPayments(successful);
        } catch (err) {
            console.error(
                "SUCCESSFUL PAYMENTS ERROR:",
                err
            );

            setError(
                err.response?.data?.detail ||
                err.response?.data?.error ||
                "Failed to load successful payments."
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadSuccessfulPayments();
    }, []);

    const filteredPayments = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) {
            return payments;
        }

        return payments.filter((payment) => {
            const transactionId = String(
                payment.transaction_id ||
                payment.tran_id ||
                payment.txn_id ||
                payment.id ||
                ""
            ).toLowerCase();

            const orderId = String(
                payment.order_id ||
                payment.order?.id ||
                payment.order ||
                ""
            ).toLowerCase();

            const customer = String(
                payment.customer_name ||
                payment.customer?.name ||
                payment.user_name ||
                payment.user?.username ||
                payment.user?.email ||
                ""
            ).toLowerCase();

            const method = String(
                payment.payment_method ||
                payment.method ||
                payment.gateway ||
                ""
            ).toLowerCase();

            return (
                transactionId.includes(keyword) ||
                orderId.includes(keyword) ||
                customer.includes(keyword) ||
                method.includes(keyword)
            );
        });
    }, [payments, search]);

    function getTransactionId(payment) {
        return (
            payment.transaction_id ||
            payment.tran_id ||
            payment.txn_id ||
            payment.id ||
            "-"
        );
    }

    function getOrderId(payment) {
        return (
            payment.order_id ||
            payment.order?.id ||
            payment.order ||
            "-"
        );
    }

    function getCustomer(payment) {
        return (
            payment.customer_name ||
            payment.customer?.name ||
            payment.user_name ||
            payment.user?.username ||
            payment.user?.email ||
            "-"
        );
    }

    function getAmount(payment) {
        return (
            payment.amount ??
            payment.total_amount ??
            payment.payment_amount ??
            payment.order?.total ??
            0
        );
    }

    function getMethod(payment) {
        return (
            payment.payment_method ||
            payment.method ||
            payment.gateway ||
            "-"
        );
    }

    function getStatus(payment) {
        return (
            payment.status ||
            payment.payment_status ||
            "SUCCESS"
        );
    }

    function getDate(payment) {
        const date =
            payment.created_at ||
            payment.created ||
            payment.date ||
            payment.timestamp;

        if (!date) {
            return "-";
        }

        const parsed = new Date(date);

        if (Number.isNaN(parsed.getTime())) {
            return date;
        }

        return parsed.toLocaleString();
    }

    return (
        <div className="
            min-h-screen
            bg-gray-100
            p-3
            sm:p-4
            md:p-6
            lg:p-8
        ">

            {/* Header */}
            <div className="
                flex
                flex-col
                gap-4
                lg:flex-row
                lg:items-center
                lg:justify-between
                mb-6
            ">

                <div>
                    <h1 className="
                        text-2xl
                        sm:text-3xl
                        font-bold
                    ">
                        Successful Payments
                    </h1>

                    <p className="
                        text-gray-500
                        mt-1
                    ">
                        Completed payment transactions
                    </p>
                </div>

                <button
                    onClick={loadSuccessfulPayments}
                    disabled={loading}
                    className="
                        w-full
                        sm:w-auto
                        bg-black
                        hover:bg-gray-800
                        disabled:bg-gray-400
                        text-white
                        px-5
                        py-3
                        rounded-xl
                        font-semibold
                    "
                >
                    {loading
                        ? "Refreshing..."
                        : "Refresh"}
                </button>

            </div>

            {/* Error */}
            {error && (
                <div className="
                    mb-6
                    bg-red-50
                    border
                    border-red-200
                    text-red-700
                    p-4
                    rounded-xl
                ">
                    {error}
                </div>
            )}

            {/* Summary */}
            <div className="
                grid
                grid-cols-1
                sm:grid-cols-2
                lg:grid-cols-3
                gap-4
                mb-6
            ">

                <div className="
                    bg-white
                    rounded-xl
                    shadow
                    p-5
                    border-l-4
                    border-green-500
                ">
                    <p className="
                        text-sm
                        text-gray-500
                    ">
                        Successful Payments
                    </p>

                    <p className="
                        text-2xl
                        font-bold
                        text-green-600
                        mt-1
                    ">
                        {payments.length}
                    </p>
                </div>

                <div className="
                    bg-white
                    rounded-xl
                    shadow
                    p-5
                    border-l-4
                    border-blue-500
                ">
                    <p className="
                        text-sm
                        text-gray-500
                    ">
                        Showing
                    </p>

                    <p className="
                        text-2xl
                        font-bold
                        mt-1
                    ">
                        {filteredPayments.length}
                    </p>
                </div>

                <div className="
                    bg-white
                    rounded-xl
                    shadow
                    p-5
                    border-l-4
                    border-green-500
                ">
                    <p className="
                        text-sm
                        text-gray-500
                    ">
                        Status
                    </p>

                    <p className="
                        text-sm
                        font-semibold
                        text-green-700
                        mt-2
                    ">
                        Payment Completed
                    </p>
                </div>

            </div>

            {/* Search */}
            <div className="
                bg-white
                rounded-xl
                shadow
                p-4
                mb-6
            ">

                <input
                    type="text"
                    placeholder="
                        Search transaction,
                        order, customer or method...
                    "
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                    className="
                        w-full
                        border
                        rounded-lg
                        px-4
                        py-3
                        focus:outline-none
                        focus:ring-2
                        focus:ring-green-500
                    "
                />

            </div>

            {/* Loading */}
            {loading ? (

                <div className="
                    bg-white
                    rounded-xl
                    shadow
                    p-10
                    text-center
                ">

                    <div className="
                        animate-spin
                        rounded-full
                        h-10
                        w-10
                        border-b-4
                        border-green-500
                        mx-auto
                    " />

                    <p className="
                        text-gray-500
                        mt-4
                    ">
                        Loading successful payments...
                    </p>

                </div>

            ) : (

                <div className="
                    bg-white
                    rounded-xl
                    shadow
                    overflow-hidden
                ">

                    <div className="overflow-x-auto">

                        <table className="
                            w-full
                            min-w-[1050px]
                        ">

                            <thead className="
                                bg-green-600
                                text-white
                            ">

                                <tr>

                                    <th className="p-4 text-left">
                                        Transaction
                                    </th>

                                    <th className="p-4 text-left">
                                        Order
                                    </th>

                                    <th className="p-4 text-left">
                                        Customer
                                    </th>

                                    <th className="p-4 text-left">
                                        Amount
                                    </th>

                                    <th className="p-4 text-left">
                                        Method
                                    </th>

                                    <th className="p-4 text-left">
                                        Status
                                    </th>

                                    <th className="p-4 text-left">
                                        Date
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {filteredPayments.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="7"
                                            className="
                                                p-10
                                                text-center
                                                text-gray-500
                                            "
                                        >
                                            No successful payments found.
                                        </td>

                                    </tr>

                                ) : (

                                    filteredPayments.map(
                                        (payment, index) => (

                                            <tr
                                                key={
                                                    payment.id ||
                                                    payment.transaction_id ||
                                                    index
                                                }
                                                className="
                                                    border-b
                                                    hover:bg-green-50
                                                "
                                            >

                                                {/* Transaction */}
                                                <td className="p-4">

                                                    <p className="
                                                        font-semibold
                                                    ">
                                                        {getTransactionId(
                                                            payment
                                                        )}
                                                    </p>

                                                </td>

                                                {/* Order */}
                                                <td className="p-4">
                                                    #
                                                    {getOrderId(
                                                        payment
                                                    )}
                                                </td>

                                                {/* Customer */}
                                                <td className="p-4">

                                                    <span className="
                                                        block
                                                        max-w-[200px]
                                                        truncate
                                                    ">
                                                        {getCustomer(
                                                            payment
                                                        )}
                                                    </span>

                                                </td>

                                                {/* Amount */}
                                                <td className="p-4">

                                                    <span className="
                                                        font-bold
                                                        text-green-600
                                                    ">
                                                        ৳{" "}
                                                        {Number(
                                                            getAmount(
                                                                payment
                                                            )
                                                        ).toLocaleString(
                                                            "en-BD",
                                                            {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2,
                                                            }
                                                        )}
                                                    </span>

                                                </td>

                                                {/* Method */}
                                                <td className="p-4">

                                                    <span className="
                                                        capitalize
                                                    ">
                                                        {String(
                                                            getMethod(
                                                                payment
                                                            )
                                                        ).replace(
                                                            /_/g,
                                                            " "
                                                        )}
                                                    </span>

                                                </td>

                                                {/* Status */}
                                                <td className="p-4">

                                                    <span className="
                                                        inline-flex
                                                        px-3
                                                        py-1
                                                        rounded-full
                                                        text-xs
                                                        font-semibold
                                                        bg-green-100
                                                        text-green-700
                                                    ">
                                                        {String(
                                                            getStatus(
                                                                payment
                                                            )
                                                        ).toUpperCase()}
                                                    </span>

                                                </td>

                                                {/* Date */}
                                                <td className="
                                                    p-4
                                                    text-sm
                                                    text-gray-500
                                                ">
                                                    {getDate(
                                                        payment
                                                    )}
                                                </td>

                                            </tr>

                                        )
                                    )

                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

            )}

        </div>
    );
}