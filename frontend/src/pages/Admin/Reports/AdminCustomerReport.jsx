import { useEffect, useMemo, useState } from "react";
import { getTopCustomers } from "../../../api/admin";

export default function Page() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    async function loadCustomerReport() {
        try {
            setLoading(true);
            setError("");

            const data = await getTopCustomers();

            let items = [];

            if (Array.isArray(data)) {
                items = data;
            } else if (Array.isArray(data?.results)) {
                items = data.results;
            } else if (Array.isArray(data?.data)) {
                items = data.data;
            } else if (Array.isArray(data?.customers)) {
                items = data.customers;
            }

            setCustomers(items);
        } catch (err) {
            console.error(
                "CUSTOMER REPORT ERROR:",
                err
            );

            setError(
                err.response?.data?.detail ||
                err.response?.data?.error ||
                "Failed to load customer report."
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadCustomerReport();
    }, []);

    const filteredCustomers = useMemo(() => {
        const keyword = search
            .trim()
            .toLowerCase();

        if (!keyword) {
            return customers;
        }

        return customers.filter((customer) => {
            const name = String(
                customer.name ||
                customer.customer_name ||
                customer.username ||
                customer.user?.username ||
                ""
            ).toLowerCase();

            const email = String(
                customer.email ||
                customer.customer_email ||
                customer.user?.email ||
                ""
            ).toLowerCase();

            return (
                name.includes(keyword) ||
                email.includes(keyword)
            );
        });
    }, [customers, search]);

    function getCustomerName(customer) {
        return (
            customer.name ||
            customer.customer_name ||
            customer.username ||
            customer.user?.username ||
            "Unknown Customer"
        );
    }

    function getEmail(customer) {
        return (
            customer.email ||
            customer.customer_email ||
            customer.user?.email ||
            "-"
        );
    }

    function getOrders(customer) {
        return (
            customer.total_orders ??
            customer.orders_count ??
            customer.order_count ??
            customer.orders ??
            0
        );
    }

    function getSpent(customer) {
        return (
            customer.total_spent ??
            customer.total_purchase ??
            customer.total_amount ??
            customer.spent ??
            customer.revenue ??
            0
        );
    }

    function getLastOrder(customer) {
        return (
            customer.last_order_date ||
            customer.last_order ||
            customer.last_purchase ||
            customer.updated_at ||
            "-"
        );
    }

    function formatAmount(value) {
        const number = Number(value);

        if (Number.isNaN(number)) {
            return "৳ 0.00";
        }

        return `৳ ${number.toLocaleString("en-BD", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    }

    function formatDate(value) {
        if (!value || value === "-") {
            return "-";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleDateString("en-BD", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    }

    const totalOrders = customers.reduce(
        (total, customer) =>
            total + Number(getOrders(customer) || 0),
        0
    );

    const totalRevenue = customers.reduce(
        (total, customer) =>
            total + Number(getSpent(customer) || 0),
        0
    );

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
                        Customer Report
                    </h1>

                    <p className="
                        text-gray-500
                        mt-1
                    ">
                        Customer activity and purchasing overview
                    </p>
                </div>

                <button
                    onClick={loadCustomerReport}
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

            {/* Summary Cards */}
            <div className="
                grid
                grid-cols-1
                sm:grid-cols-2
                lg:grid-cols-3
                gap-4
                mb-6
            ">

                {/* Customers */}
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
                        Customers
                    </p>

                    <p className="
                        text-2xl
                        font-bold
                        mt-1
                    ">
                        {customers.length}
                    </p>

                </div>

                {/* Orders */}
                <div className="
                    bg-white
                    rounded-xl
                    shadow
                    p-5
                    border-l-4
                    border-purple-500
                ">

                    <p className="
                        text-sm
                        text-gray-500
                    ">
                        Total Orders
                    </p>

                    <p className="
                        text-2xl
                        font-bold
                        text-purple-600
                        mt-1
                    ">
                        {totalOrders}
                    </p>

                </div>

                {/* Revenue */}
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
                        Total Customer Spend
                    </p>

                    <p className="
                        text-2xl
                        font-bold
                        text-green-600
                        mt-1
                    ">
                        {formatAmount(totalRevenue)}
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
                    placeholder="Search customer name or email..."
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
                        focus:ring-blue-500
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
                        border-blue-500
                        mx-auto
                    " />

                    <p className="
                        text-gray-500
                        mt-4
                    ">
                        Loading customer report...
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
                                        #
                                    </th>

                                    <th className="p-4 text-left">
                                        Customer
                                    </th>

                                    <th className="p-4 text-left">
                                        Email
                                    </th>

                                    <th className="p-4 text-left">
                                        Orders
                                    </th>

                                    <th className="p-4 text-left">
                                        Total Spent
                                    </th>

                                    <th className="p-4 text-left">
                                        Last Order
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {filteredCustomers.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="6"
                                            className="
                                                p-10
                                                text-center
                                                text-gray-500
                                            "
                                        >
                                            No customer data found.
                                        </td>

                                    </tr>

                                ) : (

                                    filteredCustomers.map(
                                        (customer, index) => (

                                            <tr
                                                key={
                                                    customer.id ||
                                                    customer.user_id ||
                                                    index
                                                }
                                                className="
                                                    border-b
                                                    hover:bg-gray-50
                                                "
                                            >

                                                {/* Number */}
                                                <td className="
                                                    p-4
                                                    font-semibold
                                                    text-gray-500
                                                ">
                                                    {index + 1}
                                                </td>

                                                {/* Customer */}
                                                <td className="p-4">

                                                    <p className="
                                                        font-semibold
                                                    ">
                                                        {getCustomerName(
                                                            customer
                                                        )}
                                                    </p>

                                                </td>

                                                {/* Email */}
                                                <td className="p-4">

                                                    <span className="
                                                        text-gray-600
                                                    ">
                                                        {getEmail(
                                                            customer
                                                        )}
                                                    </span>

                                                </td>

                                                {/* Orders */}
                                                <td className="p-4">

                                                    <span className="
                                                        inline-flex
                                                        px-3
                                                        py-1
                                                        rounded-full
                                                        bg-purple-100
                                                        text-purple-700
                                                        font-semibold
                                                        text-sm
                                                    ">
                                                        {getOrders(
                                                            customer
                                                        )}
                                                    </span>

                                                </td>

                                                {/* Total Spent */}
                                                <td className="p-4">

                                                    <span className="
                                                        font-bold
                                                        text-green-600
                                                    ">
                                                        {formatAmount(
                                                            getSpent(
                                                                customer
                                                            )
                                                        )}
                                                    </span>

                                                </td>

                                                {/* Last Order */}
                                                <td className="
                                                    p-4
                                                    text-sm
                                                    text-gray-500
                                                ">
                                                    {formatDate(
                                                        getLastOrder(
                                                            customer
                                                        )
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