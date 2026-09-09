import api from "./axios";

export async function addToCart(data) {
  const response = await api.post("/cart/", data);
  return response.data;
}

export async function getCart() {
  const response = await api.get("/cart/");
  return response.data;
}

export async function updateCart(id, quantity) {
  const response = await api.patch(`/cart/${id}/`, { quantity });
  return response.data;
}

export async function deleteCartItem(id) {
  const response = await api.delete(`/cart/${id}/`);
  return response.data;
}

export async function mergeGuestCart(items) {
  const response = await api.post("/cart/merge/", { items });
  return response.data;
}
