import { api } from "../lib/axios";
import type {
    ApiDataResponse,
    CreateCheckoutResponse,
    CreateOrderRequest,
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
     * Gọi GET /api/v1/payment-requests/{orderId}/status
     */
    async getPaymentStatus(
        orderId: number,
    ): Promise<{ status: string; paymentStatus: string }> {
        const response = await api.get<
            ApiDataResponse<{ status: string; paymentStatus: string }>
        >(`/payment-requests/${orderId}/status`);
        return response.data.data;
    },
};

