import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Edit3,
  Zap,
  RefreshCw,
  X,
} from "lucide-react";

import api from "../../../api/axios";

const PRODUCTS_ENDPOINT = "/products/";

const EMPTY_FORM = {
  name: "",
  product: "",
  discount: "",
  start_time: "",
  end_time: "",
  active: true,
};

export default function AdminFlashSales() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingSale, setEditingSale] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);

  // =====================================================
  // LOAD FLASH SALES
  // =====================================================

  const loadSales = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/flash-sales/");

      const data = response.data;

      const salesData = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : [];

      setSales(salesData);
    } catch (err) {
      console.error("Flash Sales API Error:", err);

      if (err.response?.status === 404) {
        setError(
          "Flash Sales API not found. Make sure /api/flash-sales/ is registered in Django."
        );
      } else if (err.response?.status === 401) {
        setError("Please login as administrator.");
      } else if (err.response?.status === 403) {
        setError(
          "You don't have permission to manage flash sales."
        );
      } else {
        setError(
          err.response?.data?.detail ||
            err.response?.data?.message ||
            "Failed to load flash sales."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD PRODUCTS
  // =====================================================

  const loadProducts = async () => {
    try {
      setProductsLoading(true);

      const response = await api.get(PRODUCTS_ENDPOINT);

      const data = response.data;

      const productData = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : [];

      setProducts(productData);
    } catch (err) {
      console.error("Products API Error:", err);

      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to load products."
      );
    } finally {
      setProductsLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadSales();
    loadProducts();
  }, []);

  // =====================================================
  // FORM HANDLER
  // =====================================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // =====================================================
  // OPEN CREATE MODAL
  // =====================================================

  const openCreateModal = () => {
    setEditingSale(null);
    setForm(EMPTY_FORM);
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  // =====================================================
  // OPEN EDIT MODAL
  // =====================================================

  const openEditModal = (sale) => {
    setEditingSale(sale);

    setForm({
      name: sale.name || "",
      product: sale.product ? String(sale.product) : "",
      discount:
        sale.discount !== undefined && sale.discount !== null
          ? String(sale.discount)
          : "",
      start_time: formatDateTimeLocal(sale.start_time),
      end_time: formatDateTimeLocal(sale.end_time),
      active: sale.active ?? true,
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  // =====================================================
  // CLOSE MODAL
  // =====================================================

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingSale(null);
    setForm(EMPTY_FORM);
  };

  // =====================================================
  // CREATE / UPDATE
  // =====================================================

  const saveSale = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // -----------------------------
    // BASIC VALIDATION
    // -----------------------------

    if (!form.name.trim()) {
      setError("Sale name is required.");
      return;
    }

    if (!form.product) {
      setError("Please select a product.");
      return;
    }

    const discount = Number(form.discount);

    if (!form.discount) {
      setError("Discount is required.");
      return;
    }

    if (discount < 1 || discount > 100) {
      setError("Discount must be between 1 and 100.");
      return;
    }

    if (!form.start_time) {
      setError("Start time is required.");
      return;
    }

    if (!form.end_time) {
      setError("End time is required.");
      return;
    }

    const startDate = new Date(form.start_time);
    const endDate = new Date(form.end_time);

    if (Number.isNaN(startDate.getTime())) {
      setError("Invalid start time.");
      return;
    }

    if (Number.isNaN(endDate.getTime())) {
      setError("Invalid end time.");
      return;
    }

    if (endDate <= startDate) {
      setError("End time must be greater than start time.");
      return;
    }

    // -----------------------------
    // PAYLOAD
    // -----------------------------

    const payload = {
      name: form.name.trim(),
      product: Number(form.product),
      discount,
      start_time: toISOString(form.start_time),
      end_time: toISOString(form.end_time),
      active: Boolean(form.active),
    };

    console.log(
      editingSale
        ? "UPDATE FLASH SALE PAYLOAD:"
        : "CREATE FLASH SALE PAYLOAD:",
      payload
    );

    try {
      setSaving(true);

      let response;

      if (editingSale) {
        response = await api.patch(
          `/flash-sales/${editingSale.id}/`,
          payload
        );
      } else {
        response = await api.post(
          "/flash-sales/",
          payload
        );
      }

      console.log(
        editingSale
          ? "FLASH SALE UPDATED:"
          : "FLASH SALE CREATED:",
        response.data
      );

      if (editingSale) {
        setSales((prev) =>
          prev.map((sale) =>
            sale.id === editingSale.id
              ? response.data
              : sale
          )
        );

        setSuccess("Flash sale updated successfully.");
      } else {
        setSales((prev) => [
          response.data,
          ...prev,
        ]);

        setSuccess("Flash sale created successfully.");
      }

      setForm(EMPTY_FORM);
      setEditingSale(null);
      setShowModal(false);
    } catch (err) {
      console.error(
        editingSale
          ? "Update flash sale error:"
          : "Create flash sale error:",
        err
      );

      console.error(
        "Backend response:",
        err.response?.data
      );

      const backendErrors = err.response?.data?.errors;

      if (backendErrors) {
        setError(formatBackendErrors(backendErrors));
      } else {
        setError(
          err.response?.data?.detail ||
            err.response?.data?.message ||
            "Failed to save flash sale."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE
  // =====================================================

  const deleteSale = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this flash sale?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError("");
      setSuccess("");

      await api.delete(`/flash-sales/${id}/`);

      setSales((prev) =>
        prev.filter((sale) => sale.id !== id)
      );

      setSuccess("Flash sale deleted successfully.");
    } catch (err) {
      console.error("Delete flash sale error:", err);

      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to delete flash sale."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen overflow-x-hidden bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <RefreshCw
              size={30}
              className="mx-auto animate-spin text-gray-500"
            />

            <p className="mt-4 text-sm text-gray-500">
              Loading flash sales...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-50 p-4 sm:p-6 lg:p-8">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-center md:justify-between">

        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black text-white">
              <Zap size={22} />
            </div>

            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Flash Sales
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage time-limited product deals.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 sm:w-auto"
        >
          <Plus size={18} />
          Create Flash Sale
        </button>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span className="break-words">{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            className="shrink-0 text-red-500 hover:text-red-700"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* =================================================
          SUCCESS
      ================================================= */}

      {success && (
        <div className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <span>{success}</span>

          <button
            type="button"
            onClick={() => setSuccess("")}
            className="shrink-0 text-green-500 hover:text-green-700"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* =================================================
          EMPTY
      ================================================= */}

      {sales.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm sm:p-10">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <Zap size={28} className="text-gray-500" />
          </div>

          <h2 className="mt-5 text-xl font-bold text-gray-900">
            No Flash Sales
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
            Create a time-limited discount campaign for your
            products.
          </p>

          <button
            type="button"
            onClick={openCreateModal}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800 sm:w-auto"
          >
            <Plus size={17} />
            Create Flash Sale
          </button>
        </div>
      ) : (

        /* =================================================
           SALES TABLE
        ================================================= */

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px]">

              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>

                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 sm:px-6">
                    Sale
                  </th>

                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 sm:px-6">
                    Product
                  </th>

                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 sm:px-6">
                    Discount
                  </th>

                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 sm:px-6">
                    Start
                  </th>

                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 sm:px-6">
                    End
                  </th>

                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 sm:px-6">
                    Status
                  </th>

                  <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 sm:px-6">
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">

                {sales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="transition hover:bg-gray-50"
                  >

                    {/* SALE */}

                    <td className="px-4 py-4 sm:px-6">
                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50">
                          <Zap
                            size={18}
                            className="text-red-500"
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="max-w-[180px] truncate font-semibold text-gray-900">
                            {sale.name || "Flash Sale"}
                          </p>
                        </div>

                      </div>
                    </td>

                    {/* PRODUCT */}

                    <td className="px-4 py-4 sm:px-6">
                      <p className="max-w-[180px] truncate text-sm text-gray-600">
                        {sale.product_name ||
                          getProductName(
                            products,
                            sale.product
                          ) ||
                          "—"}
                      </p>
                    </td>

                    {/* DISCOUNT */}

                    <td className="px-4 py-4 sm:px-6">
                      <span className="font-bold text-gray-900">
                        {sale.discount || 0}%
                      </span>
                    </td>

                    {/* START */}

                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600 sm:px-6">
                      {sale.start_time
                        ? new Date(
                            sale.start_time
                          ).toLocaleString()
                        : "—"}
                    </td>

                    {/* END */}

                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600 sm:px-6">
                      {sale.end_time
                        ? new Date(
                            sale.end_time
                          ).toLocaleString()
                        : "—"}
                    </td>

                    {/* STATUS */}

                    <td className="px-4 py-4 sm:px-6">
                      <span
                        className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
                          sale.active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {sale.active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    {/* ACTIONS */}

                    <td className="px-4 py-4 sm:px-6">
                      <div className="flex justify-end gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(sale)
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 hover:text-black"
                          title="Edit"
                        >
                          <Edit3 size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteSale(sale.id)
                          }
                          disabled={
                            deletingId === sale.id
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          title="Delete"
                        >
                          {deletingId === sale.id ? (
                            <RefreshCw
                              size={16}
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>
          </div>

        </div>
      )}

      {/* =================================================
          CREATE / EDIT MODAL
      ================================================= */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-3 sm:p-4">

          <div className="my-4 flex max-h-[calc(100vh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl sm:my-8">

            {/* MODAL HEADER */}

            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-4 sm:px-6 sm:py-5">

              <div className="min-w-0">
                <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                  {editingSale
                    ? "Edit Flash Sale"
                    : "Create Flash Sale"}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Configure your limited-time offer.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="ml-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                <X size={18} />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={saveSale}
              className="overflow-y-auto p-4 sm:p-6"
            >

              <div className="space-y-5">

                {/* SALE NAME */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Sale Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Weekend Flash Sale"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
                  />
                </div>

                {/* PRODUCT */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Product
                  </label>

                  <select
                    name="product"
                    required
                    value={form.product}
                    onChange={handleChange}
                    disabled={productsLoading}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10 disabled:bg-gray-100"
                  >
                    <option value="">
                      {productsLoading
                        ? "Loading products..."
                        : "Select a product"}
                    </option>

                    {products.map((product) => (
                      <option
                        key={product.id}
                        value={product.id}
                      >
                        {product.name ||
                          product.title ||
                          `Product #${product.id}`}
                      </option>
                    ))}
                  </select>

                  {!productsLoading &&
                    products.length === 0 && (
                      <p className="mt-2 text-xs text-red-500">
                        No products found.
                      </p>
                    )}
                </div>

                {/* DISCOUNT */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Discount (%)
                  </label>

                  <input
                    type="number"
                    name="discount"
                    min="1"
                    max="100"
                    required
                    value={form.discount}
                    onChange={handleChange}
                    placeholder="20"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
                  />
                </div>

                {/* DATE/TIME */}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Start Time
                    </label>

                    <input
                      type="datetime-local"
                      name="start_time"
                      required
                      value={form.start_time}
                      onChange={handleChange}
                      className="w-full min-w-0 rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10 sm:px-4"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      End Time
                    </label>

                    <input
                      type="datetime-local"
                      name="end_time"
                      required
                      value={form.end_time}
                      onChange={handleChange}
                      className="w-full min-w-0 rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10 sm:px-4"
                    />
                  </div>

                </div>

                {/* ACTIVE */}

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-4">

                  <input
                    type="checkbox"
                    name="active"
                    checked={form.active}
                    onChange={handleChange}
                    className="mt-0.5 h-4 w-4 shrink-0"
                  />

                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Activate sale
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Make this flash sale available during
                      the selected time period.
                    </p>
                  </div>

                </label>

                {/* BUTTONS */}

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">

                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={saving}
                    className="w-full rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 sm:w-auto"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {saving ? (
                      <>
                        <RefreshCw
                          size={17}
                          className="animate-spin"
                        />
                        {editingSale
                          ? "Updating..."
                          : "Creating..."}
                      </>
                    ) : (
                      <>
                        <Zap size={17} />
                        {editingSale
                          ? "Update Sale"
                          : "Create Sale"}
                      </>
                    )}
                  </button>

                </div>

              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// =====================================================
// HELPERS
// =====================================================

function formatDateTimeLocal(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (number) =>
    String(number).padStart(2, "0");

  return `${date.getFullYear()}-${pad(
    date.getMonth() + 1
  )}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

function toISOString(value) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function getProductName(products, productId) {
  if (!productId) return "";

  const product = products.find(
    (item) => Number(item.id) === Number(productId)
  );

  return (
    product?.name ||
    product?.title ||
    ""
  );
}

function formatBackendErrors(errors) {
  if (!errors) {
    return "Failed to save flash sale.";
  }

  if (typeof errors === "string") {
    return errors;
  }

  if (typeof errors === "object") {
    return Object.entries(errors)
      .map(([field, messages]) => {
        const message = Array.isArray(messages)
          ? messages.join(", ")
          : String(messages);

        return `${field}: ${message}`;
      })
      .join(" | ");
  }

  return "Failed to save flash sale.";
}