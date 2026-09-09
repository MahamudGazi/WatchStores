import api from "./axios";

export async function getAdminOrders() {
    try {
        const response = await api.get(
            "/orders/admin-orders/"
        );

        console.log("ADMIN ORDERS RESPONSE:", response.data);

        return response.data.data || [];
    } catch (err) {
        console.log("========== ADMIN ORDERS ERROR ==========");
        console.log("Status:", err.response?.status);
        console.log("Data:", err.response?.data);
        console.log("Headers:", err.response?.headers);
        console.log("Full error:", err);
        throw err;
    }
}

export async function getAdminOrder(id) {
    const response = await api.get(
        `/orders/${id}/`
    );

    return response.data;
}


export async function getDashboardStats() {
    const response = await api.get("/dashboard/stats/");
    return response.data;
}

export async function getOrderStatusChart() {
    // Backend URL
    const response = await api.get("/dashboard/order-status/");
    return response.data;
}

export async function getMonthlySales() {
    const response = await api.get("/dashboard/monthly-sales/");
    return response.data;
}

export async function getDashboardWidgets() {

    const [lowStock, latestOrders] = await Promise.all([

        api.get("/dashboard/low-stock-products/"),

        api.get("/dashboard/recent-orders/"),

    ]);

    return {

        low_stock: lowStock.data,

        latest_orders: latestOrders.data,

    };

}

export async function getDashboardAnalytics() {

    const [topProducts, topCustomers] = await Promise.all([

        api.get("/dashboard/top-products/"),

        api.get("/dashboard/top-customers/"),

    ]);

    return {

        top_products: topProducts.data,

        best_customers: topCustomers.data,

    };

}

export async function getRecentActivity() {
    const response = await api.get("/dashboard/recent-activity/");
    return response.data;
}

export async function getDashboardNotifications() {
    const response = await api.get(
        "/dashboard/notifications/"
    );

    return response.data;
}

export async function exportOrdersCSV() {

    const response = await api.get(
        "/dashboard/export/orders/",
        {
            responseType: "blob",
        }
    );

    return response.data;

}

export async function updateInventory(id, data) {

    const response = await api.post(
        `/dashboard/inventory/${id}/`,
        data
    );

    return response.data;

}

export async function getLowStockProducts() {
    const response = await api.get(
        "/dashboard/low-stock-products/"
    );

    return response.data;
}


export async function getRecentOrders() {
    const response = await api.get(
        "/dashboard/recent-orders/"
    );

    return response.data;
}


export async function getTopProducts() {
    const response = await api.get(
        "/dashboard/top-products/"
    );

    return response.data;
}


export async function getTopCustomers() {
    const response = await api.get(
        "/dashboard/top-customers/"
    );

    return response.data;
}


export async function getRevenueAnalytics() {
    try {
        const response = await api.get("/dashboard/revenue/");

        console.log("REVENUE API RESPONSE:", response.data);

        return response.data;
    } catch (error) {
        console.error(
            "REVENUE API ERROR:",
            error.response?.status,
            error.response?.data || error.message
        );

        throw error;
    }
}

export const getAdminOrderDetail = async (id) => {
    const response = await api.get(`/orders/${id}/`);

    return response.data;
};



export async function updateOrderStatus(id, data) {
    const response = await api.post(
        `/orders/${id}/update_status/`,
        data
    );

    return response.data;
}


// Get pending return requests
export async function getPendingReturns() {
    const response = await api.get(
        "/orders/pending_returns/"
    );

    return response.data.data;
}


// Approve return
export async function approveReturn(orderId) {
    const response = await api.post(
        `/orders/${orderId}/approve_return/`
    );

    return response.data;
}

// Reject return
export async function rejectReturn(orderId) {
    const response = await api.post(
        `/orders/${orderId}/reject_return/`
    );

    return response.data;
}

// Get all refunds
export async function getRefunds() {
    const response = await api.get(
        "/orders/refunds/"
    );

    return response.data.data;
}


// Get refund summary
export async function getRefundSummary() {
    const response = await api.get(
        "/orders/refund_summary/"
    );

    return response.data.data;
}

// ===============================
// PRODUCT MANAGEMENT
// ===============================

export async function getAdminProducts() {
    const response = await api.get("/products/");
    return response.data;
}

export async function getBrands() {
    const response = await api.get("/brands/");
    return response.data;
}

export async function getCategories() {
    const response = await api.get("/categories/");
    return response.data;
}


// ===============================
// CREATE PRODUCT
// ===============================

export async function createAdminProduct(data) {
    const response = await api.post(
        "/products/",
        data
    );

    return response.data;
}


// ===============================
// UPDATE PRODUCT
// ===============================

export async function updateAdminProduct(id, data) {
    const response = await api.patch(
        `/products/${id}/`,
        data
    );

    return response.data;
}


// ===============================
// DELETE PRODUCT
// ===============================

export async function deleteAdminProduct(id) {
    const response = await api.delete(
        `/products/${id}/`
    );

    return response.data;
}


// ===============================
// PRODUCT GALLERY
// ===============================

export async function getProductImages(productId) {
    const response = await api.get(
        `/products/${productId}/images/`
    );

    return response.data;
}


// ===============================
// UPLOAD GALLERY IMAGE
// ===============================

export async function uploadProductImage(
    productId,
    image,
    altText = ""
) {
    const formData = new FormData();

    formData.append("image", image);

    if (altText.trim()) {
        formData.append(
            "alt_text",
            altText.trim()
        );
    }

    const response = await api.post(
        `/products/${productId}/images/`,
        formData
    );

    return response.data;
}

// ===============================
// UPDATE GALLERY IMAGE
// ===============================

export async function updateProductImage(
    productId,
    imageId,
    imageFile = null,
    altText = ""
) {
    const formData = new FormData();

    if (imageFile instanceof File) {
        formData.append(
            "image",
            imageFile
        );
    }

    formData.append(
        "alt_text",
        altText ?? ""
    );

    const response = await api.patch(
        `/products/${productId}/images/${imageId}/`,
        formData
    );

    return response.data;
}

// ===============================
// DELETE GALLERY IMAGE
// ===============================

export async function deleteProductImage(
    productId,
    imageId
) {
    const response = await api.delete(
        `/products/${productId}/images/${imageId}/`
    );

    return response.data;
}


// ===============================
// CUSTOMERS
// ===============================

export async function getAdminCustomers() {
    const response = await api.get(
        "/orders/admin-customers/"
    );

    return response.data.data || [];
}


// ===============================
// INVENTORY
// ===============================

export async function getInventory() {
    const response = await api.get(
        "/dashboard/inventory/"
    );

    return response.data;
}

export async function getInventorySummary() {
    const response = await api.get(
        "/products/inventory_summary/"
    );

    return response.data;
}

export async function updateInventoryStock(id, stock) {
    const response = await api.post(
        `/products/${id}/update_stock/`,
        { stock }
    );

    return response.data;
}


// ===============================
// PAYMENT TRANSACTIONS
// ===============================

export async function getPaymentTransactions() {
    const response = await api.get("/payments/");

    return response.data;
}


// ===============================
// REVIEW MANAGEMENT
// ===============================

export async function getAdminReviews() {
    const response = await api.get("/reviews/admin/");
    return response.data?.data || [];
}


export async function deleteAdminReview(reviewId) {
    try {
        const response = await api.delete(
            `/reviews/${reviewId}/`
        );

        return response.data;
    } catch (error) {
        console.error(
            "DELETE REVIEW ERROR:",
            error.response?.status,
            error.response?.data || error.message
        );

        throw error;
    }
}


export async function refreshAccessToken(refresh) {
  const response = await api.post("/auth/refresh/", {
    refresh,
  });

  return response.data;
}