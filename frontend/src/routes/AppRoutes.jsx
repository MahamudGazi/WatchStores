import { BrowserRouter, Routes, Route } from "react-router-dom";

// ===============================
// LAYOUTS
// ===============================
import MainLayout from "../layouts/MainLayout";
import AdminLayout from "../layouts/AdminLayout";
import AdminRoute from "./AdminRoute";

// ===============================
// CUSTOMER PAGES
// ===============================
import Home from "../pages/Home";
import Products from "../pages/Products";
import ProductDetails from "../pages/ProductDetails";
import Cart from "../pages/Cart";
import Wishlist from "../pages/Wishlist";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Checkout from "../pages/Checkout";
import Profile from "../pages/Profile";
import Orders from "../pages/Orders";
import OrderSuccess from "../pages/OrderSuccess";
import PaymentSuccess from "../pages/PaymentSuccess";
import PaymentFailed from "../pages/PaymentFailed";
import PaymentCancelled from "../pages/PaymentCancelled";
import MyOrders from "../pages/MyOrders";
import OrderDetails from "../pages/OrderDetails";
import ForgotPassword from "../pages/ForgotPassword";

// ===============================
// ADMIN - DASHBOARD
// ===============================
import AdminDashboard from "../pages/Admin/Dashboard/AdminDashboard";
import Revenue from "../pages/Admin/Dashboard/Revenue";
import OrderStatus from "../pages/Admin/Dashboard/OrderStatus";
import TopProducts from "../pages/Admin/Dashboard/TopProducts";
import TopCustomers from "../pages/Admin/Dashboard/TopCustomers";
import Notifications from "../pages/Admin/Dashboard/Notifications";

// ===============================
// ADMIN - ORDERS
// ===============================
import AdminOrders from "../pages/Admin/Orders/AdminOrders";
import AdminOrderDetails from "../pages/Admin/Orders/AdminOrderDetails";

// ===============================
// ADMIN - CUSTOMERS
// ===============================
import AdminCustomers from "../pages/Admin/Customers/AdminCustomers";

// ===============================
// ADMIN - PRODUCTS
// ===============================
import AdminProducts from "../pages/Admin/Products/AdminProducts";

// ===============================
// ADMIN - INVENTORY
// ===============================
import AdminInventory from "../pages/Admin/Inventory/AdminInventory";

// ===============================
// ADMIN - RETURNS
// ===============================
import AdminReturns from "../pages/Admin/Returns/AdminReturns";

// ===============================
// ADMIN - REFUNDS
// ===============================
import AdminRefunds from "../pages/Admin/Refunds/AdminRefunds";

// ===============================
// ADMIN - ANALYTICS
// ===============================
import AdminAnalytics from "../pages/Admin/Analytics/AdminAnalytics";

// ===============================
// ADMIN - CATEGORIES
// ===============================
import AdminCategories from "../pages/Admin/Categories/AdminCategories";

// ===============================
// ADMIN - BRANDS
// ===============================
import AdminBrands from "../pages/Admin/Brands/AdminBrands";

// ===============================
// ADMIN - REVIEWS
// ===============================
import AdminReviews from "../pages/Admin/Reviews/AdminReviews";

// ===============================
// ADMIN - WISHLIST
// ===============================
import AdminWishlist from "../pages/Admin/Wishlist/AdminWishlist";

// ===============================
// ADMIN - PAYMENTS
// ===============================
import AdminPayments from "../pages/Admin/Payments/AdminPayments";
import AdminPaymentsSuccessful from "../pages/Admin/Payments/AdminPaymentsSuccessful";
import AdminPaymentsPending from "../pages/Admin/Payments/AdminPaymentsPending";
import AdminPaymentsFailed from "../pages/Admin/Payments/AdminPaymentsFailed";

// ===============================
// ADMIN - MARKETING
// ===============================
import AdminCoupons from "../pages/Admin/Coupons/AdminCoupons";
import AdminFlashSales from "../pages/Admin/Marketing/AdminFlashSales";
import AdminPromotions from "../pages/Admin/Marketing/AdminPromotions";

// ===============================
// ADMIN - SHIPPING
// ===============================
import AdminShippingMethods from "../pages/Admin/Shipping/AdminShippingMethods";
import AdminShippingZones from "../pages/Admin/Shipping/AdminShippingZones";
import AdminShippingCharges from "../pages/Admin/Shipping/AdminShippingCharges";

// ===============================
// ADMIN - REPORTS
// ===============================
import AdminReports from "../pages/Admin/Reports/AdminReports";
import AdminSalesReport from "../pages/Admin/Reports/AdminSalesReport";
import AdminRevenueReport from "../pages/Admin/Reports/AdminRevenueReport";
import AdminProductReport from "../pages/Admin/Reports/AdminProductReport";
import AdminCustomerReport from "../pages/Admin/Reports/AdminCustomerReport";
import AdminInventoryReport from "../pages/Admin/Reports/AdminInventoryReport";

// ===============================
// ADMIN - NOTIFICATIONS
// ===============================
import AdminNotifications from "../pages/Admin/Notifications/AdminNotifications";

// ===============================
// ADMIN - SETTINGS
// ===============================
import AdminSettings from "../pages/Admin/Settings/AdminSettings";
import AdminStoreSettings from "../pages/Admin/Settings/AdminStoreSettings";
import AdminPaymentSettings from "../pages/Admin/Settings/AdminPaymentSettings";
import AdminShippingSettings from "../pages/Admin/Settings/AdminShippingSettings";
import AdminEmailSettings from "../pages/Admin/Settings/AdminEmailSettings";
import AdminNotificationSettings from "../pages/Admin/Settings/AdminNotificationSettings";

// ===============================
// ADMIN - USERS
// ===============================
import AdminUsers from "../pages/Admin/Users/AdminUsers";
import AdminRoles from "../pages/Admin/Users/AdminRoles";
import AdminActivityLogs from "../pages/Admin/Users/AdminActivityLogs";

// ===============================
// 404
// ===============================
import NotFound from "../pages/NotFound";


export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>

                {/* =====================================================
                    CUSTOMER ROUTES
                ===================================================== */}

                <Route path="/" element={<MainLayout />}>

                    <Route
                        index
                        element={<Home />}
                    />

                    <Route
                        path="products"
                        element={<Products />}
                    />

                    <Route
                        path="products/:id"
                        element={<ProductDetails />}
                    />

                    <Route
                        path="cart"
                        element={<Cart />}
                    />

                    <Route
                        path="wishlist"
                        element={<Wishlist />}
                    />

                    <Route
                        path="checkout"
                        element={<Checkout />}
                    />

                    <Route
                        path="login"
                        element={<Login />}
                    />

                    <Route
                        path="forgot-password"
                        element={<ForgotPassword />}
                    />

                    <Route
                        path="register"
                        element={<Register />}
                    />

                    <Route
                        path="profile"
                        element={<Profile />}
                    />

                    <Route
                        path="orders"
                        element={<Orders />}
                    />

                    <Route
                        path="orders/:id"
                        element={<OrderDetails />}
                    />

                    <Route
                        path="my-orders"
                        element={<MyOrders />}
                    />

                    <Route
                        path="order-success"
                        element={<OrderSuccess />}
                    />

                    <Route
                        path="payment-success"
                        element={<PaymentSuccess />}
                    />

                    <Route
                        path="payment-failed"
                        element={<PaymentFailed />}
                    />

                    <Route
                        path="payment-cancelled"
                        element={<PaymentCancelled />}
                    />

                </Route>


                {/* =====================================================
                    ADMIN ROUTES
                ===================================================== */}

                <Route
                    path="/admin"
                    element={<AdminRoute />}
                >

                    <Route element={<AdminLayout />}>

                        {/* Dashboard */}
                        <Route
                            path="dashboard"
                            element={<AdminDashboard />}
                        />

                        {/* Orders */}
                        <Route
                            path="orders"
                            element={<AdminOrders />}
                        />

                        <Route
                            path="orders/:id"
                            element={<AdminOrderDetails />}
                        />

                        {/* Customers */}
                        <Route
                            path="customers"
                            element={<AdminCustomers />}
                        />

                        {/* Products */}
                        <Route
                            path="products"
                            element={<AdminProducts />}
                        />

                        {/* Inventory */}
                        <Route
                            path="inventory"
                            element={<AdminInventory />}
                        />

                        {/* Analytics */}
                        <Route
                            path="analytics"
                            element={<AdminAnalytics />}
                        />

                        {/* Categories */}
                        <Route
                            path="categories"
                            element={<AdminCategories />}
                        />

                        {/* Brands */}
                        <Route
                            path="brands"
                            element={<AdminBrands />}
                        />

                        {/* Reviews */}
                        <Route
                            path="reviews"
                            element={<AdminReviews />}
                        />

                        {/* Wishlist */}
                        <Route
                            path="wishlist"
                            element={<AdminWishlist />}
                        />

                        {/* Payments */}
                        <Route
                            path="payments"
                            element={<AdminPayments />}
                        />

                        <Route
                            path="payments/successful"
                            element={<AdminPaymentsSuccessful />}
                        />

                        <Route
                            path="payments/pending"
                            element={<AdminPaymentsPending />}
                        />

                        <Route
                            path="payments/failed"
                            element={<AdminPaymentsFailed />}
                        />

                        {/* Marketing */}
                        <Route
                            path="coupons"
                            element={<AdminCoupons />}
                        />

                        <Route
                            path="flash-sales"
                            element={<AdminFlashSales />}
                        />

                        <Route
                            path="promotions"
                            element={<AdminPromotions />}
                        />

                        {/* Shipping */}
                        <Route
                            path="shipping/methods"
                            element={<AdminShippingMethods />}
                        />

                        <Route
                            path="shipping/zones"
                            element={<AdminShippingZones />}
                        />

                        <Route
                            path="shipping/charges"
                            element={<AdminShippingCharges />}
                        />

                        {/* Reports */}
                        <Route
                            path="reports"
                            element={<AdminReports />}
                        />

                        <Route
                            path="reports/sales"
                            element={<AdminSalesReport />}
                        />

                        <Route
                            path="reports/revenue"
                            element={<AdminRevenueReport />}
                        />

                        <Route
                            path="reports/products"
                            element={<AdminProductReport />}
                        />

                        <Route
                            path="reports/customers"
                            element={<AdminCustomerReport />}
                        />

                        <Route
                            path="reports/inventory"
                            element={<AdminInventoryReport />}
                        />

                        {/* Notifications */}
                        <Route
                            path="notifications"
                            element={<AdminNotifications />}
                        />

                        {/* Settings */}
                        <Route
                            path="settings"
                            element={<AdminSettings />}
                        />

                        <Route
                            path="settings/store"
                            element={<AdminStoreSettings />}
                        />

                        <Route
                            path="settings/payment"
                            element={<AdminPaymentSettings />}
                        />

                        <Route
                            path="settings/shipping"
                            element={<AdminShippingSettings />}
                        />

                        <Route
                            path="settings/email"
                            element={<AdminEmailSettings />}
                        />

                        <Route
                            path="settings/notifications"
                            element={<AdminNotificationSettings />}
                        />

                        {/* Users */}
                        <Route
                            path="users"
                            element={<AdminUsers />}
                        />

                        <Route
                            path="roles"
                            element={<AdminRoles />}
                        />

                        <Route
                            path="activity-logs"
                            element={<AdminActivityLogs />}
                        />

                        {/* Returns */}
                        <Route
                            path="returns"
                            element={<AdminReturns />}
                        />

                        {/* Refunds */}
                        <Route
                            path="refunds"
                            element={<AdminRefunds />}
                        />

                    </Route>

                </Route>


                {/* =====================================================
                    DASHBOARD EXTRA ROUTES
                ===================================================== */}

                <Route
                    path="revenue"
                    element={<Revenue />}
                />

                <Route
                    path="order-status"
                    element={<OrderStatus />}
                />

                <Route
                    path="top-products"
                    element={<TopProducts />}
                />

                <Route
                    path="top-customers"
                    element={<TopCustomers />}
                />

                <Route
                    path="notifications"
                    element={<Notifications />}
                />


                {/* =====================================================
                    404
                ===================================================== */}

                <Route
                    path="*"
                    element={<NotFound />}
                />

            </Routes>
        </BrowserRouter>
    );
}