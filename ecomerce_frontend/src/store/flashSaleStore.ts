import { create } from "zustand";
import {
    flashSaleService,
    getEffectiveProductPrice,
    isFlashSaleActive,
} from "../service/flashSaleService";
import type { FlashSalePriceInfo, FlashSaleResponse } from "../types/catalog";

interface FlashSaleState {
    activeSales: FlashSaleResponse[];
    loading: boolean;
    lastFetched: number;
    fetchActiveSales: (force?: boolean) => Promise<FlashSaleResponse[]>;
    getPriceInfo: (product: {
        id: number;
        price: number;
        categoryId?: number | null;
        category?: { id: number } | null;
    }) => FlashSalePriceInfo;
}

export const useFlashSaleStore = create<FlashSaleState>((set, get) => ({
    activeSales: [],
    loading: false,
    lastFetched: 0,

    fetchActiveSales: async (force = false) => {
        const state = get();
        const now = Date.now();
        // Cache for 30 seconds unless forced
        if (!force && state.lastFetched > 0 && now - state.lastFetched < 30_000) {
            return state.activeSales;
        }

        set({ loading: true });
        try {
            const sales = await flashSaleService.getActiveFlashSales();
            const runningSales = (sales || []).filter(isFlashSaleActive);
            set({
                activeSales: runningSales,
                loading: false,
                lastFetched: Date.now(),
            });
            return runningSales;
        } catch {
            set({ loading: false });
            return [];
        }
    },

    getPriceInfo: (product) => {
        const { activeSales } = get();
        return getEffectiveProductPrice(product, activeSales);
    },
}));

