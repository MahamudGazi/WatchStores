import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import CartSummary from "../components/cart/CartSummary";
import { createOrder } from "../api/order";
import { createShippingAddress } from "../api/shipping";
import { getCart } from "../api/cart";
import { validateCoupon } from "../api/coupon";

export default function Checkout() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        full_name: "",
        phone: "",
        address_line: "",
        city: "",
        district: "",
        postal_code: "",
        payment_method: "COD",
    });

    const [cart, setCart] = useState(null);
    const [loadingCart, setLoadingCart] = useState(true);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [error, setError] = useState("");
    const [couponCode, setCouponCode] = useState("");
    const [coupon, setCoupon] = useState(null);
    const [couponMsg, setCouponMsg] = useState("");
    const [applyingCoupon, setApplyingCoupon] = useState(false);

    useEffect(() => {
        loadCart();
    }, []);

    async function loadCart() {
        try {
            setLoadingCart(true);
            setError("");

            const data = await getCart();
            setCart(data);
        } catch (err) {
            console.error("Cart loading error:", err);

            setError(
                err.response?.data?.detail ||
                "Failed to load your cart."
            );
        } finally {
            setLoadingCart(false);
        }
    }

    function handleChange(e) {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Remove error when user starts correcting form
        if (error) {
            setError("");
        }
    }

    async function handleApplyCoupon() {
        if (!couponCode.trim()) {
            setCouponMsg("Enter a coupon code.");
            return;
        }
        setApplyingCoupon(true);
        setCouponMsg("");
        try {
            const res = await validateCoupon(couponCode.trim());
            if (res.success && res.data) {
                setCoupon(res.data);
                setCouponMsg(`Coupon ${res.data.code} applied (-${res.data.discount}%)`);
            } else {
                setCoupon(null);
                setCouponMsg(res.message || "Invalid coupon.");
            }
        } catch (err) {
            setCoupon(null);
            setCouponMsg(
                err.response?.data?.message || "Invalid or expired coupon."
            );
        } finally {
            setApplyingCoupon(false);
        }
    }

    function validateForm() {
        if (!formData.full_name.trim()) {
            return "Please enter your full name.";
        }

        if (!formData.phone.trim()) {
            return "Please enter your phone number.";
        }

        if (!/^01[3-9]\d{8}$/.test(formData.phone.trim())) {
            return "Please enter a valid Bangladesh phone number.";
        }

        if (!formData.address_line.trim()) {
            return "Please enter your shipping address.";
        }

        if (!formData.city.trim()) {
            return "Please enter your city.";
        }

        if (!formData.district.trim()) {
            return "Please enter your district.";
        }

        if (!formData.postal_code.trim()) {
            return "Please enter your postal code.";
        }

        return "";
    }

    async function handlePlaceOrder(e) {
    e.preventDefault();

    if (placingOrder) return;

    const validationError = validateForm();

    if (validationError) {
        setError(validationError);
        return;
    }

    try {
        setPlacingOrder(true);
        setError("");

        // =====================================
        // 1. CREATE SHIPPING ADDRESS
        // =====================================

        const shipping = await createShippingAddress({
            full_name: formData.full_name.trim(),
            phone: formData.phone.trim(),
            address_line: formData.address_line.trim(),
            city: formData.city.trim(),
            district: formData.district.trim(),
            postal_code: formData.postal_code.trim(),
        });

        // =====================================
        // 2. CREATE ORDER
        // =====================================

        const orderPayload = {
            shipping_address_id: shipping.id,
            payment_method: formData.payment_method,
        };

        if (coupon?.id) {
            orderPayload.coupon_id = coupon.id;
        }

        const response = await createOrder(orderPayload);

        // =====================================
        // 3. GET ORDER RESPONSE DATA
        // =====================================

        const orderData = response?.data || response;

        // =====================================
        // 4. COD
        // =====================================

        if (formData.payment_method === "COD") {
            navigate("/order-success");
            return;
        }

        // =====================================
        // 5. SSL COMMERZ
        // =====================================

        if (formData.payment_method === "SSL") {
            const paymentUrl = orderData?.payment_url;

            if (!paymentUrl) {
                console.error(
                    "SSLCommerz payment response:",
                    response
                );

                throw new Error(
                    "Payment URL was not returned by server."
                );
            }

            // Redirect to SSLCommerz
            window.location.href = paymentUrl;
            return;
        }

    } catch (err) {
        console.error(
            "❌ CHECKOUT ERROR:",
            err
        );

        console.error(
            "Server response:",
            err.response?.data
        );

        const serverError =
            err.response?.data?.detail ||
            err.response?.data?.error ||
            err.response?.data?.message;

        setError(
            serverError ||
            err.message ||
            "Something went wrong while placing your order."
        );

    } finally {
        setPlacingOrder(false);
    }
}

    // =====================================
    // CART LOADING
    // =====================================

    if (loadingCart) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-black" />

                    <p className="mt-4 text-sm text-gray-500">
                        Loading checkout...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12">

                {/* =====================================
                    HEADER
                ===================================== */}

                <div className="mb-6 sm:mb-8">
                    <p className="text-sm font-medium text-gray-500">
                        Home / Checkout
                    </p>

                    <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
                        Checkout
                    </h1>

                    <p className="mt-2 text-sm text-gray-500 sm:text-base">
                        Complete your shipping information and place your order.
                    </p>
                </div>


                {/* =====================================
                    ERROR
                ===================================== */}

                {error && (
                    <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">

                        <span className="mt-0.5 text-lg">
                            ⚠️
                        </span>

                        <div>
                            <p className="font-semibold">
                                Checkout Error
                            </p>

                            <p className="mt-1 text-sm">
                                {error}
                            </p>
                        </div>

                    </div>
                )}


                {/* =====================================
                    MAIN GRID
                ===================================== */}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">

                    {/* =================================
                        SHIPPING FORM
                    ================================= */}

                    <div className="lg:col-span-2">

                        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

                            {/* Card Header */}

                            <div className="border-b border-gray-100 px-4 py-5 sm:px-6">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white">
                                        1
                                    </div>

                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                                            Shipping Information
                                        </h2>

                                        <p className="text-sm text-gray-500">
                                            Where should we deliver your order?
                                        </p>
                                    </div>

                                </div>

                            </div>


                            {/* Form */}

                            <form
                                onSubmit={handlePlaceOrder}
                                className="space-y-6 p-4 sm:p-6 lg:p-8"
                            >

                                {/* Name + Phone */}

                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                                            Full Name
                                            <span className="text-red-500">
                                                {" "}*
                                            </span>
                                        </label>

                                        <input
                                            type="text"
                                            name="full_name"
                                            value={formData.full_name}
                                            onChange={handleChange}
                                            placeholder="Enter your full name"
                                            autoComplete="name"
                                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
                                        />
                                    </div>


                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                                            Phone Number
                                            <span className="text-red-500">
                                                {" "}*
                                            </span>
                                        </label>

                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="01XXXXXXXXX"
                                            autoComplete="tel"
                                            inputMode="numeric"
                                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
                                        />
                                    </div>

                                </div>


                                {/* Address */}

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Shipping Address
                                        <span className="text-red-500">
                                            {" "}*
                                        </span>
                                    </label>

                                    <textarea
                                        rows={4}
                                        name="address_line"
                                        value={formData.address_line}
                                        onChange={handleChange}
                                        placeholder="House / Road / Area"
                                        autoComplete="street-address"
                                        className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
                                    />
                                </div>


                                {/* City + District */}

                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                                            City
                                            <span className="text-red-500">
                                                {" "}*
                                            </span>
                                        </label>

                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            placeholder="City"
                                            autoComplete="address-level2"
                                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
                                        />
                                    </div>


                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                                            District
                                            <span className="text-red-500">
                                                {" "}*
                                            </span>
                                        </label>

                                        <input
                                            type="text"
                                            name="district"
                                            value={formData.district}
                                            onChange={handleChange}
                                            placeholder="District"
                                            autoComplete="address-level1"
                                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
                                        />
                                    </div>

                                </div>


                                {/* Postal Code */}

                                <div className="sm:max-w-xs">

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Postal Code
                                        <span className="text-red-500">
                                            {" "}*
                                        </span>
                                    </label>

                                    <input
                                        type="text"
                                        name="postal_code"
                                        value={formData.postal_code}
                                        onChange={handleChange}
                                        placeholder="8100"
                                        inputMode="numeric"
                                        autoComplete="postal-code"
                                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
                                    />

                                </div>


                                {/* =================================
                                    PAYMENT METHOD
                                ================================= */}

                                <div className="border-t border-gray-100 pt-6">

                                    <div className="mb-4 flex items-center gap-3">

                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white">
                                            2
                                        </div>

                                        <div>
                                            <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                                                Payment Method
                                            </h2>

                                            <p className="text-sm text-gray-500">
                                                Choose your preferred payment option.
                                            </p>
                                        </div>

                                    </div>


                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                                        {/* COD */}

                                        <label
                                            className={`cursor-pointer rounded-xl border p-4 transition ${formData.payment_method === "COD"
                                                ? "border-black bg-gray-50 ring-2 ring-black/10"
                                                : "border-gray-200 hover:border-gray-400"
                                                }`}
                                        >

                                            <div className="flex items-center gap-3">

                                                <input
                                                    type="radio"
                                                    name="payment_method"
                                                    value="COD"
                                                    checked={
                                                        formData.payment_method === "COD"
                                                    }
                                                    onChange={handleChange}
                                                    className="h-4 w-4 accent-black"
                                                />

                                                <div>
                                                    <p className="font-semibold text-gray-900">
                                                        Cash on Delivery
                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-500">
                                                        Pay when your order arrives.
                                                    </p>
                                                </div>

                                            </div>

                                        </label>


                                        {/* SSL */}

                                        <label
                                            className={`cursor-pointer rounded-xl border p-4 transition ${formData.payment_method === "SSL"
                                                ? "border-black bg-gray-50 ring-2 ring-black/10"
                                                : "border-gray-200 hover:border-gray-400"
                                                }`}
                                        >

                                            <div className="flex items-center gap-3">

                                                <input
                                                    type="radio"
                                                    name="payment_method"
                                                    value="SSL"
                                                    checked={
                                                        formData.payment_method === "SSL"
                                                    }
                                                    onChange={handleChange}
                                                    className="h-4 w-4 accent-black"
                                                />

                                                <div>
                                                    <p className="font-semibold text-gray-900">
                                                        SSLCommerz
                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-500">
                                                        Pay securely online.
                                                    </p>
                                                </div>

                                            </div>

                                        </label>

                                    </div>

                                </div>


                                {/* =================================
                                    PLACE ORDER BUTTON
                                ================================= */}

                                <div className="border-t border-gray-100 pt-6">

                                    <button
                                        type="submit"
                                        disabled={placingOrder}
                                        className="flex w-full items-center justify-center gap-3 rounded-xl bg-black px-6 py-4 text-base font-bold text-white shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400 sm:text-lg"
                                    >

                                        {placingOrder ? (
                                            <>
                                                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                                                <span>
                                                    {formData.payment_method === "SSL"
                                                        ? "Processing Payment..."
                                                        : "Placing Order..."
                                                    }
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <span>
                                                    {formData.payment_method === "SSL"
                                                        ? "Continue to Payment"
                                                        : "Place Order"
                                                    }
                                                </span>

                                                <span>
                                                    →
                                                </span>
                                            </>
                                        )}

                                    </button>


                                    <p className="mt-3 text-center text-xs text-gray-500">
                                        🔒 Your information is securely processed.
                                    </p>

                                </div>

                            </form>

                        </div>

                    </div>


                    {/* =================================
                        ORDER SUMMARY
                    ================================= */}

                    <div className="lg:sticky lg:top-6 lg:self-start">

                        <div className="mb-4 rounded-xl border border-zinc-200 bg-white p-4">
                            <label className="mb-2 block text-sm font-medium text-zinc-700">
                                Coupon Code
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    placeholder="SAVE20"
                                    className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm uppercase"
                                />
                                <button
                                    type="button"
                                    onClick={handleApplyCoupon}
                                    disabled={applyingCoupon}
                                    className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
                                >
                                    {applyingCoupon ? "..." : "Apply"}
                                </button>
                            </div>
                            {couponMsg && (
                                <p className={`mt-2 text-sm ${coupon ? "text-green-600" : "text-red-600"}`}>
                                    {couponMsg}
                                </p>
                            )}
                        </div>

                        <CartSummary cart={cart} />

                    </div>

                </div>

            </div>
        </div>
    );
}