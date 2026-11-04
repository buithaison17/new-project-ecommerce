export type PaymentMethod = "COD" | "CARD";

export interface CartItem {
    productId: number;
    name: string;
    price: number;
    thumbnailUrl: string | null;
    stockQuantity: number;
    quantity: number;
}

export interface CheckoutDetails {
    fullName: string;
    phone: string;
    address: string;
    paymentMethod: PaymentMethod;
}
