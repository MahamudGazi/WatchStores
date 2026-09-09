import React, { useEffect, useMemo, useState } from "react";
import axios from "../../../api/axios";

const initialForm = {
  username: "",
  email: "",
  phone: "",
  password: "",
  role: "STAFF",
  is_active: true,
  profile_image: null,
};

const ROLE_OPTIONS = [
  {
    value: "ADMIN",
    label: "Admin",
  },
  {
    value: "STAFF",
    label: "Staff",
  },
];

const FILTER_ROLES = [
  "ALL",
  "SUPER_ADMIN",
  "ADMIN",
  "STAFF",
  "CUSTOMER",
];

function AdminUsers() {
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [roleFilter, setRoleFilter] = useState("ALL");

  const [statusFilter, setStatusFilter] = useState("ALL");

  const [showModal, setShowModal] = useState(false);

  const [editingUser, setEditingUser] = useState(null);

  const [form, setForm] = useState(initialForm);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "/auth/admin/users/"
      );

      const data = response.data;

      if (Array.isArray(data)) {
        setUsers(data);
      } else if (Array.isArray(data.results)) {
        setUsers(data.results);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Failed to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openCreateModal = () => {
    setEditingUser(null);

    setForm({
      ...initialForm,
    });

    setError("");
    setSuccess("");

    setShowModal(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);

    setForm({
      username: user.username || "",
      email: user.email || "",
      phone: user.phone || "",
      password: "",
      role: user.role || "CUSTOMER",
      is_active: user.is_active ?? true,
      profile_image: null,
    });

    setError("");
    setSuccess("");

    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingUser(null);

    setForm({
      ...initialForm,
    });

    setError("");
  };

  const handleChange = (event) => {
    const { name, value, type, checked, files } =
      event.target;

    if (type === "file") {
      setForm((prev) => ({
        ...prev,
        [name]: files?.[0] || null,
      }));

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const formData = new FormData();

      formData.append(
        "username",
        form.username.trim()
      );

      formData.append(
        "email",
        form.email.trim()
      );

      formData.append(
        "phone",
        form.phone.trim()
      );

      formData.append(
        "is_active",
        String(form.is_active)
      );

      if (form.profile_image) {
        formData.append(
          "profile_image",
          form.profile_image
        );
      }

      if (!editingUser) {
        formData.append(
          "password",
          form.password
        );

        formData.append(
          "role",
          form.role
        );

        await axios.post(
          "/auth/admin/users/",
          formData
        );

        setSuccess(
          "User created successfully."
        );
      } else {
        await axios.patch(
          `/auth/admin/users/${editingUser.id}/`,
          formData
        );

        // Role is handled separately
        if (
          form.role &&
          form.role !== editingUser.role &&
          form.role !== "SUPER_ADMIN"
        ) {
          await axios.patch(
            `/auth/admin/users/${editingUser.id}/role/`,
            {
              role: form.role,
            }
          );
        }

        setSuccess(
          "User updated successfully."
        );
      }

      await fetchUsers();

      setTimeout(() => {
        closeModal();
      }, 500);
    }  catch (err) {
  console.error("CREATE USER ERROR:", err);
  console.log("STATUS:", err.response?.status);
  console.log("RESPONSE DATA:", err.response?.data);

  const responseData = err.response?.data;

  if (
    responseData &&
    typeof responseData === "object"
  ) {
    const firstError = Object.values(responseData)
      .flat()
      ?. [0];

    setError(
      firstError ||
        responseData.detail ||
        responseData.message ||
        "Something went wrong."
    );
  } else {
    setError("Something went wrong.");
  }
} finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (user) => {
    if (user.role === "SUPER_ADMIN") {
      return;
    }

    try {
      setError("");

      await axios.patch(
        `/auth/admin/users/${user.id}/`,
        {
          is_active: !user.is_active,
        }
      );

      setUsers((prev) =>
        prev.map((item) =>
          item.id === user.id
            ? {
                ...item,
                is_active:
                  !user.is_active,
              }
            : item
        )
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Failed to update status."
      );
    }
  };

  const handleDelete = async (user) => {
    if (user.role === "SUPER_ADMIN") {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${user.username}"?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await axios.delete(
        `/auth/admin/users/${user.id}/`
      );

      setUsers((prev) =>
        prev.filter(
          (item) => item.id !== user.id
        )
      );

      setSuccess(
        "User deleted successfully."
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to delete user."
      );
    }
  };

  const filteredUsers = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !keyword ||
        user.username
          ?.toLowerCase()
          .includes(keyword) ||
        user.email
          ?.toLowerCase()
          .includes(keyword) ||
        user.phone
          ?.toLowerCase()
          .includes(keyword);

      const matchesRole =
        roleFilter === "ALL" ||
        user.role === roleFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" &&
          user.is_active) ||
        (statusFilter === "INACTIVE" &&
          !user.is_active);

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      );
    });
  }, [
    users,
    search,
    roleFilter,
    statusFilter,
  ]);

  const getRoleBadge = (role) => {
    const classes = {
      SUPER_ADMIN:
        "bg-purple-100 text-purple-700",
      ADMIN:
        "bg-blue-100 text-blue-700",
      STAFF:
        "bg-orange-100 text-orange-700",
      CUSTOMER:
        "bg-gray-100 text-gray-700",
    };

    return (
      <span
        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
          classes[role] ||
          classes.CUSTOMER
        }`}
      >
        {role?.replace("_", " ") ||
          "CUSTOMER"}
      </span>
    );
  };

  const getStatusBadge = (active) => {
    return (
      <span
        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
          active
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {active ? "Active" : "Inactive"}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Users
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage administrators, staff and
              customer accounts.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            + Add Admin / Staff
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search username, email or phone..."
              className="rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
            />

            <select
              value={roleFilter}
              onChange={(e) =>
                setRoleFilter(e.target.value)
              }
              className="rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
            >
              {FILTER_ROLES.map((role) => (
                <option
                  key={role}
                  value={role}
                >
                  {role === "ALL"
                    ? "All Roles"
                    : role.replace("_", " ")}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
            >
              <option value="ALL">
                All Status
              </option>

              <option value="ACTIVE">
                Active
              </option>

              <option value="INACTIVE">
                Inactive
              </option>
            </select>

          </div>
        </div>

        {/* Desktop */}
        <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm lg:block">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                    User
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                    Contact
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                    Role
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                    Joined
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-sm text-gray-500"
                    >
                      Loading users...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-sm text-gray-500"
                    >
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gray-200 text-sm font-bold text-gray-700">
                            {user.profile_image ? (
                              <img
                                src={
                                  user.profile_image
                                }
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              user.username
                                ?.charAt(0)
                                ?.toUpperCase()
                            )}
                          </div>

                          <div>
                            <p className="font-semibold text-gray-900">
                              {user.username}
                            </p>

                            <p className="text-xs text-gray-500">
                              ID #{user.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700">
                          {user.email || "—"}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {user.phone || "—"}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        {getRoleBadge(user.role)}
                      </td>

                      <td className="px-6 py-4">
                        {getStatusBadge(
                          user.is_active
                        )}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.date_joined
                          ? new Date(
                              user.date_joined
                            ).toLocaleDateString()
                          : "—"}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(user)
                            }
                            className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold hover:bg-gray-100"
                          >
                            Edit
                          </button>

                          {user.role !==
                            "SUPER_ADMIN" && (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  toggleStatus(
                                    user
                                  )
                                }
                                className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold hover:bg-gray-100"
                              >
                                {user.is_active
                                  ? "Disable"
                                  : "Enable"}
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    user
                                  )
                                }
                                className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                              >
                                Delete
                              </button>
                            </>
                          )}

                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile / Tablet */}
        <div className="grid gap-4 lg:hidden">

          {loading ? (
            <div className="rounded-xl bg-white p-8 text-center text-sm text-gray-500">
              Loading users...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="rounded-xl bg-white p-8 text-center text-sm text-gray-500">
              No users found.
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >

                <div className="flex items-start justify-between gap-3">

                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200 font-bold text-gray-700">
                      {user.profile_image ? (
                        <img
                          src={
                            user.profile_image
                          }
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        user.username
                          ?.charAt(0)
                          ?.toUpperCase()
                      )}
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {user.username}
                      </h3>

                      <p className="text-xs text-gray-500">
                        #{user.id}
                      </p>
                    </div>
                  </div>

                  {getRoleBadge(user.role)}
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <p>
                    <span className="font-medium">
                      Email:
                    </span>{" "}
                    {user.email || "—"}
                  </p>

                  <p>
                    <span className="font-medium">
                      Phone:
                    </span>{" "}
                    {user.phone || "—"}
                  </p>

                  <p>
                    <span className="font-medium">
                      Status:
                    </span>{" "}
                    {getStatusBadge(
                      user.is_active
                    )}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">

                  <button
                    type="button"
                    onClick={() =>
                      openEditModal(user)
                    }
                    className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold"
                  >
                    Edit
                  </button>

                  {user.role !==
                    "SUPER_ADMIN" && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          toggleStatus(user)
                        }
                        className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold"
                      >
                        {user.is_active
                          ? "Disable"
                          : "Enable"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(user)
                        }
                        className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600"
                      >
                        Delete
                      </button>
                    </>
                  )}

                </div>
              </div>
            ))
          )}

        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[95vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {editingUser
                    ? "Edit User"
                    : "Add Admin / Staff"}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  {editingUser
                    ? "Update user information."
                    : "Create a new administrative account."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="text-xl text-gray-400 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4 p-5"
            >

              {error && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
                  {success}
                </div>
              )}

              {/* Username */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Username
                </label>

                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
                />
              </div>

              {/* Email */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Phone
                </label>

                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
                />
              </div>

              {/* Role */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Role
                </label>

                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  disabled={
                    editingUser?.role ===
                    "SUPER_ADMIN"
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900 disabled:bg-gray-100"
                >
                  {editingUser?.role ===
                    "SUPER_ADMIN" ? (
                    <option value="SUPER_ADMIN">
                      Super Admin
                    </option>
                  ) : (
                    <>
                      {ROLE_OPTIONS.map(
                        (option) => (
                          <option
                            key={
                              option.value
                            }
                            value={
                              option.value
                            }
                          >
                            {option.label}
                          </option>
                        )
                      )}

                      {editingUser && (
                        <option value="CUSTOMER">
                          Customer
                        </option>
                      )}
                    </>
                  )}
                </select>
              </div>

              {/* Password */}
              {!editingUser && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Password
                  </label>

                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                    placeholder="Minimum 8 characters"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
                  />
                </div>
              )}

              {/* Profile */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Profile Image
                </label>

                <input
                  type="file"
                  name="profile_image"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm"
                />
              </div>

              {/* Status */}
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                  disabled={
                    editingUser?.role ===
                    "SUPER_ADMIN"
                  }
                  className="h-4 w-4"
                />

                <span className="text-sm font-medium text-gray-700">
                  Active account
                </span>
              </label>

              {/* Actions */}
              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingUser
                    ? "Save Changes"
                    : "Create User"}
                </button>

              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;