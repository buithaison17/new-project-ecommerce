import { api } from "../lib/axios";

export interface Category {
    id: string;
    name: string;
    description?: string;
}

export const catalogService = {
    getCategories: async (): Promise<Category[]> => {
        const response = await api.get("/categories");
        return response.data;
    },
};
