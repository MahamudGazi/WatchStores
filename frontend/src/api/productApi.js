import api from "./axios";

export const getProducts = async () => {
  const response = await api.get("/products/");

  return response.data;
};

export const getFeaturedProducts = async () => {
  const response = await api.get("/products/?is_featured=true");

  return response.data;
};

export const getProduct = async (slug) => {
  const response = await api.get(`/products/${slug}/`);

  return response.data;
};