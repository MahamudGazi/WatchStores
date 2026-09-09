import { Link } from "react-router-dom";
import useCategories from "../../hooks/useCategories";

const API_URL = import.meta.env.VITE_API_URL || "/api";
const BACKEND_URL = API_URL.replace(/\/api\/?$/, "");

const FALLBACK_IMAGE =
    "https://via.placeholder.com/600x450?text=Category";

export default function FeaturedCategories() {
    const { categories, loading } = useCategories();

    // =====================================================
    // LOADING SKELETON
    // =====================================================

    if (loading) {
        return (
            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
                <div className="mb-10 text-center">
                    <div className="mx-auto h-4 w-32 animate-pulse rounded bg-gray-200" />
                    <div className="mx-auto mt-3 h-10 w-64 animate-pulse rounded bg-gray-200" />
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
                    {[1, 2, 3, 4].map((item) => (
                        <div
                            key={item}
                            className="overflow-hidden rounded-2xl bg-white shadow-sm"
                        >
                            <div className="aspect-[4/3] animate-pulse bg-gray-200" />

                            <div className="space-y-3 p-5">
                                <div className="h-5 w-2/3 animate-pulse rounded bg-gray-200" />
                                <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                                <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    // =====================================================
    // EMPTY STATE
    // =====================================================

    if (!categories?.length) {
        return (
            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
                    <h2 className="text-xl font-bold text-gray-900">
                        No Categories Available
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                        Categories will appear here once they are added.
                    </p>
                </div>
            </section>
        );
    }

    // =====================================================
    // CATEGORY SECTION
    // =====================================================

    return (
        <section className="bg-gray-50">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">

                {/* =================================================
                    SECTION HEADER
                ================================================= */}

                <div className="mb-10 text-center sm:mb-12">
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gray-500">
                        Explore
                    </p>

                    <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
                        Shop By Category
                    </h2>

                    <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
                        Explore our carefully selected collections and find
                        the perfect product for you.
                    </p>
                </div>

                {/* =================================================
                    CATEGORY GRID
                ================================================= */}

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
                    {categories.map((category) => {
                        const imageUrl = category.image
                            ? category.image.startsWith("http")
                                ? category.image
                                : `${BACKEND_URL}${category.image}`
                            : FALLBACK_IMAGE;

                        return (
                            <Link
                                key={category.id}
                                to={`/categories/${category.id}`}
                                className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl"
                            >
                                {/* IMAGE */}

                                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                                    <img
                                        src={imageUrl}
                                        alt={category.name}
                                        className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                                        onError={(e) => {
                                            e.currentTarget.src = FALLBACK_IMAGE;
                                        }}
                                    />

                                    {/* DARK OVERLAY */}

                                    <div className="absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/30" />

                                    {/* EXPLORE BUTTON */}

                                    <div className="absolute bottom-3 left-3 translate-y-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                                        <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-gray-900 shadow">
                                            Explore

                                            <span>→</span>
                                        </span>
                                    </div>
                                </div>

                                {/* CONTENT */}

                                <div className="p-4 sm:p-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h3 className="truncate text-base font-bold text-gray-900 sm:text-lg">
                                                {category.name}
                                            </h3>

                                            {category.description && (
                                                <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-500 sm:text-sm">
                                                    {category.description}
                                                </p>
                                            )}
                                        </div>

                                        {/* ARROW */}

                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition duration-300 group-hover:border-gray-900 group-hover:bg-gray-900 group-hover:text-white">
                                            →
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}