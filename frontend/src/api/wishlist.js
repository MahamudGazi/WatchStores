import api from "./axios";

export async function getWishlist() {
  const response = await api.get("/wishlist/");
  return response.data;
}

export async function getWishlistCount() {
  const response = await api.get("/wishlist/count/");
  return response.data;
}

export async function addToWishlist(productId) {
  const response = await api.post("/wishlist/", {
    product: productId,
  });
  return response.data;
}

export async function removeFromWishlist(id) {
  const response = await api.delete(`/wishlist/${id}/`);
  return response.data;
}