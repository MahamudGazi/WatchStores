import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { registerUser } from "../api/auth";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    password_confirm: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Password match check
    if (formData.password !== formData.password_confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await registerUser(formData);

      console.log("Register response:", response);

      setSuccess(
        "Registration successful! Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      console.error("REGISTER ERROR:", err);
      console.error("STATUS:", err.response?.status);
      console.error("DATA:", err.response?.data);

      const data = err.response?.data;

      if (data?.detail) {
        setError(data.detail);
      } else if (typeof data === "object") {
        const messages = Object.entries(data)
          .map(([field, value]) => {
            const message = Array.isArray(value)
              ? value.join(", ")
              : value;

            return `${field}: ${message}`;
          })
          .join(" | ");

        setError(
          messages || "Registration failed. Please try again."
        );
      } else {
        setError(
          "Registration failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8 sm:py-10">

      <div className="w-full max-w-md rounded-2xl bg-white p-5 sm:p-7 md:p-8 shadow-lg border border-gray-100">

        {/* Header */}
        <div className="text-center mb-6">

          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <span className="text-3xl">
              👤
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Create Account
          </h1>

          <p className="mt-2 text-sm sm:text-base text-gray-500">
            Register to create your account
          </p>

        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-600">
              {error}
            </p>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
            <p className="text-sm text-green-600">
              {success}
            </p>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          {/* First Name + Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>
              <label
                htmlFor="first_name"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                First Name
              </label>

              <input
                id="first_name"
                type="text"
                name="first_name"
                placeholder="First name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm sm:text-base outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                required
              />
            </div>

            <div>
              <label
                htmlFor="last_name"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Last Name
              </label>

              <input
                id="last_name"
                type="text"
                name="last_name"
                placeholder="Last name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm sm:text-base outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                required
              />
            </div>

          </div>

          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Username
            </label>

            <input
              id="username"
              type="text"
              name="username"
              placeholder="Enter username"
              value={formData.username}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm sm:text-base outline-none transition focus:border-black focus:ring-1 focus:ring-black"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              name="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm sm:text-base outline-none transition focus:border-black focus:ring-1 focus:ring-black"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm sm:text-base outline-none transition focus:border-black focus:ring-1 focus:ring-black"
              required
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="password_confirm"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>

            <input
              id="password_confirm"
              type="password"
              name="password_confirm"
              placeholder="Confirm password"
              value={formData.password_confirm}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm sm:text-base outline-none transition focus:border-black focus:ring-1 focus:ring-black"
              required
            />
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-yellow-500 py-3 text-sm sm:text-base font-bold text-white transition hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Creating Account..."
              : "Register"}
          </button>

        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">

          <p className="text-sm text-gray-500">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="font-semibold text-black hover:underline"
            >
              Login
            </button>
          </p>

        </div>

      </div>
    </div>
  );
}