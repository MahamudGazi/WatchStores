import { useEffect, useState } from "react";
import { getInventory, updateInventory } from "../../../api/admin";

export default function AdminInventory() {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [stockFilter, setStockFilter] = useState("All");
    const [activeFilter, setActiveFilter] = useState("All");

    useEffect(() => {
        loadProducts();
    }, []);

    async function loadProducts() {
        try {
            setLoading(true);

            const data = await getInventory();

            setProducts(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Inventory loading error:", err);
        } finally {
            setLoading(false);
        }
    }

    async function saveStock(id, stock) {
        try {
            await updateInventory(id, {
                stock: Number(stock),
            });

            await loadProducts();
        } catch (err) {
            console.error("Stock update error:", err);
        }
    }
    async function updateProduct(id, is_active) {

        try {

            await updateInventory(id, {
                is_active,
            });

            loadProducts();

        } catch (err) {

            console.log(err);

        }

    }

    const filteredProducts = products.filter((product) => {

        const matchesSearch =
            product.name
                ?.toLowerCase()
                .includes(search.toLowerCase());

        const matchesStock =
            stockFilter === "All" ||
            product.status === stockFilter;

        const matchesActive =
            activeFilter === "All" ||
            (activeFilter === "Active" && product.is_active === true) ||
            (activeFilter === "Deactivate" && product.is_active === false);

        return (
            matchesSearch &&
            matchesStock &&
            matchesActive
        );
    });

    const totalProducts = products.length;

    const inStock = products.filter(
        (product) => product.status === "In Stock"
    ).length;

    const lowStock = products.filter(
        (product) => product.status === "Low Stock"
    ).length;

    const outOfStock = products.filter(
        (product) => product.status === "Out of Stock"
    ).length;

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-black"></div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-5 md:px-8 py-5 sm:py-8">

            {/* Header */}
            <div className="mb-6 sm:mb-8">

                <h1 className="text-2xl sm:text-3xl font-bold">
                    Inventory Management
                </h1>

                <p className="text-gray-500 text-sm sm:text-base mt-1">
                    Manage product stock and inventory
                </p>

            </div>


            {/* Statistics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6 sm:mb-8">

                {/* Total */}
                <div className="bg-blue-500 text-white rounded-xl p-4 sm:p-5 shadow">

                    <h3 className="text-xs sm:text-sm opacity-80">
                        Total Products
                    </h3>

                    <h1 className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2">
                        {totalProducts}
                    </h1>

                </div>


                {/* In Stock */}
                <div className="bg-green-500 text-white rounded-xl p-4 sm:p-5 shadow">

                    <h3 className="text-xs sm:text-sm opacity-80">
                        In Stock
                    </h3>

                    <h1 className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2">
                        {inStock}
                    </h1>

                </div>


                {/* Low Stock */}
                <div className="bg-yellow-500 text-white rounded-xl p-4 sm:p-5 shadow">

                    <h3 className="text-xs sm:text-sm opacity-80">
                        Low Stock
                    </h3>

                    <h1 className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2">
                        {lowStock}
                    </h1>

                </div>


                {/* Out Of Stock */}
                <div className="bg-red-500 text-white rounded-xl p-4 sm:p-5 shadow">

                    <h3 className="text-xs sm:text-sm opacity-80">
                        Out Of Stock
                    </h3>

                    <h1 className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2">
                        {outOfStock}
                    </h1>

                </div>

            </div>


            {/* Search */}
            <div className="mb-5 sm:mb-6 flex flex-col sm:flex-row gap-3">

                {/* Search */}
                <input
                    type="text"
                    placeholder="Search Product..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border rounded-lg px-4 py-3 w-full sm:max-w-md focus:outline-none focus:ring-2 focus:ring-black"
                />

                {/* Stock Filter */}
                <select
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value)}
                    className="border rounded-lg px-4 py-3 w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-black"
                >

                    <option value="All">
                        All Stock
                    </option>

                    <option value="In Stock">
                        In Stock
                    </option>

                    <option value="Low Stock">
                        Low Stock
                    </option>

                    <option value="Out of Stock">
                        Out Of Stock
                    </option>

                </select>

                {/* Active Filter */}
                <select
                    value={activeFilter}
                    onChange={(e) => setActiveFilter(e.target.value)}
                    className="border rounded-lg px-4 py-3 w-full md:w-52"
                >
                    <option value="All">
                        All Products
                    </option>

                    <option value="Active">
                        Active
                    </option>

                    <option value="Deactivate">
                        Deactivate
                    </option>
                </select>

            </div>


            {/* Table */}
            <div className="bg-white rounded-xl shadow overflow-hidden">

                {/* Horizontal scroll on mobile */}
                <div className="overflow-x-auto">

                    <table className="w-full min-w-[1000px]">

                        <thead className="bg-black text-white">

                            <tr>

                                <th className="p-4 text-left">
                                    Image
                                </th>

                                <th className="p-4 text-left">
                                    Product
                                </th>

                                <th className="p-4 text-left">
                                    Brand
                                </th>

                                <th className="p-4 text-left">
                                    Category
                                </th>

                                <th className="p-4 text-left">
                                    SKU
                                </th>

                                <th className="p-4 text-left">
                                    Price
                                </th>

                                <th className="p-4 text-left">
                                    Stock
                                </th>

                                <th className="p-4 text-left">
                                    Stock Status
                                </th>

                                <th className="p-4 text-left">
                                    Action
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {filteredProducts.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="9"
                                        className="text-center py-10 text-gray-500"
                                    >
                                        No products found
                                    </td>

                                </tr>

                            ) : (

                                filteredProducts.map((product) => (

                                    <InventoryRow
                                        key={product.id}
                                        product={product}
                                        saveStock={saveStock}
                                        updateProduct={updateProduct}
                                    />

                                ))

                            )}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>
    );
}


/* =====================================================
   Inventory Row
===================================================== */

function InventoryRow({ product, saveStock, updateProduct }) {


    async function toggleActive() {

        await updateProduct(
            product.id,
            !product.is_active
        );

    }

    const [stock, setStock] = useState(product.stock ?? 0);

    useEffect(() => {
        setStock(product.stock ?? 0);
    }, [product.stock]);

    const numericStock = Number(stock);

    return (
        <tr className="border-b hover:bg-gray-50">

            {/* Image */}
            <td className="p-3 sm:p-4">

                {product.image ? (
                    <img
                        src={product.image || "/placeholder.png"}
                        alt={product.name}
                        onError={(e) => {
                            e.currentTarget.src = "/placeholder.png";
                        }}
                        className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg"
                    />
                ) : (
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-500">
                        No Image
                    </div>
                )}

                {/* DEBUG */}
                <p className="text-[10px] text-red-500 mt-1 max-w-[150px] break-all">
                    {product.image || "NO IMAGE URL"}
                </p>

            </td>


            {/* Product */}
            <td className="p-3 sm:p-4">

                <h3 className="font-semibold max-w-[180px] truncate">
                    {product.name}
                </h3>

            </td>


            {/* Brand */}
            <td className="p-3 sm:p-4">
                {product.brand || "-"}
            </td>


            {/* Category */}
            <td className="p-3 sm:p-4">
                {product.category || "-"}
            </td>


            {/* SKU */}
            <td className="p-3 sm:p-4">
                {product.sku || "-"}
            </td>


            {/* Price */}
            <td className="p-3 sm:p-4 whitespace-nowrap">
                ৳ {product.price}
            </td>


            {/* Stock */}
            <td className="p-3 sm:p-4">

                <input
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="border rounded px-2 sm:px-3 py-2 w-20 sm:w-24"
                />


                {/* Progress */}
                <div className="w-20 sm:w-32 bg-gray-200 rounded-full h-2 mt-2">

                    <div
                        className={`h-2 rounded-full ${numericStock > 20
                            ? "bg-green-500"
                            : numericStock > 5
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                        style={{
                            width: `${Math.min(
                                numericStock * 5,
                                100
                            )}%`,
                        }}
                    />

                </div>

            </td>


            {/* Status */}
            <td className="p-3 sm:p-4">

                <span
                    className={`px-2 sm:px-3 py-1 rounded-full text-white text-xs sm:text-sm whitespace-nowrap ${product.status === "In Stock"
                        ? "bg-green-500"
                        : product.status === "Low Stock"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                >
                    {product.status}
                </span>

                <span
                    className={`mt-2 inline-block px-3 py-1 rounded-full text-white text-sm ${product.is_active
                        ? "bg-green-500"
                        : "bg-gray-500"
                        }`}
                >
                    {product.is_active ? "Active" : "Deactivate"}
                </span>

            </td>

            {/* Action */}
            <td className="p-3 sm:p-4">

                <div className="flex flex-col gap-2">

                    {/* Save Stock */}
                    <button
                        onClick={() =>
                            saveStock(product.id, numericStock)
                        }
                        className="bg-black text-white px-3 sm:px-4 py-2 rounded-lg text-sm hover:bg-gray-800 whitespace-nowrap"
                    >
                        Save
                    </button>

                    {/* Activate / Deactivate */}
                    <button
                        onClick={toggleActive}
                        className={`px-3 sm:px-4 py-2 rounded-lg text-sm text-white whitespace-nowrap ${product.is_active
                            ? "bg-red-500 hover:bg-red-600"
                            : "bg-green-500 hover:bg-green-600"
                            }`}
                    >
                        {product.is_active
                            ? "Deactivate"
                            : "Activate"}
                    </button>

                </div>

            </td>
        </tr>
    );
}

