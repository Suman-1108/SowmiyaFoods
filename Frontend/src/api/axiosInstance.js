import axios from "axios";

// Automatically route to local backend when developing on localhost / 127.0.0.1
const getBaseURL = () => {
  if (typeof window !== "undefined") {
    const isLocal =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.endsWith(".localhost");

    if (isLocal) {
      const envUrl = import.meta.env.VITE_API_URL;
      if (envUrl && (envUrl.includes("localhost") || envUrl.includes("127.0.0.1"))) {
        return envUrl;
      }
      return "http://localhost:5000/api";
    }

    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl && !envUrl.startsWith("/")) {
      return envUrl;
    }

    // If running on Vercel preview or with unconfigured VITE_API_URL, route to direct API
    if (window.location.hostname.endsWith(".vercel.app")) {
      return "https://api.sowmiyafoods.com/api";
    }
  }

  // In production: use VITE_API_URL if configured, otherwise default to direct DigitalOcean API
  return import.meta.env.VITE_API_URL || "https://api.sowmiyafoods.com/api";
};

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 6000, // 6s strict timeout so requests NEVER hang indefinitely!
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 Automatically attach JWT token (if available)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Gracefully intercept HTML responses (e.g. Vercel SSO preview protection or 404 HTML)
axiosInstance.interceptors.response.use(
  (response) => {
    if (
      typeof response.data === "string" &&
      (response.data.includes("<!DOCTYPE") ||
        response.data.includes("<html") ||
        response.data.startsWith("Redirecting"))
    ) {
      return Promise.reject(new Error("Received HTML redirect response instead of JSON API"));
    }
    return response;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
