import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "../types/cart";
import type { Product } from "../types/catalog";

import { formatProductImageUrl } from "../lib/image";

interface CartState {
    items: CartItem[];
    addItem: (product: Product) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    removeItem: (productId: number) => void;
    clearCart: () => void;
}

export const useCartStore = create<CartState>()(
    persist(
        (set) => ({
            items: [],
            addItem: (product) => set((state) => {
                const existingItem = state.items.find((item) => item.productId === product.id);
                if (existingItem) {
                    return {
                        items: state.items.map((item) => item.productId === product.id
                            ? { ...item, quantity: Math.min(item.quantity + 1, item.stockQuantity) }
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
                        quantity: 1,
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
