import axios from "axios";

// During local development, Vite proxies /api to the Node backend. This lets
// phones and other computers use the site without treating their own localhost
// as the API server. A deployed VITE_API_URL still takes precedence.
const baseURL = import.meta.env.VITE_API_URL || "https://assessment-backend-production-a284.up.railway.app/api";

export const api = axios.create({ baseURL });

// Attach the JWT to every request automatically once the user is logged in
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token expires or is invalid, the backend returns 401 — log the user out
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
