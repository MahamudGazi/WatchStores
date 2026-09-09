import { useEffect, useState } from "react";
import {
    Plus,
    Pencil,
    Trash2,
    X,
    Ticket,
    Loader2,
    Search,
    CheckCircle2,
    XCircle,
} from "lucide-react";

import api from "../../../api/axios";

export default function AdminCoupons() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);

    const [form, setForm] = useState({
        code: "",
        discount: "",
        start_date: "",
        end_date: "",
        active: true,
    });

    // =====================================================
    // LOAD COUPONS
    // =====================================================

    const loadCoupons = async () => {
        try {
            setLoading(true);

            const response = await api.get("/coupons/");

            const data =
                response.data?.results ||
                response.data?.data ||
                response.data ||
                [];

            setCoupons(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(
                "COUPONS API ERROR:",
                error.response?.status,
                error.response?.data || error.message
            );

            alert("Failed to load coupons.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCoupons();
    }, []);

    // =====================================================
    // OPEN ADD MODAL
    // =====================================================

    const openAddModal = () => {
        setEditingCoupon(null);

        setForm({
            code: "",
            discount: "",
            start_date: "",
            end_date: "",
            active: true,
        });

        setShowModal(true);
    };

    // =====================================================
    // OPEN EDIT MODAL
    // =====================================================

    const openEditModal = (coupon) => {
        setEditingCoupon(coupon);

        setForm({
            code: coupon.code || "",
            discount: coupon.discount || "",
            start_date: coupon.valid_from
                ? coupon.valid_from.slice(0, 10)
                : "",
            end_date: coupon.valid_to
                ? coupon.valid_to.slice(0, 10)
                : "",
            active:
                coupon.active ??
                coupon.is_active ??
                true,
        });

        setShowModal(true);
    };

    // =====================================================
    // FORM CHANGE
    // =====================================================

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        }));
    };

    // =====================================================
    // CREATE / UPDATE
    // =====================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.code.trim()) {
            alert("Coupon code is required.");
            return;
        }

        if (!form.discount) {
            alert("Discount is required.");
            return;
        }

        const discount = Number(form.discount);

        if (discount <= 0 || discount > 100) {
            alert("Discount must be between 1 and 100.");
            return;
        }

        if (!form.start_date) {
            alert("Start date is required.");
            return;
        }

        if (!form.end_date) {
            alert("End date is required.");
            return;
        }

        if (form.end_date < form.start_date) {
            alert("End date cannot be before start date.");
            return;
        }

        try {
            setSaving(true);

            const payload = {
                code: form.code.trim().toUpperCase(),
                discount: discount,
                active: form.active,
                valid_from: form.start_date
                    ? `${form.start_date}T00:00:00`
                    : null,
                valid_to: form.end_date
                    ? `${form.end_date}T23:59:59`
                    : null,
            };

            if (editingCoupon) {
                await api.patch(
                    `/coupons/${editingCoupon.id}/`,
                    payload
                );
            } else {
                await api.post(
                    "/coupons/",
                    payload
                );
            }

            setShowModal(false);

            await loadCoupons();

            alert(
                editingCoupon
                    ? "Coupon updated successfully."
                    : "Coupon created successfully."
            );
        } catch (error) {
            console.error(
                "COUPON SAVE ERROR:",
                error.response?.status,
                error.response?.data || error.message
            );

            const backendError =
                error.response?.data;

            alert(
                backendError
                    ? JSON.stringify(backendError)
                    : "Failed to save coupon."
            );
        } finally {
            setSaving(false);
        }
    };

    // =====================================================
    // DELETE
    // =====================================================

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this coupon?"
        );

        if (!confirmDelete) return;

        try {
            await api.delete(
                `/coupons/${id}/`
            );

            await loadCoupons();

            alert("Coupon deleted successfully.");
        } catch (error) {
            console.error(
                "COUPON DELETE ERROR:",
                error.response?.status,
                error.response?.data || error.message
            );

            alert("Failed to delete coupon.");
        }
    };

    // =====================================================
    // FILTER
    // =====================================================

    const filteredCoupons = coupons.filter(
        (coupon) =>
            coupon.code
                ?.toLowerCase()
                .includes(
                    search.toLowerCase()
                )
    );

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="min-h-screen w-full overflow-x-hidden bg-zinc-950 p-3 text-white sm:p-6 lg:p-8">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">

                <div>
                    <div className="mb-2 flex items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-500/10">
                            <Ticket
                                size={22}
                                className="text-pink-400"
                            />
                        </div>

                        <h1 className="text-2xl font-bold sm:text-3xl">
                            Coupons
                        </h1>

                    </div>

                    <p className="text-sm text-zinc-500">
                        Manage discount codes and offers
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openAddModal}
                    className="
                        flex
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-pink-500
                        px-5
                        py-3
                        text-sm
                        font-semibold
                        text-white
                        shadow-lg
                        shadow-pink-500/20
                        transition
                        hover:bg-pink-400
                        active:scale-95
                    "
                >
                    <Plus size={18} />
                    Add Coupon
                </button>

            </div>

            {/* =================================================
                SEARCH
            ================================================= */}

            <div className="mb-6">

                <div className="relative max-w-md">

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
                        placeholder="Search coupon code..."
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
                            focus:border-pink-500
                        "
                    />

                </div>

            </div>

            {/* =================================================
                TABLE
            ================================================= */}

            <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">

                {loading ? (

                    <div className="flex min-h-[300px] items-center justify-center">

                        <Loader2
                            size={30}
                            className="animate-spin text-pink-400"
                        />

                    </div>

                ) : filteredCoupons.length === 0 ? (

                    <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">

                        <Ticket
                            size={45}
                            className="mb-4 text-zinc-700"
                        />

                        <h2 className="text-lg font-semibold">
                            No Coupons Found
                        </h2>

                        <p className="mt-1 text-sm text-zinc-500">
                            Create your first coupon to get started.
                        </p>

                        <button
                            type="button"
                            onClick={openAddModal}
                            className="
                                mt-5
                                rounded-lg
                                bg-pink-500
                                px-4
                                py-2
                                text-sm
                                font-semibold
                                hover:bg-pink-400
                            "
                        >
                            Add Coupon
                        </button>

                    </div>

                ) : (

                    <div className="w-full overflow-x-auto overscroll-x-contain">

                        <table className="w-full min-w-[720px] sm:min-w-[800px]">

                            <thead>
                                <tr className="border-b border-zinc-800 bg-zinc-950">

                                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                        Code
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                        Discount
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                        Start Date
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                        End Date
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                        Status
                                    </th>

                                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                        Actions
                                    </th>

                                </tr>
                            </thead>

                            <tbody>

                                {filteredCoupons.map(
                                    (coupon) => {

                                        const isActive =
                                            coupon.active ??
                                            coupon.is_active ??
                                            false;

                                        return (
                                            <tr
                                                key={coupon.id}
                                                className="
                                                    border-b
                                                    border-zinc-800
                                                    last:border-0
                                                    hover:bg-zinc-800/40
                                                "
                                            >

                                                {/* CODE */}

                                                <td className="px-5 py-4">

                                                    <div className="flex items-center gap-3">

                                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-pink-500/10">

                                                            <Ticket
                                                                size={16}
                                                                className="text-pink-400"
                                                            />

                                                        </div>

                                                        <span className="font-semibold text-white">
                                                            {coupon.code}
                                                        </span>

                                                    </div>

                                                </td>

                                                {/* DISCOUNT */}

                                                <td className="px-5 py-4">

                                                    <span className="font-semibold text-green-400">
                                                        {coupon.discount}%
                                                    </span>

                                                </td>

                                                {/* START */}

                                                <td className="px-5 py-4 text-sm text-zinc-400">

                                                    {coupon.valid_from
                                                        ? new Date(
                                                              coupon.valid_from
                                                          ).toLocaleDateString()
                                                        : "—"}

                                                </td>

                                                {/* END */}

                                                <td className="px-5 py-4 text-sm text-zinc-400">

                                                    {coupon.valid_to
                                                        ? new Date(
                                                              coupon.valid_to
                                                          ).toLocaleDateString()
                                                        : "—"}

                                                </td>

                                                {/* STATUS */}

                                                <td className="px-5 py-4">

                                                    {isActive ? (

                                                        <span className="
                                                            inline-flex
                                                            items-center
                                                            gap-1.5
                                                            rounded-full
                                                            bg-green-500/10
                                                            px-3
                                                            py-1
                                                            text-xs
                                                            font-semibold
                                                            text-green-400
                                                        ">
                                                            <CheckCircle2
                                                                size={13}
                                                            />
                                                            Active
                                                        </span>

                                                    ) : (

                                                        <span className="
                                                            inline-flex
                                                            items-center
                                                            gap-1.5
                                                            rounded-full
                                                            bg-red-500/10
                                                            px-3
                                                            py-1
                                                            text-xs
                                                            font-semibold
                                                            text-red-400
                                                        ">
                                                            <XCircle
                                                                size={13}
                                                            />
                                                            Inactive
                                                        </span>

                                                    )}

                                                </td>

                                                {/* ACTIONS */}

                                                <td className="px-5 py-4">

                                                    <div className="flex justify-end gap-2">

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    coupon
                                                                )
                                                            }
                                                            className="
                                                                rounded-lg
                                                                bg-blue-500/10
                                                                p-2
                                                                text-blue-400
                                                                transition
                                                                hover:bg-blue-500/20
                                                            "
                                                            title="Edit"
                                                        >
                                                            <Pencil
                                                                size={16}
                                                            />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    coupon.id
                                                                )
                                                            }
                                                            className="
                                                                rounded-lg
                                                                bg-red-500/10
                                                                p-2
                                                                text-red-400
                                                                transition
                                                                hover:bg-red-500/20
                                                            "
                                                            title="Delete"
                                                        >
                                                            <Trash2
                                                                size={16}
                                                            />
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>
                                        );
                                    }
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
                        overflow-y-auto
                        bg-black/70
                        p-3
                        backdrop-blur-sm
                        sm:p-4
                    "
                >

                    <div className="
                        my-4
                        w-full
                        max-w-lg
                        rounded-2xl
                        border
                        border-zinc-800
                        bg-zinc-900
                        shadow-2xl
                    ">

                        {/* MODAL HEADER */}

                        <div className="
                            flex
                            items-center
                            justify-between
                            border-b
                            border-zinc-800
                            px-5
                            py-4
                        ">

                            <div>

                                <h2 className="text-lg font-bold">
                                    {editingCoupon
                                        ? "Edit Coupon"
                                        : "Add Coupon"}
                                </h2>

                                <p className="mt-1 text-xs text-zinc-500">
                                    {editingCoupon
                                        ? "Update coupon information"
                                        : "Create a new discount coupon"}
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowModal(false)
                                }
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
                            className="space-y-4 p-4 sm:space-y-5 sm:p-5"
                        >

                            {/* CODE */}

                            <div>

                                <label className="mb-2 block text-sm font-medium text-zinc-300">
                                    Coupon Code
                                </label>

                                <input
                                    type="text"
                                    name="code"
                                    value={form.code}
                                    onChange={handleChange}
                                    placeholder="EID20"
                                    className="
                                        w-full
                                        rounded-xl
                                        border
                                        border-zinc-700
                                        bg-zinc-950
                                        px-4
                                        py-3
                                        text-sm
                                        uppercase
                                        text-white
                                        outline-none
                                        placeholder:text-zinc-600
                                        focus:border-pink-500
                                    "
                                />

                            </div>

                            {/* DISCOUNT */}

                            <div>

                                <label className="mb-2 block text-sm font-medium text-zinc-300">
                                    Discount (%)
                                </label>

                                <input
                                    type="number"
                                    name="discount"
                                    value={form.discount}
                                    required
                                    onChange={handleChange}
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    placeholder="20"
                                    className="
                                        w-full
                                        rounded-xl
                                        border
                                        border-zinc-700
                                        bg-zinc-950
                                        px-4
                                        py-3
                                        text-sm
                                        text-white
                                        outline-none
                                        placeholder:text-zinc-600
                                        focus:border-pink-500
                                    "
                                />

                            </div>

                            {/* DATES */}

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                <div>

                                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                                        Start Date
                                    </label>

                                    <input
                                        type="date"
                                        name="start_date"
                                        value={form.start_date}
                                        required
                                        onChange={handleChange}
                                        className="
                                            w-full
                                            rounded-xl
                                            border
                                            border-zinc-700
                                            bg-zinc-950
                                            px-3
                                            py-3
                                            text-sm
                                            text-white
                                            outline-none
                                            focus:border-pink-500
                                        "
                                    />

                                </div>

                                <div>

                                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                                        End Date
                                    </label>

                                    <input
                                        type="date"
                                        name="end_date"
                                        value={form.end_date}
                                        required
                                        onChange={handleChange}
                                        className="
                                            w-full
                                            rounded-xl
                                            border
                                            border-zinc-700
                                            bg-zinc-950
                                            px-3
                                            py-3
                                            text-sm
                                            text-white
                                            outline-none
                                            focus:border-pink-500
                                        "
                                    />

                                </div>

                            </div>

                            {/* ACTIVE */}

                            <label className="
                                flex
                                cursor-pointer
                                items-center
                                gap-3
                                rounded-xl
                                border
                                border-zinc-800
                                bg-zinc-950
                                px-4
                                py-3
                            ">

                                <input
                                    type="checkbox"
                                    name="active"
                                    checked={form.active}
                                    onChange={handleChange}
                                    className="
                                        h-4
                                        w-4
                                        accent-pink-500
                                    "
                                />

                                <div>

                                    <p className="text-sm font-medium text-white">
                                        Active Coupon
                                    </p>

                                    <p className="text-xs text-zinc-500">
                                        Allow customers to use this coupon
                                    </p>

                                </div>

                            </label>

                            {/* BUTTONS */}

                            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowModal(false)
                                    }
                                    className="
                                        w-full
                                        rounded-xl
                                        border
                                        border-zinc-700
                                        px-5
                                        py-3
                                        sm:w-auto
                                        text-sm
                                        font-medium
                                        text-zinc-300
                                        transition
                                        hover:bg-zinc-800
                                    "
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="
                                        flex
                                        w-full
                                        items-center
                                        justify-center
                                        gap-2
                                        rounded-xl
                                        bg-pink-500
                                        px-5
                                        py-3
                                        text-sm
                                        font-semibold
                                        text-white
                                        transition
                                        hover:bg-pink-400
                                        disabled:cursor-not-allowed
                                        disabled:opacity-50
                                        sm:w-auto
                                    "
                                >

                                    {saving && (
                                        <Loader2
                                            size={16}
                                            className="animate-spin"
                                        />
                                    )}

                                    {editingCoupon
                                        ? "Update Coupon"
                                        : "Create Coupon"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}