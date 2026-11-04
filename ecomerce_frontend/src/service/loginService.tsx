import { api } from "../lib/axios";

export const loginService = {
    login: async (data: { username: string; password: string }) => {
        const response = await api.post("/auth/login", data);
        return response.data;
    },
    getCurrentUser: async () => {
        try {
            const response = await api.get("/users/me");
            return response.data;
        } catch {
            const response = await api.get("/auth/me");
            return response.data;
        }
    },
    logout: async () => {
        await api.post("/auth/logout");
    },
};
