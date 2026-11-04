import type { OrderStatus } from "../types/order";

const OVERRIDES_STORAGE_KEY = "order_status_overrides";
const LEGACY_ADMIN_KEY = "admin_order_status_overrides";

// Chỉ có 4 trạng thái hợp lệ trong toàn hệ thống: PENDING, SHIPPED, DELIVERED, CANCELLED
export const VALID_ORDER_STATUSES: OrderStatus[] = ["PENDING", "SHIPPED", "DELIVERED", "CANCELLED"];

/**
 * Chuẩn hóa trạng thái đơn hàng để đảm bảo chỉ có 4 trạng thái duy nhất:
 * PENDING, SHIPPED, DELIVERED, CANCELLED
 */
export function normalizeOrderStatus(status: unknown): OrderStatus {
    const s = String(status || "").trim().toUpperCase();
    if (s === "SHIPPED" || s === "SHIPPING") return "SHIPPED";
    if (s === "DELIVERED" || s === "COMPLETED") return "DELIVERED";
    if (s === "CANCELLED" || s === "CANCELED") return "CANCELLED";
    return "PENDING";
}

/**
 * Lấy danh sách các trạng thái đơn hàng đã được cập nhật/đồng bộ giữa Admin và Người dùng.
 */
export function getOrderStatusOverrides(): Record<string, OrderStatus> {
    try {
        const primary = JSON.parse(localStorage.getItem(OVERRIDES_STORAGE_KEY) || "{}");
        const legacy = JSON.parse(localStorage.getItem(LEGACY_ADMIN_KEY) || "{}");
        const combined = { ...legacy, ...primary };
        const result: Record<string, OrderStatus> = {};
        for (const key of Object.keys(combined)) {
            result[key] = normalizeOrderStatus(combined[key]);
        }
        return result;
    } catch {
        return {};
    }
}

/**
 * Lưu trạng thái đơn hàng mới vào kho lưu trữ Frontend dùng chung và bắn event đồng bộ tức thì.
 * Chỉ chấp nhận 4 trạng thái: PENDING, SHIPPED, DELIVERED, CANCELLED.
 */
export function saveOrderStatusOverride(orderId: number | string, status: OrderStatus | string): void {
    try {
        const overrides = getOrderStatusOverrides();
        const normalized = normalizeOrderStatus(status);
        const orderKey = String(orderId);

        // Nếu trạng thái đã lưu giống trạng thái mới thì bỏ qua, tránh ghi đè và loop event
        if (overrides[orderKey] === normalized) {
            return;
        }

        overrides[orderKey] = normalized;

        localStorage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify(overrides));
        localStorage.setItem(LEGACY_ADMIN_KEY, JSON.stringify(overrides));

        // Phát sự kiện toàn cục để mọi trang (Admin, Khách hàng, Modal) tự động cập nhật
        if (typeof window !== "undefined") {
            window.dispatchEvent(
                new CustomEvent("order_status_changed", {
                    detail: { orderId: Number(orderId), status: normalized },
                })
            );
        }
    } catch (e) {
        console.warn("Lỗi lưu trạng thái đơn hàng:", e);
    }
}

/**
 * Xóa override trạng thái đơn hàng khi cần phục hồi về trạng thái gốc của Backend
 */
export function removeOrderStatusOverride(orderId: number | string): void {
    try {
        const overrides = getOrderStatusOverrides();
        delete overrides[String(orderId)];
        localStorage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify(overrides));
        localStorage.setItem(LEGACY_ADMIN_KEY, JSON.stringify(overrides));
    } catch (e) {
        console.warn("Lỗi xóa override trạng thái đơn hàng:", e);
    }
}

/**
 * Đồng bộ trạng thái đơn hàng của một đối tượng Order bất kỳ (User hay Admin).
 * Đảm bảo orderStatus trả về luôn là 1 trong 4 giá trị: PENDING, SHIPPED, DELIVERED, CANCELLED.
 * Nếu order từ backend đã có orderStatus, nó là nguồn sự thật và được chuẩn hóa chính xác.
 */
export function syncOrderStatus<T extends { id: number; orderStatus?: any }>(order: T): T {
    if (!order) return order;
    const overrides = getOrderStatusOverrides();
    const ov = overrides[order.id] || overrides[String(order.id)];
    // Ưu tiên trạng thái trả về trực tiếp từ Backend; nếu không có mới lấy từ override
    const rawStatus = order.orderStatus !== undefined && order.orderStatus !== null && order.orderStatus !== ""
        ? order.orderStatus
        : ov;
    const normalized = normalizeOrderStatus(rawStatus);
    return {
        ...order,
        orderStatus: normalized,
    };
}

