export interface ApiDataResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

export interface AdminOrder {
    id: number;
    totalAmount: number;
    shippingAmount: number;
    finalAmount: number;
    orderStatus: "PENDING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
    paymentMethod: string;
    paymentStatus: string;
    note?: string;
    delivery?: {
        fullName?: string;
        phoneNumber?: string;
        address?: string;
    };
}

export interface InventoryItem {
    productId: number;
    productName: string;
    quantity: number;
    reservedQuantity: number;
    availableQuantity: number;
    lowStock: boolean;
    updatedAt: string;
}

export interface DashboardSummaryResponse {
    totalOrders: number;
    ordersToday: number;
    ordersByStatus: Record<string, number>;
    totalRevenue: number;
    totalProducts: number;
    lowStockProducts: number;
    outOfStockProducts: number;
    lowStockThreshold: number;
}

export interface AdminUserResponse {
    id: number;
    username: string;
    email: string;
    role: string;
    isEnabled: boolean;
    createdAt: string;
    updatedAt: string;
}
