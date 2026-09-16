import axiosInstance from "./axiosInstance";

/**
 * Send WhatsApp Embedded Signup onboarding payload to backend
 * @param {object} payload { code, wabaId, phoneNumberId, businessId }
 * @param {string} token Admin auth token (optional if attached by axios interceptor)
 */
export const saveWhatsappOnboarding = async (payload, token) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await axiosInstance.post("/whatsapp/onboarding", payload, { headers });
  return res.data;
};

/**
 * Get current connected WhatsApp Business account details & status
 * @param {string} token Admin auth token (optional if attached by axios interceptor)
 */
export const getWhatsappStatus = async (token) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await axiosInstance.get("/whatsapp/status", { headers });
  return res.data;
};
