import { api } from "../lib/axios";
import type { AdminOrder, AdminUserResponse, ApiDataResponse, DashboardSummaryResponse, InventoryItem, PageResponse } from "../types/admin";
import type { Category, ProductSummary } from "../types/catalog";
import type { OrderItemResponse, OrderStatus } from "../types/order";
import { getProductThumbnail, orderService } from "./orderService";
import { getOrderStatusOverrides, normalizeOrderStatus, saveOrderStatusOverride, syncOrderStatus, VALID_ORDER_STATUSES } from "./orderStatusSync";

export const adminService = {
    // Lấy số liệu tổng quan của trang Dashboard theo backend API
    async getDashboardSummary(): Promise<DashboardSummaryResponse> {
        const response = await api.get<ApiDataResponse<DashboardSummaryResponse>>("/admin/dashboard/summary");
        return response.data.data;
    },

    saveOrderStatusOverride(orderId: number, status: OrderStatus | string) {
        saveOrderStatusOverride(orderId, status);
    },

    getOrderStatusOverrides(): Record<string, string> {
        return getOrderStatusOverrides();
    },

    // Lấy danh sách đơn hàng cho Admin: hỗ trợ phân trang và lọc theo trạng thái BE
    async getOrders(page = 1, status?: string): Promise<PageResponse<AdminOrder>> {
        let orders: AdminOrder[] = [];
        let totalElements = 0;
        let totalPages = 1;
        const normalizedStatus = status && VALID_ORDER_STATUSES.includes(status as OrderStatus) ? (status as OrderStatus) : undefined;

        try {
            // Thử endpoint GET /api/v1/orders (có phân trang Spring Page chuẩn xác)
            const response = await api.get<ApiDataResponse<any>>("/orders", {
                params: {
                    currentPage: page,
                    pageSize: 20,
                    orderStatus: normalizedStatus || undefined,
                },
            });
            const data = response.data?.data;
            if (data?.content && Array.isArray(data.content)) {
                orders = data.content;
                totalElements = data.totalElements ?? data.content.length;
                totalPages = data.totalPages ?? 1;
            } else if (Array.isArray(data)) {
                orders = data;
                totalElements = (page - 1) * 20 + data.length;
                totalPages = data.length >= 20 ? page + 1 : page;
            }
        } catch (ordersErr) {
            console.warn("Lỗi khi gọi /orders, thử /admin/orders:", ordersErr);
            try {
                // Fallback sang endpoint GET /api/v1/admin/orders
                const response = await api.get<ApiDataResponse<any>>("/admin/orders", {
                    params: {
                        currentPage: page,
                        pageSize: 20,
                        orderStatus: normalizedStatus || undefined,
                    },
                });
                const data = response.data?.data;
                if (Array.isArray(data)) {
                    orders = data;
                    totalElements = (page - 1) * 20 + data.length;
                    totalPages = data.length >= 20 ? page + 1 : page;
                } else if (data?.content && Array.isArray(data.content)) {
                    orders = data.content;
                    totalElements = data.totalElements ?? data.content.length;
                    totalPages = data.totalPages ?? 1;
                }
            } catch (err) {
                console.warn("Lỗi khi tải đơn hàng từ cả 2 endpoints:", err);
                throw err;
            }
        }

        // Chuẩn hóa và đồng bộ trạng thái đơn hàng (không lưu override để tránh phát event loop)
        orders = orders.map((ord) => syncOrderStatus(ord));

        if (normalizedStatus) {
            orders = orders.filter((ord) => ord.orderStatus === normalizedStatus);
            if (totalElements < orders.length) {
                totalElements = orders.length;
            }
        }

        return {
            content: orders,
            totalElements,
            totalPages,
            number: page,
            size: 20,
        };
    },

    // Cập nhật trạng thái đơn hàng (chỉ hỗ trợ 4 trạng thái: PENDING, SHIPPED, DELIVERED, CANCELLED)
    async updateOrderStatus(orderId: number, status: OrderStatus | string): Promise<AdminOrder> {
        const validStatus: OrderStatus = normalizeOrderStatus(status);

        let updatedOrder: AdminOrder | null = null;
        let lastError: any = null;

        // Gọi API backend: PATCH /api/v1/admin/orders/{id}/status với body { status: OrderStatus }
        try {
            const response = await api.patch<ApiDataResponse<AdminOrder>>(
                `/admin/orders/${orderId}/status`,
                { status: validStatus }
            );
            if (response.data?.data) {
                updatedOrder = response.data.data;
            }
        } catch (err: any) {
            lastError = err;
            // Nếu 404 (endpoint khác), thử fallback sang PATCH /api/v1/orders/{id}
            if (err?.response?.status === 404) {
                try {
                    const fallbackRes = await api.patch<ApiDataResponse<AdminOrder>>(
                        `/orders/${orderId}`,
                        { status: validStatus }
                    );
                    if (fallbackRes.data?.data) {
                        updatedOrder = fallbackRes.data.data;
                        lastError = null;
                    }
                } catch (fallbackErr: any) {
                    lastError = fallbackErr;
                }
            }
        }

        // Nếu Backend trả về lỗi (ví dụ: HTTP 400 "Đơn hàng không thể hủy"), THROW lỗi để UI hiển thị và rollback
        if (lastError && !updatedOrder) {
            const message =
                lastError.response?.data?.message ||
                lastError.message ||
                "Không thể cập nhật trạng thái đơn hàng";
            throw new Error(message);
        }

        // Cập nhật thành công ở Backend -> Lưu vào cache đồng bộ và trả về
        const finalStatus = normalizeOrderStatus(updatedOrder?.orderStatus || validStatus);
        saveOrderStatusOverride(orderId, finalStatus);

        return syncOrderStatus({
            ...(updatedOrder || {}),
            id: orderId,
            orderStatus: finalStatus,
        } as AdminOrder);
    },

    // Lấy chi tiết sản phẩm của đơn hàng cho Admin
    async getOrderDetail(orderId: number, orderHint?: any): Promise<OrderItemResponse[]> {
        try {
            const response = await api.get<ApiDataResponse<OrderItemResponse[]>>(`/admin/orders/${orderId}`);
            const items = response.data?.data;
            if (Array.isArray(items) && items.length > 0) {
                return items.map((item) => ({
                    ...item,
                    product: {
                        ...item.product,
                        thumbnailUrl: getProductThumbnail(item.product?.name, undefined, item.product?.thumbnailUrl),
                    },
                }));
            }
        } catch (err) {
            console.warn(`Lỗi khi gọi /admin/orders/${orderId}:`, err);
        }

        // Fallback sang orderService (hỗ trợ /orders/{id}, cache đặt hàng và suy luận danh mục)
        return orderService.getOrderDetail(orderId, orderHint);
    },

    async getInventories(lowStockOnly = false, page = 0, size = 15) {
        const response = await api.get<ApiDataResponse<PageResponse<InventoryItem>>>("/admin/inventories", {
            params: { lowStockOnly, page, size },
        });
        return response.data.data;
    },

    async restock(productId: number, quantity: number) {
        const response = await api.patch<ApiDataResponse<InventoryItem>>(
            `/admin/inventories/products/${productId}/restock`,
            { quantity },
        );
        return response.data.data;
    },

    async updateStock(productId: number, quantity: number) {
        const response = await api.put<ApiDataResponse<InventoryItem>>(
            `/admin/inventories/products/${productId}`,
            { quantity },
        );
        return response.data.data;
    },

    async createCategory(data: { name: string; description: string; brands?: string[] }) {
        return (await api.post<ApiDataResponse<Category>>("/admin/categories", data)).data.data;
    },

    async updateCategory(id: number, data: { name: string; description: string; brands?: string[] }) {
        return (await api.put<ApiDataResponse<Category>>(`/admin/categories/${id}`, data)).data.data;
    },

    async deleteCategory(id: number) {
        await api.delete(`/admin/categories/${id}`);
    },

    async createProduct(data: {
        name: string;
        description: string;
        price: number;
        categoryId: number;
        initialQuantity: number;
        imageUrls: string[];
    }) {
        return (await api.post<ApiDataResponse<ProductSummary>>("/admin/products", data)).data.data;
    },

    async updateProduct(productId: number, data: { name: string; description: string; price: number; categoryId: number; imageUrls: string[] }) {
        return (await api.put<ApiDataResponse<ProductSummary>>(`/admin/products/${productId}`, data)).data.data;
    },

    async uploadProductImage(productId: number, file: File) {
        const formData = new FormData();
        formData.append("file", file);
        const response = await api.post<ApiDataResponse<any>>(
            `/admin/products/${productId}/images`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return response.data.data;
    },

    async deleteProductImage(productId: number, imageId: number) {
        const response = await api.delete<ApiDataResponse<any>>(
            `/admin/products/${productId}/images/${imageId}`
        );
        return response.data.data;
    },

    async deleteProduct(productId: number) {
        const response = await api.delete<ApiDataResponse<void>>(`/admin/products/${productId}`);
        return response.data.data;
    },

    async getUsers(keyword?: string, role?: string, page = 1, size = 10): Promise<PageResponse<AdminUserResponse>> {
        const response = await api.get<ApiDataResponse<PageResponse<AdminUserResponse>>>("/admin/users", {
            params: { keyword, role, page, size },
        });
        return response.data.data;
    },

    async blockUser(userId: number) {
        const response = await api.patch<ApiDataResponse<void>>(`/admin/users/${userId}/block`);
        return response.data.data;
    },

    async unblockUser(userId: number) {
        const response = await api.patch<ApiDataResponse<void>>(`/admin/users/${userId}/unblock`);
        return response.data.data;
    },
};
