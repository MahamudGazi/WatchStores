import { useEffect, useState } from "react";

const DEFAULT_SETTINGS = {
    orderNotifications: true,
    lowStockAlerts: true,
    paymentNotifications: true,
    customerNotifications: true,
    reviewNotifications: true,
    returnNotifications: true,
};

export default function AdminNotificationSettings() {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(
                "admin_notification_settings"
            );

            if (stored) {
                setSettings({
                    ...DEFAULT_SETTINGS,
                    ...JSON.parse(stored),
                });
            }
        } catch (error) {
            console.error(
                "Failed to load notification settings:",
                error
            );
        }
    }, []);

    const handleChange = (name) => {
        setSettings((prev) => ({
            ...prev,
            [name]: !prev[name],
        }));

        setSaved(false);
    };

    const handleSave = () => {
        try {
            localStorage.setItem(
                "admin_notification_settings",
                JSON.stringify(settings)
            );

            setSaved(true);

            setTimeout(() => {
                setSaved(false);
            }, 3000);
        } catch (error) {
            console.error(
                "Failed to save notification settings:",
                error
            );
        }
    };

    const notificationItems = [
        {
            key: "orderNotifications",
            title: "Order Notifications",
            description:
                "Receive notifications when a new order is placed.",
        },
        {
            key: "lowStockAlerts",
            title: "Low Stock Alerts",
            description:
                "Get notified when product stock reaches a low level.",
        },
        {
            key: "paymentNotifications",
            title: "Payment Notifications",
            description:
                "Receive alerts about successful, failed or pending payments.",
        },
        {
            key: "customerNotifications",
            title: "Customer Notifications",
            description:
                "Get notified about important customer activity.",
        },
        {
            key: "reviewNotifications",
            title: "Review Notifications",
            description:
                "Receive alerts when customers submit product reviews.",
        },
        {
            key: "returnNotifications",
            title: "Return Notifications",
            description:
                "Get notified when customers request product returns.",
        },
    ];

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Notification Settings
                </h1>

                <p className="text-gray-500 mt-1">
                    Manage your admin alert preferences
                </p>
            </div>

            {/* Success */}
            {saved && (
                <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
                    <p className="font-semibold">
                        Settings saved successfully.
                    </p>

                    <p className="text-sm mt-1">
                        Your notification preferences have been updated.
                    </p>
                </div>
            )}

            {/* Notification Preferences */}
            <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">

                <div className="p-5 sm:p-6 border-b">
                    <h2 className="text-lg font-bold text-gray-900">
                        Alert Preferences
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                        Choose which notifications you want to receive.
                    </p>
                </div>

                <div className="divide-y">
                    {notificationItems.map((item) => (
                        <div
                            key={item.key}
                            className="p-5 sm:p-6 flex items-center justify-between gap-5"
                        >
                            <div className="min-w-0">
                                <h3 className="font-semibold text-gray-900">
                                    {item.title}
                                </h3>

                                <p className="text-sm text-gray-500 mt-1">
                                    {item.description}
                                </p>
                            </div>

                            {/* Toggle */}
                            <button
                                type="button"
                                onClick={() =>
                                    handleChange(item.key)
                                }
                                aria-label={`Toggle ${item.title}`}
                                className={`
                                    relative
                                    flex-shrink-0
                                    w-12
                                    h-7
                                    rounded-full
                                    transition-colors
                                    ${
                                        settings[item.key]
                                            ? "bg-black"
                                            : "bg-gray-300"
                                    }
                                `}
                            >
                                <span
                                    className={`
                                        absolute
                                        top-1
                                        w-5
                                        h-5
                                        bg-white
                                        rounded-full
                                        shadow
                                        transition-transform
                                        ${
                                            settings[item.key]
                                                ? "translate-x-6"
                                                : "translate-x-1"
                                        }
                                    `}
                                />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-5 sm:p-6 bg-gray-50 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                    <p className="text-sm text-gray-500">
                        Changes are saved for this browser.
                    </p>

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
                            transition
                        "
                    >
                        Save Settings
                    </button>

                </div>
            </div>
        </div>
    );
}