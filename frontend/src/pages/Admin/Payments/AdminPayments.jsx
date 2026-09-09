import { useEffect, useMemo, useState } from "react";
import { getPaymentTransactions } from "../../../api/admin";

export default function Page() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    async function loadTransactions() {
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

            setTransactions(items);
        } catch (err) {
            console.error(
                "TRANSACTIONS ERROR:",
                err
            );

            setError(
                err.response?.data?.detail ||
                err.response?.data?.error ||
                "Failed to load payment transactions."
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadTransactions();
    }, []);

    const statuses = useMemo(() => {
        const values = transactions
            .map((item) =>
                String(
                    item.status ||
                    item.payment_status ||
                    ""
                ).toUpperCase()
            )
            .filter(Boolean);

        return ["ALL", ...new Set(values)];
    }, [transactions]);

    const filteredTransactions = useMemo(() => {
        const keyword = search
            .trim()
            .toLowerCase();

        return transactions.filter((transaction) => {
            const status = String(
                transaction.status ||
                transaction.payment_status ||
                ""
            ).toUpperCase();

            const transactionId = String(
                transaction.transaction_id ||
                transaction.tran_id ||
                transaction.txn_id ||
                transaction.id ||
                ""
            ).toLowerCase();

            const orderId = String(
                transaction.order_id ||
                transaction.order?.id ||
                transaction.order ||
                ""
            ).toLowerCase();

            const customer = String(
                transaction.customer_name ||
                transaction.customer?.name ||
                transaction.user_name ||
                transaction.user?.username ||
                transaction.user?.email ||
                ""
            ).toLowerCase();

            const matchesSearch =
                !keyword ||
                transactionId.includes(keyword) ||
                orderId.includes(keyword) ||
                customer.includes(keyword);

            const matchesStatus =
                statusFilter === "ALL" ||
                status === statusFilter;

            return (
                matchesSearch &&
                matchesStatus
            );
        });
    }, [
        transactions,
        search,
        statusFilter,
    ]);

    function getStatusStyle(status) {
        const value = String(
            status || ""
        ).toUpperCase();

        if (
            value === "SUCCESS" ||
            value === "COMPLETED" ||
            value === "PAID"
        ) {
            return "bg-green-100 text-green-700";
        }

        if (
            value === "PENDING" ||
            value === "PROCESSING"
        ) {
            return "bg-yellow-100 text-yellow-700";
        }

        if (
            value === "FAILED" ||
            value === "CANCELLED" ||
            value === "CANCELED"
        ) {
            return "bg-red-100 text-red-700";
        }

        if (
            value === "REFUNDED"
        ) {
            return "bg-purple-100 text-purple-700";
        }

        return "bg-gray-100 text-gray-700";
    }

    function getAmount(transaction) {
        return (
            transaction.amount ??
            transaction.total_amount ??
            transaction.payment_amount ??
            transaction.order?.total ??
            0
        );
    }

    function getPaymentMethod(transaction) {
        return (
            transaction.payment_method ||
            transaction.method ||
            transaction.gateway ||
            "-"
        );
    }

    function getStatus(transaction) {
        return (
            transaction.status ||
            transaction.payment_status ||
            "UNKNOWN"
        );
    }

    function getTransactionId(transaction) {
        return (
            transaction.transaction_id ||
            transaction.tran_id ||
            transaction.txn_id ||
            transaction.id ||
            "-"
        );
    }

    function getOrderId(transaction) {
        return (
            transaction.order_id ||
            transaction.order?.id ||
            transaction.order ||
            "-"
        );
    }

    function getCustomer(transaction) {
        return (
            transaction.customer_name ||
            transaction.customer?.name ||
            transaction.user_name ||
            transaction.user?.username ||
            transaction.user?.email ||
            "-"
        );
    }

    function getDate(transaction) {
        const date =
            transaction.created_at ||
            transaction.created ||
            transaction.date ||
            transaction.timestamp;

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
        <div className="min-h-screen bg-gray-100 p-3 sm:p-4 md:p-6 lg:p-8">

            {/* Header */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">

                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">
                        Transactions
                    </h1>

                    <p className="text-gray-500 mt-1">
                        All payment transactions
                    </p>
                </div>

                <button
                    onClick={loadTransactions}
                    disabled={loading}
                    className="
                        w-full sm:w-auto
                        bg-black
                        hover:bg-gray-800
                        disabled:bg-gray-400
                        text-white
                        px-5 py-3
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
                    border border-red-200
                    text-red-700
                    p-4
                    rounded-xl
                ">
                    {error}
                </div>
            )}

            {/* Filters */}
            <div className="
                bg-white
                rounded-xl
                shadow
                p-4
                mb-6
            ">

                <div className="
                    flex
                    flex-col
                    md:flex-row
                    gap-3
                ">

                    {/* Search */}
                    <input
                        type="text"
                        placeholder="
                            Search transaction,
                            order or customer...
                        "
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                        className="
                            flex-1
                            border
                            rounded-lg
                            px-4
                            py-3
                            focus:outline-none
                            focus:ring-2
                            focus:ring-black
                        "
                    />

                    {/* Status */}
                    <select
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(e.target.value)
                        }
                        className="
                            w-full
                            md:w-52
                            border
                            rounded-lg
                            px-4
                            py-3
                            bg-white
                            focus:outline-none
                            focus:ring-2
                            focus:ring-black
                        "
                    >
                        {statuses.map((status) => (
                            <option
                                key={status}
                                value={status}
                            >
                                {status === "ALL"
                                    ? "All Status"
                                    : status}
                            </option>
                        ))}
                    </select>

                </div>

                <div className="mt-3 text-sm text-gray-500">
                    Showing{" "}
                    <span className="font-semibold text-gray-700">
                        {filteredTransactions.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-gray-700">
                        {transactions.length}
                    </span>{" "}
                    transactions
                </div>

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
                        border-black
                        mx-auto
                    " />

                    <p className="
                        text-gray-500
                        mt-4
                    ">
                        Loading transactions...
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
                            min-w-[1000px]
                        ">

                            <thead className="
                                bg-black
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

                                {filteredTransactions.length === 0 ? (

                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="
                                                p-10
                                                text-center
                                                text-gray-500
                                            "
                                        >
                                            No transactions found.
                                        </td>
                                    </tr>

                                ) : (

                                    filteredTransactions.map(
                                        (transaction, index) => {

                                            const status =
                                                getStatus(
                                                    transaction
                                                );

                                            return (
                                                <tr
                                                    key={
                                                        transaction.id ||
                                                        transaction.transaction_id ||
                                                        index
                                                    }
                                                    className="
                                                        border-b
                                                        hover:bg-gray-50
                                                    "
                                                >

                                                    {/* Transaction */}
                                                    <td className="p-4">

                                                        <p className="
                                                            font-semibold
                                                            text-gray-900
                                                        ">
                                                            {getTransactionId(
                                                                transaction
                                                            )}
                                                        </p>

                                                    </td>

                                                    {/* Order */}
                                                    <td className="p-4">
                                                        #{getOrderId(
                                                            transaction
                                                        )}
                                                    </td>

                                                    {/* Customer */}
                                                    <td className="p-4">
                                                        <span className="
                                                            max-w-[200px]
                                                            block
                                                            truncate
                                                        ">
                                                            {getCustomer(
                                                                transaction
                                                            )}
                                                        </span>
                                                    </td>

                                                    {/* Amount */}
                                                    <td className="p-4">

                                                        <span className="
                                                            font-bold
                                                        ">
                                                            ৳{" "}
                                                            {Number(
                                                                getAmount(
                                                                    transaction
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
                                                                getPaymentMethod(
                                                                    transaction
                                                                )
                                                            ).replace(
                                                                /_/g,
                                                                " "
                                                            )}
                                                        </span>

                                                    </td>

                                                    {/* Status */}
                                                    <td className="p-4">

                                                        <span
                                                            className={`
                                                                inline-flex
                                                                px-3
                                                                py-1
                                                                rounded-full
                                                                text-xs
                                                                font-semibold
                                                                ${getStatusStyle(
                                                                    status
                                                                )}
                                                            `}
                                                        >
                                                            {String(
                                                                status
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
                                                            transaction
                                                        )}
                                                    </td>

                                                </tr>
                                            );
                                        }
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