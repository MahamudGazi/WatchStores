import { useEffect, useMemo, useState } from "react";
import {
    BarChart3,
    TrendingUp,
    ShoppingBag,
    DollarSign,
    Package,
    Users,
    RefreshCw,
    AlertCircle,
} from "lucide-react";

import {
    getDashboardStats,
    getMonthlySales,
    getOrderStatusChart,
    getTopProducts,
    getTopCustomers,
} from "../../../api/admin";


// =====================================================
// HELPERS
// =====================================================

const formatMoney = (value) => {
    const number = Number(value || 0);

    return `৳${number.toLocaleString("en-BD", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};


const formatNumber = (value) => {
    return Number(value || 0).toLocaleString("en-BD");
};


const getArray = (value) => {
    if (Array.isArray(value)) {
        return value;
    }

    if (Array.isArray(value?.data)) {
        return value.data;
    }

    if (Array.isArray(value?.results)) {
        return value.results;
    }

    return [];
};


// =====================================================
// CARD
// =====================================================

function StatCard({
    title,
    value,
    icon: Icon,
    description,
    iconClass = "text-blue-400",
}) {
    return (
        <div
            className="
                rounded-2xl
                border
                border-zinc-800
                bg-zinc-950
                p-5
                shadow-lg
                transition
                hover:border-zinc-700
            "
        >
            <div className="flex items-start justify-between gap-4">

                <div className="min-w-0">

                    <p
                        className="
                            text-xs
                            font-medium
                            uppercase
                            tracking-wider
                            text-zinc-500
                        "
                    >
                        {title}
                    </p>

                    <h3
                        className="
                            mt-2
                            truncate
                            text-2xl
                            font-bold
                            text-white
                        "
                    >
                        {value}
                    </h3>

                    {description && (
                        <p
                            className="
                                mt-1
                                text-xs
                                text-zinc-500
                            "
                        >
                            {description}
                        </p>
                    )}

                </div>

                <div
                    className="
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-zinc-900
                    "
                >
                    <Icon
                        size={21}
                        className={iconClass}
                    />
                </div>

            </div>
        </div>
    );
}


// =====================================================
// SECTION CARD
// =====================================================

function SectionCard({
    title,
    icon: Icon,
    children,
    rightContent,
}) {
    return (
        <div
            className="
                overflow-hidden
                rounded-2xl
                border
                border-zinc-800
                bg-zinc-950
                shadow-lg
            "
        >

            <div
                className="
                    flex
                    items-center
                    justify-between
                    gap-3
                    border-b
                    border-zinc-800
                    px-5
                    py-4
                "
            >

                <div className="flex items-center gap-3">

                    <div
                        className="
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-lg
                            bg-zinc-900
                        "
                    >
                        <Icon
                            size={17}
                            className="text-amber-400"
                        />
                    </div>

                    <h2
                        className="
                            text-sm
                            font-semibold
                            text-white
                        "
                    >
                        {title}
                    </h2>

                </div>

                {rightContent}

            </div>

            <div className="p-5">
                {children}
            </div>

        </div>
    );
}


// =====================================================
// MONTHLY SALES CHART
// =====================================================

function MonthlySalesChart({ data }) {

    const chartData = useMemo(() => {

        return getArray(data).map((item, index) => {

            const label =
                item.month ??
                item.name ??
                item.label ??
                item.period ??
                `Month ${index + 1}`;

            const revenue = Number(
                item.revenue ??
                item.total_revenue ??
                item.sales ??
                item.amount ??
                item.total ??
                0
            );

            const orders = Number(
                item.orders ??
                item.order_count ??
                item.count ??
                0
            );

            return {
                label,
                revenue,
                orders,
            };

        });

    }, [data]);


    if (!chartData.length) {

        return (
            <div
                className="
                    flex
                    min-h-[280px]
                    items-center
                    justify-center
                    text-sm
                    text-zinc-500
                "
            >
                No monthly sales data available.
            </div>
        );

    }


    const maxRevenue = Math.max(
        ...chartData.map(
            (item) => item.revenue
        ),
        1
    );


    return (
        <div className="overflow-x-auto">

            <div
                className="
                    flex
                    min-w-[620px]
                    items-end
                    gap-4
                "
                style={{
                    height: "280px",
                }}
            >

                {chartData.map(
                    (item, index) => {

                        const height =
                            Math.max(
                                8,
                                (item.revenue /
                                    maxRevenue) *
                                    210
                            );

                        return (
                            <div
                                key={`${item.label}-${index}`}
                                className="
                                    flex
                                    h-full
                                    min-w-[48px]
                                    flex-1
                                    flex-col
                                    items-center
                                    justify-end
                                    gap-2
                                "
                            >

                                <div
                                    className="
                                        text-[10px]
                                        font-medium
                                        text-zinc-400
                                    "
                                >
                                    {formatMoney(
                                        item.revenue
                                    )}
                                </div>

                                <div
                                    className="
                                        flex
                                        w-full
                                        items-end
                                        justify-center
                                    "
                                    style={{
                                        height: "215px",
                                    }}
                                >

                                    <div
                                        className="
                                            w-full
                                            max-w-[42px]
                                            rounded-t-lg
                                            bg-amber-400
                                            transition-all
                                            duration-300
                                            hover:bg-amber-300
                                        "
                                        style={{
                                            height: `${height}px`,
                                        }}
                                        title={`${item.label}: ${formatMoney(
                                            item.revenue
                                        )}`}
                                    />

                                </div>

                                <span
                                    className="
                                        max-w-[70px]
                                        truncate
                                        text-[10px]
                                        text-zinc-500
                                    "
                                >
                                    {item.label}
                                </span>

                            </div>
                        );
                    }
                )}

            </div>

        </div>
    );
}


// =====================================================
// ORDER STATUS
// =====================================================

function OrderStatusChart({ data }) {

    const chartData = useMemo(() => {

        return getArray(data).map(
            (item, index) => {

                const name =
                    item.status ??
                    item.name ??
                    item.label ??
                    `Status ${index + 1}`;

                const value = Number(
                    item.count ??
                    item.orders ??
                    item.total ??
                    item.value ??
                    0
                );

                return {
                    name,
                    value,
                };

            }
        );

    }, [data]);


    if (!chartData.length) {

        return (
            <div
                className="
                    flex
                    min-h-[220px]
                    items-center
                    justify-center
                    text-sm
                    text-zinc-500
                "
            >
                No order status data available.
            </div>
        );

    }


    const total = chartData.reduce(
        (sum, item) =>
            sum + item.value,
        0
    );


    return (
        <div className="space-y-4">

            {chartData.map(
                (item, index) => {

                    const percentage =
                        total > 0
                            ? (item.value /
                                  total) *
                              100
                            : 0;

                    return (
                        <div
                            key={`${item.name}-${index}`}
                        >

                            <div
                                className="
                                    mb-2
                                    flex
                                    items-center
                                    justify-between
                                    gap-3
                                "
                            >

                                <span
                                    className="
                                        truncate
                                        text-xs
                                        font-medium
                                        text-zinc-300
                                    "
                                >
                                    {item.name}
                                </span>

                                <span
                                    className="
                                        shrink-0
                                        text-xs
                                        text-zinc-500
                                    "
                                >
                                    {formatNumber(
                                        item.value
                                    )}{" "}
                                    ({percentage.toFixed(1)}%)
                                </span>

                            </div>

                            <div
                                className="
                                    h-2
                                    overflow-hidden
                                    rounded-full
                                    bg-zinc-800
                                "
                            >

                                <div
                                    className="
                                        h-full
                                        rounded-full
                                        bg-amber-400
                                        transition-all
                                        duration-500
                                    "
                                    style={{
                                        width: `${percentage}%`,
                                    }}
                                />

                            </div>

                        </div>
                    );

                }
            )}

        </div>
    );
}


// =====================================================
// TOP PRODUCTS
// =====================================================

function TopProductsList({ data }) {

    const products = useMemo(() => {

        return getArray(data).slice(0, 5);

    }, [data]);


    if (!products.length) {

        return (
            <p className="text-sm text-zinc-500">
                No product data available.
            </p>
        );

    }


    return (
        <div className="space-y-3">

            {products.map(
                (product, index) => {

                    const name =
                        product.name ??
                        product.product_name ??
                        product.title ??
                        `Product ${index + 1}`;

                    const quantity = Number(
                        product.quantity ??
                        product.total_quantity ??
                        product.sold ??
                        product.sales_count ??
                        product.count ??
                        0
                    );

                    const revenue = Number(
                        product.revenue ??
                        product.total_revenue ??
                        product.sales ??
                        0
                    );

                    return (
                        <div
                            key={
                                product.id ??
                                `${name}-${index}`
                            }
                            className="
                                flex
                                items-center
                                gap-3
                                rounded-xl
                                bg-zinc-900
                                p-3
                            "
                        >

                            <div
                                className="
                                    flex
                                    h-8
                                    w-8
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-lg
                                    bg-zinc-800
                                    text-xs
                                    font-bold
                                    text-amber-400
                                "
                            >
                                #{index + 1}
                            </div>

                            <div className="min-w-0 flex-1">

                                <p
                                    className="
                                        truncate
                                        text-xs
                                        font-semibold
                                        text-white
                                    "
                                >
                                    {name}
                                </p>

                                <p
                                    className="
                                        mt-1
                                        text-[10px]
                                        text-zinc-500
                                    "
                                >
                                    {formatNumber(
                                        quantity
                                    )} sold
                                </p>

                            </div>

                            <div
                                className="
                                    shrink-0
                                    text-right
                                "
                            >
                                <p
                                    className="
                                        text-xs
                                        font-semibold
                                        text-emerald-400
                                    "
                                >
                                    {formatMoney(
                                        revenue
                                    )}
                                </p>
                            </div>

                        </div>
                    );

                }
            )}

        </div>
    );
}


// =====================================================
// TOP CUSTOMERS
// =====================================================

function TopCustomersList({ data }) {

    const customers = useMemo(() => {

        return getArray(data).slice(0, 5);

    }, [data]);


    if (!customers.length) {

        return (
            <p className="text-sm text-zinc-500">
                No customer data available.
            </p>
        );

    }


    return (
        <div className="space-y-3">

            {customers.map(
                (customer, index) => {

                    const name =
                        customer.name ??
                        customer.full_name ??
                        customer.username ??
                        customer.email ??
                        `Customer ${index + 1}`;

                    const orders = Number(
                        customer.orders ??
                        customer.order_count ??
                        customer.total_orders ??
                        customer.count ??
                        0
                    );

                    const spent = Number(
                        customer.total_spent ??
                        customer.spent ??
                        customer.revenue ??
                        customer.total ??
                        0
                    );

                    return (
                        <div
                            key={
                                customer.id ??
                                `${name}-${index}`
                            }
                            className="
                                flex
                                items-center
                                gap-3
                                rounded-xl
                                bg-zinc-900
                                p-3
                            "
                        >

                            <div
                                className="
                                    flex
                                    h-9
                                    w-9
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-gradient-to-br
                                    from-blue-500
                                    to-purple-600
                                    text-[10px]
                                    font-bold
                                    text-white
                                "
                            >
                                {name
                                    .split(" ")
                                    .map(
                                        (part) =>
                                            part[0]
                                    )
                                    .join("")
                                    .slice(0, 2)
                                    .toUpperCase()}
                            </div>

                            <div className="min-w-0 flex-1">

                                <p
                                    className="
                                        truncate
                                        text-xs
                                        font-semibold
                                        text-white
                                    "
                                >
                                    {name}
                                </p>

                                <p
                                    className="
                                        mt-1
                                        text-[10px]
                                        text-zinc-500
                                    "
                                >
                                    {formatNumber(
                                        orders
                                    )} orders
                                </p>

                            </div>

                            <div
                                className="
                                    shrink-0
                                    text-right
                                "
                            >
                                <p
                                    className="
                                        text-xs
                                        font-semibold
                                        text-emerald-400
                                    "
                                >
                                    {formatMoney(
                                        spent
                                    )}
                                </p>
                            </div>

                        </div>
                    );

                }
            )}

        </div>
    );
}


// =====================================================
// MAIN COMPONENT
// =====================================================

export default function AdminAnalytics() {

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState(null);

    const [stats, setStats] =
        useState(null);

    const [monthlySales, setMonthlySales] =
        useState([]);

    const [orderStatus, setOrderStatus] =
        useState([]);

    const [topProducts, setTopProducts] =
        useState([]);

    const [topCustomers, setTopCustomers] =
        useState([]);


    // =================================================
    // LOAD DATA
    // =================================================

    const loadAnalytics = async (
        isRefresh = false
    ) => {

        try {

            setError(null);

            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }


            const results =
                await Promise.allSettled([

                    getDashboardStats(),

                    getMonthlySales(),

                    getOrderStatusChart(),

                    getTopProducts(),

                    getTopCustomers(),

                ]);


            const [
                statsResult,
                monthlyResult,
                statusResult,
                productsResult,
                customersResult,
            ] = results;


            // -----------------------------------------
            // STATS
            // -----------------------------------------

            if (
                statsResult.status ===
                "fulfilled"
            ) {

                setStats(
                    statsResult.value
                );

            }


            // -----------------------------------------
            // MONTHLY SALES
            // -----------------------------------------

            if (
                monthlyResult.status ===
                "fulfilled"
            ) {

                setMonthlySales(
                    monthlyResult.value
                );

            }


            // -----------------------------------------
            // ORDER STATUS
            // -----------------------------------------

            if (
                statusResult.status ===
                "fulfilled"
            ) {

                setOrderStatus(
                    statusResult.value
                );

            }


            // -----------------------------------------
            // PRODUCTS
            // -----------------------------------------

            if (
                productsResult.status ===
                "fulfilled"
            ) {

                setTopProducts(
                    productsResult.value
                );

            }


            // -----------------------------------------
            // CUSTOMERS
            // -----------------------------------------

            if (
                customersResult.status ===
                "fulfilled"
            ) {

                setTopCustomers(
                    customersResult.value
                );

            }


            // -----------------------------------------
            // CHECK ERRORS
            // -----------------------------------------

            const failed =
                results.filter(
                    (result) =>
                        result.status ===
                        "rejected"
                );


            if (failed.length === results.length) {

                throw new Error(
                    "Unable to load analytics data."
                );

            }


            if (failed.length > 0) {

                console.warn(
                    "Some analytics APIs failed:",
                    failed
                );

            }

        } catch (err) {

            console.error(
                "ANALYTICS LOAD ERROR:",
                err
            );

            setError(
                err?.response?.data?.detail ||
                err?.message ||
                "Failed to load analytics."
            );

        } finally {

            setLoading(false);
            setRefreshing(false);

        }

    };


    // =================================================
    // INITIAL LOAD
    // =================================================

    useEffect(() => {

        loadAnalytics();

    }, []);


    // =================================================
    // EXTRACT STATS
    // =================================================

    const analytics = useMemo(() => {

        const source =
            stats?.data ??
            stats ??
            {};

        return {

            revenue:
                source.revenue ??
                source.total_revenue ??
                source.grand_total ??
                0,

            orders:
                source.orders ??
                source.total_orders ??
                source.order_count ??
                0,

            customers:
                source.customers ??
                source.total_customers ??
                source.customer_count ??
                0,

            products:
                source.products ??
                source.total_products ??
                source.product_count ??
                0,

            averageOrder:
                source.average_order_value ??
                source.avg_order_value ??
                source.average_order ??
                0,

        };

    }, [stats]);


    // =================================================
    // LOADING
    // =================================================

    if (loading) {

        return (
            <div
                className="
                    min-h-[70vh]
                    bg-[#09090b]
                    p-6
                "
            >

                <div
                    className="
                        mx-auto
                        max-w-7xl
                    "
                >

                    <div
                        className="
                            mb-6
                            h-8
                            w-52
                            animate-pulse
                            rounded-lg
                            bg-zinc-800
                        "
                    />

                    <div
                        className="
                            grid
                            gap-4
                            sm:grid-cols-2
                            lg:grid-cols-4
                        "
                    >

                        {[1, 2, 3, 4].map(
                            (item) => (
                                <div
                                    key={item}
                                    className="
                                        h-28
                                        animate-pulse
                                        rounded-2xl
                                        bg-zinc-900
                                    "
                                />
                            )
                        )}

                    </div>

                </div>

            </div>
        );

    }


    // =================================================
    // PAGE
    // =================================================

    return (
        <div
            className="
                min-h-screen
                bg-[#09090b]
                p-4
                text-white
                sm:p-6
                lg:p-8
            "
        >

            <div
                className="
                    mx-auto
                    max-w-7xl
                "
            >

                {/* =====================================
                    HEADER
                ===================================== */}

                <div
                    className="
                        mb-6
                        flex
                        flex-col
                        gap-4
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                    "
                >

                    <div>

                        <div
                            className="
                                flex
                                items-center
                                gap-3
                            "
                        >

                            <div
                                className="
                                    flex
                                    h-10
                                    w-10
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-amber-400
                                "
                            >
                                <BarChart3
                                    size={21}
                                    className="text-black"
                                />
                            </div>

                            <div>

                                <h1
                                    className="
                                        text-xl
                                        font-bold
                                        sm:text-2xl
                                    "
                                >
                                    Analytics
                                </h1>

                                <p
                                    className="
                                        mt-1
                                        text-xs
                                        text-zinc-500
                                    "
                                >
                                    Revenue, orders and
                                    performance overview
                                </p>

                            </div>

                        </div>

                    </div>


                    <button
                        type="button"
                        onClick={() =>
                            loadAnalytics(true)
                        }
                        disabled={refreshing}
                        className="
                            inline-flex
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            border
                            border-zinc-700
                            bg-zinc-900
                            px-4
                            py-2.5
                            text-xs
                            font-semibold
                            text-zinc-300
                            transition
                            hover:border-zinc-600
                            hover:bg-zinc-800
                            hover:text-white
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >

                        <RefreshCw
                            size={15}
                            className={
                                refreshing
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        {refreshing
                            ? "Refreshing..."
                            : "Refresh"}

                    </button>

                </div>


                {/* =====================================
                    ERROR
                ===================================== */}

                {error && (
                    <div
                        className="
                            mb-6
                            flex
                            items-start
                            gap-3
                            rounded-xl
                            border
                            border-red-500/20
                            bg-red-500/10
                            p-4
                            text-red-300
                        "
                    >

                        <AlertCircle
                            size={18}
                            className="mt-0.5 shrink-0"
                        />

                        <div>

                            <p
                                className="
                                    text-sm
                                    font-semibold
                                "
                            >
                                Analytics loading issue
                            </p>

                            <p
                                className="
                                    mt-1
                                    text-xs
                                    text-red-300/70
                                "
                            >
                                {error}
                            </p>

                        </div>

                    </div>
                )}


                {/* =====================================
                    STATS
                ===================================== */}

                <div
                    className="
                        mb-6
                        grid
                        gap-4
                        sm:grid-cols-2
                        lg:grid-cols-4
                    "
                >

                    <StatCard
                        title="Total Revenue"
                        value={formatMoney(
                            analytics.revenue
                        )}
                        icon={DollarSign}
                        description="Overall store revenue"
                        iconClass="text-emerald-400"
                    />

                    <StatCard
                        title="Total Orders"
                        value={formatNumber(
                            analytics.orders
                        )}
                        icon={ShoppingBag}
                        description="Orders processed"
                        iconClass="text-blue-400"
                    />

                    <StatCard
                        title="Customers"
                        value={formatNumber(
                            analytics.customers
                        )}
                        icon={Users}
                        description="Registered customers"
                        iconClass="text-purple-400"
                    />

                    <StatCard
                        title="Products"
                        value={formatNumber(
                            analytics.products
                        )}
                        icon={Package}
                        description="Products in catalog"
                        iconClass="text-orange-400"
                    />

                </div>


                {/* =====================================
                    AVERAGE ORDER
                ===================================== */}

                <div className="mb-6">

                    <div
                        className="
                            rounded-2xl
                            border
                            border-zinc-800
                            bg-zinc-950
                            p-5
                            shadow-lg
                        "
                    >

                        <div
                            className="
                                flex
                                items-center
                                gap-3
                            "
                        >

                            <div
                                className="
                                    flex
                                    h-10
                                    w-10
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-zinc-900
                                "
                            >
                                <TrendingUp
                                    size={18}
                                    className="text-amber-400"
                                />
                            </div>

                            <div>

                                <p
                                    className="
                                        text-xs
                                        uppercase
                                        tracking-wider
                                        text-zinc-500
                                    "
                                >
                                    Average Order Value
                                </p>

                                <p
                                    className="
                                        mt-1
                                        text-xl
                                        font-bold
                                        text-white
                                    "
                                >
                                    {formatMoney(
                                        analytics.averageOrder ||
                                        (
                                            Number(
                                                analytics.revenue
                                            ) /
                                            Math.max(
                                                Number(
                                                    analytics.orders
                                                ),
                                                1
                                            )
                                        )
                                    )}
                                </p>

                            </div>

                        </div>

                    </div>

                </div>


                {/* =====================================
                    MAIN ANALYTICS
                ===================================== */}

                <div
                    className="
                        mb-6
                        grid
                        gap-6
                        lg:grid-cols-2
                    "
                >

                    {/* MONTHLY SALES */}

                    <SectionCard
                        title="Monthly Sales"
                        icon={TrendingUp}
                    >

                        <MonthlySalesChart
                            data={monthlySales}
                        />

                    </SectionCard>


                    {/* ORDER STATUS */}

                    <SectionCard
                        title="Order Status"
                        icon={ShoppingBag}
                    >

                        <OrderStatusChart
                            data={orderStatus}
                        />

                    </SectionCard>

                </div>


                {/* =====================================
                    TOP DATA
                ===================================== */}

                <div
                    className="
                        grid
                        gap-6
                        lg:grid-cols-2
                    "
                >

                    <SectionCard
                        title="Top Products"
                        icon={Package}
                    >

                        <TopProductsList
                            data={topProducts}
                        />

                    </SectionCard>


                    <SectionCard
                        title="Top Customers"
                        icon={Users}
                    >

                        <TopCustomersList
                            data={topCustomers}
                        />

                    </SectionCard>

                </div>

            </div>

        </div>
    );
}