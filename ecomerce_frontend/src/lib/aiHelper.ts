import { catalogService } from "../service/catalogService";
import type { SuggestedProduct } from "../types/ai";

/**
 * Trích xuất khoảng giá từ câu hỏi của người dùng (vd: "dưới 10 triệu", "tầm 5 đến 8tr")
 */
export const extractPriceConstraints = (
    text: string
): { minPrice?: number; maxPrice?: number } => {
    const clean = text.toLowerCase().replace(/,/g, "").replace(/\./g, "");
    let maxPrice: number | undefined;
    let minPrice: number | undefined;

    // Pattern: dưới X triệu / < X triệu / dưới X tr / tầm dưới X triệu
    const maxMatch = clean.match(
        /(?:dưới|<|thấp hơn|nhỏ hơn|tối đa|tầm dưới)\s*(\d+(?:\.\d+)?)\s*(triệu|tr|k|nghìn)?/i
    );
    if (maxMatch) {
        const val = parseFloat(maxMatch[1]);
        const unit = (maxMatch[2] || "").toLowerCase();
        if (unit.startsWith("tr") || unit.startsWith("triệu")) {
            maxPrice = val * 1_000_000;
        } else if (unit === "k" || unit.startsWith("nghìn")) {
            maxPrice = val * 1_000;
        } else if (val <= 100) {
            maxPrice = val * 1_000_000;
        } else {
            maxPrice = val;
        }
    }

    // Pattern: trên X triệu / > X triệu / từ X triệu
    const minMatch = clean.match(
        /(?:trên|>|cao hơn|lớn hơn|tối thiểu|từ)\s*(\d+(?:\.\d+)?)\s*(triệu|tr|k|nghìn)?/i
    );
    if (minMatch) {
        const val = parseFloat(minMatch[1]);
        const unit = (minMatch[2] || "").toLowerCase();
        if (unit.startsWith("tr") || unit.startsWith("triệu")) {
            minPrice = val * 1_000_000;
        } else if (unit === "k" || unit.startsWith("nghìn")) {
            minPrice = val * 1_000;
        } else if (val <= 100) {
            minPrice = val * 1_000_000;
        } else {
            minPrice = val;
        }
    }

    return { minPrice, maxPrice };
};

/**
 * Lọc bỏ các từ đệm thông thường trong câu hỏi tư vấn mua sắm để lấy từ khóa sản phẩm cốt lõi
 */
export const extractCoreProductKeyword = (userPrompt: string): string => {
    let kw = userPrompt
        .toLowerCase()
        .replace(/[?.,!]/g, " ")
        .replace(
            /\b(gợi ý|tìm|kiếm|tư vấn|cho tôi|giúp tôi|cần|muốn|mua|bán|có những|loại nào|nào tốt|giá rẻ|phù hợp|được không|nhé|tầm|khoảng|dưới|trên|triệu|tr|k|nghìn|vnd|đồng)\b/gi,
            " "
        )
        .replace(/\s+/g, " ")
        .trim();

    return kw;
};

/**
 * Thuật toán Senior trích xuất và truy vấn danh sách sản phẩm gợi ý thông minh từ phản hồi của AI
 */
export const extractAndFetchSuggestedProducts = async (
    aiResponseText: string,
    userPrompt: string
): Promise<SuggestedProduct[]> => {
    try {
        // 1. Kiểm tra JSON embedded trong response (vd: ```json [{...}] ```)
        const jsonBlockMatch = aiResponseText.match(
            /```(?:json)?\s*(\[[\s\S]*?\]|\{[\s\S]*?\})\s*```/
        );
        if (jsonBlockMatch) {
            try {
                const parsed = JSON.parse(jsonBlockMatch[1]);
                const rawItems = Array.isArray(parsed)
                    ? parsed
                    : parsed.products || parsed.items;
                if (Array.isArray(rawItems) && rawItems.length > 0) {
                    return rawItems.slice(0, 4).map((p: any) => ({
                        id: Number(p.id),
                        name: p.name || `Sản phẩm #${p.id}`,
                        price: Number(p.price) || 0,
                        imageUrl: p.imageUrl || p.thumbnailUrl || null,
                        categoryName: p.categoryName || null,
                    }));
                }
            } catch {
                // ignore JSON parse error
            }
        }

        // 2. Kiểm tra pattern ID trực tiếp: [PRODUCT_ID: 1] hoặc ID: 1 hoặc SP: 1
        const idMatches = Array.from(
            aiResponseText.matchAll(/(?:PRODUCT_ID|ID|Mã SP|SP)[:#\s]+(\d+)/gi)
        );
        if (idMatches.length > 0) {
            const productIds = Array.from(
                new Set(idMatches.map((m) => Number(m[1])))
            ).filter((id) => !isNaN(id));
            if (productIds.length > 0) {
                const productsRes = await catalogService.getProducts({ size: 50 });
                const matched = (productsRes.content || []).filter((p) =>
                    productIds.includes(p.id)
                );
                if (matched.length > 0) {
                    return matched.slice(0, 4).map((p) => ({
                        id: p.id,
                        name: p.name,
                        price: p.price,
                        imageUrl: p.thumbnailUrl,
                        categoryName: p.categoryName,
                    }));
                }
            }
        }

        // 3. Trích xuất tên sản phẩm được in đậm trong câu trả lời của AI (vd: **iPhone 13**, **MacBook Air M1**)
        const boldMatches = Array.from(aiResponseText.matchAll(/\*\*([^*]{3,40})\*\*/g));
        if (boldMatches.length > 0) {
            const candidates = boldMatches
                .map((m) => m[1].trim())
                .filter(
                    (name) =>
                        !name.toLowerCase().includes("lưu ý") &&
                        !name.toLowerCase().includes("ưu điểm") &&
                        !name.toLowerCase().includes("nhược điểm") &&
                        !name.toLowerCase().includes("giá")
                );

            if (candidates.length > 0) {
                // Thử tìm kiếm theo tên sản phẩm nổi bật đầu tiên
                const targetName = candidates[0];
                const res = await catalogService.getProducts({
                    keyword: targetName,
                    size: 4,
                });
                if (res?.content && res.content.length > 0) {
                    return res.content.slice(0, 4).map((p) => ({
                        id: p.id,
                        name: p.name,
                        price: p.price,
                        imageUrl: p.thumbnailUrl,
                        categoryName: p.categoryName,
                    }));
                }
            }
        }

        // 4. Phân tích ngữ nghĩa từ khóa và điều kiện giá từ prompt của người dùng
        const { minPrice, maxPrice } = extractPriceConstraints(userPrompt);
        const coreKeyword = extractCoreProductKeyword(userPrompt);

        // Danh sách từ khóa ngành hàng phổ biến
        const popularCategories = [
            "smartphone",
            "điện thoại",
            "laptop",
            "máy tính",
            "tai nghe",
            "chuột",
            "bàn phím",
            "đồng hồ",
            "máy đọc sách",
            "kindle",
            "sách",
            "balo",
            "túi xách",
            "áo",
            "quần",
            "giày",
        ];

        let matchedCategoryKw: string | undefined = undefined;
        const promptAndResponseLower = (userPrompt + " " + aiResponseText).toLowerCase();
        for (const cat of popularCategories) {
            if (promptAndResponseLower.includes(cat)) {
                matchedCategoryKw = cat;
                break;
            }
        }

        const searchKeyword =
            coreKeyword.length >= 2
                ? coreKeyword
                : matchedCategoryKw || (userPrompt.trim().length <= 30 ? userPrompt.trim() : undefined);

        const productsRes = await catalogService.getProducts({
            keyword: searchKeyword,
            minPrice,
            maxPrice,
            size: 4,
        });

        if (productsRes?.content && productsRes.content.length > 0) {
            return productsRes.content.slice(0, 4).map((p) => ({
                id: p.id,
                name: p.name,
                price: p.price,
                imageUrl: p.thumbnailUrl,
                categoryName: p.categoryName,
            }));
        }

        // Fallback: nếu có khoảng giá nhưng không tìm thấy keyword, tìm theo khoảng giá
        if (maxPrice || minPrice) {
            const fallbackRes = await catalogService.getProducts({
                minPrice,
                maxPrice,
                size: 4,
            });
            if (fallbackRes?.content && fallbackRes.content.length > 0) {
                return fallbackRes.content.slice(0, 4).map((p) => ({
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    imageUrl: p.thumbnailUrl,
                    categoryName: p.categoryName,
                }));
            }
        }
    } catch (err) {
        console.warn("Lỗi khi tìm kiếm sản phẩm đề xuất:", err);
    }

    return [];
};

