export type FlashSaleScope = "ALL" | "CATEGORY" | "PRODUCT";
export type FlashSaleDiscountType = "PERCENTAGE" | "FIXED_AMOUNT";

export interface FlashSaleResponse {
    id: number;
    name: string;
    description: string | null;
    scope: FlashSaleScope;
    categoryId: number | null;
    categoryName: string | null;
    productId: number | null;
    productName: string | null;
    discountType: FlashSaleDiscountType;
    discountValue: number;
    startAt: string;
    endAt: string;
    isActive: boolean;
    isRunning: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface FlashSalePriceInfo {
    originalPrice: number;
    salePrice: number;
    discountPercent: number;
    isFlashSale: boolean;
    appliedSale?: FlashSaleResponse;
    endAt?: string;
}

