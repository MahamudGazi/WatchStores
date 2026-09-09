import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Megaphone,
  Calendar,
  Percent,
  Eye,
  EyeOff,
  Package,
  Clock,
  X,
} from "lucide-react";
import api from "../../../api/axios";

export default function AdminPromotions() {
  const [promotions, setPromotions] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);

  const [form, setForm] = useState({
    name: "",
    product: "",
    discount: "",
    start_time: "",
    end_time: "",
    active: true,
  });

  // =========================================================
  // LOAD PROMOTIONS
  // =========================================================

  const loadPromotions = async () => {
    try {
      setLoading(true);

      const response = await api.get("/promotions/");

      const data = response.data;

      setPromotions(
        Array.isArray(data)
          ? data
          : data?.results || []
      );
    } catch (error) {
      console.error("Promotions API Error:", error);
      console.error("Backend response:", error.response?.data);

      setPromotions([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD PRODUCTS
  // =========================================================

  const loadProducts = async () => {
    try {
      setProductsLoading(true);

      const response = await api.get("/products/");

      const data = response.data;

      setProducts(
        Array.isArray(data)
          ? data
          : data?.results || []
      );
    } catch (error) {
      console.error("Products API Error:", error);
      console.error("Backend response:", error.response?.data);

      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    loadPromotions();
    loadProducts();
  }, []);

  // =========================================================
  // FORM
  // =========================================================

  const resetForm = () => {
    setForm({
      name: "",
      product: "",
      discount: "",
      start_time: "",
      end_time: "",
      active: true,
    });

    setEditingPromotion(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const formatDateTimeForInput = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const openEditModal = (promotion) => {
    setEditingPromotion(promotion);

    setForm({
      name: promotion.name || "",
      product: promotion.product || "",
      discount:
        promotion.discount !== null &&
        promotion.discount !== undefined
          ? promotion.discount
          : "",
      start_time: formatDateTimeForInput(
        promotion.start_time
      ),
      end_time: formatDateTimeForInput(
        promotion.end_time
      ),
      active: promotion.active ?? true,
    });

    setShowModal(true);
  };

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

  // =========================================================
  // DATETIME
  // =========================================================

  const convertToISO = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toISOString();
  };

  // =========================================================
  // ERROR MESSAGE
  // =========================================================

  const getBackendError = (error) => {
    const data = error?.response?.data;

    if (!data) {
      return "Failed to save promotion.";
    }

    if (typeof data === "string") {
      return data;
    }

    if (data.detail) {
      return data.detail;
    }

    if (typeof data === "object") {
      return Object.entries(data)
        .map(([field, messages]) => {
          const message = Array.isArray(messages)
            ? messages.join(", ")
            : String(messages);

          return `${field}: ${message}`;
        })
        .join("\n");
    }

    return "Failed to save promotion.";
  };

  // =========================================================
  // CREATE / UPDATE
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.product) {
      alert("Please select a product.");
      return;
    }

    if (!form.start_time) {
      alert("Please select start time.");
      return;
    }

    if (!form.end_time) {
      alert("Please select end time.");
      return;
    }

    const startDate = new Date(form.start_time);
    const endDate = new Date(form.end_time);

    if (endDate <= startDate) {
      alert("End time must be greater than start time.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      product: Number(form.product),
      discount: Number(form.discount),
      start_time: convertToISO(form.start_time),
      end_time: convertToISO(form.end_time),
      active: form.active,
    };

    console.log("PROMOTION PAYLOAD:", payload);

    try {
      setSaving(true);

      if (editingPromotion) {
        const response = await api.put(
          `/promotions/${editingPromotion.id}/`,
          payload
        );

        setPromotions((prev) =>
          prev.map((item) =>
            item.id === editingPromotion.id
              ? response.data
              : item
          )
        );
      } else {
        const response = await api.post(
          "/promotions/",
          payload
        );

        setPromotions((prev) => [
          response.data,
          ...prev,
        ]);
      }

      setShowModal(false);
      resetForm();

      await loadPromotions();
    } catch (error) {
      console.error(
        "Save promotion error:",
        error
      );

      console.error(
        "Backend response:",
        error.response?.data
      );

      alert(getBackendError(error));
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const deletePromotion = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this promotion?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/promotions/${id}/`);

      setPromotions((prev) =>
        prev.filter(
          (item) => item.id !== id
        )
      );
    } catch (error) {
      console.error(
        "Delete promotion error:",
        error
      );

      console.error(
        "Backend response:",
        error.response?.data
      );

      alert(
        getBackendError(error) ||
          "Failed to delete promotion."
      );
    }
  };

  // =========================================================
  // TOGGLE ACTIVE
  // =========================================================

  const togglePromotion = async (promotion) => {
    try {
      const response = await api.patch(
        `/promotions/${promotion.id}/`,
        {
          active: !promotion.active,
        }
      );

      setPromotions((prev) =>
        prev.map((item) =>
          item.id === promotion.id
            ? response.data
            : item
        )
      );
    } catch (error) {
      console.error(
        "Toggle promotion error:",
        error
      );

      console.error(
        "Backend response:",
        error.response?.data
      );

      alert(getBackendError(error));
    }
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =========================================================
  // FILTER
  // =========================================================

  const filteredPromotions = promotions.filter(
    (promotion) => {
      const searchText = `
        ${promotion.name || ""}
        ${promotion.product_name || ""}
      `.toLowerCase();

      return searchText.includes(
        search.toLowerCase()
      );
    }
  );

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-5 lg:p-8">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-6 flex flex-col gap-4 lg:mb-8 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex min-w-0 items-center gap-3">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black text-white">
            <Megaphone size={21} />
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold text-gray-900 sm:text-3xl">
              Promotions
            </h1>

            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
              Manage campaigns, discounts and promotional campaigns.
            </p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 sm:w-auto"
        >
          <Plus size={18} />
          Create Promotion
        </button>
      </div>

      {/* =====================================================
          SEARCH
      ===================================================== */}

      <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="relative">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search promotions or products..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-black focus:bg-white"
          />
        </div>
      </div>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-gray-200 bg-white">
          <div className="text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-black" />

            <p className="mt-4 text-sm text-gray-500">
              Loading promotions...
            </p>
          </div>
        </div>
      ) : filteredPromotions.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm sm:p-10">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
            <Megaphone
              size={28}
              className="text-gray-400"
            />
          </div>

          <h2 className="mt-5 text-xl font-bold text-gray-900">
            {search
              ? "No Promotions Found"
              : "No Promotions Yet"}
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
            {search
              ? "Try searching with another promotion or product name."
              : "Create your first promotional campaign to attract more customers."}
          </p>

          {!search && (
            <button
              onClick={openCreateModal}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
            >
              <Plus size={18} />
              Create Promotion
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

          {filteredPromotions.map(
            (promotion) => (
              <div
                key={promotion.id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
              >

                {/* =================================================
                    BANNER
                ================================================= */}

                <div className="flex min-h-[135px] items-center justify-between gap-4 bg-black p-5 text-white sm:p-6">

                  <div className="min-w-0">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-gray-300 sm:text-xs">
                      Promotion
                    </p>

                    <h2 className="mt-2 break-words text-lg font-bold sm:text-xl">
                      {promotion.name}
                    </h2>

                    {promotion.product_name && (
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-300 sm:text-sm">
                        <Package size={14} />
                        {promotion.product_name}
                      </p>
                    )}
                  </div>

                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-black sm:h-16 sm:w-16">
                    <span className="text-lg font-bold sm:text-xl">
                      {promotion.discount || 0}%
                    </span>
                  </div>
                </div>

                {/* =================================================
                    INFO
                ================================================= */}

                <div className="p-4 sm:p-5">

                  <div className="space-y-3">

                    {/* Discount */}

                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex shrink-0 items-center gap-2 text-gray-500">
                        <Percent size={16} />
                        Discount
                      </span>

                      <span className="font-semibold text-gray-900">
                        {promotion.discount || 0}%
                      </span>
                    </div>

                    {/* Product */}

                    <div className="flex items-start justify-between gap-3 text-sm">
                      <span className="flex shrink-0 items-center gap-2 text-gray-500">
                        <Package size={16} />
                        Product
                      </span>

                      <span className="max-w-[60%] break-words text-right font-medium text-gray-900">
                        {promotion.product_name ||
                          `Product #${promotion.product}`}
                      </span>
                    </div>

                    {/* Start */}

                    <div className="flex items-start justify-between gap-3 text-sm">
                      <span className="flex shrink-0 items-center gap-2 text-gray-500">
                        <Calendar size={16} />
                        Start
                      </span>

                      <span className="max-w-[60%] text-right font-medium text-gray-900">
                        {formatDate(
                          promotion.start_time
                        )}
                      </span>
                    </div>

                    {/* End */}

                    <div className="flex items-start justify-between gap-3 text-sm">
                      <span className="flex shrink-0 items-center gap-2 text-gray-500">
                        <Calendar size={16} />
                        End
                      </span>

                      <span className="max-w-[60%] text-right font-medium text-gray-900">
                        {formatDate(
                          promotion.end_time
                        )}
                      </span>
                    </div>

                  </div>

                  {/* =================================================
                      RUNNING STATUS
                  ================================================= */}

                  <div className="mt-4">

                    {promotion.is_running ? (
                      <div className="flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2 text-xs font-semibold text-green-700">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                        Promotion is currently running
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 text-xs font-medium text-gray-500">
                        <Clock size={14} />
                        Not currently running
                      </div>
                    )}

                  </div>

                  {/* =================================================
                      STATUS + ACTIONS
                  ================================================= */}

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">

                    <button
                      onClick={() =>
                        togglePromotion(
                          promotion
                        )
                      }
                      className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                        promotion.active
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {promotion.active ? (
                        <Eye size={14} />
                      ) : (
                        <EyeOff size={14} />
                      )}

                      {promotion.active
                        ? "Active"
                        : "Inactive"}
                    </button>

                    <div className="flex items-center gap-2">

                      <button
                        onClick={() =>
                          openEditModal(
                            promotion
                          )
                        }
                        className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-50 hover:text-black"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        onClick={() =>
                          deletePromotion(
                            promotion.id
                          )
                        }
                        className="rounded-lg border border-red-100 p-2 text-red-500 transition hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* =========================================================
          MODAL
      ========================================================= */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">

          <div className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl sm:max-h-[90vh]">

            {/* Modal Header */}

            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-gray-100 bg-white px-4 py-4 sm:px-6 sm:py-5">

              <div>
                <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                  {editingPromotion
                    ? "Edit Promotion"
                    : "Create Promotion"}
                </h2>

                <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                  Configure your promotional campaign.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900"
              >
                <X size={20} />
              </button>

            </div>

            {/* Form */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-4 sm:p-6"
            >

              {/* Product + Name */}

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                <Input
                  label="Promotion Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Summer Sale"
                  required
                />

                {/* Product */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Product
                  </label>

                  <select
                    name="product"
                    value={form.product}
                    onChange={handleChange}
                    required
                    disabled={productsLoading}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10 disabled:bg-gray-100"
                  >
                    <option value="">
                      {productsLoading
                        ? "Loading products..."
                        : "Select Product"}
                    </option>

                    {products.map(
                      (product) => (
                        <option
                          key={product.id}
                          value={product.id}
                        >
                          {product.name}
                        </option>
                      )
                    )}
                  </select>

                  {products.length === 0 &&
                    !productsLoading && (
                      <p className="mt-1 text-xs text-red-500">
                        No products available.
                      </p>
                    )}
                </div>

                {/* Discount */}

                <Input
                  label="Discount (%)"
                  name="discount"
                  type="number"
                  min="1"
                  max="100"
                  value={form.discount}
                  onChange={handleChange}
                  placeholder="20"
                  required
                />

                {/* Active */}

                <div className="flex items-center rounded-xl border border-gray-200 px-4 py-3">
                  <label className="flex w-full cursor-pointer items-center justify-between gap-4">

                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        Active Promotion
                      </p>

                      <p className="text-xs text-gray-500">
                        Make this campaign active.
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      name="active"
                      checked={form.active}
                      onChange={handleChange}
                      className="h-5 w-5 shrink-0 accent-black"
                    />

                  </label>
                </div>

                {/* Start Time */}

                <Input
                  label="Start Date & Time"
                  name="start_time"
                  type="datetime-local"
                  value={form.start_time}
                  onChange={handleChange}
                  required
                />

                {/* End Time */}

                <Input
                  label="End Date & Time"
                  name="end_time"
                  type="datetime-local"
                  value={form.end_time}
                  onChange={handleChange}
                  required
                />

              </div>

              {/* Backend model does not have description/banner_text */}

              <div className="rounded-xl bg-blue-50 px-4 py-3 text-xs text-blue-700">
                <strong>Note:</strong> This promotion is linked
                directly to a product. The current backend supports
                promotion name, product, discount, start/end time,
                and active status.
              </div>

              {/* Buttons */}

              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  disabled={saving}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  )}

                  {saving
                    ? editingPromotion
                      ? "Updating..."
                      : "Creating..."
                    : editingPromotion
                    ? "Update Promotion"
                    : "Create Promotion"}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================
// INPUT COMPONENT
// =============================================================

function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
  min,
  max,
  placeholder,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        min={min}
        max={max}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
      />
    </div>
  );
}

