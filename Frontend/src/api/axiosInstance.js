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
      // If VITE_API_URL explicitly specifies a localhost/127.0.0.1 address, use it; otherwise route to local backend
      if (envUrl && (envUrl.includes("localhost") || envUrl.includes("127.0.0.1"))) {
        return envUrl;
      }
      return "http://localhost:5000/api";
    }
  }

  // In production: use VITE_API_URL if configured, otherwise default to same-origin /api for Vercel
  return import.meta.env.VITE_API_URL || "/api";
};

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 Automatically attach JWT token (if available)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // assuming you store JWT in localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
