import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminOrders } from "../../../api/admin";

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ==================================================
    // FILTER STATES
    // ==================================================

    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] = useState("all");
    const [courier, setCourier] = useState("");

    // ==================================================
    // PAGINATION
    // ==================================================

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    // ==================================================
    // SELECTION
    // ==================================================

    const [selectedOrders, setSelectedOrders] = useState([]);

    // ==================================================
    // LOAD ORDERS
    // ==================================================

    useEffect(() => {
        loadOrders();
    }, []);

    async function loadOrders() {
        try {
            setLoading(true);
            setError("");

            const response = await getAdminOrders();

            if (Array.isArray(response)) {
                setOrders(response);
            } else {
                setOrders(response?.results || []);
            }
        } catch (err) {
            console.error("Orders loading error:", err);

            setError(
                err.response?.data?.detail ||
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to load orders."
            );

            setOrders([]);
        } finally {
            setLoading(false);
        }
    }

    // ==================================================
    // SEARCH
    // ==================================================

    function handleSearch() {
        setSearch(searchInput.trim());
        setCurrentPage(1);
        setSelectedOrders([]);
    }

    function handleSearchKeyDown(e) {
        if (e.key === "Enter") {
            handleSearch();
        }
    }


    function handlePrintSelected() {
        if (selectedOrders.length === 0) {
            alert("Please select at least one order to print.");
            return;
        }

        const selected = orders.filter((order) =>
            selectedOrders.includes(order.id)
        );

        const printWindow = window.open(
            "",
            "_blank",
            "width=900,height=700"
        );

        if (!printWindow) {
            alert("Please allow pop-ups to print invoices.");
            return;
        }

        const invoiceHTML = selected
            .map(
                (order) => `
                <div class="invoice">
                    <div class="header">
                        <h1>INVOICE</h1>
                        <p>
                            Invoice:
                            ${order.invoice?.invoice_number ||
                    order.order_number
                    }
                        </p>
                        <p>
                            Order:
                            ${order.order_number}
                        </p>
                    </div>

                    <hr />

                    <div class="customer">
                        <h3>Customer Information</h3>

                        <p>
                            <strong>Name:</strong>
                            ${order.customer?.username || "-"}
                        </p>

                        <p>
                            <strong>Email:</strong>
                            ${order.customer?.email || "-"}
                        </p>

                        <p>
                            <strong>Phone:</strong>
                            ${order.shipping_address?.phone ||
                    "-"
                    }
                        </p>
                    </div>

                    <div class="shipping">
                        <h3>Shipping Address</h3>

                        <p>
                            ${order.shipping_address
                        ?.address_line || "-"
                    }
                        </p>

                        <p>
                            ${order.shipping_address?.city || ""
                    },
                            ${order.shipping_address
                        ?.district || ""
                    }
                        </p>

                        <p>
                            ${order.shipping_address
                        ?.postal_code || ""
                    }
                        </p>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Price</th>
                                <th>Qty</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>

                        <tbody>
                            ${order.items
                        ?.map(
                            (item) => `
                                    <tr>
                                        <td>
                                            ${item.product_name ||
                                "-"
                                }
                                        </td>

                                        <td>
                                            ৳ ${item.price}
                                        </td>

                                        <td>
                                            ${item.quantity}
                                        </td>

                                        <td>
                                            ৳ ${item.subtotal}
                                        </td>
                                    </tr>
                                `
                        )
                        .join("") || ""
                    }
                        </tbody>
                    </table>

                    <div class="totals">
                        <p>
                            <strong>Subtotal:</strong>
                            ৳ ${order.total_price || 0}
                        </p>

                        <p>
                            <strong>Delivery:</strong>
                            ৳ ${order.delivery_charge || 0}
                        </p>

                        <p class="grand">
                            Grand Total:
                            ৳ ${order.grand_total || 0}
                        </p>
                    </div>

                    <div class="footer">
                        <p>Thank you for your purchase.</p>
                    </div>
                </div>
            `
            )
            .join("");

        printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Selected Invoices</title>

            <style>
                * {
                    box-sizing: border-box;
                }

                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 20px;
                    color: #222;
                }

                .invoice {
                    max-width: 800px;
                    margin: 0 auto 40px;
                    padding: 30px;
                    border: 1px solid #ddd;
                    page-break-after: always;
                }

                .invoice:last-child {
                    page-break-after: auto;
                }

                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }

                .header h1 {
                    margin: 0;
                    font-size: 28px;
                }

                .header p {
                    margin: 4px 0;
                }

                .customer,
                .shipping {
                    margin: 20px 0;
                }

                h3 {
                    margin-bottom: 8px;
                }

                p {
                    margin: 5px 0;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 25px;
                }

                th,
                td {
                    border: 1px solid #ddd;
                    padding: 10px;
                    text-align: left;
                }

                th {
                    background: #f3f3f3;
                }

                .totals {
                    margin-top: 25px;
                    margin-left: auto;
                    width: 300px;
                }

                .totals p {
                    display: flex;
                    justify-content: space-between;
                }

                .grand {
                    border-top: 2px solid #222;
                    padding-top: 10px;
                    font-size: 18px;
                    font-weight: bold;
                }

                .footer {
                    margin-top: 40px;
                    text-align: center;
                    color: #777;
                }

                @media print {
                    body {
                        padding: 0;
                    }

                    .invoice {
                        border: none;
                        margin: 0;
                    }
                }
            </style>
        </head>

        <body>
            ${invoiceHTML}

            <script>
                window.onload = function() {
                    window.print();
                };

                window.onafterprint = function() {
                    window.close();
                };
            <\/script>
        </body>
        </html>
    `);

        printWindow.document.close();
    }

    // ==================================================
    // RESET
    // ==================================================

    function resetFilters() {
        setSearchInput("");
        setSearch("");
        setStatusFilter("all");
        setCourier("");
        setCurrentPage(1);
        setSelectedOrders([]);
    }

    // ==================================================
    // FILTERED ORDERS
    // ==================================================

    const filteredOrders = useMemo(() => {
        const keyword = search.toLowerCase().trim();

        return orders.filter((order) => {
            // ----------------------------
            // SEARCH
            // ----------------------------

            const username =
                order.customer?.username?.toLowerCase() || "";

            const email =
                order.customer?.email?.toLowerCase() || "";

            const phone =
                order.shipping_address?.phone?.toLowerCase() || "";

            const orderNumber =
                order.order_number?.toLowerCase() || "";

            const ipAddress =
                order.ip_address?.toLowerCase() || "";

            const invoiceNumber =
                order.invoice?.invoice_number?.toLowerCase() || "";

            const matchesSearch =
                !keyword ||
                username.includes(keyword) ||
                email.includes(keyword) ||
                phone.includes(keyword) ||
                orderNumber.includes(keyword) ||
                ipAddress.includes(keyword) ||
                invoiceNumber.includes(keyword);

            // ----------------------------
            // STATUS
            // ----------------------------

            const matchesStatus =
                statusFilter === "all" ||
                order.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [orders, search, statusFilter]);

    // ==================================================
    // PAGINATION
    // ==================================================

    const totalPages = Math.max(
        1,
        Math.ceil(
            filteredOrders.length / itemsPerPage
        )
    );

    // Prevent invalid page
    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const startIndex =
        (currentPage - 1) * itemsPerPage;

    const paginatedOrders =
        filteredOrders.slice(
            startIndex,
            startIndex + itemsPerPage
        );

    // ==================================================
    // ITEMS PER PAGE
    // ==================================================

    function handleItemsPerPageChange(e) {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
        setSelectedOrders([]);
    }

    // ==================================================
    // STATUS FILTER
    // ==================================================

    function handleStatusChange(e) {
        setStatusFilter(e.target.value);
        setCurrentPage(1);
        setSelectedOrders([]);
    }

    // ==================================================
    // CHECKBOX
    // ==================================================

    function toggleOrder(id) {
        setSelectedOrders((current) => {
            if (current.includes(id)) {
                return current.filter(
                    (orderId) => orderId !== id
                );
            }

            return [...current, id];
        });
    }

    // ==================================================
    // SELECT ALL CURRENT PAGE
    // ==================================================

    const currentPageIds = paginatedOrders.map(
        (order) => order.id
    );

    const allCurrentPageSelected =
        currentPageIds.length > 0 &&
        currentPageIds.every((id) =>
            selectedOrders.includes(id)
        );

    function toggleSelectAll() {
        if (allCurrentPageSelected) {
            setSelectedOrders((current) =>
                current.filter(
                    (id) => !currentPageIds.includes(id)
                )
            );
        } else {
            setSelectedOrders((current) => [
                ...new Set([
                    ...current,
                    ...currentPageIds,
                ]),
            ]);
        }
    }

    // ==================================================
    // PAGINATION
    // ==================================================

    function goToPage(pageNumber) {
        if (
            pageNumber < 1 ||
            pageNumber > totalPages
        ) {
            return;
        }

        setCurrentPage(pageNumber);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }

    // ==================================================
    // STATUS COLORS
    // ==================================================

    const statusColor = {
        Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",

        Confirmed: "bg-blue-100 text-blue-700 border-blue-200",

        Processing: "bg-indigo-100 text-indigo-700 border-indigo-200",

        Shipped: "bg-purple-100 text-purple-700 border-purple-200",

        "Out for Delivery":
            "bg-orange-100 text-orange-700 border-orange-200",

        Delivered: "bg-green-100 text-green-700 border-green-200",

        Cancelled: "bg-red-100 text-red-700 border-red-200",
    };


    const pendingCount = orders.filter(
        (order) => order.status === "Pending"
    ).length;

    const confirmedCount = orders.filter(
        (order) => order.status === "Confirmed"
    ).length;

    const processingCount = orders.filter(
        (order) => order.status === "Processing"
    ).length;

    const shippedCount = orders.filter(
        (order) => order.status === "Shipped"
    ).length;

    const outForDeliveryCount = orders.filter(
        (order) => order.status === "Out for Delivery"
    ).length;

    const deliveredCount = orders.filter(
        (order) => order.status === "Delivered"
    ).length;

    const cancelledCount = orders.filter(
        (order) => order.status === "Cancelled"
    ).length;

    // ==================================================
    // COURIER EXPORT
    // ==================================================

    function handleCourierExport(courierName) {
        if (selectedOrders.length === 0) {
            alert("Please select at least one order.");
            return;
        }

        alert(
            `${courierName} export will be connected to the courier API.`
        );
    }

    // ==================================================
    // RENDER
    // ==================================================

    return (
        <div className="min-h-screen bg-gray-100">

            <div className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-5 sm:py-6 lg:px-8">

                {/* =========================================
                    HEADER
                ========================================= */}

                <div className="mb-6">

                    <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                        Order Management
                    </h1>

                    <p className="mt-1 text-sm text-gray-500 sm:text-base">
                        Manage customer orders
                    </p>

                </div>

                {/* =========================================
                    STATISTICS
                ========================================= */}

                <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">

                    <StatCard
                        title="Total"
                        value={orders.length}
                        className="bg-white"
                    />

                    <StatCard
                        title="Pending"
                        value={pendingCount}
                        className="bg-yellow-50"
                        valueClass="text-yellow-700"
                    />

                    <StatCard
                        title="Confirmed"
                        value={confirmedCount}
                        className="bg-blue-50"
                        valueClass="text-blue-700"
                    />

                    <StatCard
                        title="Processing"
                        value={processingCount}
                        className="bg-indigo-50"
                        valueClass="text-indigo-700"
                    />

                    <StatCard
                        title="Shipped"
                        value={shippedCount}
                        className="bg-purple-50"
                        valueClass="text-purple-700"
                    />

                    <StatCard
                        title="Out for Delivery"
                        value={outForDeliveryCount}
                        className="bg-orange-50"
                        valueClass="text-orange-700"
                    />

                    <StatCard
                        title="Delivered"
                        value={deliveredCount}
                        className="bg-green-50"
                        valueClass="text-green-700"
                    />

                    <StatCard
                        title="Cancelled"
                        value={cancelledCount}
                        className="bg-red-50"
                        valueClass="text-red-700"
                    />



                </div>

                {/* =========================================
                    FILTER AREA
                ========================================= */}

                <div className=" mb-6 rounded-xl bg-[#f1f1f7] p-3 sm:p-4">

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

                        {/* STATUS */}

                        <select
                            value={statusFilter}
                            onChange={handleStatusChange}
                            className="h-10 w-full border border-gray-300 bg-white px-3 text-sm text-gray-600 outline-none focus:border-blue-400"
                        >

                            {/* <option value="Total">
                                AllOrder
                            </option> */}

                            <option value="Cancelled">
                                Cancelled
                            </option>

                            <option value="Confirmed">
                                Confirmed
                            </option>

                            <option value="Delivered">
                                Delivered
                            </option>

                            <option value="Out for Delivery">
                                Out for Delivery
                            </option>

                            <option value="Pending">
                                Pending
                            </option>

                            <option value="Processing">
                                Processing
                            </option>

                            <option value="Shipped">
                                Shipped
                            </option>

                        </select>

                        {/* COURIER */}

                        <select
                            value={courier}
                            onChange={(e) =>
                                setCourier(e.target.value)
                            }
                            className="h-10 w-full border border-gray-300 bg-white px-3 text-sm text-gray-600 outline-none"
                        >
                            <option value="">
                                Select Courier
                            </option>

                            <option value="steadfast">
                                SteadFast
                            </option>

                            <option value="redex">
                                Redex
                            </option>

                            <option value="pathao">
                                Pathao
                            </option>
                        </select>

                        {/* SEARCH */}

                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) =>
                                setSearchInput(e.target.value)
                            }
                            onKeyDown={handleSearchKeyDown}
                            placeholder="Name, Phone, Invoice ID"
                            className="h-10 w-full border border-gray-300 bg-white px-3 text-sm outline-none focus:border-blue-400"
                        />

                        {/* SEARCH BUTTON */}

                        <button
                            type="button"
                            onClick={handleSearch}
                            className="h-10 w-full bg-gray-800 px-4 text-sm font-semibold text-white hover:bg-black"
                        >
                            Search
                        </button>

                    </div>

                    {/* SECOND ROW */}

                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap">

                        {/* PRINT */}

                        <button
                            type="button"
                            onClick={handlePrintSelected}
                            disabled={selectedOrders.length === 0}
                            className="h-10 bg-cyan-500 px-4 text-sm font-semibold text-white hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Print Invoice
                            {selectedOrders.length > 0 && (
                                <span className="ml-2">
                                    ({selectedOrders.length})
                                </span>
                            )}
                        </button>
                        {/* STEADFAST */}

                        <button
                            type="button"
                            onClick={() =>
                                handleCourierExport(
                                    "SteadFast"
                                )
                            }
                            className="h-10 w-full bg-green-500 px-4 text-sm font-semibold text-white hover:bg-green-600 sm:w-auto"
                        >
                            SteadFast Export
                        </button>

                        {/* REDEX */}

                        <button
                            type="button"
                            onClick={() =>
                                handleCourierExport(
                                    "Redex"
                                )
                            }
                            className="h-10 w-full bg-red-500 px-4 text-sm font-semibold text-white hover:bg-red-600 sm:w-auto"
                        >
                            Redex Export
                        </button>

                        {/* PATHAO */}

                        <button
                            type="button"
                            onClick={() =>
                                handleCourierExport(
                                    "Pathao"
                                )
                            }
                            className="h-10 w-full bg-pink-500 px-4 text-sm font-semibold text-white hover:bg-pink-600 sm:w-auto"
                        >
                            Pathao Export
                        </button>

                        {/* RESET */}

                        <button
                            type="button"
                            onClick={resetFilters}
                            className=" h-10 w-full bg-gray-500 px-4 text-sm font-semibold text-white hover:bg-gray-600 sm:w-auto"
                        >
                            Reset
                        </button>

                        {/* SHOW */}

                        <div className="flex h-10 items-center gap-2 sm:ml-auto">

                            <span className="text-sm font-semibold text-gray-500">
                                Show:
                            </span>

                            <select
                                value={itemsPerPage}
                                onChange={
                                    handleItemsPerPageChange
                                }
                                className="h-10 w-20 border border-gray-300 bg-white px-3 text-sm outline-none"
                            >
                                <option value={20}>
                                    20
                                </option>

                                <option value={50}>
                                    50
                                </option>

                                <option value={100}>
                                    100
                                </option>
                            </select>

                        </div>

                    </div>

                </div>

                {/* =========================================
                    RESULTS INFO
                ========================================= */}

                {!loading &&
                    !error &&
                    orders.length > 0 && (

                        <div className="mb-4 flex flex-col gap-2 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">

                            <p>
                                Showing{" "}
                                <span className="font-semibold text-gray-900">
                                    {filteredOrders.length === 0
                                        ? 0
                                        : startIndex + 1}
                                </span>
                                {" - "}
                                <span className="font-semibold text-gray-900">
                                    {Math.min(
                                        startIndex +
                                        paginatedOrders.length,
                                        filteredOrders.length
                                    )}
                                </span>
                                {" of "}
                                <span className="font-semibold text-gray-900">
                                    {filteredOrders.length}
                                </span>
                                {" orders"}
                            </p>

                            {selectedOrders.length > 0 && (
                                <p className="font-semibold text-blue-600">
                                    {selectedOrders.length} selected
                                </p>
                            )}

                        </div>
                    )}

                {/* =========================================
                    LOADING
                ========================================= */}

                {loading && (

                    <div className="rounded-xl bg-white p-10 text-center shadow">

                        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black" />

                        <p className="text-gray-500">
                            Loading orders...
                        </p>

                    </div>

                )}

                {/* =========================================
                    ERROR
                ========================================= */}

                {!loading && error && (

                    <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">

                        <p className="font-semibold">
                            {error}
                        </p>

                        <button
                            onClick={loadOrders}
                            className="mt-3 rounded-lg bg-black px-4 py-2 text-white"
                        >
                            Try Again
                        </button>

                    </div>

                )}

                {/* =========================================
                    EMPTY
                ========================================= */}

                {!loading &&
                    !error &&
                    filteredOrders.length === 0 && (

                        <div className="rounded-xl bg-white p-10 text-center shadow">

                            <p className="text-gray-500">
                                No orders found.
                            </p>

                            {(search ||
                                statusFilter !== "all") && (

                                    <button
                                        onClick={resetFilters}
                                        className="mt-4 rounded-lg bg-black px-4 py-2 text-sm text-white"
                                    >
                                        Clear Filters
                                    </button>
                                )}

                        </div>
                    )}

                {/* =========================================
                    DESKTOP TABLE
                ========================================= */}

                {!loading &&
                    !error &&
                    paginatedOrders.length > 0 && (

                        <div className="hidden overflow-hidden rounded-xl bg-white shadow md:block">

                            <div className="overflow-x-auto">

                                <table className="w-full min-w-[1100px]">

                                    <thead className="bg-black text-white">

                                        <tr>

                                            <th className="w-12 p-4">

                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        allCurrentPageSelected
                                                    }
                                                    onChange={
                                                        toggleSelectAll
                                                    }
                                                    className="h-4 w-4 cursor-pointer"
                                                />

                                            </th>

                                            <th className="p-4 text-left">
                                                Order
                                            </th>

                                            <th className="p-4 text-left">
                                                Customer
                                            </th>

                                            <th className="p-4 text-left">
                                                IP Address
                                            </th>

                                            <th className="p-4 text-left">
                                                Total
                                            </th>

                                            <th className="p-4 text-left">
                                                Payment
                                            </th>

                                            <th className="p-4 text-left">
                                                Status
                                            </th>

                                            <th className="p-4 text-left">
                                                Date
                                            </th>

                                            <th className="p-4 text-left">
                                                Action
                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody>

                                        {paginatedOrders.map(
                                            (order) => (

                                                <tr
                                                    key={order.id}
                                                    className={`border-b transition hover:bg-gray-50 ${selectedOrders.includes(
                                                        order.id
                                                    )
                                                        ? "bg-yellow-50"
                                                        : ""
                                                        }`}
                                                >

                                                    {/* CHECKBOX */}

                                                    <td className="p-4">

                                                        <input
                                                            type="checkbox"
                                                            checked={selectedOrders.includes(
                                                                order.id
                                                            )}
                                                            onChange={() =>
                                                                toggleOrder(
                                                                    order.id
                                                                )
                                                            }
                                                            className="h-4 w-4 cursor-pointer"
                                                        />

                                                    </td>

                                                    {/* ORDER */}

                                                    <td className="p-4">

                                                        <p className="font-semibold">
                                                            #
                                                            {
                                                                order.order_number
                                                            }
                                                        </p>

                                                        <p className="text-xs text-gray-500">
                                                            ID:{" "}
                                                            {order.id}
                                                        </p>

                                                        {order.invoice
                                                            ?.invoice_number && (
                                                                <p className="mt-1 text-xs text-blue-600">
                                                                    {
                                                                        order
                                                                            .invoice
                                                                            .invoice_number
                                                                    }
                                                                </p>
                                                            )}

                                                    </td>

                                                    {/* CUSTOMER */}

                                                    <td className="p-4">

                                                        <p className="font-medium">
                                                            {
                                                                order
                                                                    .customer
                                                                    ?.username ||
                                                                "-"
                                                            }
                                                        </p>

                                                        <p className="text-sm text-gray-500">
                                                            {
                                                                order
                                                                    .customer
                                                                    ?.email ||
                                                                "-"
                                                            }
                                                        </p>

                                                        <p className="text-xs text-gray-400">
                                                            {
                                                                order
                                                                    .shipping_address
                                                                    ?.phone ||
                                                                "-"
                                                            }
                                                        </p>

                                                    </td>

                                                    {/* IP */}

                                                    <td className="p-4">

                                                        <span className="rounded bg-gray-100 px-2 py-1 font-mono text-xs">
                                                            {
                                                                order.ip_address ||
                                                                "-"
                                                            }
                                                        </span>

                                                    </td>

                                                    {/* TOTAL */}

                                                    <td className="whitespace-nowrap p-4">

                                                        <span className="font-semibold">
                                                            ৳{" "}
                                                            {
                                                                order.grand_total
                                                            }
                                                        </span>

                                                    </td>

                                                    {/* PAYMENT */}

                                                    <td className="p-4">

                                                        <span
                                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${order.payment_method ===
                                                                "COD"
                                                                ? "bg-orange-100 text-orange-700"
                                                                : order.payment_method ===
                                                                    "SSL"
                                                                    ? "bg-green-100 text-green-700"
                                                                    : "bg-blue-100 text-blue-700"
                                                                }`}
                                                        >
                                                            {
                                                                order.payment_method
                                                            }
                                                        </span>

                                                    </td>

                                                    {/* STATUS */}

                                                    <td className="p-4">

                                                        <span
                                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor[
                                                                order.status
                                                            ] ||
                                                                "bg-gray-100 text-gray-700"
                                                                }`}
                                                        >
                                                            {
                                                                order.status
                                                            }
                                                        </span>

                                                    </td>

                                                    {/* DATE */}

                                                    <td className="whitespace-nowrap p-4 text-sm">

                                                        {order.created_at
                                                            ? new Date(
                                                                order.created_at
                                                            ).toLocaleDateString()
                                                            : "-"}

                                                    </td>

                                                    {/* ACTION */}

                                                    <td className="p-4">

                                                        <Link
                                                            to={`/admin/orders/${order.id}`}
                                                            className="inline-block rounded-lg bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
                                                        >
                                                            View
                                                        </Link>

                                                    </td>

                                                </tr>

                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        </div>
                    )}

                {/* =========================================
                    MOBILE CARDS
                ========================================= */}

                {!loading &&
                    !error &&
                    paginatedOrders.length > 0 && (

                        <div className="space-y-4 md:hidden">

                            {/* SELECT ALL */}

                            <div className="flex items-center justify-between rounded-xl bg-white p-4 shadow">

                                <label className="flex items-center gap-3 text-sm font-medium">

                                    <input
                                        type="checkbox"
                                        checked={
                                            allCurrentPageSelected
                                        }
                                        onChange={
                                            toggleSelectAll
                                        }
                                        className="h-5 w-5"
                                    />

                                    Select All

                                </label>

                                <span className="text-sm text-gray-500">
                                    {
                                        paginatedOrders.length
                                    }{" "}
                                    orders
                                </span>

                            </div>

                            {/* CARDS */}

                            {paginatedOrders.map(
                                (order) => (

                                    <div
                                        key={order.id}
                                        className={`rounded-xl bg-white p-4 shadow ${selectedOrders.includes(
                                            order.id
                                        )
                                            ? "ring-2 ring-yellow-500"
                                            : ""
                                            }`}
                                    >

                                        {/* TOP */}

                                        <div className="flex items-start justify-between gap-3">

                                            <label className="flex items-start gap-3">

                                                <input
                                                    type="checkbox"
                                                    checked={selectedOrders.includes(
                                                        order.id
                                                    )}
                                                    onChange={() =>
                                                        toggleOrder(
                                                            order.id
                                                        )
                                                    }
                                                    className="mt-1 h-5 w-5"
                                                />

                                                <div>

                                                    <p className="break-all font-bold">
                                                        #
                                                        {
                                                            order.order_number
                                                        }
                                                    </p>

                                                    <p className="text-xs text-gray-500">
                                                        ID:{" "}
                                                        {order.id}
                                                    </p>

                                                </div>

                                            </label>

                                            <span
                                                className={`whitespace-nowrap rounded-full px-2 py-1 text-xs font-semibold ${statusColor[
                                                    order.status
                                                ] ||
                                                    "bg-gray-100 text-gray-700"
                                                    }`}
                                            >
                                                {
                                                    order.status
                                                }
                                            </span>

                                        </div>

                                        {/* DETAILS */}

                                        <div className="mt-4 space-y-2 border-t pt-4 text-sm">

                                            <div className="flex justify-between gap-4">

                                                <span className="text-gray-500">
                                                    Customer
                                                </span>

                                                <span className="text-right font-medium">
                                                    {
                                                        order
                                                            .customer
                                                            ?.username ||
                                                        "-"
                                                    }
                                                </span>

                                            </div>

                                            <div className="flex justify-between gap-4">

                                                <span className="text-gray-500">
                                                    Email
                                                </span>

                                                <span className="max-w-[60%] truncate text-right">
                                                    {
                                                        order
                                                            .customer
                                                            ?.email ||
                                                        "-"
                                                    }
                                                </span>

                                            </div>

                                            <div className="flex justify-between gap-4">

                                                <span className="text-gray-500">
                                                    Phone
                                                </span>

                                                <span>
                                                    {
                                                        order
                                                            .shipping_address
                                                            ?.phone ||
                                                        "-"
                                                    }
                                                </span>

                                            </div>

                                            <div className="flex justify-between gap-4">

                                                <span className="text-gray-500">
                                                    IP
                                                </span>

                                                <span className="font-mono text-xs">
                                                    {
                                                        order.ip_address ||
                                                        "-"
                                                    }
                                                </span>

                                            </div>

                                            <div className="flex justify-between">

                                                <span className="text-gray-500">
                                                    Total
                                                </span>

                                                <span className="font-bold">
                                                    ৳{" "}
                                                    {
                                                        order.grand_total
                                                    }
                                                </span>

                                            </div>

                                            <div className="flex justify-between">

                                                <span className="text-gray-500">
                                                    Payment
                                                </span>

                                                <span className="font-medium">
                                                    {
                                                        order.payment_method
                                                    }
                                                </span>

                                            </div>

                                            <div className="flex justify-between">

                                                <span className="text-gray-500">
                                                    Date
                                                </span>

                                                <span>
                                                    {order.created_at
                                                        ? new Date(
                                                            order.created_at
                                                        ).toLocaleDateString()
                                                        : "-"}
                                                </span>

                                            </div>

                                        </div>

                                        {/* VIEW */}

                                        <Link
                                            to={`/admin/orders/${order.id}`}
                                            className="mt-4 block rounded-lg bg-black py-3 text-center text-sm font-semibold text-white"
                                        >
                                            View Order
                                        </Link>

                                    </div>

                                )
                            )}

                        </div>
                    )}

                {/* =========================================
                    PAGINATION
                ========================================= */}

                {!loading &&
                    !error &&
                    totalPages > 1 && (

                        <div className="mt-6 flex flex-col gap-4 rounded-xl bg-white p-4 shadow sm:flex-row sm:items-center sm:justify-between">

                            <p className="text-sm text-gray-500">

                                Page{" "}
                                <span className="font-semibold text-gray-900">
                                    {currentPage}
                                </span>{" "}
                                of{" "}
                                <span className="font-semibold text-gray-900">
                                    {totalPages}
                                </span>

                            </p>

                            <div className="flex flex-wrap items-center justify-center gap-1">

                                {/* PREVIOUS */}

                                <button
                                    disabled={
                                        currentPage === 1
                                    }
                                    onClick={() =>
                                        goToPage(
                                            currentPage - 1
                                        )
                                    }
                                    className="rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Previous
                                </button>

                                {/* PAGE NUMBERS */}

                                {Array.from(
                                    {
                                        length: Math.min(
                                            totalPages,
                                            5
                                        ),
                                    },
                                    (_, index) => {

                                        let pageNumber;

                                        if (
                                            totalPages <=
                                            5
                                        ) {
                                            pageNumber =
                                                index + 1;
                                        } else if (
                                            currentPage <=
                                            3
                                        ) {
                                            pageNumber =
                                                index + 1;
                                        } else if (
                                            currentPage >=
                                            totalPages - 2
                                        ) {
                                            pageNumber =
                                                totalPages -
                                                4 +
                                                index;
                                        } else {
                                            pageNumber =
                                                currentPage -
                                                2 +
                                                index;
                                        }

                                        return (
                                            <button
                                                key={
                                                    pageNumber
                                                }
                                                onClick={() =>
                                                    goToPage(
                                                        pageNumber
                                                    )
                                                }
                                                className={`h-9 min-w-9 rounded-lg px-3 text-sm ${pageNumber ===
                                                    currentPage
                                                    ? "bg-black text-white"
                                                    : "border hover:bg-gray-100"
                                                    }`}
                                            >
                                                {
                                                    pageNumber
                                                }
                                            </button>
                                        );
                                    }
                                )}

                                {/* NEXT */}

                                <button
                                    disabled={
                                        currentPage ===
                                        totalPages
                                    }
                                    onClick={() =>
                                        goToPage(
                                            currentPage + 1
                                        )
                                    }
                                    className="rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Next
                                </button>

                            </div>

                        </div>
                    )}

            </div>

        </div>
    );
}

/* =====================================================
   STAT CARD
===================================================== */

function StatCard({
    title,
    value,
    className = "",
    valueClass = "text-gray-900",
}) {
    return (
        <div
            className={`rounded-xl p-4 shadow ${className}`}
        >
            <p className="text-sm text-gray-500">
                {title}
            </p>

            <p
                className={`mt-1 text-2xl font-bold sm:text-3xl ${valueClass}`}
            >
                {value}
            </p>
        </div>
    );
}