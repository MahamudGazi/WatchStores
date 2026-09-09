import { useEffect, useState } from "react";
import {
  Store,
  Save,
  RefreshCw,
  MapPin,
  Phone,
  Mail,
  Globe,
} from "lucide-react";
import api from "../../../api/axios";

export default function AdminStoreSettings() {
  const [settings, setSettings] = useState({
    store_name: "WatchStore",
    store_email: "admin@watchstore.com",
    phone: "+880 1XXX-XXXXXX",
    address: "Dhaka, Bangladesh",
    currency: "BDT",
    timezone: "Asia/Dhaka",
    country: "Bangladesh",
    store_active: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadSettings() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/settings/store/");

      if (response.data) {
        setSettings((prev) => ({
          ...prev,
          ...response.data,
        }));
      }
    } catch (err) {
      console.error("Store Settings API Error:", err);

      // Backend endpoint না থাকলেও page কাজ করবে
      if (err.response?.status !== 404) {
        setError(
          err.response?.data?.detail ||
            err.response?.data?.error ||
            "Failed to load store settings."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;

    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function toggleStore() {
    setSettings((prev) => ({
      ...prev,
      store_active: !prev.store_active,
    }));
  }

  async function handleSave(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      await api.put("/settings/store/", settings);

      setMessage("Store settings saved successfully.");

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (err) {
      console.error("Save Store Settings Error:", err);

      setError(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          "Failed to save store settings."
      );
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <RefreshCw
              size={32}
              className="mx-auto animate-spin text-gray-500"
            />

            <p className="mt-4 text-sm text-gray-500">
              Loading store settings...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white">
            <Store size={23} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Store Settings
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage your store profile and preferences.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadSettings}
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
        >
          <RefreshCw size={17} />
          Reload
        </button>
      </div>

      {/* Success */}
      {message && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {message}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSave}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main */}
          <div className="space-y-6 lg:col-span-2">
            {/* Store Profile */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-5">
                <Store size={21} />

                <div>
                  <h2 className="font-bold text-gray-900">
                    Store Profile
                  </h2>

                  <p className="text-sm text-gray-500">
                    Basic information about your store.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
                <Input
                  label="Store Name"
                  name="store_name"
                  value={settings.store_name}
                  onChange={handleChange}
                  icon={<Store size={18} />}
                />

                <Input
                  label="Store Email"
                  name="store_email"
                  type="email"
                  value={settings.store_email}
                  onChange={handleChange}
                  icon={<Mail size={18} />}
                />

                <Input
                  label="Phone"
                  name="phone"
                  value={settings.phone}
                  onChange={handleChange}
                  icon={<Phone size={18} />}
                />

                <Input
                  label="Country"
                  name="country"
                  value={settings.country}
                  onChange={handleChange}
                  icon={<Globe size={18} />}
                />

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Store Address
                  </label>

                  <div className="relative">
                    <MapPin
                      size={18}
                      className="absolute left-4 top-4 text-gray-400"
                    />

                    <textarea
                      name="address"
                      rows={4}
                      value={settings.address}
                      onChange={handleChange}
                      className={`${inputClass} pl-11`}
                      placeholder="Enter store address"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Regional */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-5">
                <h2 className="font-bold text-gray-900">
                  Regional Preferences
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Configure currency and timezone.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Currency
                  </label>

                  <select
                    name="currency"
                    value={settings.currency}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="BDT">
                      BDT — Bangladeshi Taka
                    </option>

                    <option value="USD">
                      USD — US Dollar
                    </option>

                    <option value="EUR">
                      EUR — Euro
                    </option>

                    <option value="GBP">
                      GBP — British Pound
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Timezone
                  </label>

                  <select
                    name="timezone"
                    value={settings.timezone}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="Asia/Dhaka">
                      Asia/Dhaka
                    </option>

                    <option value="UTC">
                      UTC
                    </option>

                    <option value="Europe/Bucharest">
                      Europe/Bucharest
                    </option>

                    <option value="Asia/Dubai">
                      Asia/Dubai
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* Store Status */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-5">
                <h2 className="font-bold text-gray-900">
                  Store Status
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Control whether customers can access the store.
                </p>
              </div>

              <div className="flex items-center justify-between gap-4 p-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Store is active
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    When disabled, you can use this setting for
                    maintenance mode.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={toggleStore}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                    settings.store_active
                      ? "bg-black"
                      : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                      settings.store_active
                        ? "left-6"
                        : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="sticky top-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-5">
                <h2 className="font-bold text-gray-900">
                  Store Overview
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Current store configuration.
                </p>
              </div>

              <div className="space-y-5 p-6">
                <InfoRow
                  label="Store"
                  value={settings.store_name}
                />

                <InfoRow
                  label="Email"
                  value={settings.store_email}
                />

                <InfoRow
                  label="Phone"
                  value={settings.phone}
                />

                <InfoRow
                  label="Country"
                  value={settings.country}
                />

                <InfoRow
                  label="Currency"
                  value={settings.currency}
                />

                <InfoRow
                  label="Timezone"
                  value={settings.timezone}
                />

                <div className="rounded-xl bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Store Status
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        settings.store_active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {settings.store_active
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 p-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  <Save size={18} />

                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

/* =====================================================
   INPUT
===================================================== */

function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  icon,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pl-11 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
        />
      </div>
    </div>
  );
}

/* =====================================================
   INFO ROW
===================================================== */

function InfoRow({ label, value }) {
  return (
    <div className="border-b border-gray-100 pb-4">
      <p className="text-xs text-gray-400">{label}</p>

      <p className="mt-1 break-words text-sm font-semibold text-gray-900">
        {value || "-"}
      </p>
    </div>
  );
}

