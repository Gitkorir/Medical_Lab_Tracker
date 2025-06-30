import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:5000",
});

// ✅ Automatically add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

export default api;
