export type OrderStatus = "PENDING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export type PaymentMethod = "CASH" | "CREDIT_CARD";

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED";

export interface CreateOrderItemRequest {
    productId: number;
    quantity: number;
}

export interface CreateOrderRequest {
    items: CreateOrderItemRequest[];
    deliveryId: number;
    paymentMethod: PaymentMethod;
    note?: string;
}

export interface UserDeliveryRequest {
    address: string;
    phoneNumber: string;
}

export interface UserDeliveryResponse {
    address: string;
    phoneNumber: string;
}

export interface OrderItemProduct {
    id: number;
    name: string;
    description?: string;
    price: number;
    thumbnailUrl?: string;
    stockQuantity?: number;
}

export interface OrderItemResponse {
    id: number;
    product: OrderItemProduct;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
}

export interface OrderResponse {
    id: number;
    totalAmount: number;
    shippingAmount: number;
    finalAmount: number;
    delivery: UserDeliveryResponse;
    orderStatus: OrderStatus;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    note?: string;
}

export interface OrderDetailResponse {
    id: number;
    totalAmount: number;
    shippingAmount: number;
    finalAmount: number;
    delivery: UserDeliveryResponse;
    orderStatus: OrderStatus;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    note?: string;
    createdAt?: string;
    updatedAt?: string;
    items?: OrderItemResponse[];
}

export interface ApiDataResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    last: boolean;
    first: boolean;
}
