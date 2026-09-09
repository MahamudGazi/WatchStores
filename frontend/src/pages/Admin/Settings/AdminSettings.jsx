import { useEffect, useState } from "react";
import {
  User,
  Store,
  Bell,
  Shield,
  CreditCard,
  Truck,
  Mail,
  Save,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

import api from "../../../api/axios";

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("general");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [general, setGeneral] = useState({
    storeName: "WatchStore",
    storeEmail: "admin@watchstore.com",
    phone: "",
    address: "Dhaka, Bangladesh",
    currency: "BDT",
    timezone: "Asia/Dhaka",
  });

  const [notifications, setNotifications] = useState({
    newOrder: true,
    newCustomer: true,
    lowStock: true,
    returnRequest: true,
    refundRequest: true,
    emailNotification: true,
  });

  const [security, setSecurity] = useState({
    twoFactor: false,
    loginAlert: true,
  });

  const [payments, setPayments] = useState({
    cod: true,
    sslcommerz: true,
    stripe: false,
  });

  const [shipping, setShipping] = useState({
    deliveryCharge: 80,
    deliveryDays: 5,
    freeShippingMinimum: 5000,
  });

  const [email, setEmail] = useState({
    fromName: "WatchStore",
    fromEmail: "admin@watchstore.com",
    smtpHost: "smtp.gmail.com",
    smtpPort: 587,
  });

  const [password, setPassword] = useState({
    current: "",
    newPassword: "",
    confirm: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const tabs = [
    {
      id: "general",
      name: "General",
      icon: Store,
    },
    {
      id: "profile",
      name: "Admin Profile",
      icon: User,
    },
    {
      id: "notifications",
      name: "Notifications",
      icon: Bell,
    },
    {
      id: "security",
      name: "Security",
      icon: Shield,
    },
    {
      id: "payments",
      name: "Payments",
      icon: CreditCard,
    },
    {
      id: "shipping",
      name: "Shipping",
      icon: Truck,
    },
    {
      id: "email",
      name: "Email",
      icon: Mail,
    },
  ];

  /*
  =========================================================
  LOAD SETTINGS
  =========================================================
  */

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/settings/");

      const data = response.data || {};

      /*
      General
      */
      if (data.general) {
        setGeneral((prev) => ({
          ...prev,
          ...data.general,
        }));
      }

      /*
      Notifications
      */
      if (data.notifications) {
        setNotifications((prev) => ({
          ...prev,
          ...data.notifications,
        }));
      }

      /*
      Security
      */
      if (data.security) {
        setSecurity((prev) => ({
          ...prev,
          ...data.security,
        }));
      }

      /*
      Payments
      */
      if (data.payments) {
        setPayments((prev) => ({
          ...prev,
          ...data.payments,
        }));
      }

      /*
      Shipping
      */
      if (data.shipping) {
        setShipping((prev) => ({
          ...prev,
          ...data.shipping,
        }));
      }

      /*
      Email
      */
      if (data.email) {
        setEmail((prev) => ({
          ...prev,
          ...data.email,
        }));
      }
    } catch (err) {
      console.error("Settings API Error:", err);

      /*
      404 হলে UI default values দিয়েই চলবে
      */
      if (err.response?.status !== 404) {
        setError(
          err.response?.data?.detail ||
            err.response?.data?.error ||
            "Failed to load settings."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  /*
  =========================================================
  SAVE SETTINGS
  =========================================================
  */

  async function handleSave() {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      const payload = {
        general,
        notifications,
        security,
        payments,
        shipping,
        email,
      };

      await api.put("/settings/", payload);

      setMessage("Settings saved successfully.");

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (err) {
      console.error("Save Settings Error:", err);

      setError(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          "Failed to save settings."
      );
    } finally {
      setSaving(false);
    }
  }

  /*
  =========================================================
  CHANGE PASSWORD
  =========================================================
  */

  async function handleChangePassword() {
    if (!password.current) {
      setError("Please enter your current password.");
      return;
    }

    if (!password.newPassword) {
      setError("Please enter a new password.");
      return;
    }

    if (password.newPassword.length < 8) {
      setError("New password must contain at least 8 characters.");
      return;
    }

    if (password.newPassword !== password.confirm) {
      setError("New passwords do not match.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setError("");

      await api.post("/auth/change-password/", {
        current_password: password.current,
        new_password: password.newPassword,
      });

      setPassword({
        current: "",
        newPassword: "",
        confirm: "",
      });

      setMessage("Password changed successfully.");

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (err) {
      console.error("Change Password Error:", err);

      setError(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          "Failed to change password."
      );
    } finally {
      setSaving(false);
    }
  }

  /*
  =========================================================
  INPUT CLASS
  =========================================================
  */

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10";

  /*
  =========================================================
  LOADING
  =========================================================
  */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2
            size={38}
            className="mx-auto animate-spin text-black"
          />

          <p className="mt-3 text-sm text-gray-500">
            Loading settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* HEADER */}

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Settings
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage your WatchStore administration settings.
        </p>
      </div>

      {/* SUCCESS */}

      {message && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          <CheckCircle size={18} />

          {message}
        </div>
      )}

      {/* ERROR */}

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle size={18} />

          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* SIDEBAR */}

        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
            <div className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                      activeTab === tab.id
                        ? "bg-black text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Icon size={19} />

                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* CONTENT */}

        <div className="lg:col-span-9">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            {/* =====================================================
                GENERAL
            ====================================================== */}

            {activeTab === "general" && (
              <section>
                <SectionHeader
                  title="General Settings"
                  description="Basic information about your store."
                />

                <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
                  <Input
                    label="Store Name"
                    value={general.storeName}
                    onChange={(e) =>
                      setGeneral({
                        ...general,
                        storeName: e.target.value,
                      })
                    }
                  />

                  <Input
                    label="Store Email"
                    type="email"
                    value={general.storeEmail}
                    onChange={(e) =>
                      setGeneral({
                        ...general,
                        storeEmail: e.target.value,
                      })
                    }
                  />

                  <Input
                    label="Phone"
                    value={general.phone}
                    onChange={(e) =>
                      setGeneral({
                        ...general,
                        phone: e.target.value,
                      })
                    }
                  />

                  <Input
                    label="Currency"
                    value={general.currency}
                    onChange={(e) =>
                      setGeneral({
                        ...general,
                        currency: e.target.value,
                      })
                    }
                  />

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Timezone
                    </label>

                    <select
                      className={inputClass}
                      value={general.timezone}
                      onChange={(e) =>
                        setGeneral({
                          ...general,
                          timezone: e.target.value,
                        })
                      }
                    >
                      <option value="Asia/Dhaka">
                        Asia/Dhaka
                      </option>

                      <option value="UTC">UTC</option>

                      <option value="Europe/Bucharest">
                        Europe/Bucharest
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Store Status
                    </label>

                    <div className="flex h-[46px] items-center justify-between rounded-xl border border-gray-200 px-4">
                      <span className="text-sm text-gray-700">
                        Store is active
                      </span>

                      <div className="h-3 w-3 rounded-full bg-green-500" />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Store Address
                    </label>

                    <textarea
                      rows={4}
                      className={inputClass}
                      value={general.address}
                      onChange={(e) =>
                        setGeneral({
                          ...general,
                          address: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </section>
            )}

            {/* =====================================================
                PROFILE
            ====================================================== */}

            {activeTab === "profile" && (
              <section>
                <SectionHeader
                  title="Admin Profile"
                  description="Manage your administrator account."
                />

                <div className="p-6">
                  <div className="mb-6 flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black text-xl font-bold text-white">
                      A
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Administrator
                      </h3>

                      <p className="text-sm text-gray-500">
                        Super Admin
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Input
                      label="First Name"
                      value="Admin"
                      readOnly
                    />

                    <Input
                      label="Last Name"
                      value="User"
                      readOnly
                    />

                    <Input
                      label="Email"
                      type="email"
                      value={general.storeEmail}
                      readOnly
                    />

                    <Input
                      label="Role"
                      value="Super Administrator"
                      readOnly
                    />
                  </div>
                </div>
              </section>
            )}

            {/* =====================================================
                NOTIFICATIONS
            ====================================================== */}

            {activeTab === "notifications" && (
              <section>
                <SectionHeader
                  title="Notifications"
                  description="Choose which events you want to be notified about."
                />

                <div className="divide-y divide-gray-100">
                  <ToggleRow
                    title="New Order"
                    description="Notify when a new order is placed."
                    checked={notifications.newOrder}
                    onChange={() =>
                      setNotifications({
                        ...notifications,
                        newOrder: !notifications.newOrder,
                      })
                    }
                  />

                  <ToggleRow
                    title="New Customer"
                    description="Notify when a new customer registers."
                    checked={notifications.newCustomer}
                    onChange={() =>
                      setNotifications({
                        ...notifications,
                        newCustomer:
                          !notifications.newCustomer,
                      })
                    }
                  />

                  <ToggleRow
                    title="Low Stock"
                    description="Notify when product stock is low."
                    checked={notifications.lowStock}
                    onChange={() =>
                      setNotifications({
                        ...notifications,
                        lowStock: !notifications.lowStock,
                      })
                    }
                  />

                  <ToggleRow
                    title="Return Request"
                    description="Notify when a customer requests a return."
                    checked={notifications.returnRequest}
                    onChange={() =>
                      setNotifications({
                        ...notifications,
                        returnRequest:
                          !notifications.returnRequest,
                      })
                    }
                  />

                  <ToggleRow
                    title="Refund Request"
                    description="Notify about refund activity."
                    checked={notifications.refundRequest}
                    onChange={() =>
                      setNotifications({
                        ...notifications,
                        refundRequest:
                          !notifications.refundRequest,
                      })
                    }
                  />

                  <ToggleRow
                    title="Email Notifications"
                    description="Receive important notifications by email."
                    checked={notifications.emailNotification}
                    onChange={() =>
                      setNotifications({
                        ...notifications,
                        emailNotification:
                          !notifications.emailNotification,
                      })
                    }
                  />
                </div>
              </section>
            )}

            {/* =====================================================
                SECURITY
            ====================================================== */}

            {activeTab === "security" && (
              <section>
                <SectionHeader
                  title="Security"
                  description="Protect your administrator account."
                />

                <div className="p-6">
                  <div className="mb-8 divide-y divide-gray-100 rounded-xl border border-gray-100">
                    <ToggleRow
                      title="Two-Factor Authentication"
                      description="Add an extra layer of security to your account."
                      checked={security.twoFactor}
                      onChange={() =>
                        setSecurity({
                          ...security,
                          twoFactor: !security.twoFactor,
                        })
                      }
                    />

                    <ToggleRow
                      title="Login Alerts"
                      description="Receive an alert when your account is accessed."
                      checked={security.loginAlert}
                      onChange={() =>
                        setSecurity({
                          ...security,
                          loginAlert: !security.loginAlert,
                        })
                      }
                    />
                  </div>

                  <div className="border-t border-gray-100 pt-6">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">
                      Change Password
                    </h3>

                    <div className="space-y-4">
                      <PasswordInput
                        label="Current Password"
                        value={password.current}
                        onChange={(e) =>
                          setPassword({
                            ...password,
                            current: e.target.value,
                          })
                        }
                        showPassword={showPassword}
                        setShowPassword={setShowPassword}
                      />

                      <PasswordInput
                        label="New Password"
                        value={password.newPassword}
                        onChange={(e) =>
                          setPassword({
                            ...password,
                            newPassword: e.target.value,
                          })
                        }
                        showPassword={showPassword}
                        setShowPassword={setShowPassword}
                      />

                      <PasswordInput
                        label="Confirm New Password"
                        value={password.confirm}
                        onChange={(e) =>
                          setPassword({
                            ...password,
                            confirm: e.target.value,
                          })
                        }
                        showPassword={showPassword}
                        setShowPassword={setShowPassword}
                      />

                      <button
                        type="button"
                        onClick={handleChangePassword}
                        disabled={saving}
                        className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
                      >
                        {saving
                          ? "Updating..."
                          : "Update Password"}
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* =====================================================
                PAYMENTS
            ====================================================== */}

            {activeTab === "payments" && (
              <section>
                <SectionHeader
                  title="Payment Settings"
                  description="Manage available payment methods."
                />

                <div className="space-y-4 p-6">
                  <PaymentToggle
                    title="Cash on Delivery"
                    description="Allow customers to pay when their order arrives."
                    checked={payments.cod}
                    onChange={() =>
                      setPayments({
                        ...payments,
                        cod: !payments.cod,
                      })
                    }
                  />

                  <PaymentToggle
                    title="SSLCommerz"
                    description="Accept online payments through SSLCommerz."
                    checked={payments.sslcommerz}
                    onChange={() =>
                      setPayments({
                        ...payments,
                        sslcommerz:
                          !payments.sslcommerz,
                      })
                    }
                  />

                  <PaymentToggle
                    title="Stripe"
                    description="Accept international card payments."
                    checked={payments.stripe}
                    onChange={() =>
                      setPayments({
                        ...payments,
                        stripe: !payments.stripe,
                      })
                    }
                  />
                </div>
              </section>
            )}

            {/* =====================================================
                SHIPPING
            ====================================================== */}

            {activeTab === "shipping" && (
              <section>
                <SectionHeader
                  title="Shipping Settings"
                  description="Configure your store delivery options."
                />

                <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
                  <Input
                    label="Default Delivery Charge"
                    type="number"
                    value={shipping.deliveryCharge}
                    onChange={(e) =>
                      setShipping({
                        ...shipping,
                        deliveryCharge:
                          Number(e.target.value),
                      })
                    }
                  />

                  <Input
                    label="Estimated Delivery Days"
                    type="number"
                    value={shipping.deliveryDays}
                    onChange={(e) =>
                      setShipping({
                        ...shipping,
                        deliveryDays:
                          Number(e.target.value),
                      })
                    }
                  />

                  <Input
                    label="Free Shipping Minimum"
                    type="number"
                    value={shipping.freeShippingMinimum}
                    onChange={(e) =>
                      setShipping({
                        ...shipping,
                        freeShippingMinimum:
                          Number(e.target.value),
                      })
                    }
                  />

                  <Input
                    label="Shipping Country"
                    value="Bangladesh"
                    readOnly
                  />
                </div>
              </section>
            )}

            {/* =====================================================
                EMAIL
            ====================================================== */}

            {activeTab === "email" && (
              <section>
                <SectionHeader
                  title="Email Settings"
                  description="Configure store email communication."
                />

                <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
                  <Input
                    label="From Name"
                    value={email.fromName}
                    onChange={(e) =>
                      setEmail({
                        ...email,
                        fromName: e.target.value,
                      })
                    }
                  />

                  <Input
                    label="From Email"
                    type="email"
                    value={email.fromEmail}
                    onChange={(e) =>
                      setEmail({
                        ...email,
                        fromEmail: e.target.value,
                      })
                    }
                  />

                  <Input
                    label="SMTP Host"
                    value={email.smtpHost}
                    onChange={(e) =>
                      setEmail({
                        ...email,
                        smtpHost: e.target.value,
                      })
                    }
                  />

                  <Input
                    label="SMTP Port"
                    type="number"
                    value={email.smtpPort}
                    onChange={(e) =>
                      setEmail({
                        ...email,
                        smtpPort: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </section>
            )}

            {/* =====================================================
                SAVE BUTTON
            ====================================================== */}

            <div className="flex justify-end border-t border-gray-100 p-6">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {saving ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />

                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />

                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({ title, description }) {
  return (
    <div className="border-b border-gray-100 px-6 py-5">
      <h2 className="text-lg font-bold text-gray-900">
        {title}
      </h2>

      <p className="mt-1 text-sm text-gray-500">
        {description}
      </p>
    </div>
  );
}


/* =========================================================
   INPUT
========================================================= */

function Input({
  label,
  type = "text",
  value,
  onChange,
  readOnly = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        className={`w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition ${
          readOnly
            ? "bg-gray-50 text-gray-500"
            : "bg-white focus:border-black focus:ring-2 focus:ring-black/10"
        }`}
      />
    </div>
  );
}


/* =========================================================
   TOGGLE
========================================================= */

function ToggleRow({
  title,
  description,
  checked,
  onChange,
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-6 py-5">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">
          {title}
        </h3>

        <p className="mt-1 text-xs text-gray-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={onChange}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-black" : "bg-gray-300"
        }`}
        aria-pressed={checked}
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


/* =========================================================
   PAYMENT TOGGLE
========================================================= */

function PaymentToggle({
  title,
  description,
  checked,
  onChange,
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
          <CreditCard size={20} />
        </div>

        <div>
          <h3 className="font-semibold text-gray-900">
            {title}
          </h3>

          <p className="text-xs text-gray-500">
            {description}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onChange}
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


/* =========================================================
   PASSWORD INPUT
========================================================= */

function PasswordInput({
  label,
  value,
  onChange,
  showPassword,
  setShowPassword,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="relative">
        <Lock
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-12 text-sm outline-none focus:border-black focus:ring-2 focus:ring-black/10"
        />

        <button
          type="button"
          onClick={() =>
            setShowPassword(!showPassword)
          }
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
          aria-label={
            showPassword
              ? "Hide password"
              : "Show password"
          }
        >
          {showPassword ? (
            <EyeOff size={18} />
          ) : (
            <Eye size={18} />
          )}
        </button>
      </div>
    </div>
  );
}

