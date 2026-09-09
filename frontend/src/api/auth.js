import api from "./axios";

export async function loginUser(data) {
  const response = await api.post("/auth/login/", data);
  return response.data;
}

export async function registerUser(data) {
  const response = await api.post("/auth/register/", data);
  return response.data;
}

export async function getProfile() {
  const response = await api.get("/auth/profile/");
  return response.data;
}

export async function requestPasswordReset(email) {
  const response = await api.post("/auth/password-reset/", { email });
  return response.data;
}

export async function confirmPasswordReset(data) {
  const response = await api.post(
    "/auth/password-reset/confirm/",
    data
  );
  return response.data;
}

export async function sendEmailVerification() {
  const response = await api.post("/auth/verify-email/send/");
  return response.data;
}

export async function verifyEmail(otp) {
  const response = await api.post("/auth/verify-email/", { otp });
  return response.data;
}