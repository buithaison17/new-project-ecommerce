const defaultBackendUrl = import.meta.env.PROD
    ? "http://221.121.4.43:8080"
    : "http://localhost:8080";

export const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL ||
    (import.meta.env.VITE_API_BASE_URL?.startsWith("http")
        ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/v1\/?$/, "")
        : defaultBackendUrl);

/**
 * Chuẩn hóa URL ảnh sản phẩm từ Backend
 * Hỗ trợ đường dẫn upload (/uploads/...), URL tuyệt đối và fallback ảnh mặc định
 */
export function formatProductImageUrl(
    url?: string | null,
    fallback = "https://placehold.co/600x600/f1f5f9/64748b?text=ShopNova"
): string {
    if (!url || typeof url !== "string" || !url.trim()) {
        return fallback;
    }
    const cleanUrl = url.trim();
    if (cleanUrl.startsWith("/uploads/")) {
        return `${BACKEND_URL}${cleanUrl}`;
    }
    if (
        cleanUrl.startsWith("http://") ||
        cleanUrl.startsWith("https://") ||
        cleanUrl.startsWith("blob:") ||
        cleanUrl.startsWith("data:")
    ) {
        return cleanUrl;
    }
    if (cleanUrl.startsWith("/")) {
        return `${BACKEND_URL}${cleanUrl}`;
    }
    return cleanUrl;
}
