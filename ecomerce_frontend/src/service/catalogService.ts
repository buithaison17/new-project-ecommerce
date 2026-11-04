import { api } from "../lib/axios";
import type { ApiDataResponse, Category, PageResponse, Product, ProductSummary } from "../types/catalog";

export interface ProductQuery { keyword?: string; brand?: string; categoryId?: number; minPrice?: number; maxPrice?: number; sortBy?: "createdAt" | "price" | "name"; sortDir?: "asc" | "desc"; page?: number; size?: number; }
export const catalogService = {
    async getCategories() { return (await api.get<ApiDataResponse<Category[]>>("/categories")).data.data; },
    async getProducts(query: ProductQuery) { return (await api.get<ApiDataResponse<PageResponse<ProductSummary>>>("/products", { params: query })).data.data; },
    async getProduct(id: string) { return (await api.get<ApiDataResponse<Product>>(`/products/${id}`)).data.data; },
};
