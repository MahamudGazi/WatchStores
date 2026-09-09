import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../api/axios";
import { addToCart } from "../api/cart";
import Loading from "../components/common/Loading";
import ProductGrid from "../components/products/ProductGrid";

export default function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [quantity, setQuantity] = useState(1);

    const [loading, setLoading] = useState(true);
    const [addingToCart, setAddingToCart] = useState(false);
    const [buyingNow, setBuyingNow] = useState(false);

    useEffect(() => {
        async function fetchProduct() {
            try {
                setLoading(true);

                // Product Details
                const productRes = await api.get(
                    `/products/${id}/`
                );

                setProduct(productRes.data);

                // Similar Products
                try {
                    const relatedRes = await api.get(
                        `/products/${id}/similar/`
                    );

                    const similar =
                        relatedRes.data?.data ||
                        relatedRes.data?.results ||
                        relatedRes.data ||
                        [];

                    setRelatedProducts(
                        Array.isArray(similar)
                            ? similar.slice(0, 4)
                            : []
                    );
                } catch (relatedError) {
                    console.error(
                        "Failed to load related products:",
                        relatedError
                    );

                    setRelatedProducts([]);
                }

            } catch (err) {
                console.error(
                    "Failed to load product:",
                    err
                );

                setProduct(null);
            } finally {
                setLoading(false);
            }
        }

        fetchProduct();
    }, [id]);


    if (loading) {
        return <Loading />;
    }


    if (!product) {
        return (
            <div className="min-h-[70vh] bg-gray-50 px-4 py-20">
                <div className="mx-auto max-w-xl text-center">

                    <div className="mb-6 text-6xl">
                        📦
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                        Product Not Found
                    </h1>

                    <p className="mt-3 text-gray-500">
                        Sorry, this product is no longer available.
                    </p>

                    <button
                        onClick={() => navigate("/products")}
                        className="
                            mt-7
                            rounded-xl
                            bg-black
                            px-6
                            py-3
                            font-semibold
                            text-white
                            transition
                            hover:bg-gray-800
                        "
                    >
                        Continue Shopping
                    </button>

                </div>
            </div>
        );
    }


    const currentPrice =
        product.discount_price || product.price;

    const hasDiscount =
        product.discount_price &&
        Number(product.discount_price) <
            Number(product.price);

    const stock =
        Number(product.stock) || 0;

    const isOutOfStock =
        stock <= 0 ||
        product.stock_status === "Out of Stock";


    // =========================
    // ADD TO CART
    // =========================

    async function handleAddToCart() {
        if (isOutOfStock || addingToCart) return;

        try {
            setAddingToCart(true);

            const response = await addToCart({
                product: product.id,
                quantity,
            });

            console.log(
                "ADD TO CART:",
                response
            );

            alert(
                "Product added to cart successfully!"
            );

        } catch (err) {
            console.error(
                "Add to cart error:",
                err
            );

            alert(
                err.response?.data?.detail ||
                err.response?.data?.error ||
                "Failed to add product to cart."
            );

        } finally {
            setAddingToCart(false);
        }
    }


    // =========================
    // BUY NOW / CHECKOUT
    // =========================

    async function handleBuyNow() {
        if (isOutOfStock || buyingNow) return;

        try {
            setBuyingNow(true);

            await addToCart({
                product: product.id,
                quantity,
            });

            // Go directly to checkout
            navigate("/checkout");

        } catch (err) {
            console.error(
                "Buy now error:",
                err
            );

            alert(
                err.response?.data?.detail ||
                err.response?.data?.error ||
                "Unable to proceed to checkout."
            );

        } finally {
            setBuyingNow(false);
        }
    }


    return (
        <main className="min-h-screen bg-gray-50">

            <div className="
                mx-auto
                w-full
                max-w-7xl
                px-4
                py-8
                sm:px-6
                sm:py-10
                lg:px-8
                lg:py-14
            ">

                {/* ========================= */}
                {/* PRODUCT DETAILS */}
                {/* ========================= */}

                <div className="
                    grid
                    grid-cols-1
                    gap-8
                    lg:grid-cols-2
                    lg:gap-14
                ">

                    {/* ========================= */}
                    {/* IMAGE */}
                    {/* ========================= */}

                    <div className="
                        flex
                        items-start
                        justify-center
                        rounded-2xl
                        border
                        border-gray-200
                        bg-white
                        p-4
                        shadow-sm
                        sm:p-6
                    ">

                        {product.thumbnail ? (
                            <img
                                src={product.thumbnail}
                                alt={product.name}
                                className="
                                    h-auto
                                    max-h-[500px]
                                    w-full
                                    rounded-xl
                                    object-contain
                                    sm:max-h-[600px]
                                "
                            />
                        ) : (
                            <div className="
                                flex
                                h-[350px]
                                w-full
                                items-center
                                justify-center
                                rounded-xl
                                bg-gray-100
                                text-gray-400
                            ">
                                No Image Available
                            </div>
                        )}

                    </div>


                    {/* ========================= */}
                    {/* PRODUCT INFO */}
                    {/* ========================= */}

                    <div className="
                        flex
                        flex-col
                        justify-center
                    ">

                        {/* Product Name */}

                        <h1 className="
                            text-2xl
                            font-bold
                            leading-tight
                            tracking-tight
                            text-gray-900
                            sm:text-3xl
                            lg:text-4xl
                        ">
                            {product.name}
                        </h1>


                        {/* Rating */}

                        <div className="
                            mt-4
                            flex
                            flex-wrap
                            items-center
                            gap-3
                        ">

                            <span className="
                                rounded-full
                                bg-yellow-50
                                px-3
                                py-1
                                text-sm
                                font-semibold
                                text-yellow-700
                            ">
                                ⭐{" "}
                                {product.average_rating || "No rating"}
                            </span>

                            {product.sku && (
                                <span className="
                                    text-sm
                                    text-gray-500
                                ">
                                    SKU: {product.sku}
                                </span>
                            )}

                        </div>


                        {/* Description */}

                        <p className="
                            mt-6
                            text-sm
                            leading-7
                            text-gray-600
                            sm:text-base
                        ">
                            {product.description}
                        </p>


                        {/* Price */}

                        <div className="
                            mt-6
                            flex
                            flex-wrap
                            items-center
                            gap-3
                        ">

                            <span className="
                                text-3xl
                                font-bold
                                text-yellow-600
                                sm:text-4xl
                            ">
                                ৳ {currentPrice}
                            </span>

                            {hasDiscount && (
                                <span className="
                                    text-lg
                                    text-gray-400
                                    line-through
                                    sm:text-xl
                                ">
                                    ৳ {product.price}
                                </span>
                            )}

                            {hasDiscount && (
                                <span className="
                                    rounded-full
                                    bg-red-50
                                    px-3
                                    py-1
                                    text-xs
                                    font-bold
                                    text-red-600
                                ">
                                    SALE
                                </span>
                            )}

                        </div>


                        {/* Stock */}

                        <div className="mt-6">

                            {isOutOfStock ? (
                                <span className="
                                    inline-flex
                                    rounded-full
                                    bg-red-100
                                    px-4
                                    py-2
                                    text-sm
                                    font-semibold
                                    text-red-700
                                ">
                                    Out of Stock
                                </span>
                            ) : (
                                <span className="
                                    inline-flex
                                    rounded-full
                                    bg-green-100
                                    px-4
                                    py-2
                                    text-sm
                                    font-semibold
                                    text-green-700
                                ">
                                    ✓ {product.stock_status || `${stock} Available`}
                                </span>
                            )}

                        </div>


                        {/* ========================= */}
                        {/* QUANTITY */}
                        {/* ========================= */}

                        {!isOutOfStock && (
                            <div className="mt-7">

                                <p className="
                                    mb-3
                                    text-sm
                                    font-semibold
                                    text-gray-900
                                ">
                                    Quantity
                                </p>

                                <div className="
                                    inline-flex
                                    items-center
                                    overflow-hidden
                                    rounded-xl
                                    border
                                    border-gray-300
                                    bg-white
                                ">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setQuantity(
                                                (q) =>
                                                    Math.max(
                                                        1,
                                                        q - 1
                                                    )
                                            )
                                        }
                                        className="
                                            flex
                                            h-11
                                            w-11
                                            items-center
                                            justify-center
                                            text-xl
                                            transition
                                            hover:bg-gray-100
                                        "
                                    >
                                        −
                                    </button>

                                    <span className="
                                        flex
                                        h-11
                                        w-14
                                        items-center
                                        justify-center
                                        border-x
                                        border-gray-300
                                        font-bold
                                    ">
                                        {quantity}
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setQuantity(
                                                (q) =>
                                                    Math.min(
                                                        stock || q + 1,
                                                        q + 1
                                                    )
                                            )
                                        }
                                        className="
                                            flex
                                            h-11
                                            w-11
                                            items-center
                                            justify-center
                                            text-xl
                                            transition
                                            hover:bg-gray-100
                                        "
                                    >
                                        +
                                    </button>

                                </div>

                            </div>
                        )}


                        {/* ========================= */}
                        {/* ACTION BUTTONS */}
                        {/* ========================= */}

                        <div className="
                            mt-8
                            grid
                            grid-cols-1
                            gap-3
                            sm:grid-cols-2
                        ">

                            {/* Add To Cart */}

                            <button
                                type="button"
                                onClick={handleAddToCart}
                                disabled={
                                    isOutOfStock ||
                                    addingToCart ||
                                    buyingNow
                                }
                                className="
                                    rounded-xl
                                    border-2
                                    border-yellow-500
                                    bg-yellow-500
                                    px-5
                                    py-3.5
                                    font-bold
                                    text-white
                                    transition
                                    hover:bg-yellow-600
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                "
                            >
                                {addingToCart
                                    ? "Adding..."
                                    : "🛒 Add to Cart"}
                            </button>


                            {/* Checkout */}

                            <button
                                type="button"
                                onClick={handleBuyNow}
                                disabled={
                                    isOutOfStock ||
                                    addingToCart ||
                                    buyingNow
                                }
                                className="
                                    rounded-xl
                                    bg-black
                                    px-5
                                    py-3.5
                                    font-bold
                                    text-white
                                    transition
                                    hover:bg-gray-800
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                "
                            >
                                {buyingNow
                                    ? "Processing..."
                                    : "⚡ Buy Now"}
                            </button>

                        </div>


                        {/* Wishlist */}

                        <button
                            type="button"
                            className="
                                mt-3
                                w-full
                                rounded-xl
                                border
                                border-gray-300
                                bg-white
                                px-5
                                py-3
                                font-semibold
                                text-gray-700
                                transition
                                hover:border-red-400
                                hover:bg-red-50
                                hover:text-red-600
                            "
                        >
                            ♡ Add to Wishlist
                        </button>


                        {/* Benefits */}

                        <div className="
                            mt-8
                            grid
                            grid-cols-1
                            gap-3
                            border-t
                            border-gray-200
                            pt-6
                            sm:grid-cols-3
                        ">

                            <div className="text-center sm:text-left">
                                <p className="text-sm font-bold text-gray-900">
                                    🚚 Fast Delivery
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                    Quick & secure shipping
                                </p>
                            </div>

                            <div className="text-center sm:text-left">
                                <p className="text-sm font-bold text-gray-900">
                                    🔒 Secure Payment
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                    Safe checkout
                                </p>
                            </div>

                            <div className="text-center sm:text-left">
                                <p className="text-sm font-bold text-gray-900">
                                    ✓ Quality Product
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                    Trusted products
                                </p>
                            </div>

                        </div>

                    </div>

                </div>


                {/* ========================= */}
                {/* RELATED PRODUCTS */}
                {/* ========================= */}

                {relatedProducts.length > 0 && (
                    <section className="mt-16 sm:mt-20 lg:mt-24">

                        <div className="
                            mb-7
                            flex
                            items-end
                            justify-between
                            gap-4
                        ">

                            <div>
                                <p className="
                                    text-sm
                                    font-semibold
                                    uppercase
                                    tracking-wider
                                    text-yellow-600
                                ">
                                    You may also like
                                </p>

                                <h2 className="
                                    mt-1
                                    text-2xl
                                    font-bold
                                    text-gray-900
                                    sm:text-3xl
                                ">
                                    Related Products
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    navigate("/products")
                                }
                                className="
                                    hidden
                                    text-sm
                                    font-semibold
                                    text-gray-700
                                    hover:text-black
                                    sm:block
                                "
                            >
                                View All →
                            </button>

                        </div>

                        <ProductGrid
                            products={relatedProducts}
                        />

                    </section>
                )}

            </div>

        </main>
    );
}

