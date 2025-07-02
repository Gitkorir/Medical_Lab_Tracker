import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "https://medical-lab-tracker.onrender.com/",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Dynamically add token for every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  // Always send as Bearer <token>
  if (token) {
    config.headers.Authorization = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
});

// Error logging remains the same
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Log status, message, and the data payload
      console.error("API Error:", {
        status: error.response.status,
        statusText: error.response.statusText,
        url: error.config.url,
        data: error.response.data,
      });
    } else {
      console.error("API Error:", error.message);
    }
    return Promise.reject(error);
  }
);


export default api;