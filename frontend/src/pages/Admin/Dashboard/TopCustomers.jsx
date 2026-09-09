import { useEffect, useState } from "react";
import { ArrowLeft, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { getTopCustomers } from "../../../api/admin";

export default function TopCustomers() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadCustomers() {
            try {
                setLoading(true);

                const response = await getTopCustomers();

                console.log("TOP CUSTOMERS:", response);

                const data =
                    response?.data ||
                    response?.results ||
                    response ||
                    [];

                setCustomers(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Top customers error:", err);

                setError(
                    err.response?.data?.detail ||
                    err.response?.data?.message ||
                    "Failed to load top customers."
                );
            } finally {
                setLoading(false);
            }
        }

        loadCustomers();
    }, []);

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <div
                className="
                    w-full
                    min-w-0
                    max-w-full
                    overflow-hidden
                    bg-gray-100
                    p-3

                    sm:p-4

                    md:p-5

                    lg:p-6

                    xl:p-7

                    2xl:p-8
                "
            >
                <div
                    className="
                        mx-auto
                        w-full
                        min-w-0
                        max-w-full
                    "
                >
                    <div
                        className="
                            w-full
                            rounded-2xl
                            bg-white
                            p-8
                            text-center
                            shadow-sm

                            sm:p-10

                            lg:p-12
                        "
                    >
                        Loading top customers...
                    </div>
                </div>
            </div>
        );
    }

    // ==========================================
    // ERROR
    // ==========================================

    if (error) {
        return (
            <div
                className="
                    w-full
                    min-w-0
                    max-w-full
                    overflow-hidden
                    bg-gray-100
                    p-3

                    sm:p-4

                    md:p-5

                    lg:p-6

                    xl:p-7

                    2xl:p-8
                "
            >
                <div
                    className="
                        mx-auto
                        w-full
                        min-w-0
                        max-w-full
                    "
                >
                    <div
                        className="
                            w-full
                            min-w-0
                            rounded-2xl
                            border
                            border-red-200
                            bg-red-50
                            p-5
                            text-red-600

                            sm:p-6

                            lg:p-7
                        "
                    >
                        <p className="break-words">
                            {error}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // ==========================================
    // MAIN UI
    // ==========================================

    return (
        <div
            className="
                w-full
                min-w-0
                max-w-full
                overflow-hidden
                bg-gray-100
                p-3

                sm:p-4

                md:p-5

                lg:p-6

                xl:p-7

                2xl:p-8
            "
        >
            <div
                className="
                    mx-auto
                    w-full
                    min-w-0
                    max-w-full
                "
            >
                {/* =====================================
                    HEADER
                ====================================== */}

                <div
                    className="
                        mb-5
                        flex
                        min-w-0
                        items-start
                        gap-3

                        sm:mb-6
                        sm:items-center

                        lg:mb-7

                        xl:mb-8
                    "
                >
                    {/* BACK BUTTON */}

                    <Link
                        to="/admin/dashboard"
                        className="
                            flex
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            bg-white
                            p-2
                            shadow-sm
                            transition
                            hover:bg-gray-50
                        "
                    >
                        <ArrowLeft size={20} />
                    </Link>

                    {/* TITLE */}

                    <div className="min-w-0 flex-1">
                        <h1
                            className="
                                truncate
                                text-xl
                                font-bold
                                text-gray-900

                                sm:text-2xl

                                lg:text-3xl
                            "
                        >
                            Top Customers
                        </h1>

                        <p
                            className="
                                mt-1
                                break-words
                                text-xs
                                text-gray-500

                                sm:text-sm
                            "
                        >
                            Your highest-value customers.
                        </p>
                    </div>
                </div>

                {/* =====================================
                    MAIN CARD
                ====================================== */}

                <div
                    className="
                        w-full
                        min-w-0
                        overflow-hidden
                        rounded-2xl
                        bg-white
                        shadow-sm
                    "
                >
                    {/* CARD HEADER */}

                    <div
                        className="
                            w-full
                            min-w-0
                            border-b
                            p-4

                            sm:p-5

                            md:p-6

                            lg:p-7

                            xl:p-8
                        "
                    >
                        <div
                            className="
                                flex
                                min-w-0
                                items-center
                                gap-3
                            "
                        >
                            {/* ICON */}

                            <div
                                className="
                                    flex
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-pink-100
                                    p-2.5
                                    text-pink-600

                                    sm:p-3
                                "
                            >
                                <Users
                                    size={22}
                                    className="sm:h-6 sm:w-6"
                                />
                            </div>

                            {/* TITLE */}

                            <h2
                                className="
                                    min-w-0
                                    truncate
                                    text-lg
                                    font-bold
                                    text-gray-900

                                    sm:text-xl

                                    lg:text-2xl
                                "
                            >
                                Best Customers
                            </h2>
                        </div>
                    </div>

                    {/* =====================================
                        TABLE
                    ====================================== */}

                    <div
                        className="
                            w-full
                            min-w-0
                            max-w-full
                            overflow-x-auto
                            overscroll-x-contain
                        "
                    >
                        <table
                            className="
                                w-full
                                min-w-[600px]
                                border-collapse

                                lg:min-w-0
                            "
                        >
                            {/* TABLE HEAD */}

                            <thead>
                                <tr
                                    className="
                                        bg-gray-50
                                        text-left
                                        text-xs
                                        text-gray-500

                                        sm:text-sm
                                    "
                                >
                                    <th
                                        className="
                                            whitespace-nowrap
                                            px-4
                                            py-3
                                            font-medium

                                            sm:px-5
                                            sm:py-4

                                            lg:px-6

                                            xl:px-7
                                        "
                                    >
                                        #
                                    </th>

                                    <th
                                        className="
                                            whitespace-nowrap
                                            px-4
                                            py-3
                                            font-medium

                                            sm:px-5
                                            sm:py-4

                                            lg:px-6

                                            xl:px-7
                                        "
                                    >
                                        Customer
                                    </th>

                                    <th
                                        className="
                                            whitespace-nowrap
                                            px-4
                                            py-3
                                            font-medium

                                            sm:px-5
                                            sm:py-4

                                            lg:px-6

                                            xl:px-7
                                        "
                                    >
                                        Orders
                                    </th>

                                    <th
                                        className="
                                            whitespace-nowrap
                                            px-4
                                            py-3
                                            font-medium

                                            sm:px-5
                                            sm:py-4

                                            lg:px-6

                                            xl:px-7
                                        "
                                    >
                                        Total Spent
                                    </th>
                                </tr>
                            </thead>

                            {/* TABLE BODY */}

                            <tbody className="divide-y divide-gray-100">
                                {customers.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="4"
                                            className="
                                                px-4
                                                py-10
                                                text-center
                                                text-sm
                                                text-gray-500

                                                sm:px-5

                                                lg:px-6

                                                xl:px-7
                                            "
                                        >
                                            No customer data found.
                                        </td>
                                    </tr>
                                ) : (
                                    customers.map(
                                        (customer, index) => (
                                            <tr
                                                key={`${customer.username}-${index}`}
                                                className="
                                                    transition
                                                    hover:bg-gray-50
                                                "
                                            >
                                                {/* RANK */}

                                                <td
                                                    className="
                                                        whitespace-nowrap
                                                        px-4
                                                        py-3
                                                        font-bold
                                                        text-gray-400

                                                        sm:px-5
                                                        sm:py-4

                                                        lg:px-6

                                                        xl:px-7
                                                    "
                                                >
                                                    #{index + 1}
                                                </td>

                                                {/* CUSTOMER */}

                                                <td
                                                    className="
                                                        max-w-[240px]
                                                        px-4
                                                        py-3
                                                        font-semibold
                                                        text-gray-900

                                                        sm:px-5
                                                        sm:py-4

                                                        lg:max-w-none
                                                        lg:px-6

                                                        xl:px-7
                                                    "
                                                >
                                                    <span
                                                        className="
                                                            block
                                                            truncate
                                                        "
                                                        title={
                                                            customer.username
                                                        }
                                                    >
                                                        {
                                                            customer.username
                                                        }
                                                    </span>
                                                </td>

                                                {/* ORDERS */}

                                                <td
                                                    className="
                                                        whitespace-nowrap
                                                        px-4
                                                        py-3
                                                        text-gray-700

                                                        sm:px-5
                                                        sm:py-4

                                                        lg:px-6

                                                        xl:px-7
                                                    "
                                                >
                                                    {customer.orders}
                                                </td>

                                                {/* TOTAL SPENT */}

                                                <td
                                                    className="
                                                        whitespace-nowrap
                                                        px-4
                                                        py-3
                                                        font-bold
                                                        text-green-600

                                                        sm:px-5
                                                        sm:py-4

                                                        lg:px-6

                                                        xl:px-7
                                                    "
                                                >
                                                    ৳{" "}
                                                    {Number(
                                                        customer.spent ||
                                                            0
                                                    ).toLocaleString()}
                                                </td>
                                            </tr>
                                        )
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}