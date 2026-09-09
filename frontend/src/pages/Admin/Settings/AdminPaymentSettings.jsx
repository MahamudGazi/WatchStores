import { useEffect, useState } from "react";

const DEFAULT_SETTINGS = {
    sslcommerzEnabled: true,
    sslcommerzStoreId: "",
    sslcommerzStorePassword: "",

    bkashEnabled: false,
    bkashAppKey: "",
    bkashAppSecret: "",
    bkashUsername: "",
    bkashPassword: "",

    nagadEnabled: false,
    nagadMerchantId: "",
    nagadMerchantNumber: "",
};

export default function AdminPaymentSettings() {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(
                "admin_payment_settings"
            );

            if (stored) {
                setSettings({
                    ...DEFAULT_SETTINGS,
                    ...JSON.parse(stored),
                });
            }
        } catch (error) {
            console.error(
                "Failed to load payment settings:",
                error
            );
        }
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setSettings((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        setSaved(false);
    };

    const handleSave = () => {
        try {
            localStorage.setItem(
                "admin_payment_settings",
                JSON.stringify(settings)
            );

            setSaved(true);

            setTimeout(() => {
                setSaved(false);
            }, 3000);
        } catch (error) {
            console.error(
                "Failed to save payment settings:",
                error
            );
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Payment Settings
                </h1>

                <p className="text-gray-500 mt-1">
                    Configure SSLCommerz, bKash and Nagad payment methods
                </p>
            </div>

            {/* Success */}
            {saved && (
                <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
                    <p className="font-semibold">
                        Payment settings saved successfully.
                    </p>
                </div>
            )}

            {/* SSLCommerz */}
            <div className="bg-white border rounded-2xl shadow-sm p-5 sm:p-6 mb-6">

                <div className="flex items-center justify-between gap-4 mb-6">

                    <div>
                        <h2 className="text-lg font-bold">
                            SSLCommerz
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Online payment gateway
                        </p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            name="sslcommerzEnabled"
                            checked={settings.sslcommerzEnabled}
                            onChange={handleChange}
                            className="sr-only peer"
                        />

                        <div className="
                            w-12
                            h-7
                            bg-gray-300
                            rounded-full
                            peer
                            peer-checked:bg-black
                            after:content-['']
                            after:absolute
                            after:top-[4px]
                            after:left-[4px]
                            after:bg-white
                            after:rounded-full
                            after:h-5
                            after:w-5
                            after:transition-all
                            peer-checked:after:translate-x-5
                        " />
                    </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    <Input
                        label="Store ID"
                        name="sslcommerzStoreId"
                        value={settings.sslcommerzStoreId}
                        onChange={handleChange}
                        placeholder="Your SSLCommerz Store ID"
                    />

                    <Input
                        label="Store Password"
                        name="sslcommerzStorePassword"
                        type="password"
                        value={settings.sslcommerzStorePassword}
                        onChange={handleChange}
                        placeholder="Your SSLCommerz Store Password"
                    />

                </div>
            </div>

            {/* bKash */}
            <div className="bg-white border rounded-2xl shadow-sm p-5 sm:p-6 mb-6">

                <div className="flex items-center justify-between gap-4 mb-6">

                    <div>
                        <h2 className="text-lg font-bold">
                            bKash
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            bKash payment gateway
                        </p>
                    </div>

                    <Toggle
                        name="bkashEnabled"
                        checked={settings.bkashEnabled}
                        onChange={handleChange}
                    />

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    <Input
                        label="App Key"
                        name="bkashAppKey"
                        value={settings.bkashAppKey}
                        onChange={handleChange}
                        placeholder="bKash App Key"
                    />

                    <Input
                        label="App Secret"
                        name="bkashAppSecret"
                        type="password"
                        value={settings.bkashAppSecret}
                        onChange={handleChange}
                        placeholder="bKash App Secret"
                    />

                    <Input
                        label="Username"
                        name="bkashUsername"
                        value={settings.bkashUsername}
                        onChange={handleChange}
                        placeholder="bKash Username"
                    />

                    <Input
                        label="Password"
                        name="bkashPassword"
                        type="password"
                        value={settings.bkashPassword}
                        onChange={handleChange}
                        placeholder="bKash Password"
                    />

                </div>
            </div>

            {/* Nagad */}
            <div className="bg-white border rounded-2xl shadow-sm p-5 sm:p-6 mb-6">

                <div className="flex items-center justify-between gap-4 mb-6">

                    <div>
                        <h2 className="text-lg font-bold">
                            Nagad
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Nagad payment gateway
                        </p>
                    </div>

                    <Toggle
                        name="nagadEnabled"
                        checked={settings.nagadEnabled}
                        onChange={handleChange}
                    />

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    <Input
                        label="Merchant ID"
                        name="nagadMerchantId"
                        value={settings.nagadMerchantId}
                        onChange={handleChange}
                        placeholder="Nagad Merchant ID"
                    />

                    <Input
                        label="Merchant Number"
                        name="nagadMerchantNumber"
                        value={settings.nagadMerchantNumber}
                        onChange={handleChange}
                        placeholder="01XXXXXXXXX"
                    />

                </div>
            </div>

            {/* Save */}
            <div className="flex justify-end">

                <button
                    type="button"
                    onClick={handleSave}
                    className="
                        w-full
                        sm:w-auto
                        bg-black
                        hover:bg-gray-800
                        text-white
                        px-6
                        py-3
                        rounded-xl
                        font-semibold
                    "
                >
                    Save Payment Settings
                </button>

            </div>

        </div>
    );
}


/* =========================
   Input Component
========================= */

function Input({
    label,
    name,
    value,
    onChange,
    type = "text",
    placeholder,
}) {
    return (
        <div>
            <label className="block text-sm font-semibold mb-2">
                {label}
            </label>

            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="
                    w-full
                    border
                    rounded-xl
                    px-4
                    py-3
                    outline-none
                    focus:ring-2
                    focus:ring-black
                "
            />
        </div>
    );
}


/* =========================
   Toggle Component
========================= */

function Toggle({
    name,
    checked,
    onChange,
}) {
    return (
        <label className="relative inline-flex items-center cursor-pointer">

            <input
                type="checkbox"
                name={name}
                checked={checked}
                onChange={onChange}
                className="sr-only peer"
            />

            <div className="
                w-12
                h-7
                bg-gray-300
                rounded-full
                peer
                peer-checked:bg-black
                after:content-['']
                after:absolute
                after:top-[4px]
                after:left-[4px]
                after:bg-white
                after:rounded-full
                after:h-5
                after:w-5
                after:transition-all
                peer-checked:after:translate-x-5
            " />

        </label>
    );
}