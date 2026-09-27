import axios from "axios";
import { useAuthStore } from "../features/auth/authStore";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false,
  timeout: 15000,
});

// إرفاق التوكن تلقائيًا (لطلبات admin)
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (import.meta.env.DEV) {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
  }
  return config;
});

// معالجة الأخطاء
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 في مسارات admin → امسح الجلسة
    if (error.response?.status === 401 && error.config?.url?.includes("/admin/")) {
      useAuthStore.getState().clearAuth();
    }
    if (import.meta.env.DEV) {
      console.error("[API ERROR]", error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;