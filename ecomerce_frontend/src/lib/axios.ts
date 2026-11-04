import axios from "axios";
import { useAuthStore } from "../store/authStore";

const defaultBaseUrl = import.meta.env.PROD
    ? "http://221.121.4.43:8080/api/v1"
    : "http://localhost:8080/api/v1";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || defaultBaseUrl,
    withCredentials: true,
});

// Thêm access token vào request
api.interceptors.request.use(
    (config) => {
        if (config.url?.startsWith("/api/v1")) {
            config.url = config.url.substring(7);
        }

        const token = useAuthStore.getState().accessToken;

        const isAuthApi =
            config.url?.startsWith("/auth/login") ||
            config.url?.startsWith("/auth/register") ||
            config.url?.startsWith("/products") ||
            config.url?.startsWith("/categories") ||
            config.url?.startsWith("/auth/refresh");

        if (token && !isAuthApi) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error),
);

// Xử lý response
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (!originalRequest) {
            return Promise.reject(error);
        }

        const url = originalRequest.url ?? "";

        const isAuthApi =
            url.startsWith("/auth/login") ||
            url.startsWith("/auth/register") ||
            url.startsWith("/products") ||
            url.startsWith("/categories") ||
            url.startsWith("/auth/refresh");

        if (isAuthApi) {
            return Promise.reject(error);
        }

        // Không thử lại request nhiều lần
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            await useAuthStore.getState().refresh();
            const token = useAuthStore.getState().accessToken;

            if (!token) {
                return Promise.reject(error);
            }

            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
        }

        return Promise.reject(error);
    },
);
