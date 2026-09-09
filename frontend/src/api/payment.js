import api from "./axios";

export const createSSLSession = async (data) => {
    const response = await api.post("/payments/create-session/", data);
    return response.data;
};