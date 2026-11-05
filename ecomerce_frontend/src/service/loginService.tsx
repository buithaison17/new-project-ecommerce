import { api } from "../lib/axios";

export const loginService = {
    // Kết nối với backend API đăng nhập
    login: async (data: { username: string; password: string }) => {
        const response = await api.post("/auth/login", data);
        return response.data;
    },
    // Kết nối với backend API lấy thông tin người dùng hiện tại
    getCurrentUser: async () => {
        try {
            const response = await api.get("/users/me");
            return response.data;
        } catch {
            const response = await api.get("/auth/me");
            return response.data;
        }
    },
    // Kết nối với backend API đăng xuất
    logout: async () => {
        await api.post("/auth/logout");
    },
};
