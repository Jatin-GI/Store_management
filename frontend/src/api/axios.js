import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_URL;

if (!apiBaseUrl) {
  console.error("VITE_API_URL is missing. Set it before building the frontend.");
}

const api = axios.create({
  baseURL: apiBaseUrl || "http://localhost:8080/api/v1",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
