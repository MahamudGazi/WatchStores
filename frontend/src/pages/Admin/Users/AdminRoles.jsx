import { useState } from "react";
import {
  Shield,
  Users,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
} from "lucide-react";

const PERMISSIONS = [
  "Dashboard",
  "Products",
  "Categories",
  "Orders",
  "Customers",
  "Reviews",
  "Coupons",
  "Payments",
  "Shipping",
  "Settings",
];

const INITIAL_ROLES = [
  {
    id: 1,
    name: "Super Admin",
    description: "Full access to all store features.",
    users: 1,
    permissions: [...PERMISSIONS],
    system: true,
  },
  {
    id: 2,
    name: "Manager",
    description: "Manage products, orders and customers.",
    users: 2,
    permissions: [
      "Dashboard",
      "Products",
      "Categories",
      "Orders",
      "Customers",
      "Reviews",
      "Coupons",
      "Shipping",
    ],
    system: false,
  },
  {
    id: 3,
    name: "Staff",
    description: "Limited access for store staff.",
    users: 4,
    permissions: [
      "Dashboard",
      "Products",
      "Orders",
      "Customers",
    ],
    system: false,
  },
];

export default function Page() {
  const [roles, setRoles] = useState(INITIAL_ROLES);

  const [selectedRole, setSelectedRole] = useState(
    INITIAL_ROLES[0]
  );

  const [showForm, setShowForm] = useState(false);

  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    permissions: [],
  });

  const openAddForm = () => {
    setEditing(false);

    setForm({
      name: "",
      description: "",
      permissions: [],
    });

    setShowForm(true);
  };

  const openEditForm = (role) => {
    setEditing(true);

    setSelectedRole(role);

    setForm({
      name: role.name,
      description: role.description,
      permissions: [...role.permissions],
    });

    setShowForm(true);
  };

  const togglePermission = (permission) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(
            (item) => item !== permission
          )
        : [...prev.permissions, permission],
    }));
  };

  const saveRole = () => {
    if (!form.name.trim()) return;

    if (editing) {
      setRoles((prev) =>
        prev.map((role) =>
          role.id === selectedRole.id
            ? {
                ...role,
                name: form.name,
                description: form.description,
                permissions: form.permissions,
              }
            : role
        )
      );

      setSelectedRole({
        ...selectedRole,
        name: form.name,
        description: form.description,
        permissions: form.permissions,
      });
    } else {
      const newRole = {
        id: Date.now(),
        name: form.name,
        description: form.description,
        users: 0,
        permissions: form.permissions,
        system: false,
      };

      setRoles((prev) => [...prev, newRole]);

      setSelectedRole(newRole);
    }

    setShowForm(false);
  };

  const deleteRole = (role) => {
    if (role.system) return;

    setRoles((prev) =>
      prev.filter((item) => item.id !== role.id)
    );

    if (selectedRole.id === role.id) {
      setSelectedRole(roles[0]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Roles & Permissions
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Control what administrators and staff can access.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          <Plus size={18} />
          Add Role
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">
              {editing ? "Edit Role" : "Create Role"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Configure role information and permissions.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Input
              label="Role Name"
              placeholder="e.g. Sales Manager"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
            />

            <Input
              label="Description"
              placeholder="Describe this role"
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
            />
          </div>

          <div className="mt-6">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">
              Permissions
            </h3>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {PERMISSIONS.map((permission) => {
                const checked =
                  form.permissions.includes(permission);

                return (
                  <button
                    key={permission}
                    type="button"
                    onClick={() =>
                      togglePermission(permission)
                    }
                    className={`flex items-center gap-3 rounded-xl border p-4 text-left text-sm font-medium transition ${
                      checked
                        ? "border-black bg-black text-white"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                        checked
                          ? "border-white bg-white text-black"
                          : "border-gray-300"
                      }`}
                    >
                      {checked && <Check size={13} />}
                    </span>

                    {permission}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              <X size={17} />
              Cancel
            </button>

            <button
              type="button"
              onClick={saveRole}
              className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
            >
              {editing ? "Update Role" : "Create Role"}
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Roles */}
        <div className="lg:col-span-5">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-5">
              <h2 className="font-bold text-gray-900">
                Roles
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                {roles.length} roles configured
              </p>
            </div>

            <div className="divide-y divide-gray-100">
              {roles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => {
                    setSelectedRole(role);
                    setShowForm(false);
                  }}
                  className={`flex w-full items-center gap-4 p-5 text-left transition ${
                    selectedRole.id === role.id
                      ? "bg-gray-50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      selectedRole.id === role.id
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Shield size={20} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-gray-900">
                        {role.name}
                      </h3>

                      {role.system && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
                          SYSTEM
                        </span>
                      )}
                    </div>

                    <p className="mt-1 truncate text-xs text-gray-500">
                      {role.description}
                    </p>

                    <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                      <Users size={13} />
                      {role.users} user
                      {role.users !== 1 ? "s" : ""}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Role Details */}
        <div className="lg:col-span-7">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-gray-100 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                  <Shield size={22} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {selectedRole.name}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {selectedRole.description}
                  </p>
                </div>
              </div>

              {!selectedRole.system && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      openEditForm(selectedRole)
                    }
                    className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                  >
                    <Pencil size={15} />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      deleteRole(selectedRole)
                    }
                    className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={15} />
                    Delete
                  </button>
                </div>
              )}
            </div>

            {/* Permissions */}
            <div className="p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Permissions
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    {selectedRole.permissions.length} of{" "}
                    {PERMISSIONS.length} permissions enabled
                  </p>
                </div>

                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  Active
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {PERMISSIONS.map((permission) => {
                  const enabled =
                    selectedRole.permissions.includes(
                      permission
                    );

                  return (
                    <div
                      key={permission}
                      className={`flex items-center justify-between rounded-xl border p-4 ${
                        enabled
                          ? "border-gray-200 bg-white"
                          : "border-gray-100 bg-gray-50"
                      }`}
                    >
                      <span
                        className={`text-sm font-medium ${
                          enabled
                            ? "text-gray-900"
                            : "text-gray-400"
                        }`}
                      >
                        {permission}
                      </span>

                      {enabled ? (
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-700">
                          <Check size={14} />
                        </span>
                      ) : (
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-gray-400">
                          <X size={14} />
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Users */}
            <div className="border-t border-gray-100 bg-gray-50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Assigned Users
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    Users currently assigned to this role.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Users
                    size={18}
                    className="text-gray-500"
                  />

                  <span className="font-bold text-gray-900">
                    {selectedRole.users}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   INPUT
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

