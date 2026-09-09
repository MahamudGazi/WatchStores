import { useState } from "react";

export default function AdminEmailSettings() {
    const [settings, setSettings] = useState({
        host: "",
        port: "587",
        username: "",
        password: "",
        fromEmail: "",
        fromName: "WatchStore",
        useTls: true,
        useSsl: false,
    });

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setSettings((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setSaving(true);
        setMessage("");

        try {
            // Backend API ready হলে এখানে POST/PATCH করবে
            // await api.patch("/settings/email/", settings);

            await new Promise((resolve) =>
                setTimeout(resolve, 800)
            );

            setMessage("Email settings saved successfully.");
        } catch (error) {
            console.error("Email settings error:", error);

            setMessage(
                "Failed to save email settings."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Email Settings
                </h1>

                <p className="text-gray-500 mt-1">
                    Configure SMTP server and email sender settings
                </p>
            </div>

            {/* Success / Error */}
            {message && (
                <div
                    className={`mb-6 rounded-xl border p-4 ${
                        message.includes("successfully")
                            ? "bg-green-50 border-green-200 text-green-700"
                            : "bg-red-50 border-red-200 text-red-700"
                    }`}
                >
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit}>

                {/* SMTP Server */}
                <div className="bg-white border rounded-2xl shadow-sm p-5 sm:p-6 mb-6">

                    <h2 className="text-lg font-bold text-gray-900">
                        SMTP Server
                    </h2>

                    <p className="text-sm text-gray-500 mt-1 mb-5">
                        Configure your outgoing mail server.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        {/* Host */}
                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                SMTP Host
                            </label>

                            <input
                                type="text"
                                name="host"
                                value={settings.host}
                                onChange={handleChange}
                                placeholder="smtp.gmail.com"
                                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                            />
                        </div>

                        {/* Port */}
                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                SMTP Port
                            </label>

                            <input
                                type="number"
                                name="port"
                                value={settings.port}
                                onChange={handleChange}
                                placeholder="587"
                                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                            />
                        </div>

                        {/* Username */}
                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                SMTP Username
                            </label>

                            <input
                                type="email"
                                name="username"
                                value={settings.username}
                                onChange={handleChange}
                                placeholder="your@email.com"
                                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                SMTP Password
                            </label>

                            <input
                                type="password"
                                name="password"
                                value={settings.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                            />
                        </div>

                    </div>

                    {/* Security */}
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">

                        <label className="flex items-center gap-3 border rounded-xl p-4 cursor-pointer">
                            <input
                                type="checkbox"
                                name="useTls"
                                checked={settings.useTls}
                                onChange={handleChange}
                                className="w-4 h-4"
                            />

                            <div>
                                <p className="font-semibold">
                                    Use TLS
                                </p>

                                <p className="text-xs text-gray-500">
                                    Recommended for port 587
                                </p>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 border rounded-xl p-4 cursor-pointer">
                            <input
                                type="checkbox"
                                name="useSsl"
                                checked={settings.useSsl}
                                onChange={handleChange}
                                className="w-4 h-4"
                            />

                            <div>
                                <p className="font-semibold">
                                    Use SSL
                                </p>

                                <p className="text-xs text-gray-500">
                                    Usually used with port 465
                                </p>
                            </div>
                        </label>

                    </div>
                </div>

                {/* Sender */}
                <div className="bg-white border rounded-2xl shadow-sm p-5 sm:p-6 mb-6">

                    <h2 className="text-lg font-bold text-gray-900">
                        Sender Information
                    </h2>

                    <p className="text-sm text-gray-500 mt-1 mb-5">
                        Configure the name and email customers will see.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                From Email
                            </label>

                            <input
                                type="email"
                                name="fromEmail"
                                value={settings.fromEmail}
                                onChange={handleChange}
                                placeholder="noreply@watchstore.com"
                                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                From Name
                            </label>

                            <input
                                type="text"
                                name="fromName"
                                value={settings.fromName}
                                onChange={handleChange}
                                placeholder="WatchStore"
                                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                            />
                        </div>

                    </div>
                </div>

                {/* Save */}
                <div className="flex justify-end">

                    <button
                        type="submit"
                        disabled={saving}
                        className="
                            w-full
                            sm:w-auto
                            bg-black
                            hover:bg-gray-800
                            disabled:bg-gray-400
                            text-white
                            px-6
                            py-3
                            rounded-xl
                            font-semibold
                        "
                    >
                        {saving ? "Saving..." : "Save Email Settings"}
                    </button>

                </div>

            </form>
        </div>
    );
}