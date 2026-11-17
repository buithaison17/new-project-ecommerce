import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "../types/cart";
import type { ProductImage } from "../types/catalog";
import { formatProductImageUrl } from "../lib/image";

export interface CartAddableProduct {
    id: number;
    name: string;
    price: number;
    stockQuantity?: number;
    thumbnailUrl?: string | null;
    images?: ProductImage[];
}

interface CartState {
    items: CartItem[];
    addItem: (product: CartAddableProduct, quantity?: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    removeItem: (productId: number) => void;
    clearCart: () => void;
    setItems: (items: CartItem[]) => void;
}

export const useCartStore = create<CartState>()(
    persist(
        (set) => ({
            items: [],
            addItem: (product, quantity = 1) =>
                set((state) => {
                    const safeQty = Math.max(1, Number(quantity) || 1);
                    const safePrice = Number(product.price) || 0;
                    const safeStock = Math.max(1, Number(product.stockQuantity) || 99);
                    const existingItem = state.items.find((item) => item.productId === product.id);

                    if (existingItem) {
                        return {
                            items: state.items.map((item) =>
                                item.productId === product.id
                                    ? {
                                          ...item,
                                          name: product.name || item.name || "Sản phẩm",
                                          price: safePrice > 0 ? safePrice : item.price,
                                          stockQuantity: safeStock,
                                          quantity: Math.min(item.quantity + safeQty, safeStock),
                                      }
                                    : item
                            ),
                        };
                    }

                    const image = formatProductImageUrl(product.thumbnailUrl || product.images?.[0]?.url);
                    return {
                        items: [
                            ...state.items,
                            {
                                productId: product.id,
                                name: product.name || "Sản phẩm",
                                price: safePrice,
                                thumbnailUrl: image,
                                stockQuantity: safeStock,
                                quantity: Math.min(safeQty, safeStock),
                            },
                        ],
                    };
                }),

            updateQuantity: (productId, quantity) =>
                set((state) => ({
                    items: state.items.map((item) =>
                        item.productId === productId
                            ? {
                                  ...item,
                                  quantity: Math.max(1, Math.min(Number(quantity) || 1, item.stockQuantity || 99)),
                              }
                            : item
                    ),
                })),

            removeItem: (productId) =>
                set((state) => ({
                    items: state.items.filter((item) => item.productId !== productId),
                })),

            clearCart: () => set({ items: [] }),

            setItems: (newItems) =>
                set({
                    items: (newItems || []).map((item) => ({
                        productId: Number(item.productId),
                        name: item.name || "Sản phẩm",
                        price: Number(item.price) || 0,
                        thumbnailUrl: item.thumbnailUrl ? formatProductImageUrl(item.thumbnailUrl) : null,
                        stockQuantity: Math.max(1, Number(item.stockQuantity) || 99),
                        quantity: Math.max(1, Number(item.quantity) || 1),
                    })),
                }),
        }),
        { name: "shopnova-cart" }
    )
);
