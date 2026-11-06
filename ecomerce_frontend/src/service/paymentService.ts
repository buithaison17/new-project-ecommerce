import { api } from "../lib/axios";
import type {
    ApiDataResponse,
    CreateCheckoutResponse,
    CreateOrderRequest,
    OrderResponse,
    PageResponse,
} from "../types/order";

export const paymentService = {
    /**
     * Tạo link thanh toán PayOS từ thông tin đơn hàng.
     * Gọi POST /api/v1/payment-requests
     */
    async createPaymentLink(
        request: CreateOrderRequest,
    ): Promise<CreateCheckoutResponse> {
        const response = await api.post<ApiDataResponse<CreateCheckoutResponse>>(
            "/payment-requests",
            request,
        );
        return response.data.data;
    },

    /**
     * Hủy thanh toán PayOS cho đơn hàng.
     * Gọi POST /api/v1/payment-requests/{orderId}/cancel
     */
    async cancelPayment(orderId: number): Promise<void> {
        await api.post(`/payment-requests/${orderId}/cancel`);
    },

    /**
     * Kiểm tra trạng thái thanh toán PayOS cho đơn hàng.
     * Thử GET /api/v1/payment-requests/{orderId}/status,
     * nếu backend chưa có endpoint riêng thì kiểm tra qua GET /api/v1/orders/users.
     */
    async getPaymentStatus(
        orderId: number,
    ): Promise<{ status: string; paymentStatus: string }> {
        try {
            const response = await api.get<
                ApiDataResponse<{ status: string; paymentStatus: string }>
            >(`/payment-requests/${orderId}/status`);
            if (response.data?.data) {
                return response.data.data;
            }
        } catch {
            // Backend chưa có endpoint status riêng -> fallback kiểm tra qua danh sách đơn hàng
        }

        try {
            const res = await api.get<ApiDataResponse<PageResponse<OrderResponse>>>(
                "/orders/users",
                {
                    params: { currentPage: 1, pageSize: 20 },
                },
            );
            const found = res.data?.data?.content?.find((o) => o.id === orderId);
            if (found) {
                const isPaid = found.paymentStatus === "COMPLETED";
                const isCancelled = found.orderStatus === "CANCELLED";
                return {
                    status: isPaid ? "PAID" : isCancelled ? "CANCELLED" : "PENDING",
                    paymentStatus: found.paymentStatus,
                };
            }
        } catch {
            // ignore
        }

        return { status: "PENDING", paymentStatus: "PENDING" };
    },
};
