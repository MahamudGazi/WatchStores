import api from "./axios";

export async function validateCoupon(code) {
  const response = await api.post("/coupons/validate/", { code });
  return response.data;
}
