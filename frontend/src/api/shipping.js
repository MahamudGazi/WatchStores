import api from "./axios";

export async function createShippingAddress(data) {
    const response = await api.post(
        "/orders/shipping-addresses/",
        data
    );

    return response.data;
}

export async function getShippingAddresses() {
    const response = await api.get(
        "/orders/shipping-addresses/"
    );

    return response.data;
}

export async function updateShippingAddress(id, data) {
    const response = await api.patch(
        `/orders/shipping-addresses/${id}/`,
        data
    );

    return response.data;
}

export async function deleteShippingAddress(id) {
    const response = await api.delete(
        `/orders/shipping-addresses/${id}/`
    );

    return response.data;
}