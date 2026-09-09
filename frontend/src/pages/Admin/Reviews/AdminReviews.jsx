import { useEffect, useMemo, useState } from "react";
import api from "../../../api/axios";

export default function AdminReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [ratingFilter, setRatingFilter] = useState("all");

    async function loadReviews(isRefresh = false) {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const response = await api.get("/reviews/admin/");

            const data = response.data;

            const items = Array.isArray(data)
                ? data
                : Array.isArray(data?.data)
                    ? data.data
                    : Array.isArray(data?.results)
                        ? data.results
                        : [];

            setReviews(items);
        } catch (err) {
            console.error("Reviews API Error:", err);

            if (err.response?.status === 401) {
                setError(
                    "Authentication required. Please login again."
                );
            } else if (err.response?.status === 403) {
                setError(
                    "You do not have permission to manage reviews."
                );
            } else {
                setError(
                    err.response?.data?.detail ||
                    err.response?.data?.error ||
                    "Failed to load reviews."
                );
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        loadReviews();
    }, []);

    const filteredReviews = useMemo(() => {
        const query = search.trim().toLowerCase();

        return reviews.filter((review) => {
            const userName =
                review.user_name ||
                review.username ||
                review.user?.username ||
                "";

            const productName =
                review.product_name ||
                review.product?.name ||
                "";

            const comment = review.comment || "";

            const matchesSearch =
                !query ||
                userName.toLowerCase().includes(query) ||
                productName.toLowerCase().includes(query) ||
                comment.toLowerCase().includes(query);

            const rating = Number(review.rating || 0);

            const matchesRating =
                ratingFilter === "all" ||
                rating === Number(ratingFilter);

            return matchesSearch && matchesRating;
        });
    }, [reviews, search, ratingFilter]);

    async function handleDelete(id) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this review?"
        );

        if (!confirmed) return;

        try {
            await api.delete(`/reviews/${id}/`);

            setReviews((current) =>
                current.filter(
                    (review) => review.id !== id
                )
            );
        } catch (err) {
            console.error("Delete Review Error:", err);

            alert(
                err.response?.data?.detail ||
                "Failed to delete review."
            );
        }
    }

    function getStars(rating) {
        const value = Number(rating || 0);

        return (
            <span>
                <span className="text-yellow-500">
                    {"★".repeat(value)}
                </span>

                <span className="text-gray-300">
                    {"★".repeat(5 - value)}
                </span>
            </span>
        );
    }

    function formatDate(date) {
        if (!date) return "-";

        return new Date(date).toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">

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
                        text-gray-900
                    ">
                        Reviews
                    </h1>

                    <p className="text-gray-500 mt-1">
                        Moderate and manage customer reviews
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => loadReviews(true)}
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
                    {refreshing
                        ? "Refreshing..."
                        : "↻ Refresh"}
                </button>
            </div>

            {error && (
                <div className="
                    mb-6
                    bg-red-50
                    border
                    border-red-200
                    rounded-xl
                    p-4
                    text-red-700
                ">
                    <p className="font-semibold">
                        Reviews Error
                    </p>

                    <p className="text-sm mt-1">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() => loadReviews()}
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

            {!loading && (
                <div className="
                    bg-white
                    border
                    rounded-2xl
                    shadow-sm
                    p-4
                    mb-6
                ">
                    <div className="
                        flex
                        flex-col
                        md:flex-row
                        gap-3
                    ">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            placeholder="Search user, product or comment..."
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
                            value={ratingFilter}
                            onChange={(e) =>
                                setRatingFilter(e.target.value)
                            }
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
                                All Ratings
                            </option>
                            <option value="5">
                                5 Stars
                            </option>
                            <option value="4">
                                4 Stars
                            </option>
                            <option value="3">
                                3 Stars
                            </option>
                            <option value="2">
                                2 Stars
                            </option>
                            <option value="1">
                                1 Star
                            </option>
                        </select>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="
                    bg-white
                    border
                    rounded-2xl
                    shadow-sm
                    p-12
                    text-center
                ">
                    <div className="
                        animate-spin
                        rounded-full
                        h-10
                        w-10
                        border-b-4
                        border-black
                        mx-auto
                    " />

                    <p className="text-gray-500 mt-4">
                        Loading reviews...
                    </p>
                </div>
            ) : (
                <div className="
                    bg-white
                    border
                    rounded-2xl
                    shadow-sm
                    overflow-hidden
                ">
                    <div className="
                        px-5
                        py-4
                        border-b
                    ">
                        <h2 className="text-lg font-bold">
                            Customer Reviews
                        </h2>

                        <p className="
                            text-sm
                            text-gray-500
                            mt-1
                        ">
                            Showing {filteredReviews.length} of{" "}
                            {reviews.length} reviews
                        </p>
                    </div>

                    {filteredReviews.length === 0 ? (
                        <div className="
                            p-12
                            text-center
                        ">
                            <p className="
                                text-lg
                                font-semibold
                                text-gray-700
                            ">
                                No reviews found
                            </p>

                            <p className="
                                text-sm
                                text-gray-500
                                mt-1
                            ">
                                Try changing your search or filter.
                            </p>
                        </div>
                    ) : (
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
                                            Customer
                                        </th>

                                        <th className="p-4 text-left">
                                            Product
                                        </th>

                                        <th className="p-4 text-left">
                                            Rating
                                        </th>

                                        <th className="p-4 text-left">
                                            Comment
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
                                    {filteredReviews.map(
                                        (review) => (
                                            <tr
                                                key={review.id}
                                                className="
                                                    border-b
                                                    hover:bg-gray-50
                                                "
                                            >
                                                <td className="p-4">
                                                    <p className="font-semibold">
                                                        {review.user_name ||
                                                            review.username ||
                                                            review.user?.username ||
                                                            "Unknown"}
                                                    </p>
                                                </td>

                                                <td className="p-4">
                                                    <p className="font-medium">
                                                        {review.product_name ||
                                                            review.product?.name ||
                                                            "Unknown Product"}
                                                    </p>
                                                </td>

                                                <td className="p-4">
                                                    <div>
                                                        {getStars(
                                                            review.rating
                                                        )}

                                                        <p className="
                                                            text-xs
                                                            text-gray-500
                                                            mt-1
                                                        ">
                                                            {review.rating}/5
                                                        </p>
                                                    </div>
                                                </td>

                                                <td className="
                                                    p-4
                                                    max-w-[350px]
                                                ">
                                                    <p className="
                                                        text-sm
                                                        text-gray-700
                                                    ">
                                                        {review.comment ||
                                                            "-"}
                                                    </p>
                                                </td>

                                                <td className="
                                                    p-4
                                                    text-sm
                                                    text-gray-500
                                                ">
                                                    {formatDate(
                                                        review.created_at
                                                    )}
                                                </td>

                                                <td className="p-4">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDelete(
                                                                review.id
                                                            )
                                                        }
                                                        className="
                                                            bg-red-600
                                                            hover:bg-red-700
                                                            text-white
                                                            px-4
                                                            py-2
                                                            rounded-lg
                                                            text-sm
                                                            font-semibold
                                                        "
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}