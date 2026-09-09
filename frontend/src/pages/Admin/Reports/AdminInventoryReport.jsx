import { useEffect, useMemo, useState } from "react";
import api from "../../../api/axios";

export default function AdminInventoryReport() {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [stockFilter, setStockFilter] = useState("all");

    async function loadInventory(isRefresh = false) {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const response = await api.get("/dashboard/inventory/");
            const data = response.data;

            let items = [];

            if (Array.isArray(data)) {
                items = data;
            } else if (Array.isArray(data?.results)) {
                items = data.results;
            } else if (Array.isArray(data?.data)) {
                items = data.data;
            }

            setInventory(items);
        } catch (err) {
            console.error("Inventory API Error:", err);

            setError(
                err.response?.data?.detail ||
                    err.response?.data?.error ||
                    "Failed to load inventory."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        loadInventory();
    }, []);

    const stats = useMemo(() => {
        let totalProducts = inventory.length;
        let inStock = 0;
        let lowStock = 0;
        let outOfStock = 0;
        let totalUnits = 0;

        inventory.forEach((item) => {
            const stock = Number(item.stock ?? 0);

            totalUnits += stock;

            if (stock === 0) {
                outOfStock++;
            } else if (stock <= 5) {
                lowStock++;
            } else {
                inStock++;
            }
        });

        return {
            totalProducts,
            inStock,
            lowStock,
            outOfStock,
            totalUnits,
        };
    }, [inventory]);

    const filteredInventory = useMemo(() => {
        const query = search.trim().toLowerCase();

        return inventory.filter((item) => {
            const stock = Number(item.stock ?? 0);

            const matchesSearch =
                !query ||
                item.name?.toLowerCase().includes(query) ||
                item.sku?.toLowerCase().includes(query) ||
                item.brand_name?.toLowerCase().includes(query) ||
                item.category_name?.toLowerCase().includes(query);

            let matchesFilter = true;

            if (stockFilter === "in") {
                matchesFilter = stock > 5;
            }

            if (stockFilter === "low") {
                matchesFilter = stock > 0 && stock <= 5;
            }

            if (stockFilter === "out") {
                matchesFilter = stock === 0;
            }

            return matchesSearch && matchesFilter;
        });
    }, [inventory, search, stockFilter]);

    function getStockStatus(stock) {
        const value = Number(stock ?? 0);

        if (value === 0) {
            return {
                label: "Out of Stock",
                className: "bg-red-100 text-red-700",
            };
        }

        if (value <= 5) {
            return {
                label: "Low Stock",
                className: "bg-yellow-100 text-yellow-700",
            };
        }

        return {
            label: "In Stock",
            className: "bg-green-100 text-green-700",
        };
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        Inventory Report
                    </h1>

                    <p className="text-gray-500 mt-1">
                        Stock levels and inventory alerts
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => loadInventory(true)}
                    disabled={refreshing}
                    className="
                        w-full
                        lg:w-auto
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
                    {refreshing ? "Refreshing..." : "↻ Refresh"}
                </button>
            </div>

            {/* Error */}
            {error && (
                <div
                    className="
                        mb-6
                        bg-red-50
                        border
                        border-red-200
                        text-red-700
                        rounded-xl
                        p-4
                    "
                >
                    <p className="font-semibold">
                        Inventory Error
                    </p>

                    <p className="text-sm mt-1">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() => loadInventory()}
                        className="
                            mt-3
                            bg-red-600
                            hover:bg-red-700
                            text-white
                            px-4
                            py-2
                            rounded-lg
                            text-sm
                        "
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Statistics */}
            {!loading && !error && (
                <div
                    className="
                        grid
                        grid-cols-1
                        sm:grid-cols-2
                        lg:grid-cols-4
                        gap-4
                        mb-6
                    "
                >
                    {/* Total */}
                    <div className="bg-white border rounded-2xl p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Total Products
                        </p>

                        <p className="text-3xl font-bold mt-2">
                            {stats.totalProducts}
                        </p>

                        <p className="text-xs text-gray-400 mt-1">
                            {stats.totalUnits} total units
                        </p>
                    </div>

                    {/* In Stock */}
                    <div className="bg-white border rounded-2xl p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            In Stock
                        </p>

                        <p className="text-3xl font-bold text-green-600 mt-2">
                            {stats.inStock}
                        </p>

                        <p className="text-xs text-gray-400 mt-1">
                            Healthy inventory
                        </p>
                    </div>

                    {/* Low Stock */}
                    <div className="bg-white border rounded-2xl p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Low Stock
                        </p>

                        <p className="text-3xl font-bold text-yellow-600 mt-2">
                            {stats.lowStock}
                        </p>

                        <p className="text-xs text-gray-400 mt-1">
                            5 units or less
                        </p>
                    </div>

                    {/* Out of Stock */}
                    <div className="bg-white border rounded-2xl p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Out of Stock
                        </p>

                        <p className="text-3xl font-bold text-red-600 mt-2">
                            {stats.outOfStock}
                        </p>

                        <p className="text-xs text-gray-400 mt-1">
                            Requires restocking
                        </p>
                    </div>
                </div>
            )}

            {/* Search and Filter */}
            <div
                className="
                    bg-white
                    border
                    rounded-2xl
                    shadow-sm
                    p-4
                    mb-6
                "
            >
                <div className="flex flex-col md:flex-row gap-3">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search product, SKU, brand or category..."
                        className="
                            flex-1
                            border
                            rounded-xl
                            px-4
                            py-3
                            outline-none
                            focus:ring-2
                            focus:ring-black
                        "
                    />

                    <select
                        value={stockFilter}
                        onChange={(e) => setStockFilter(e.target.value)}
                        className="
                            border
                            rounded-xl
                            px-4
                            py-3
                            bg-white
                            outline-none
                        "
                    >
                        <option value="all">
                            All Products
                        </option>

                        <option value="in">
                            In Stock
                        </option>

                        <option value="low">
                            Low Stock
                        </option>

                        <option value="out">
                            Out of Stock
                        </option>
                    </select>
                </div>
            </div>

            {/* Loading */}
            {loading ? (
                <div
                    className="
                        bg-white
                        border
                        rounded-2xl
                        shadow-sm
                        p-12
                        text-center
                    "
                >
                    <div
                        className="
                            animate-spin
                            rounded-full
                            h-10
                            w-10
                            border-b-4
                            border-black
                            mx-auto
                        "
                    />

                    <p className="text-gray-500 mt-4">
                        Loading inventory...
                    </p>
                </div>
            ) : (
                <div
                    className="
                        bg-white
                        border
                        rounded-2xl
                        shadow-sm
                        overflow-hidden
                    "
                >
                    {/* Table Header */}
                    <div className="px-5 py-4 border-b">
                        <h2 className="text-lg font-bold">
                            Inventory
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Showing {filteredInventory.length} of{" "}
                            {inventory.length} products
                        </p>
                    </div>

                    {/* Empty */}
                    {filteredInventory.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-lg font-semibold text-gray-700">
                                No inventory found
                            </p>

                            <p className="text-sm text-gray-500 mt-1">
                                Try changing your search or filter.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[850px]">
                                <thead className="bg-black text-white">
                                    <tr>
                                        <th className="p-4 text-left">
                                            Product
                                        </th>

                                        <th className="p-4 text-left">
                                            SKU
                                        </th>

                                        <th className="p-4 text-left">
                                            Brand
                                        </th>

                                        <th className="p-4 text-left">
                                            Category
                                        </th>

                                        <th className="p-4 text-left">
                                            Stock
                                        </th>

                                        <th className="p-4 text-left">
                                            Status
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredInventory.map((item) => {
                                        const status = getStockStatus(
                                            item.stock
                                        );

                                        return (
                                            <tr
                                                key={item.id}
                                                className="
                                                    border-b
                                                    hover:bg-gray-50
                                                "
                                            >
                                                <td className="p-4">
                                                    <div
                                                        className="
                                                            flex
                                                            items-center
                                                            gap-3
                                                        "
                                                    >
                                                        {item.thumbnail ? (
                                                            <img
                                                                src={
                                                                    item.thumbnail
                                                                }
                                                                alt={
                                                                    item.name ||
                                                                    "Product"
                                                                }
                                                                className="
                                                                    w-12
                                                                    h-12
                                                                    rounded-lg
                                                                    object-cover
                                                                    border
                                                                "
                                                            />
                                                        ) : (
                                                            <div
                                                                className="
                                                                    w-12
                                                                    h-12
                                                                    rounded-lg
                                                                    bg-gray-100
                                                                    flex
                                                                    items-center
                                                                    justify-center
                                                                    text-xs
                                                                    text-gray-400
                                                                "
                                                            >
                                                                No Image
                                                            </div>
                                                        )}

                                                        <p
                                                            className="
                                                                font-semibold
                                                                truncate
                                                                max-w-[220px]
                                                            "
                                                        >
                                                            {item.name || "-"}
                                                        </p>
                                                    </div>
                                                </td>

                                                <td className="p-4 text-sm">
                                                    {item.sku || "-"}
                                                </td>

                                                <td className="p-4 text-sm">
                                                    {item.brand_name || "-"}
                                                </td>

                                                <td className="p-4 text-sm">
                                                    {item.category_name || "-"}
                                                </td>

                                                <td className="p-4">
                                                    <span className="font-bold text-lg">
                                                        {Number(
                                                            item.stock ?? 0
                                                        )}
                                                    </span>
                                                </td>

                                                <td className="p-4">
                                                    <span
                                                        className={`
                                                            inline-flex
                                                            px-3
                                                            py-1
                                                            rounded-full
                                                            text-xs
                                                            font-semibold
                                                            ${status.className}
                                                        `}
                                                    >
                                                        {status.label}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}