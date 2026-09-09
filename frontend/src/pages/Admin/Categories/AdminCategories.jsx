import { useEffect, useMemo, useState } from "react";
import {
    Plus,
    Search,
    Trash2,
    X,
    RefreshCw,
    FolderTree,
    Loader2,
} from "lucide-react";

import api from "../../../api/axios";


// =====================================================
// ADMIN CATEGORIES
// =====================================================

export default function AdminCategories() {

    // ===================================================
    // STATE
    // ===================================================

    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [deletingId, setDeletingId] = useState(null);

    const [search, setSearch] = useState("");

    const [showModal, setShowModal] = useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");

    const [name, setName] = useState("");


    // ===================================================
    // LOAD CATEGORIES
    // ===================================================

    const loadCategories = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await api.get(
                "/categories/"
            );

            console.log(
                "CATEGORIES API RESPONSE:",
                response.data
            );

            const data = response.data;

            if (Array.isArray(data)) {

                setCategories(data);

            } else if (
                Array.isArray(data.results)
            ) {

                setCategories(data.results);

            } else if (
                Array.isArray(data.data)
            ) {

                setCategories(data.data);

            } else {

                setCategories([]);

            }

        } catch (err) {

            console.error(
                "CATEGORIES API ERROR:",
                err.response?.status,
                err.response?.data ||
                    err.message
            );

            setError(
                err.response?.data?.detail ||
                "Failed to load categories."
            );

        } finally {

            setLoading(false);

        }
    };


    // ===================================================
    // INITIAL LOAD
    // ===================================================

    useEffect(() => {

        loadCategories();

    }, []);


    // ===================================================
    // SEARCH
    // ===================================================

    const filteredCategories = useMemo(() => {

        const query =
            search.trim().toLowerCase();

        if (!query) {

            return categories;

        }

        return categories.filter(
            (category) =>
                String(
                    category.name || ""
                )
                    .toLowerCase()
                    .includes(query)
        );

    }, [categories, search]);


    // ===================================================
    // OPEN MODAL
    // ===================================================

    const openModal = () => {

        setName("");

        setError("");

        setSuccess("");

        setShowModal(true);

    };


    // ===================================================
    // CLOSE MODAL
    // ===================================================

    const closeModal = () => {

        if (saving) return;

        setShowModal(false);

        setName("");

    };


    // ===================================================
    // ADD CATEGORY
    // ===================================================

    const handleAddCategory = async (e) => {

        e.preventDefault();

        const categoryName =
            name.trim();

        if (!categoryName) {

            setError(
                "Category name is required."
            );

            return;

        }

        try {

            setSaving(true);

            setError("");

            setSuccess("");

            const response =
                await api.post(
                    "/categories/",
                    {
                        name: categoryName,
                    }
                );

            console.log(
                "CATEGORY CREATE RESPONSE:",
                response.data
            );

            setSuccess(
                "Category added successfully."
            );

            setName("");

            await loadCategories();

            setTimeout(() => {

                setShowModal(false);

                setSuccess("");

            }, 700);

        } catch (err) {

            console.error(
                "CATEGORY CREATE ERROR:",
                err.response?.status,
                err.response?.data ||
                    err.message
            );

            const data =
                err.response?.data;

            if (
                data &&
                typeof data === "object"
            ) {

                const firstError =
                    Object.values(data)[0];

                if (
                    Array.isArray(firstError)
                ) {

                    setError(
                        firstError[0]
                    );

                } else if (
                    typeof firstError ===
                    "string"
                ) {

                    setError(
                        firstError
                    );

                } else {

                    setError(
                        "Failed to add category."
                    );

                }

            } else {

                setError(
                    "Failed to add category."
                );

            }

        } finally {

            setSaving(false);

        }
    };


    // ===================================================
    // DELETE CATEGORY
    // ===================================================

    const handleDeleteCategory =
        async (category) => {

            const confirmed =
                window.confirm(
                    `Are you sure you want to remove "${category.name}"?`
                );

            if (!confirmed) return;

            try {

                setDeletingId(
                    category.id
                );

                setError("");

                setSuccess("");

                await api.delete(
                    `/categories/${category.id}/`
                );

                setSuccess(
                    "Category removed successfully."
                );

                await loadCategories();

            } catch (err) {

                console.error(
                    "CATEGORY DELETE ERROR:",
                    err.response?.status,
                    err.response?.data ||
                        err.message
                );

                setError(
                    err.response?.data?.detail ||
                    "Failed to remove category."
                );

            } finally {

                setDeletingId(null);

            }
        };


    // ===================================================
    // UI
    // ===================================================

    return (
        <div
            className="
                min-h-screen
                bg-zinc-950
                p-4
                text-white
                sm:p-6
            "
        >

            {/* =================================================
                HEADER
            ================================================= */}

            <div
                className="
                    mb-6
                    flex
                    flex-col
                    gap-4
                    lg:flex-row
                    lg:items-center
                    lg:justify-between
                "
            >

                <div>

                    <div className="flex items-center gap-3">

                        <div
                            className="
                                flex
                                h-11
                                w-11
                                items-center
                                justify-center
                                rounded-xl
                                bg-pink-400/10
                            "
                        >

                            <FolderTree
                                size={22}
                                className="text-pink-400"
                            />

                        </div>

                        <div>

                            <h1
                                className="
                                    text-2xl
                                    font-bold
                                "
                            >
                                Categories
                            </h1>

                            <p
                                className="
                                    text-sm
                                    text-zinc-500
                                "
                            >
                                Manage product categories
                            </p>

                        </div>

                    </div>

                </div>


                {/* ACTIONS */}

                <div className="flex gap-2">

                    <button
                        type="button"
                        onClick={loadCategories}
                        disabled={loading}
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
                            py-2.5
                            text-sm
                            font-medium
                            text-zinc-300
                            transition
                            hover:bg-zinc-800
                            hover:text-white
                            disabled:opacity-50
                        "
                    >

                        <RefreshCw
                            size={16}
                            className={
                                loading
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        Refresh

                    </button>


                    <button
                        type="button"
                        onClick={openModal}
                        className="
                            flex
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            bg-yellow-400
                            px-4
                            py-2.5
                            text-sm
                            font-bold
                            text-black
                            transition
                            hover:bg-yellow-300
                            active:scale-95
                        "
                    >

                        <Plus size={17} />

                        Add Category

                    </button>

                </div>

            </div>


            {/* =================================================
                SUCCESS
            ================================================= */}

            {success && (

                <div
                    className="
                        mb-5
                        rounded-xl
                        border
                        border-emerald-500/20
                        bg-emerald-500/10
                        px-4
                        py-3
                        text-sm
                        text-emerald-400
                    "
                >
                    {success}
                </div>

            )}


            {/* =================================================
                ERROR
            ================================================= */}

            {error && !showModal && (

                <div
                    className="
                        mb-5
                        rounded-xl
                        border
                        border-red-500/20
                        bg-red-500/10
                        px-4
                        py-3
                        text-sm
                        text-red-400
                    "
                >
                    {error}
                </div>

            )}


            {/* =================================================
                SEARCH
            ================================================= */}

            <div
                className="
                    mb-5
                    grid
                    gap-4
                    md:grid-cols-[1fr_auto]
                "
            >

                <div className="relative">

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
                        placeholder="Search categories..."
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
                            focus:border-pink-400/50
                        "
                    />

                </div>


                <div
                    className="
                        flex
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-zinc-800
                        bg-zinc-900
                        px-5
                        py-3
                        text-sm
                        text-zinc-400
                    "
                >

                    <span
                        className="
                            mr-2
                            font-semibold
                            text-white
                        "
                    >
                        {filteredCategories.length}
                    </span>

                    Categories

                </div>

            </div>


            {/* =================================================
                CATEGORY TABLE
            ================================================= */}

            <div
                className="
                    overflow-hidden
                    rounded-2xl
                    border
                    border-zinc-800
                    bg-zinc-900/60
                "
            >

                {loading ? (

                    <div
                        className="
                            flex
                            min-h-[300px]
                            items-center
                            justify-center
                            gap-3
                            text-zinc-500
                        "
                    >

                        <Loader2
                            size={22}
                            className="animate-spin"
                        />

                        Loading categories...

                    </div>

                ) : filteredCategories.length ===
                  0 ? (

                    <div
                        className="
                            flex
                            min-h-[300px]
                            flex-col
                            items-center
                            justify-center
                            px-6
                            text-center
                        "
                    >

                        <div
                            className="
                                mb-4
                                flex
                                h-14
                                w-14
                                items-center
                                justify-center
                                rounded-2xl
                                bg-zinc-800
                            "
                        >

                            <FolderTree
                                size={24}
                                className="text-zinc-500"
                            />

                        </div>

                        <h3
                            className="
                                mb-1
                                text-base
                                font-semibold
                            "
                        >
                            No categories found
                        </h3>

                        <p
                            className="
                                mb-5
                                text-sm
                                text-zinc-500
                            "
                        >
                            {search
                                ? "Try a different search."
                                : "Add your first category."
                            }
                        </p>

                        {!search && (

                            <button
                                type="button"
                                onClick={openModal}
                                className="
                                    flex
                                    items-center
                                    gap-2
                                    rounded-xl
                                    bg-yellow-400
                                    px-4
                                    py-2.5
                                    text-sm
                                    font-bold
                                    text-black
                                    hover:bg-yellow-300
                                "
                            >

                                <Plus size={16} />

                                Add Category

                            </button>

                        )}

                    </div>

                ) : (

                    <div className="overflow-x-auto">

                        <table
                            className="
                                w-full
                                min-w-[600px]
                            "
                        >

                            <thead>

                                <tr
                                    className="
                                        border-b
                                        border-zinc-800
                                        text-left
                                        text-xs
                                        uppercase
                                        tracking-wider
                                        text-zinc-500
                                    "
                                >

                                    <th className="px-5 py-4">
                                        ID
                                    </th>

                                    <th className="px-5 py-4">
                                        Category
                                    </th>

                                    <th className="px-5 py-4 text-right">
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredCategories.map(
                                    (category) => (

                                        <tr
                                            key={
                                                category.id
                                            }
                                            className="
                                                border-b
                                                border-zinc-800/70
                                                transition
                                                hover:bg-zinc-800/40
                                            "
                                        >

                                            {/* ID */}

                                            <td
                                                className="
                                                    px-5
                                                    py-4
                                                "
                                            >

                                                <span
                                                    className="
                                                        rounded-lg
                                                        bg-zinc-800
                                                        px-2.5
                                                        py-1
                                                        text-xs
                                                        text-zinc-400
                                                    "
                                                >
                                                    #{category.id}
                                                </span>

                                            </td>


                                            {/* NAME */}

                                            <td
                                                className="
                                                    px-5
                                                    py-4
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
                                                            bg-pink-400/10
                                                            text-sm
                                                            font-bold
                                                            text-pink-400
                                                        "
                                                    >
                                                        {String(
                                                            category.name ||
                                                                "?"
                                                        )
                                                            .charAt(
                                                                0
                                                            )
                                                            .toUpperCase()}
                                                    </div>

                                                    <span
                                                        className="
                                                            font-medium
                                                            text-white
                                                        "
                                                    >
                                                        {
                                                            category.name
                                                        }
                                                    </span>

                                                </div>

                                            </td>


                                            {/* DELETE */}

                                            <td
                                                className="
                                                    px-5
                                                    py-4
                                                "
                                            >

                                                <div
                                                    className="
                                                        flex
                                                        justify-end
                                                    "
                                                >

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDeleteCategory(
                                                                category
                                                            )
                                                        }
                                                        disabled={
                                                            deletingId ===
                                                            category.id
                                                        }
                                                        className="
                                                            flex
                                                            h-9
                                                            items-center
                                                            gap-2
                                                            rounded-lg
                                                            bg-zinc-800
                                                            px-3
                                                            text-xs
                                                            font-medium
                                                            text-zinc-400
                                                            transition
                                                            hover:bg-red-500/10
                                                            hover:text-red-400
                                                            disabled:opacity-50
                                                        "
                                                    >

                                                        {deletingId ===
                                                        category.id ? (

                                                            <Loader2
                                                                size={15}
                                                                className="animate-spin"
                                                            />

                                                        ) : (

                                                            <Trash2
                                                                size={15}
                                                            />

                                                        )}

                                                        Remove

                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* =================================================
                ADD CATEGORY MODAL
            ================================================= */}

            {showModal && (

                <div
                    className="
                        fixed
                        inset-0
                        z-[100]
                        flex
                        items-center
                        justify-center
                        bg-black/70
                        p-4
                        backdrop-blur-sm
                    "
                    onMouseDown={(e) => {

                        if (
                            e.target ===
                            e.currentTarget
                        ) {

                            closeModal();

                        }

                    }}
                >

                    <div
                        className="
                            w-full
                            max-w-md
                            rounded-2xl
                            border
                            border-zinc-800
                            bg-zinc-950
                            p-6
                            shadow-2xl
                        "
                    >

                        {/* HEADER */}

                        <div
                            className="
                                mb-6
                                flex
                                items-center
                                justify-between
                            "
                        >

                            <div>

                                <h2
                                    className="
                                        text-lg
                                        font-bold
                                    "
                                >
                                    Add Category
                                </h2>

                                <p
                                    className="
                                        mt-1
                                        text-xs
                                        text-zinc-500
                                    "
                                >
                                    Create a new product category.
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={saving}
                                className="
                                    rounded-lg
                                    p-2
                                    text-zinc-500
                                    transition
                                    hover:bg-zinc-800
                                    hover:text-white
                                "
                            >

                                <X size={18} />

                            </button>

                        </div>


                        {/* FORM */}

                        <form
                            onSubmit={
                                handleAddCategory
                            }
                            className="space-y-5"
                        >

                            <div>

                                <label
                                    htmlFor="category-name"
                                    className="
                                        mb-2
                                        block
                                        text-sm
                                        font-medium
                                        text-zinc-300
                                    "
                                >
                                    Category Name
                                </label>

                                <input
                                    id="category-name"
                                    type="text"
                                    value={name}
                                    onChange={(e) =>
                                        setName(
                                            e.target.value
                                        )
                                    }
                                    placeholder="e.g. Luxury Watches"
                                    autoFocus
                                    disabled={saving}
                                    className="
                                        w-full
                                        rounded-xl
                                        border
                                        border-zinc-800
                                        bg-zinc-900
                                        px-4
                                        py-3
                                        text-sm
                                        text-white
                                        outline-none
                                        placeholder:text-zinc-600
                                        focus:border-pink-400/50
                                        disabled:opacity-50
                                    "
                                />

                            </div>


                            {/* MODAL ERROR */}

                            {error && (

                                <div
                                    className="
                                        rounded-xl
                                        border
                                        border-red-500/20
                                        bg-red-500/10
                                        px-3
                                        py-2.5
                                        text-xs
                                        text-red-400
                                    "
                                >
                                    {error}
                                </div>

                            )}


                            {/* MODAL SUCCESS */}

                            {success && (

                                <div
                                    className="
                                        rounded-xl
                                        border
                                        border-emerald-500/20
                                        bg-emerald-500/10
                                        px-3
                                        py-2.5
                                        text-xs
                                        text-emerald-400
                                    "
                                >
                                    {success}
                                </div>

                            )}


                            {/* BUTTONS */}

                            <div
                                className="
                                    flex
                                    justify-end
                                    gap-2
                                "
                            >

                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={saving}
                                    className="
                                        rounded-xl
                                        border
                                        border-zinc-800
                                        bg-zinc-900
                                        px-4
                                        py-2.5
                                        text-sm
                                        font-medium
                                        text-zinc-400
                                        transition
                                        hover:bg-zinc-800
                                        hover:text-white
                                        disabled:opacity-50
                                    "
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    disabled={
                                        saving ||
                                        !name.trim()
                                    }
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                        rounded-xl
                                        bg-yellow-400
                                        px-5
                                        py-2.5
                                        text-sm
                                        font-bold
                                        text-black
                                        transition
                                        hover:bg-yellow-300
                                        disabled:cursor-not-allowed
                                        disabled:opacity-50
                                    "
                                >

                                    {saving && (

                                        <Loader2
                                            size={16}
                                            className="animate-spin"
                                        />

                                    )}

                                    Add Category

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}