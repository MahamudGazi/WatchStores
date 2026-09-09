import { useEffect, useMemo, useState } from "react";
import {
  Truck,
  Plus,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  X,
  Save,
} from "lucide-react";
import api from "../../../api/axios";

export default function AdminDeliveryCharges() {
  const [charges, setCharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    district: "",
    charge: "",
    estimated_days: 3,
    is_active: true,
  });

  async function loadCharges() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/settings/delivery-charges/");

      const data = response.data;

      if (Array.isArray(data)) {
        setCharges(data);
      } else if (Array.isArray(data?.results)) {
        setCharges(data.results);
      } else if (Array.isArray(data?.data)) {
        setCharges(data.data);
      } else {
        setCharges([]);
      }
    } catch (err) {
      console.error("Delivery Charges API Error:", err);

      setError(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          "Failed to load delivery charges."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCharges();
  }, []);

  function openAddModal() {
    setEditingId(null);

    setForm({
      district: "",
      charge: "",
      estimated_days: 3,
      is_active: true,
    });

    setError("");
    setShowModal(true);
  }

  function openEditModal(item) {
    setEditingId(item.id);

    setForm({
      district: item.district || "",
      charge: item.charge ?? "",
      estimated_days: item.estimated_days ?? 3,
      is_active: item.is_active ?? true,
    });

    setError("");
    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setEditingId(null);
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.district.trim()) {
      setError("District name is required.");
      return;
    }

    if (form.charge === "" || Number(form.charge) < 0) {
      setError("Please enter a valid delivery charge.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        district: form.district.trim(),
        charge: Number(form.charge),
        estimated_days: Number(form.estimated_days),
        is_active: form.is_active,
      };

      if (editingId) {
        await api.put(
          `/settings/delivery-charges/${editingId}/`,
          payload
        );

        setMessage("Delivery charge updated successfully.");
      } else {
        await api.post(
          "/settings/delivery-charges/",
          payload
        );

        setMessage("Delivery charge added successfully.");
      }

      setShowModal(false);
      setEditingId(null);

      await loadCharges();

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (err) {
      console.error("Delivery Charge Save Error:", err);

      setError(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          "Failed to save delivery charge."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this delivery charge?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await api.delete(
        `/settings/delivery-charges/${id}/`
      );

      setMessage("Delivery charge deleted successfully.");

      await loadCharges();

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (err) {
      console.error("Delete Delivery Charge Error:", err);

      setError(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          "Failed to delete delivery charge."
      );
    }
  }

  const filteredCharges = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return charges;

    return charges.filter((item) =>
      item.district?.toLowerCase().includes(query)
    );
  }, [charges, search]);

  const activeCount = charges.filter(
    (item) => item.is_active
  ).length;

  const totalCharges = charges.length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white">
            <Truck size={23} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Delivery Charges
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage district-wise delivery charges.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={loadCharges}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            <Plus size={18} />
            Add District
          </button>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {message}
        </div>
      )}

      {error && !showModal && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Districts
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {totalCharges}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Active Charges
          </p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            {activeCount}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search district..."
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-lg font-bold text-gray-900">
            District Charges
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Showing {filteredCharges.length} of {charges.length}{" "}
            districts
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw
              size={32}
              className="mx-auto animate-spin text-gray-400"
            />

            <p className="mt-4 text-sm text-gray-500">
              Loading delivery charges...
            </p>
          </div>
        ) : filteredCharges.length === 0 ? (
          <div className="p-12 text-center">
            <Truck
              size={40}
              className="mx-auto text-gray-300"
            />

            <p className="mt-4 text-lg font-semibold text-gray-700">
              No delivery charges found
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Add a district to configure its delivery charge.
            </p>

            <button
              type="button"
              onClick={openAddModal}
              className="mt-5 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Add District
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-black text-white">
                <tr>
                  <th className="p-4 text-left">
                    District
                  </th>

                  <th className="p-4 text-left">
                    Delivery Charge
                  </th>

                  <th className="p-4 text-left">
                    Estimated Days
                  </th>

                  <th className="p-4 text-left">
                    Status
                  </th>

                  <th className="p-4 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredCharges.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="p-4">
                      <span className="font-semibold text-gray-900">
                        {item.district || "-"}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="font-bold">
                        ৳
                        {Number(
                          item.charge ?? 0
                        ).toLocaleString()}
                      </span>
                    </td>

                    <td className="p-4 text-sm text-gray-600">
                      {item.estimated_days ?? "-"} days
                    </td>

                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          item.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {item.is_active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(item)
                          }
                          className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-100 hover:text-black"
                          title="Edit"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(item.id)
                          }
                          className="rounded-lg border border-red-200 p-2 text-red-600 transition hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {editingId
                    ? "Edit Delivery Charge"
                    : "Add Delivery Charge"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Configure district delivery information.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-black"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Error */}
            {error && (
              <div className="mx-6 mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  District
                </label>

                <input
                  type="text"
                  name="district"
                  value={form.district}
                  onChange={handleChange}
                  placeholder="e.g. Gopalganj"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black focus:ring-2 focus:ring-black/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Delivery Charge
                </label>

                <div className="relative">
                  <input
                    type="number"
                    name="charge"
                    min="0"
                    step="0.01"
                    value={form.charge}
                    onChange={handleChange}
                    placeholder="120"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-12 text-sm outline-none focus:border-black focus:ring-2 focus:ring-black/10"
                  />

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
                    ৳
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Estimated Delivery Days
                </label>

                <input
                  type="number"
                  name="estimated_days"
                  min="1"
                  value={form.estimated_days}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black focus:ring-2 focus:ring-black/10"
                />
              </div>

              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-gray-200 p-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Active
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Customers can use this delivery charge.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      is_active: !prev.is_active,
                    }))
                  }
                  className={`relative h-6 w-11 rounded-full transition ${
                    form.is_active
                      ? "bg-black"
                      : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                      form.is_active
                        ? "left-6"
                        : "left-1"
                    }`}
                  />
                </button>
              </label>

              {/* Buttons */}
              <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:bg-gray-400"
                >
                  <Save size={17} />

                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Charge"
                    : "Add Charge"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

