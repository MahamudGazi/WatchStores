import { useState } from "react";
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
} from "lucide-react";

export default function Page() {
  const [zones, setZones] = useState([
    {
      id: 1,
      name: "Dhaka",
      regions: "Dhaka City, Savar, Keraniganj",
      charge: 80,
      active: true,
    },
    {
      id: 2,
      name: "Chattogram",
      regions: "Chattogram City, Sitakunda",
      charge: 120,
      active: true,
    },
    {
      id: 3,
      name: "Other Districts",
      regions: "All other districts of Bangladesh",
      charge: 150,
      active: true,
    },
  ]);

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    regions: "",
    charge: "",
  });

  const addZone = () => {
    if (!form.name.trim() || !form.regions.trim() || !form.charge) {
      return;
    }

    setZones((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: form.name,
        regions: form.regions,
        charge: Number(form.charge),
        active: true,
      },
    ]);

    setForm({
      name: "",
      regions: "",
      charge: "",
    });

    setShowForm(false);
  };

  const toggleZone = (id) => {
    setZones((prev) =>
      prev.map((zone) =>
        zone.id === id
          ? {
              ...zone,
              active: !zone.active,
            }
          : zone
      )
    );
  };

  const deleteZone = (id) => {
    setZones((prev) =>
      prev.filter((zone) => zone.id !== id)
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Shipping Zones
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage regions and delivery coverage for your store.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          <Plus size={18} />
          Add Shipping Zone
        </button>
      </div>

      {/* Add Zone Form */}
      {showForm && (
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-bold text-gray-900">
            Add Shipping Zone
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <Input
              label="Zone Name"
              placeholder="e.g. Khulna"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
            />

            <Input
              label="Regions / Areas"
              placeholder="e.g. Khulna City, Dumuria"
              value={form.regions}
              onChange={(e) =>
                setForm({
                  ...form,
                  regions: e.target.value,
                })
              }
            />

            <Input
              label="Shipping Charge"
              type="number"
              placeholder="e.g. 100"
              value={form.charge}
              onChange={(e) =>
                setForm({
                  ...form,
                  charge: e.target.value,
                })
              }
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={addZone}
              className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Save Zone
            </button>
          </div>
        </div>
      )}

      {/* Zones */}
      {zones.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {zones.map((zone) => (
            <div
              key={zone.id}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              {/* Top */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                    <MapPin
                      size={22}
                      className="text-gray-700"
                    />
                  </div>

                  <div>
                    <h2 className="font-bold text-gray-900">
                      {zone.name}
                    </h2>

                    <p className="mt-1 text-xs text-gray-500">
                      Bangladesh
                    </p>
                  </div>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    zone.active
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {zone.active ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Regions */}
              <div className="mt-6 rounded-xl bg-gray-50 p-4">
                <p className="mb-1 text-xs font-medium text-gray-500">
                  Covered Regions
                </p>

                <p className="text-sm leading-6 text-gray-700">
                  {zone.regions}
                </p>
              </div>

              {/* Charge */}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Delivery Charge
                </span>

                <span className="text-lg font-bold text-gray-900">
                  ৳{zone.charge}
                </span>
              </div>

              {/* Actions */}
              <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-5">
                <button
                  type="button"
                  onClick={() => toggleZone(zone.id)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-black"
                >
                  <CheckCircle size={17} />

                  {zone.active ? "Disable" : "Enable"}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-black"
                    title="Edit"
                  >
                    <Pencil size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteZone(zone.id)}
                    className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
          <MapPin
            size={42}
            className="mx-auto text-gray-300"
          />

          <h3 className="mt-4 font-semibold text-gray-900">
            No shipping zones
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Add your first shipping zone to configure delivery coverage.
          </p>
        </div>
      )}
    </div>
  );
}

/* =====================================================
   INPUT COMPONENT
===================================================== */

function Input({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-2 focus:ring-black/10"
      />
    </div>
  );
}

