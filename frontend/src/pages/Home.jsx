import { useEffect, useState } from "react";
import api from "../api/axios";
import Loading from "../components/common/Loading";
import Hero from "../components/home/Hero";
import Categories from "../components/home/Categories";
import FeaturedProducts from "../components/home/FeaturedProducts";
import FlashSale from "../components/home/FlashSale";
import LatestProducts from "../components/home/LatestProducts";
import Newsletter from "../components/home/Newsletter";

import ProductCard from "../components/products/ProductCard";


export default function Home() {

    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    // =====================================================
    // LOAD PRODUCTS
    // =====================================================

    useEffect(() => {

        let mounted = true;


        async function loadProducts() {

            try {

                setLoading(true);

                setError("");


                const response = await api.get(
                    "/products/"
                );


                if (!mounted) return;


                const data = response?.data;


                // =================================================
                // HANDLE DIFFERENT API RESPONSE FORMATS
                // =================================================

                const productData =
                    Array.isArray(data)
                        ? data
                        : Array.isArray(data?.results)
                            ? data.results
                            : Array.isArray(data?.data)
                                ? data.data
                                : [];


                setProducts(productData);

            } catch (err) {

                console.error(
                    "Failed to load products:",
                    err
                );


                if (!mounted) return;


                setProducts([]);

                setError(
                    err?.response?.data?.message ||
                    err?.response?.data?.detail ||
                    "Failed to load products."
                );

            } finally {

                if (mounted) {
                    setLoading(false);
                }

            }

        }


        loadProducts();


        return () => {
            mounted = false;
        };

    }, []);


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {
        return <Loading />;
    }


    // =====================================================
    // ERROR
    // =====================================================

    if (error) {

        return (

            <div className="flex min-h-[60vh] items-center justify-center px-4">

                <div className="w-full max-w-lg rounded-2xl border border-red-100 bg-red-50 p-8 text-center">

                    <h2 className="text-2xl font-bold text-red-600">
                        Unable to load products
                    </h2>

                    <p className="mt-3 text-sm text-red-500">
                        {error}
                    </p>


                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                    >
                        Try Again
                    </button>

                </div>

            </div>

        );
    }


    // =====================================================
    // HOME PAGE
    // =====================================================

    return (

        <>

            {/* =================================================
                HERO
            ================================================= */}

            <Hero />


            {/* =================================================
                CATEGORIES
            ================================================= */}

            <Categories />


            {/* =================================================
                FEATURED PRODUCTS
            ================================================= */}

            <FeaturedProducts
                products={products}
            />


            {/* =================================================
                FLASH SALE
            ================================================= */}

            <FlashSale
                products={products}
            />


            {/* =================================================
                LATEST PRODUCTS
            ================================================= */}

            <LatestProducts
                products={products}
            />


            {/* =================================================
                ALL PRODUCTS
            ================================================= */}

            <section className="bg-gray-50">

                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">


                    {/* Header */}

                    <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

                        <div>

                            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gray-500">
                                Browse
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
                                All Products
                            </h2>

                            <p className="mt-2 text-sm text-gray-500 sm:text-base">
                                Explore our complete collection.
                            </p>

                        </div>


                        <p className="text-sm font-medium text-gray-500">
                            {products.length}{" "}
                            {products.length === 1
                                ? "Product"
                                : "Products"}
                        </p>

                    </div>


                    {/* Products */}

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">

                        {products.map((product) => (

                            <div
                                key={product.id}
                                className="min-w-0"
                            >

                                <ProductCard
                                    product={product}
                                />

                            </div>

                        ))}

                    </div>

                </div>

            </section>


            {/* =================================================
                NEWSLETTER
            ================================================= */}

            <Newsletter />

        </>

    );
}

