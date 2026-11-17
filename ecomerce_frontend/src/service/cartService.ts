import { api } from "../lib/axios";
import { formatProductImageUrl } from "../lib/image";
import type { CartItem } from "../types/cart";

export interface SyncCartItem {
    productId: number;
    quantity: number;
}

export interface BackendCartItem {
    productId: number;
    productName?: string;
    name?: string;
    thumbnailUrl: string | null;
    unitPrice?: number;
    price?: number;
    quantity: number;
    availableQuantity?: number;
    stockQuantity?: number;
    subtotal?: number;
}

export interface CartResponse {
    items: BackendCartItem[];
    totalQuantity?: number;
    totalAmount?: number;
}

export function normalizeBackendCartItems(backendItems: BackendCartItem[] = []): CartItem[] {
    return backendItems.map((item) => {
        const rawPrice = item.unitPrice ?? item.price ?? 0;
        const numPrice = typeof rawPrice === "number" ? rawPrice : Number(rawPrice);
        const rawStock = item.availableQuantity ?? item.stockQuantity ?? 99;
        const numStock = typeof rawStock === "number" ? rawStock : Number(rawStock);
        const rawQty = item.quantity ?? 1;
        const numQty = typeof rawQty === "number" ? rawQty : Number(rawQty);

        return {
            productId: Number(item.productId),
            name: item.productName || item.name || "Sản phẩm",
            price: Number.isNaN(numPrice) ? 0 : numPrice,
            thumbnailUrl: item.thumbnailUrl ? formatProductImageUrl(item.thumbnailUrl) : null,
            stockQuantity: Number.isNaN(numStock) ? 99 : Math.max(1, numStock),
            quantity: Number.isNaN(numQty) ? 1 : Math.max(1, numQty),
        };
    });
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
