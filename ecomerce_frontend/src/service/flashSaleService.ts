import { api } from "../lib/axios";
import type {
    ApiDataResponse,
    FlashSalePriceInfo,
    FlashSaleProduct,
    FlashSaleResponse,
    Product,
    ProductSummary,
} from "../types/catalog";

export const isFlashSaleActive = (sale: FlashSaleResponse): boolean => {
    if (!sale.isActive) return false;
    const now = Date.now();
    const start = new Date(sale.startAt).getTime();
    const end = new Date(sale.endAt).getTime();
    return now >= start && now <= end;
};

export const doesSaleApplyToProduct = (
    sale: FlashSaleResponse,
    product: {
        id: number;
        categoryId?: number | null;
        category?: { id: number } | null;
    },
): boolean => {
    if (sale.scope === "ALL") return true;

    const catId = product.categoryId ?? product.category?.id ?? null;
    if (sale.scope === "CATEGORY") {
        return (
            sale.categoryId != null &&
            catId != null &&
            Number(sale.categoryId) === Number(catId)
        );
    }

    if (sale.scope === "PRODUCT") {
        return sale.productId != null && Number(sale.productId) === Number(product.id);
    }

    return false;
};

export const calculateDiscountedPrice = (
    price: number,
    sale: FlashSaleResponse,
): number => {
    let discounted = price;
    if (sale.discountType === "PERCENTAGE") {
        discounted = price * (1 - sale.discountValue / 100);
    } else if (sale.discountType === "FIXED_AMOUNT") {
        discounted = price - sale.discountValue;
    }
    return Math.max(0, Math.round(discounted));
};

export const getEffectiveProductPrice = (
    product: {
        id: number;
        price: number;
        categoryId?: number | null;
        category?: { id: number } | null;
    },
    activeSales: FlashSaleResponse[],
): FlashSalePriceInfo => {
    const runningSales = activeSales.filter(isFlashSaleActive);
    const applicableSales = runningSales.filter((sale) =>
        doesSaleApplyToProduct(sale, product),
    );

    if (applicableSales.length === 0) {
        return {
            originalPrice: product.price,
            salePrice: product.price,
            discountPercent: 0,
            isFlashSale: false,
        };
    }

    let minPrice = product.price;
    let chosenSale: FlashSaleResponse = applicableSales[0];

    for (const sale of applicableSales) {
        const discounted = calculateDiscountedPrice(product.price, sale);
        if (discounted < minPrice) {
            minPrice = discounted;
            chosenSale = sale;
        }
    }

    const discountPercent =
        product.price > 0
            ? Math.min(
                100,
                Math.max(1, Math.round(((product.price - minPrice) / product.price) * 100)),
            )
            : 0;

    return {
        originalPrice: product.price,
        salePrice: minPrice,
        discountPercent,
        isFlashSale: minPrice < product.price,
        appliedSale: chosenSale,
        endAt: chosenSale.endAt,
    };
};

export const flashSaleService = {
    async getActiveFlashSales(): Promise<FlashSaleResponse[]> {
        try {
            const res = await api.get<ApiDataResponse<FlashSaleResponse[]>>(
                "/flash-sales/active",
            );
            return res.data.data || [];
        } catch {
            return [];
        }
    },

    async getFlashSaleProducts(): Promise<FlashSaleProduct[]> {
        const activeSales = await this.getActiveFlashSales();
        const runningSales = activeSales.filter(isFlashSaleActive);

        if (runningSales.length === 0) {
            return [];
        }

        const candidateMap = new Map<
            number,
            ProductSummary | (Product & { categoryId?: number; categoryName?: string })
        >();

        try {
            const hasAll = runningSales.some((s) => s.scope === "ALL");
            if (hasAll) {
                // Toàn bộ sản phẩm: tải danh sách sản phẩm lớn
                const productsRes = await api.get<
                    ApiDataResponse<{ content: ProductSummary[] }>
                >("/products", {
                    params: { size: 100 },
                });
                const list = productsRes.data.data?.content || [];
                for (const p of list) {
                    candidateMap.set(p.id, p);
                }
            } else {
                // Gom theo từng danh mục hoặc sản phẩm cụ thể
                const categoryIds = Array.from(
                    new Set(
                        runningSales
                            .filter((s) => s.scope === "CATEGORY" && s.categoryId != null)
                            .map((s) => s.categoryId as number),
                    ),
                );

                for (const catId of categoryIds) {
                    try {
                        const catRes = await api.get<
                            ApiDataResponse<{ content: ProductSummary[] }>
                        >("/products", {
                            params: { categoryId: catId, size: 50 },
                        });
                        const list = catRes.data.data?.content || [];
                        for (const p of list) {
                            candidateMap.set(p.id, p);
                        }
                    } catch {
                        // ignore and continue
                    }
                }

                const productIds = Array.from(
                    new Set(
                        runningSales
                            .filter((s) => s.scope === "PRODUCT" && s.productId != null)
                            .map((s) => s.productId as number),
                    ),
                );

                for (const prodId of productIds) {
                    if (!candidateMap.has(prodId as number)) {
                        try {
                            const pRes = await api.get<ApiDataResponse<Product>>(
                                `/products/${prodId}`,
                            );
                            const p = pRes.data.data;
                            if (p) {
                                candidateMap.set(p.id, {
                                    ...p,
                                    categoryId: p.category?.id ?? 0,
                                    categoryName: p.category?.name ?? "",
                                });
                            }
                        } catch {
                            // ignore and continue
                        }
                    }
                }
            }

            const flashSaleProducts: FlashSaleProduct[] = [];

            for (const prod of candidateMap.values()) {
                const info = getEffectiveProductPrice(prod, runningSales);
                if (info.isFlashSale) {
                    flashSaleProducts.push({
                        id: prod.id,
                        name: prod.name,
                        price: prod.price,
                        salePrice: info.salePrice,
                        discountPercent: info.discountPercent,
                        categoryId:
                            (prod as ProductSummary).categoryId ??
                            (prod as Product).category?.id ??
                            null,
                        categoryName:
                            (prod as ProductSummary).categoryName ??
                            (prod as Product).category?.name ??
                            null,
                        thumbnailUrl: prod.thumbnailUrl,
                        stockQuantity: prod.stockQuantity,
                        inStock: prod.inStock,
                        endAt: info.endAt ?? null,
                        saleName: info.appliedSale?.name,
                    });
                }
            }

            // Sắp xếp ưu tiên giảm giá sâu nhất
            return flashSaleProducts.sort(
                (a, b) => b.discountPercent - a.discountPercent,
            );
        } catch {
            return [];
        }
    },
};
