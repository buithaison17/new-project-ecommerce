import { api } from "../lib/axios";
import type { CartItem } from "../types/cart";

export interface SyncCartItem {
    productId: number;
    quantity: number;
}

export interface CartResponse {
    items: CartItem[];
}

export const cartService = {
    async getCart() {
        return (await api.get<{ data: CartResponse }>("/cart")).data.data;
    },

    async addItem(productId: number, quantity: number) {
        return (await api.post<{ data: CartResponse }>("/cart/items", { productId, quantity })).data.data;
    },

    async updateItem(productId: number, quantity: number) {
        return (await api.put<{ data: CartResponse }>(`/cart/items/${productId}`, { quantity })).data.data;
    },

    async removeItem(productId: number) {
        return (await api.delete<{ data: CartResponse }>(`/cart/items/${productId}`)).data.data;
    },

    async clear() {
        return (await api.delete<{ data: CartResponse }>("/cart")).data.data;
    },

    async sync(items: SyncCartItem[]) {
        return (await api.post<{ data: CartResponse }>("/cart/sync", { items })).data.data;
    },
};
