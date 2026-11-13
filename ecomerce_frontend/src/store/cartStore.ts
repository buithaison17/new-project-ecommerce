import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "../types/cart";
import type { ProductImage } from "../types/catalog";

import { formatProductImageUrl } from "../lib/image";

export interface CartAddableProduct {
    id: number;
    name: string;
    price: number;
    stockQuantity: number;
    thumbnailUrl?: string | null;
    images?: ProductImage[];
}

interface CartState {
    items: CartItem[];
    addItem: (product: CartAddableProduct, quantity?: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    removeItem: (productId: number) => void;
    clearCart: () => void;
}

export const useCartStore = create<CartState>()(
    persist(
        (set) => ({
            items: [],
            addItem: (product, quantity = 1) => set((state) => {
                const safeQty = Math.max(1, quantity);
                const maxStock = Math.max(1, product.stockQuantity || 1);
                const existingItem = state.items.find((item) => item.productId === product.id);
                if (existingItem) {
                    return {
                        items: state.items.map((item) => item.productId === product.id
                            ? {
                                ...item,
                                price: product.price,
                                stockQuantity: product.stockQuantity,
                                quantity: Math.min(item.quantity + safeQty, maxStock),
                            }
                            : item),
                    };
                }
                const image = formatProductImageUrl(product.thumbnailUrl || product.images?.[0]?.url);
                return {
                    items: [...state.items, {
                        productId: product.id,
                        name: product.name,
                        price: product.price,
                        thumbnailUrl: image,
                        stockQuantity: product.stockQuantity,
                        quantity: Math.min(safeQty, maxStock),
                    }],
                };
            }),
            updateQuantity: (productId, quantity) => set((state) => ({
                items: state.items.map((item) => item.productId === productId
                    ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stockQuantity)) }
                    : item),
            })),
            removeItem: (productId) => set((state) => ({
                items: state.items.filter((item) => item.productId !== productId),
            })),
            clearCart: () => set({ items: [] }),
        }),
        { name: "shopnova-cart" },
    ),
);
