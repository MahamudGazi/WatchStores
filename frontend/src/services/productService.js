import api from "../api/axios";

export const getFeaturedProducts = async () => {
  const response = await api.get("/products/");
  return response.data;
};