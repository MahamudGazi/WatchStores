import { useEffect, useMemo, useState } from "react";
import {
    Users,
    Search,
    RefreshCw,
    Loader2,
    UserCheck,
    UserX,
    ShoppingBag,
    Wallet,
    Mail,
} from "lucide-react";

import { getAdminCustomers } from "../../../api/admin";

export default function AdminCustomers() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    // =====================================================
    // LOAD CUSTOMERS
    // =====================================================

    const loadCustomers = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const data = await getAdminCustomers();

            setCustomers(
                Array.isArray(data) ? data : []
            );
        } catch (err) {
            console.error(
                "Customers loading error:",
                err
            );

            setError(
                err.response?.data?.message ||
                    err.response?.data?.detail ||
                    "Failed to load customers."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadCustomers();
    }, []);

    // =====================================================
    // SEARCH
    // =====================================================

    const filteredCustomers = useMemo(() => {
        const keyword =
            search.trim().toLowerCase();

        if (!keyword) {
            return customers;
        }

        return customers.filter((customer) => {
            const name =
                `${customer.first_name || ""} ${
                    customer.last_name || ""
                }`.toLowerCase();

            const username =
                customer.username
                    ?.toLowerCase() || "";

            const email =
                customer.email
                    ?.toLowerCase() || "";

            return (
                name.includes(keyword) ||
                username.includes(keyword) ||
                email.includes(keyword) ||
                String(customer.id).includes(
                    keyword
                )
            );
        });
    }, [customers, search]);

    // =====================================================
    // STATISTICS
    // =====================================================

    const totalCustomers =
        customers.length;

    const activeCustomers =
        customers.filter(
            (customer) =>
                customer.is_active
        ).length;

    const inactiveCustomers =
        customers.filter(
            (customer) =>
                !customer.is_active
        ).length;

    const totalOrders =
        customers.reduce(
            (total, customer) =>
                total +
                Number(
                    customer.total_orders || 0
                ),
            0
        );

    const totalSpent =
        customers.reduce(
            (total, customer) =>
                total +
                Number(
                    customer.total_spent || 0
                ),
            0
        );

    // =====================================================
    // CUSTOMER NAME
    // =====================================================

    const getCustomerName = (
        customer
    ) => {
        const fullName =
            `${customer.first_name || ""} ${
                customer.last_name || ""
            }`.trim();

        return (
            fullName ||
            customer.username ||
            "Unknown Customer"
        );
    };

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 p-6 text-white lg:p-8">

                <div className="mb-8">
                    <div className="h-8 w-48 animate-pulse rounded bg-zinc-800" />

                    <div className="mt-3 h-4 w-72 animate-pulse rounded bg-zinc-900" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                    {[1, 2, 3, 4].map(
                        (item) => (
                            <div
                                key={item}
                                className="
                                    h-28
                                    animate-pulse
                                    rounded-2xl
                                    border
                                    border-zinc-800
                                    bg-zinc-900
                                "
                            />
                        )
                    )}

                </div>

                <div className="
                    mt-6
                    h-96
                    animate-pulse
                    rounded-2xl
                    border
                    border-zinc-800
                    bg-zinc-900
                " />

            </div>
        );
    }

    // =====================================================
    // PAGE
    // =====================================================

    return (
        <div className="
            min-h-screen
            bg-zinc-950
            p-4
            text-white
            sm:p-6
            lg:p-8
        ">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="
                mb-8
                flex
                flex-col
                gap-4
                lg:flex-row
                lg:items-center
                lg:justify-between
            ">

                <div>

                    <div className="
                        mb-2
                        flex
                        items-center
                        gap-3
                    ">

                        <div className="
                            flex
                            h-11
                            w-11
                            items-center
                            justify-center
                            rounded-xl
                            bg-violet-500/10
                        ">
                            <Users
                                size={22}
                                className="text-violet-400"
                            />
                        </div>

                        <h1 className="
                            text-2xl
                            font-bold
                            tracking-tight
                            sm:text-3xl
                        ">
                            Customers
                        </h1>

                    </div>

                    <p className="text-sm text-zinc-500">
                        Manage and monitor your customers
                    </p>

                </div>

                <button
                    type="button"
                    onClick={() =>
                        loadCustomers(true)
                    }
                    disabled={refreshing}
                    className="
                        flex
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-zinc-800
                        bg-zinc-900
                        px-4
                        py-3
                        text-sm
                        font-medium
                        text-zinc-300
                        transition
                        hover:bg-zinc-800
                        hover:text-white
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                    "
                >

                    {refreshing ? (
                        <Loader2
                            size={17}
                            className="animate-spin"
                        />
                    ) : (
                        <RefreshCw size={17} />
                    )}

                    Refresh

                </button>

            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
                <div className="
                    mb-6
                    rounded-xl
                    border
                    border-red-500/20
                    bg-red-500/10
                    p-4
                    text-sm
                    text-red-400
                ">
                    {error}
                </div>
            )}

            {/* =================================================
                STAT CARDS
            ================================================= */}

            <div className="
                mb-6
                grid
                gap-4
                sm:grid-cols-2
                xl:grid-cols-4
            ">

                {/* TOTAL */}

                <div className="
                    rounded-2xl
                    border
                    border-zinc-800
                    bg-zinc-900
                    p-5
                ">

                    <div className="
                        flex
                        items-center
                        justify-between
                    ">

                        <div>

                            <p className="
                                text-xs
                                font-medium
                                uppercase
                                tracking-wider
                                text-zinc-500
                            ">
                                Total Customers
                            </p>

                            <p className="
                                mt-2
                                text-2xl
                                font-bold
                            ">
                                {totalCustomers}
                            </p>

                        </div>

                        <div className="
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-xl
                            bg-violet-500/10
                        ">
                            <Users
                                size={19}
                                className="text-violet-400"
                            />
                        </div>

                    </div>

                </div>

                {/* ACTIVE */}

                <div className="
                    rounded-2xl
                    border
                    border-zinc-800
                    bg-zinc-900
                    p-5
                ">

                    <div className="
                        flex
                        items-center
                        justify-between
                    ">

                        <div>

                            <p className="
                                text-xs
                                font-medium
                                uppercase
                                tracking-wider
                                text-zinc-500
                            ">
                                Active
                            </p>

                            <p className="
                                mt-2
                                text-2xl
                                font-bold
                                text-green-400
                            ">
                                {activeCustomers}
                            </p>

                        </div>

                        <div className="
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-xl
                            bg-green-500/10
                        ">
                            <UserCheck
                                size={19}
                                className="text-green-400"
                            />
                        </div>

                    </div>

                </div>

                {/* ORDERS */}

                <div className="
                    rounded-2xl
                    border
                    border-zinc-800
                    bg-zinc-900
                    p-5
                ">

                    <div className="
                        flex
                        items-center
                        justify-between
                    ">

                        <div>

                            <p className="
                                text-xs
                                font-medium
                                uppercase
                                tracking-wider
                                text-zinc-500
                            ">
                                Total Orders
                            </p>

                            <p className="
                                mt-2
                                text-2xl
                                font-bold
                            ">
                                {totalOrders}
                            </p>

                        </div>

                        <div className="
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-xl
                            bg-orange-500/10
                        ">
                            <ShoppingBag
                                size={19}
                                className="text-orange-400"
                            />
                        </div>

                    </div>

                </div>

                {/* SPENT */}

                <div className="
                    rounded-2xl
                    border
                    border-zinc-800
                    bg-zinc-900
                    p-5
                ">

                    <div className="
                        flex
                        items-center
                        justify-between
                    ">

                        <div>

                            <p className="
                                text-xs
                                font-medium
                                uppercase
                                tracking-wider
                                text-zinc-500
                            ">
                                Total Spent
                            </p>

                            <p className="
                                mt-2
                                text-2xl
                                font-bold
                                text-emerald-400
                            ">
                                ৳
                                {totalSpent.toLocaleString(
                                    "en-BD",
                                    {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    }
                                )}
                            </p>

                        </div>

                        <div className="
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-xl
                            bg-emerald-500/10
                        ">
                            <Wallet
                                size={19}
                                className="text-emerald-400"
                            />
                        </div>

                    </div>

                </div>

            </div>

            {/* =================================================
                SEARCH
            ================================================= */}

            <div className="
                mb-6
                flex
                flex-col
                gap-3
                sm:flex-row
                sm:items-center
                sm:justify-between
            ">

                <div className="
                    relative
                    w-full
                    sm:max-w-md
                ">

                    <Search
                        size={18}
                        className="
                            absolute
                            left-3
                            top-1/2
                            -translate-y-1/2
                            text-zinc-500
                        "
                    />

                    <input
                        type="text"
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                        placeholder="Search customer..."
                        className="
                            w-full
                            rounded-xl
                            border
                            border-zinc-800
                            bg-zinc-900
                            py-3
                            pl-10
                            pr-4
                            text-sm
                            text-white
                            outline-none
                            placeholder:text-zinc-600
                            focus:border-violet-500
                        "
                    />

                </div>

                <p className="
                    text-sm
                    text-zinc-500
                ">
                    Showing{" "}
                    <span className="text-zinc-300">
                        {filteredCustomers.length}
                    </span>{" "}
                    of{" "}
                    <span className="text-zinc-300">
                        {totalCustomers}
                    </span>{" "}
                    customers
                </p>

            </div>

            {/* =================================================
                TABLE
            ================================================= */}

            <div className="
                overflow-hidden
                rounded-2xl
                border
                border-zinc-800
                bg-zinc-900
            ">

                {filteredCustomers.length === 0 ? (

                    <div className="
                        flex
                        min-h-[300px]
                        flex-col
                        items-center
                        justify-center
                        px-6
                        text-center
                    ">

                        <Users
                            size={45}
                            className="mb-4 text-zinc-700"
                        />

                        <h2 className="
                            text-lg
                            font-semibold
                        ">
                            No Customers Found
                        </h2>

                        <p className="
                            mt-1
                            text-sm
                            text-zinc-500
                        ">
                            Try another search keyword.
                        </p>

                    </div>

                ) : (

                    <div className="overflow-x-auto">

                        <table className="
                            w-full
                            min-w-[900px]
                        ">

                            <thead>

                                <tr className="
                                    border-b
                                    border-zinc-800
                                    bg-zinc-950
                                ">

                                    <th className="
                                        px-5
                                        py-4
                                        text-left
                                        text-xs
                                        font-semibold
                                        uppercase
                                        tracking-wider
                                        text-zinc-500
                                    ">
                                        ID
                                    </th>

                                    <th className="
                                        px-5
                                        py-4
                                        text-left
                                        text-xs
                                        font-semibold
                                        uppercase
                                        tracking-wider
                                        text-zinc-500
                                    ">
                                        Customer
                                    </th>

                                    <th className="
                                        px-5
                                        py-4
                                        text-left
                                        text-xs
                                        font-semibold
                                        uppercase
                                        tracking-wider
                                        text-zinc-500
                                    ">
                                        Email
                                    </th>

                                    <th className="
                                        px-5
                                        py-4
                                        text-left
                                        text-xs
                                        font-semibold
                                        uppercase
                                        tracking-wider
                                        text-zinc-500
                                    ">
                                        Orders
                                    </th>

                                    <th className="
                                        px-5
                                        py-4
                                        text-left
                                        text-xs
                                        font-semibold
                                        uppercase
                                        tracking-wider
                                        text-zinc-500
                                    ">
                                        Total Spent
                                    </th>

                                    <th className="
                                        px-5
                                        py-4
                                        text-left
                                        text-xs
                                        font-semibold
                                        uppercase
                                        tracking-wider
                                        text-zinc-500
                                    ">
                                        Status
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {filteredCustomers.map(
                                    (customer) => {

                                        const name =
                                            getCustomerName(
                                                customer
                                            );

                                        return (
                                            <tr
                                                key={
                                                    customer.id
                                                }
                                                className="
                                                    border-b
                                                    border-zinc-800
                                                    last:border-0
                                                    transition
                                                    hover:bg-zinc-800/40
                                                "
                                            >

                                                {/* ID */}

                                                <td className="
                                                    px-5
                                                    py-4
                                                ">

                                                    <span className="
                                                        rounded-lg
                                                        bg-zinc-800
                                                        px-2.5
                                                        py-1
                                                        text-xs
                                                        font-medium
                                                        text-zinc-400
                                                    ">
                                                        #
                                                        {
                                                            customer.id
                                                        }
                                                    </span>

                                                </td>

                                                {/* CUSTOMER */}

                                                <td className="
                                                    px-5
                                                    py-4
                                                ">

                                                    <div className="
                                                        flex
                                                        items-center
                                                        gap-3
                                                    ">

                                                        <div className="
                                                            flex
                                                            h-10
                                                            w-10
                                                            shrink-0
                                                            items-center
                                                            justify-center
                                                            rounded-full
                                                            bg-gradient-to-br
                                                            from-violet-500
                                                            to-purple-600
                                                            text-xs
                                                            font-bold
                                                            text-white
                                                        ">
                                                            {name
                                                                .charAt(
                                                                    0
                                                                )
                                                                .toUpperCase()}
                                                        </div>

                                                        <div className="min-w-0">

                                                            <p className="
                                                                truncate
                                                                text-sm
                                                                font-semibold
                                                                text-white
                                                            ">
                                                                {
                                                                    name
                                                                }
                                                            </p>

                                                            {customer.username && (
                                                                <p className="
                                                                    truncate
                                                                    text-xs
                                                                    text-zinc-500
                                                                ">
                                                                    @
                                                                    {
                                                                        customer.username
                                                                    }
                                                                </p>
                                                            )}

                                                        </div>

                                                    </div>

                                                </td>

                                                {/* EMAIL */}

                                                <td className="
                                                    px-5
                                                    py-4
                                                ">

                                                    <div className="
                                                        flex
                                                        items-center
                                                        gap-2
                                                        text-sm
                                                        text-zinc-400
                                                    ">

                                                        <Mail
                                                            size={14}
                                                            className="text-zinc-600"
                                                        />

                                                        <span>
                                                            {
                                                                customer.email ||
                                                                    "—"
                                                            }
                                                        </span>

                                                    </div>

                                                </td>

                                                {/* ORDERS */}

                                                <td className="
                                                    px-5
                                                    py-4
                                                ">

                                                    <span className="
                                                        font-semibold
                                                        text-white
                                                    ">
                                                        {
                                                            customer.total_orders ??
                                                                0
                                                        }
                                                    </span>

                                                </td>

                                                {/* TOTAL SPENT */}

                                                <td className="
                                                    px-5
                                                    py-4
                                                ">

                                                    <span className="
                                                        font-semibold
                                                        text-emerald-400
                                                    ">
                                                        ৳
                                                        {Number(
                                                            customer.total_spent ||
                                                                0
                                                        ).toLocaleString(
                                                            "en-BD",
                                                            {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2,
                                                            }
                                                        )}
                                                    </span>

                                                </td>

                                                {/* STATUS */}

                                                <td className="
                                                    px-5
                                                    py-4
                                                ">

                                                    {customer.is_active ? (

                                                        <span className="
                                                            inline-flex
                                                            items-center
                                                            gap-1.5
                                                            rounded-full
                                                            bg-green-500/10
                                                            px-3
                                                            py-1.5
                                                            text-xs
                                                            font-semibold
                                                            text-green-400
                                                        ">

                                                            <UserCheck
                                                                size={13}
                                                            />

                                                            Active

                                                        </span>

                                                    ) : (

                                                        <span className="
                                                            inline-flex
                                                            items-center
                                                            gap-1.5
                                                            rounded-full
                                                            bg-red-500/10
                                                            px-3
                                                            py-1.5
                                                            text-xs
                                                            font-semibold
                                                            text-red-400
                                                        ">

                                                            <UserX
                                                                size={13}
                                                            />

                                                            Inactive

                                                        </span>

                                                    )}

                                                </td>

                                            </tr>
                                        );
                                    }
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>
    );
}