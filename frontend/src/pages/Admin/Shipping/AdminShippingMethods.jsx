import { useState } from "react";
import { Truck, Plus, Pencil, Trash2, CheckCircle } from "lucide-react";

export default function Page() {
  const [methods, setMethods] = useState([
    {
      id: 1,
      name: "Standard Delivery",
      description: "Regular delivery service",
      estimatedDays: "3–5 Days",
      charge: 80,
      active: true,
    },
    {
      id: 2,
      name: "Express Delivery",
      description: "Fast delivery service",
      estimatedDays: "1–2 Days",
      charge: 150,
      active: true,
    },
  ]);

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    estimatedDays: "",
    charge: "",
  });

  const addMethod = () => {
    if (!form.name || !form.charge) return;

    setMethods([
      ...methods,
      {
        id: Date.now(),
        name: form.name,
        description: form.description,
        estimatedDays: form.estimatedDays,
        charge: Number(form.charge),
        active: true,
      },
    ]);

    setForm({
      name: "",
      description: "",
      estimatedDays: "",
      charge: "",
    });

    setShowForm(false);
  };

  const toggleMethod = (id) => {
    setMethods((prev) =>
      prev.map((method) =>
        method.id === id
          ? { ...method, active: !method.active }
          : method
      )
    );
  };

  const deleteMethod = (id) => {
    setMethods((prev) =>
      prev.filter((method) => method.id !== id)
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Shipping Methods
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Configure available delivery methods for your customers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          <Plus size={18} />
          Add Shipping Method
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-bold text-gray-900">
            Add Shipping Method
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Input
              label="Method Name"
              placeholder="e.g. Standard Delivery"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
            />

            <Input
              label="Estimated Delivery"
              placeholder="e.g. 3–5 Days"
              value={form.estimatedDays}
              onChange={(e) =>
                setForm({
                  ...form,
                  estimatedDays: e.target.value,
                })
              }
            />

            <Input
              label="Delivery Charge"
              type="number"
              placeholder="e.g. 80"
              value={form.charge}
              onChange={(e) =>
                setForm({
                  ...form,
                  charge: e.target.value,
                })
              }
            />

            <Input
              label="Description"
              placeholder="Describe this delivery method"
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
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
              onClick={addMethod}
              className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Save Method
            </button>
          </div>
        </div>
      )}

      {/* Methods */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {methods.map((method) => (
          <div
            key={method.id}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                  <Truck size={22} className="text-gray-700" />
                </div>

                <div>
                  <h2 className="font-bold text-gray-900">
                    {method.name}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {method.description || "No description"}
                  </p>
                </div>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  method.active
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {method.active ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs text-gray-500">
                  Delivery Time
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {method.estimatedDays || "Not specified"}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs text-gray-500">
                  Delivery Charge
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  ৳{method.charge}
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-5">
              <button
                type="button"
                onClick={() => toggleMethod(method.id)}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black"
              >
                <CheckCircle size={17} />
                {method.active ? "Disable" : "Enable"}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-black"
                  title="Edit"
                >
                  <Pencil size={17} />
                </button>

                <button
                  type="button"
                  onClick={() => deleteMethod(method.id)}
                  className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                  title="Delete"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {methods.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
          <Truck
            size={40}
            className="mx-auto text-gray-300"
          />

          <h3 className="mt-4 font-semibold text-gray-900">
            No shipping methods
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Add your first shipping method.
          </p>
        </div>
      )}
    </div>
  );
}

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

