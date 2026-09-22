import { useEffect, useState } from "react";
import api from "../api/axios";


export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("ss_token");

  useEffect(() => {
    const fetchProfile = async () => {
      // User is not logged in
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(
          "/auth/profile/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setProfile(response.data.data || response.data);
      } catch (err) {
        console.error("Profile error:", err);

        if (err.response?.status === 401) {
          localStorage.removeItem("ss_token");
          setProfile(null);
          setError("Your session has expired. Please login again.");
        } else if (err.response?.status === 403) {
          setError("You don't have permission to view this profile.");
        } else {
          setError("Failed to load profile.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto" />

          <p className="mt-4 text-sm sm:text-base text-gray-500">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  // =========================
  // NOT LOGGED IN
  // =========================
  if (!token || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-6 sm:py-10">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-8 md:p-10">

          <div className="text-center">

            {/* Avatar */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-3xl sm:text-4xl">
                👤
              </span>
            </div>

            {/* Title */}
            <h1 className="mt-4 text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
              My Profile
            </h1>

            {/* Description */}
            <p className="mt-2 text-sm sm:text-base text-gray-500 leading-relaxed">
              Please login or create an account to continue.
            </p>

            {/* Error */}
            {error && (
              <div className="mt-4 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Login / Register */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">

              {/* Login */}
              <a
                href="/login"
                className="w-full px-5 py-3 text-sm sm:text-base bg-black text-white rounded-lg hover:bg-gray-800 active:bg-gray-900 transition font-medium text-center"
              >
                Login
              </a>

              {/* Register */}
              <a
                href="/register"
                className="w-full px-5 py-3 text-sm sm:text-base border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition font-medium text-center"
              >
                Register
              </a>

            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================
  // PROFILE DATA
  // =========================

  const firstName =
    profile?.first_name ||
    profile?.username ||
    "Customer";

  const lastName =
    profile?.last_name || "";

  const fullName =
    `${firstName} ${lastName}`.trim();

  const initials =
    fullName
      .split(" ")
      .filter(Boolean)
      .map((name) => name[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const phone =
    profile?.phone ||
    profile?.phone_number ||
    "";

  const postcode =
    profile?.postcode ||
    profile?.postal_code ||
    "";

  // =========================
  // LOGGED-IN PROFILE
  // =========================

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 lg:py-10">

      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* =========================
            PAGE HEADER
        ========================= */}
        <div className="mb-6 sm:mb-8">

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
            My Profile
          </h1>

          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            View your account information
          </p>

        </div>

        {/* =========================
            MAIN LAYOUT
        ========================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">

          {/* =========================
              PROFILE CARD
          ========================= */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-7 lg:p-8">

            <div className="flex flex-col items-center text-center">

              {/* Avatar */}
              {profile?.profile_image ||
              profile?.avatar ? (
                <img
                  src={
                    profile.profile_image ||
                    profile.avatar
                  }
                  alt={fullName}
                  className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full object-cover border-4 border-gray-100"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full bg-black text-white flex items-center justify-center text-2xl sm:text-3xl lg:text-4xl font-bold">
                  {initials}
                </div>
              )}

              {/* Name */}
              <h2 className="mt-5 text-xl sm:text-2xl font-bold text-gray-900 break-words">
                {fullName}
              </h2>

              {/* Username */}
              {profile?.username && (
                <p className="text-gray-500 mt-1 text-sm sm:text-base break-all">
                  @{profile.username}
                </p>
              )}

              {/* Role */}
              <span className="mt-4 inline-flex px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs sm:text-sm">
                Customer
              </span>

            </div>
          </div>

          {/* =========================
              INFORMATION
          ========================= */}
          <div className="lg:col-span-2 space-y-5 sm:space-y-6">

            {/* =========================
                PERSONAL INFORMATION
            ========================= */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-7">

              <div className="flex items-center justify-between mb-5 sm:mb-6">

                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  Personal Information
                </h2>

                <span className="text-lg sm:text-xl">
                  👤
                </span>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">

                {/* First Name */}
                <div className="min-w-0">
                  <label className="text-xs sm:text-sm text-gray-500">
                    First Name
                  </label>

                  <p className="mt-1 font-medium text-gray-900 break-words">
                    {profile?.first_name || "Not provided"}
                  </p>
                </div>

                {/* Last Name */}
                <div className="min-w-0">
                  <label className="text-xs sm:text-sm text-gray-500">
                    Last Name
                  </label>

                  <p className="mt-1 font-medium text-gray-900 break-words">
                    {profile?.last_name || "Not provided"}
                  </p>
                </div>

                {/* Username */}
                <div className="min-w-0">
                  <label className="text-xs sm:text-sm text-gray-500">
                    Username
                  </label>

                  <p className="mt-1 font-medium text-gray-900 break-words">
                    {profile?.username || "Not provided"}
                  </p>
                </div>

                {/* Email */}
                <div className="min-w-0">
                  <label className="text-xs sm:text-sm text-gray-500">
                    Email
                  </label>

                  <p className="mt-1 font-medium text-gray-900 break-all">
                    {profile?.email || "Not provided"}
                  </p>
                </div>

                {/* Phone */}
                <div className="min-w-0">
                  <label className="text-xs sm:text-sm text-gray-500">
                    Phone
                  </label>

                  <p className="mt-1 font-medium text-gray-900 break-words">
                    {phone || "Not provided"}
                  </p>
                </div>

                {/* Date Joined */}
                <div className="min-w-0">
                  <label className="text-xs sm:text-sm text-gray-500">
                    Member Since
                  </label>

                  <p className="mt-1 font-medium text-gray-900">
                    {profile?.date_joined
                      ? new Date(
                          profile.date_joined
                        ).toLocaleDateString()
                      : "Not available"}
                  </p>
                </div>

              </div>
            </div>

            {/* =========================
                ADDRESS
            ========================= */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-7">

              <div className="flex items-center justify-between mb-5 sm:mb-6">

                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  Address
                </h2>

                <span className="text-lg sm:text-xl">
                  📍
                </span>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">

                {/* Address */}
                <div className="sm:col-span-2 min-w-0">
                  <label className="text-xs sm:text-sm text-gray-500">
                    Address
                  </label>

                  <p className="mt-1 font-medium text-gray-900 break-words">
                    {profile?.address || "Not provided"}
                  </p>
                </div>

                {/* City */}
                <div className="min-w-0">
                  <label className="text-xs sm:text-sm text-gray-500">
                    City
                  </label>

                  <p className="mt-1 font-medium text-gray-900 break-words">
                    {profile?.city || "Not provided"}
                  </p>
                </div>

                {/* State */}
                <div className="min-w-0">
                  <label className="text-xs sm:text-sm text-gray-500">
                    State
                  </label>

                  <p className="mt-1 font-medium text-gray-900 break-words">
                    {profile?.state || "Not provided"}
                  </p>
                </div>

                {/* Postcode */}
                <div className="min-w-0">
                  <label className="text-xs sm:text-sm text-gray-500">
                    Postcode
                  </label>

                  <p className="mt-1 font-medium text-gray-900 break-words">
                    {postcode || "Not provided"}
                  </p>
                </div>

                {/* Country */}
                <div className="min-w-0">
                  <label className="text-xs sm:text-sm text-gray-500">
                    Country
                  </label>

                  <p className="mt-1 font-medium text-gray-900 break-words">
                    {profile?.country || "Bangladesh"}
                  </p>
                </div>

              </div>
            </div>

            {/* =========================
                ACCOUNT
            ========================= */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-7">

              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-5">
                Account
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                {/* My Orders */}
                <a
                  href="/my-orders"
                  className="flex items-center justify-between gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-sm sm:text-base"
                >
                  <span className="truncate">
                    My Orders
                  </span>

                  <span className="shrink-0">
                    →
                  </span>
                </a>

                {/* Wishlist */}
                <a
                  href="/wishlist"
                  className="flex items-center justify-between gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-sm sm:text-base"
                >
                  <span className="truncate">
                    My Wishlist
                  </span>

                  <span className="shrink-0">
                    ♡
                  </span>
                </a>

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}