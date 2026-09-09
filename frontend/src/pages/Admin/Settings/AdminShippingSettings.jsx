import { useEffect, useState } from "react";
import { Save, Truck, MapPin, Package, RefreshCw } from "lucide-react";
import api from "../../../api/axios";

export default function AdminShippingSettings() {
  const [settings, setSettings] = useState({
    default_delivery_charge: 80,
    estimated_delivery_days: 5,
    free_shipping_minimum: 5000,
    shipping_country: "Bangladesh",
    inside_dhaka_charge: 80,
    outside_dhaka_charge: 120,
    free_shipping_enabled: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadSettings() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/settings/shipping/");

      if (response.data) {
        setSettings((prev) => ({
          ...prev,
          ...response.data,
        }));
      }
    } catch (err) {
      console.error("Shipping Settings API Error:", err);

      // API না থাকলেও default settings দেখাবে
      if (err.response?.status !== 404) {
        setError(
          err.response?.data?.detail ||
            err.response?.data?.error ||
            "Failed to load shipping settings."
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
    const { name, value, type, checked } = e.target;

    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSave(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const payload = {
        ...settings,
        default_delivery_charge: Number(
          settings.default_delivery_charge
        ),
        estimated_delivery_days: Number(
          settings.estimated_delivery_days
        ),
        free_shipping_minimum: Number(
          settings.free_shipping_minimum
        ),
        inside_dhaka_charge: Number(
          settings.inside_dhaka_charge
        ),
        outside_dhaka_charge: Number(
          settings.outside_dhaka_charge
        ),
      };

      await api.put("/settings/shipping/", payload);

      setMessage("Shipping settings saved successfully.");

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (err) {
      console.error("Save Shipping Settings Error:", err);

      setError(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          "Failed to save shipping settings."
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
              Loading shipping settings...
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
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white">
              <Truck size={23} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Shipping Settings
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Configure your store delivery options.
              </p>
            </div>
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
          {/* Main Settings */}
          <div className="space-y-6 lg:col-span-2">
            {/* Delivery */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-5">
                <Package size={21} />

                <div>
                  <h2 className="font-bold text-gray-900">
                    Delivery Options
                  </h2>

                  <p className="text-sm text-gray-500">
                    Configure default delivery charges and estimated time.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
                <Input
                  label="Default Delivery Charge"
                  name="default_delivery_charge"
                  type="number"
                  value={settings.default_delivery_charge}
                  onChange={handleChange}
                  suffix="৳"
                />

                <Input
                  label="Estimated Delivery Days"
                  name="estimated_delivery_days"
                  type="number"
                  value={settings.estimated_delivery_days}
                  onChange={handleChange}
                  suffix="Days"
                />

                <Input
                  label="Inside Dhaka Charge"
                  name="inside_dhaka_charge"
                  type="number"
                  value={settings.inside_dhaka_charge}
                  onChange={handleChange}
                  suffix="৳"
                />

                <Input
                  label="Outside Dhaka Charge"
                  name="outside_dhaka_charge"
                  type="number"
                  value={settings.outside_dhaka_charge}
                  onChange={handleChange}
                  suffix="৳"
                />
              </div>
            </div>

            {/* Free Shipping */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-5">
                <h2 className="font-bold text-gray-900">
                  Free Shipping
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Offer free delivery when customers reach a minimum order
                  value.
                </p>
              </div>

              <div className="space-y-5 p-6">
                <Toggle
                  name="free_shipping_enabled"
                  checked={settings.free_shipping_enabled}
                  onChange={handleChange}
                  title="Enable Free Shipping"
                  description="Customers can receive free delivery when the minimum order value is reached."
                />

                {settings.free_shipping_enabled && (
                  <Input
                    label="Free Shipping Minimum Order"
                    name="free_shipping_minimum"
                    type="number"
                    value={settings.free_shipping_minimum}
                    onChange={handleChange}
                    suffix="৳"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-5">
                <div className="flex items-center gap-3">
                  <MapPin size={21} />

                  <div>
                    <h2 className="font-bold text-gray-900">
                      Shipping Summary
                    </h2>

                    <p className="text-sm text-gray-500">
                      Current configuration
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-6">
                <SummaryRow
                  label="Country"
                  value={settings.shipping_country}
                />

                <SummaryRow
                  label="Default Charge"
                  value={`৳${Number(
                    settings.default_delivery_charge
                  ).toLocaleString()}`}
                />

                <SummaryRow
                  label="Inside Dhaka"
                  value={`৳${Number(
                    settings.inside_dhaka_charge
                  ).toLocaleString()}`}
                />

                <SummaryRow
                  label="Outside Dhaka"
                  value={`৳${Number(
                    settings.outside_dhaka_charge
                  ).toLocaleString()}`}
                />

                <SummaryRow
                  label="Delivery Time"
                  value={`${settings.estimated_delivery_days} days`}
                />

                <SummaryRow
                  label="Free Shipping"
                  value={
                    settings.free_shipping_enabled
                      ? `Above ৳${Number(
                          settings.free_shipping_minimum
                        ).toLocaleString()}`
                      : "Disabled"
                  }
                />

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs leading-5 text-gray-500">
                    Shipping charges will be used when calculating the
                    customer's checkout total.
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-100 p-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  <Save size={18} />

                  {saving ? "Saving..." : "Save Shipping Settings"}
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
  suffix,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="relative">
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          min={type === "number" ? 0 : undefined}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pr-16 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
        />

        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

/* =====================================================
   TOGGLE
===================================================== */

function Toggle({
  name,
  checked,
  onChange,
  title,
  description,
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">
          {title}
        </h3>

        <p className="mt-1 text-xs leading-5 text-gray-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={() =>
          onChange({
            target: {
              name,
              type: "checkbox",
              checked: !checked,
            },
          })
        }
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-black" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

/* =====================================================
   SUMMARY ROW
===================================================== */

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-4">
      <span className="text-sm text-gray-500">{label}</span>

      <span className="text-right text-sm font-semibold text-gray-900">
        {value}
      </span>
    </div>
  );
}

