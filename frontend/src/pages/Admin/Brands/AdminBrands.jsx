import { useEffect, useMemo, useState } from "react";
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    X,
    RefreshCw,
    Tag,
    Loader2,
} from "lucide-react";

import api from "../../../api/axios";


// =====================================================
// ADMIN BRANDS
// =====================================================

export default function AdminBrands() {

    // ===================================================
    // STATE
    // ===================================================

    const [brands, setBrands] = useState([]);

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [deletingId, setDeletingId] = useState(null);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [showModal, setShowModal] = useState(false);

    const [editingBrand, setEditingBrand] = useState(null);

    const [form, setForm] = useState({
        name: "",
    });


    // ===================================================
    // FETCH BRANDS
    // ===================================================

    const loadBrands = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await api.get(
                "/brands/"
            );

            console.log(
                "BRANDS API RESPONSE:",
                response.data
            );

            const data = response.data;

            // Handle common DRF response formats

            if (Array.isArray(data)) {

                setBrands(data);

            } else if (Array.isArray(data.results)) {

                setBrands(data.results);

            } else if (Array.isArray(data.data)) {

                setBrands(data.data);

            } else {

                setBrands([]);

            }

        } catch (err) {

            console.error(
                "BRANDS API ERROR:",
                err.response?.status,
                err.response?.data || err.message
            );

            setError(
                err.response?.data?.detail ||
                "Failed to load brands."
            );

        } finally {

            setLoading(false);

        }
    };


    // ===================================================
    // LOAD ON MOUNT
    // ===================================================

    useEffect(() => {

        loadBrands();

    }, []);


    // ===================================================
    // FILTER
    // ===================================================

    const filteredBrands = useMemo(() => {

        const value =
            search.trim().toLowerCase();

        if (!value) {
            return brands;
        }

        return brands.filter((brand) =>
            String(
                brand.name || ""
            )
                .toLowerCase()
                .includes(value)
        );

    }, [brands, search]);


    // ===================================================
    // OPEN CREATE
    // ===================================================

    const openCreateModal = () => {

        setEditingBrand(null);

        setForm({
            name: "",
        });

        setError("");

        setShowModal(true);
    };


    // ===================================================
    // OPEN EDIT
    // ===================================================

    const openEditModal = (brand) => {

        setEditingBrand(brand);

        setForm({
            name: brand.name || "",
        });

        setError("");

        setShowModal(true);
    };


    // ===================================================
    // CLOSE MODAL
    // ===================================================

    const closeModal = () => {

        if (saving) return;

        setShowModal(false);

        setEditingBrand(null);

        setForm({
            name: "",
        });

    };


    // ===================================================
    // FORM CHANGE
    // ===================================================

    const handleChange = (e) => {

        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));

    };


    // ===================================================
    // CREATE / UPDATE
    // ===================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        const name =
            form.name.trim();

        if (!name) {

            setError(
                "Brand name is required."
            );

            return;
        }

        try {

            setSaving(true);
            setError("");

            // UPDATE

            if (editingBrand) {

                const response =
                    await api.patch(
                        `/brands/${editingBrand.id}/`,
                        {
                            name,
                        }
                    );

                console.log(
                    "BRAND UPDATE RESPONSE:",
                    response.data
                );

            }

            // CREATE

            else {

                const response =
                    await api.post(
                        "/brands/",
                        {
                            name,
                        }
                    );

                console.log(
                    "BRAND CREATE RESPONSE:",
                    response.data
                );

            }

            closeModal();

            await loadBrands();

        } catch (err) {

            console.error(
                "BRAND SAVE ERROR:",
                err.response?.status,
                err.response?.data || err.message
            );

            const apiError =
                err.response?.data;

            if (
                apiError &&
                typeof apiError === "object"
            ) {

                const firstError =
                    Object.values(apiError)[0];

                if (Array.isArray(firstError)) {

                    setError(
                        firstError[0]
                    );

                } else if (
                    typeof firstError === "string"
                ) {

                    setError(
                        firstError
                    );

                } else {

                    setError(
                        "Failed to save brand."
                    );

                }

            } else {

                setError(
                    "Failed to save brand."
                );

            }

        } finally {

            setSaving(false);

        }
    };


    // ===================================================
    // DELETE
    // ===================================================

    const handleDelete = async (brand) => {

        const confirmed =
            window.confirm(
                `Are you sure you want to delete "${brand.name}"?`
            );

        if (!confirmed) return;

        try {

            setDeletingId(brand.id);

            setError("");

            await api.delete(
                `/brands/${brand.id}/`
            );

            await loadBrands();

        } catch (err) {

            console.error(
                "BRAND DELETE ERROR:",
                err.response?.status,
                err.response?.data || err.message
            );

            setError(
                err.response?.data?.detail ||
                "Failed to delete brand."
            );

        } finally {

            setDeletingId(null);

        }
    };


    // ===================================================
    // UI
    // ===================================================

    return (
        <div className="min-h-screen bg-zinc-950 p-4 text-white sm:p-6">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                <div>

                    <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-400/10">

                            <Tag
                                size={22}
                                className="text-yellow-400"
                            />

                        </div>

                        <div>

                            <h1 className="text-2xl font-bold">
                                Brands
                            </h1>

                            <p className="text-sm text-zinc-500">
                                Manage watch brands
                            </p>

                        </div>

                    </div>

                </div>


                {/* ACTIONS */}

                <div className="flex gap-2">

                    <button
                        type="button"
                        onClick={loadBrands}
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
                        onClick={openCreateModal}
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

                        Add Brand

                    </button>

                </div>

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

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
                SEARCH / STATS
            ================================================= */}

            <div className="mb-5 grid gap-4 md:grid-cols-[1fr_auto]">

                {/* SEARCH */}

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
                        placeholder="Search brands..."
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
                            focus:border-yellow-400/50
                        "
                    />

                </div>


                {/* COUNT */}

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

                    <span className="mr-2 text-white font-semibold">
                        {filteredBrands.length}
                    </span>

                    Brands

                </div>

            </div>


            {/* =================================================
                CONTENT
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

                {/* LOADING */}

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

                        Loading brands...

                    </div>

                ) : filteredBrands.length === 0 ? (

                    /* EMPTY */

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

                            <Tag
                                size={24}
                                className="text-zinc-500"
                            />

                        </div>

                        <h3 className="mb-1 text-base font-semibold">
                            No brands found
                        </h3>

                        <p className="mb-5 text-sm text-zinc-500">
                            {search
                                ? "Try a different search."
                                : "Start by adding your first brand."
                            }
                        </p>

                        {!search && (

                            <button
                                type="button"
                                onClick={openCreateModal}
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

                                Add Brand

                            </button>

                        )}

                    </div>

                ) : (

                    /* TABLE */

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[600px]">

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
                                        Brand
                                    </th>

                                    <th className="px-5 py-4 text-right">
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredBrands.map(
                                    (brand) => (

                                        <tr
                                            key={brand.id}
                                            className="
                                                border-b
                                                border-zinc-800/70
                                                transition
                                                hover:bg-zinc-800/40
                                            "
                                        >

                                            {/* ID */}

                                            <td className="px-5 py-4">

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
                                                    #{brand.id}
                                                </span>

                                            </td>


                                            {/* NAME */}

                                            <td className="px-5 py-4">

                                                <div className="flex items-center gap-3">

                                                    <div
                                                        className="
                                                            flex
                                                            h-10
                                                            w-10
                                                            items-center
                                                            justify-center
                                                            rounded-xl
                                                            bg-gradient-to-br
                                                            from-yellow-400/20
                                                            to-orange-500/10
                                                            text-sm
                                                            font-bold
                                                            text-yellow-400
                                                        "
                                                    >
                                                        {String(
                                                            brand.name || "?"
                                                        )
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>

                                                    <span className="font-medium text-white">
                                                        {brand.name}
                                                    </span>

                                                </div>

                                            </td>


                                            {/* ACTIONS */}

                                            <td className="px-5 py-4">

                                                <div className="flex justify-end gap-2">

                                                    {/* EDIT */}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openEditModal(
                                                                brand
                                                            )
                                                        }
                                                        className="
                                                            flex
                                                            h-9
                                                            w-9
                                                            items-center
                                                            justify-center
                                                            rounded-lg
                                                            bg-zinc-800
                                                            text-zinc-400
                                                            transition
                                                            hover:bg-blue-500/10
                                                            hover:text-blue-400
                                                        "
                                                        title="Edit"
                                                    >

                                                        <Pencil size={16} />

                                                    </button>


                                                    {/* DELETE */}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDelete(
                                                                brand
                                                            )
                                                        }
                                                        disabled={
                                                            deletingId ===
                                                            brand.id
                                                        }
                                                        className="
                                                            flex
                                                            h-9
                                                            w-9
                                                            items-center
                                                            justify-center
                                                            rounded-lg
                                                            bg-zinc-800
                                                            text-zinc-400
                                                            transition
                                                            hover:bg-red-500/10
                                                            hover:text-red-400
                                                            disabled:opacity-50
                                                        "
                                                        title="Delete"
                                                    >

                                                        {deletingId ===
                                                        brand.id ? (

                                                            <Loader2
                                                                size={16}
                                                                className="animate-spin"
                                                            />

                                                        ) : (

                                                            <Trash2
                                                                size={16}
                                                            />

                                                        )}

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
                MODAL
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
                            e.target === e.currentTarget
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

                        {/* MODAL HEADER */}

                        <div className="mb-6 flex items-center justify-between">

                            <div>

                                <h2 className="text-lg font-bold">
                                    {editingBrand
                                        ? "Edit Brand"
                                        : "Add Brand"}
                                </h2>

                                <p className="mt-1 text-xs text-zinc-500">
                                    {editingBrand
                                        ? "Update brand information."
                                        : "Create a new watch brand."}
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
                                    hover:bg-zinc-800
                                    hover:text-white
                                "
                            >

                                <X size={18} />

                            </button>

                        </div>


                        {/* FORM */}

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >

                            <div>

                                <label
                                    htmlFor="brand-name"
                                    className="
                                        mb-2
                                        block
                                        text-sm
                                        font-medium
                                        text-zinc-300
                                    "
                                >
                                    Brand Name
                                </label>

                                <input
                                    id="brand-name"
                                    name="name"
                                    type="text"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Rolex"
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
                                        focus:border-yellow-400/50
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


                            {/* BUTTONS */}

                            <div className="flex justify-end gap-2">

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
                                        !form.name.trim()
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

                                    {editingBrand
                                        ? "Update Brand"
                                        : "Create Brand"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}