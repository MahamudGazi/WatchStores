import api from "./axios";

export async function createOrder(data) {
  const response = await api.post("/orders/checkout/", data);
  return response.data;
}

export const getMyOrders = async () => {
    const response = await api.get("/orders/my_orders/");
    return response.data;
};

export const getOrderDetails = async (id) => {
    const response = await api.get(`/orders/${id}/`);
    return response.data;
};

export const cancelOrder = async (id) => {
    const response = await api.post(`/orders/${id}/cancel/`);
    return response.data;
};

export async function createReturnRequest(
    orderId,
    reason,
    images = []
) {
    const formData = new FormData();

    // Return reason
    formData.append(
        "reason",
        reason
    );

    // Return images
    images.forEach((image) => {
        formData.append(
            "images",
            image
        );
    });

    const response = await api.post(
        `/orders/${orderId}/return_request/`,
        formData
    );

    return response.data;
}


