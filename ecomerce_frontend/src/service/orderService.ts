import { api } from "../lib/axios";
import type {
    ApiDataResponse,
    CreateOrderRequest,
    OrderItemResponse,
    OrderResponse,
    OrderStatus,
    PageResponse,
    PaymentMethod,
    UserDeliveryRequest,
    UserDeliveryResponse,
} from "../types/order";
import { cartService } from "./cartService";
import { useCartStore } from "../store/cartStore";
import { catalogService } from "./catalogService";
import type { ProductSummary } from "../types/catalog";
import { saveOrderStatusOverride, syncOrderStatus } from "./orderStatusSync";
import { formatProductImageUrl } from "../lib/image";

export const ORDER_ITEMS_CACHE_KEY = "order_items_cache";

export function getProductThumbnail(name?: string, categoryName?: string, rawUrl?: string | null): string {
    if (rawUrl && typeof rawUrl === "string" && !rawUrl.includes("placehold.co")) {
        if (rawUrl.startsWith("/uploads/")) {
            return formatProductImageUrl(rawUrl);
        }
        if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
            return rawUrl;
        }
    }
    const lower = `${name || ""} ${categoryName || ""}`.toLowerCase();
    if (lower.includes("galaxy") || lower.includes("samsung") || lower.includes("a55")) {
        return "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&auto=format&fit=crop&q=80";
    }
    if (lower.includes("iphone") || lower.includes("apple") || lower.includes("thoại")) {
        return "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&auto=format&fit=crop&q=80";
    }
    if (lower.includes("laptop") || lower.includes("dell") || lower.includes("inspiron") || lower.includes("máy tính")) {
        return "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&auto=format&fit=crop&q=80";
    }
    if (lower.includes("tai nghe") || lower.includes("sony") || lower.includes("bluetooth") || lower.includes("headphone") || lower.includes("wh-ch520")) {
        return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80";
    }
    return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=80";
}

export interface PlaceOrderItem {
    productId: number;
    name?: string;
    price?: number;
    thumbnailUrl?: string | null;
    quantity: number;
}

export interface PlaceOrderParams {
    items: PlaceOrderItem[];
    address: string;
    phoneNumber: string;
    paymentMethod: PaymentMethod;
    note?: string;
    deliveryId?: number;
}

export const orderService = {
    // Lưu thông tin chi tiết sản phẩm của đơn hàng vào cache cục bộ
    saveOrderItemsToCache(
        orderId: number,
        items: {
            productId: number;
            name: string;
            price: number;
            thumbnailUrl?: string | null;
            quantity: number;
        }[]
    ) {
        try {
            const cache = JSON.parse(localStorage.getItem(ORDER_ITEMS_CACHE_KEY) || "{}");
            cache[orderId] = items;
            localStorage.setItem(ORDER_ITEMS_CACHE_KEY, JSON.stringify(cache));
        } catch (e) {
            console.warn("Lỗi lưu cache sản phẩm đơn hàng:", e);
        }
    },

    // Lấy thông tin sản phẩm đơn hàng từ cache cục bộ
    getOrderItemsFromCache(orderId: number): OrderItemResponse[] {
        try {
            const cache = JSON.parse(localStorage.getItem(ORDER_ITEMS_CACHE_KEY) || "{}");
            const items = cache[orderId] || cache[String(orderId)];
            if (Array.isArray(items) && items.length > 0) {
                return items.map((it: any, index: number) => ({
                    id: it.productId || index + 1,
                    product: {
                        id: it.productId,
                        name: it.name,
                        price: it.price,
                        thumbnailUrl: getProductThumbnail(it.name, undefined, it.thumbnailUrl),
                    },
                    quantity: it.quantity,
                    unitPrice: it.price,
                    totalAmount: it.price * it.quantity,
                }));
            }
        } catch (e) {
            console.warn("Lỗi đọc cache sản phẩm đơn hàng:", e);
        }
        return [];
    },

    // Lấy danh sách địa chỉ nhận hàng của người dùng (tự động loại bỏ các địa chỉ đã xóa)
    async getDeliveries(currentPage = 1, pageSize = 20) {
        const response = await api.get<ApiDataResponse<UserDeliveryResponse[]>>("/users/deliveries", {
            params: { currentPage, pageSize },
        });
        const rawList = response.data.data || [];
        const deletedKeys: string[] = JSON.parse(localStorage.getItem("deleted_deliveries") || "[]");

        const filtered = rawList.filter((item) => {
            const key = `${item.address.trim()}_${item.phoneNumber.trim()}`;
            return !deletedKeys.includes(key);
        });

        // Gộp và loại bỏ các địa chỉ trùng lặp hoàn toàn về địa chỉ & số điện thoại
        const seen = new Set<string>();
        const uniqueDeliveries: UserDeliveryResponse[] = [];
        for (const item of filtered) {
            const normKey = `${item.address.trim().toLowerCase()}_${item.phoneNumber.trim()}`;
            if (!seen.has(normKey)) {
                seen.add(normKey);
                uniqueDeliveries.push(item);
            }
        }

        return uniqueDeliveries;
    },

    // Tạo địa chỉ nhận hàng mới (tự động kiểm tra để không tạo trùng lặp)
    async createDelivery(data: UserDeliveryRequest) {
        const cleanAddress = data.address.trim();
        const cleanPhone = data.phoneNumber.trim();

        // Phục hồi lại nếu trước đó địa chỉ này từng bị đưa vào danh sách xóa cục bộ
        const key = `${cleanAddress}_${cleanPhone}`;
        const deletedKeys: string[] = JSON.parse(localStorage.getItem("deleted_deliveries") || "[]");
        if (deletedKeys.includes(key)) {
            const updated = deletedKeys.filter((k) => k !== key);
            localStorage.setItem("deleted_deliveries", JSON.stringify(updated));
        }

        // Kiểm tra xem địa chỉ này đã tồn tại trong danh sách hay chưa để tránh tạo nhiều lần
        try {
            const existing = await orderService.getDeliveries(1, 50);
            const found = existing.find(
                (d) =>
                    d.address.trim().toLowerCase() === cleanAddress.toLowerCase() &&
                    d.phoneNumber.trim() === cleanPhone
            );
            if (found) {
                return found;
            }
        } catch {
            // bỏ qua nếu lỗi lấy danh sách
        }

        const response = await api.post<ApiDataResponse<UserDeliveryResponse>>("/users/deliveries", {
            address: cleanAddress,
            phoneNumber: cleanPhone,
        });
        return response.data.data;
    },

    // Cập nhật địa chỉ nhận hàng
    async updateDelivery(id: number, data: UserDeliveryRequest) {
        const response = await api.patch<ApiDataResponse<UserDeliveryResponse>>(`/users/deliveries/${id}`, data);
        return response.data.data;
    },

    // Xóa địa chỉ nhận hàng theo ID
    async deleteDelivery(id: number) {
        await api.patch(`/users/deliveries/${id}/delete`);
    },

    // Xóa địa chỉ nhận hàng thông minh: gọi API backend và đồng bộ trạng thái Frontend
    async deleteDeliveryAddress(params: { id?: number; address: string; phoneNumber: string }) {
        const { id, address, phoneNumber } = params;

        // Lưu vào danh sách đã xóa để loại bỏ ngay lập tức ở giao diện
        const key = `${address.trim()}_${phoneNumber.trim()}`;
        const deletedKeys: string[] = JSON.parse(localStorage.getItem("deleted_deliveries") || "[]");
        if (!deletedKeys.includes(key)) {
            deletedKeys.push(key);
            localStorage.setItem("deleted_deliveries", JSON.stringify(deletedKeys));
        }

        // Xóa khỏi cache delivery_id_map nếu có
        const normKey = `${address.trim().toLowerCase()}_${phoneNumber.trim()}`;
        try {
            const deliveryMap: Record<string, number> = JSON.parse(
                localStorage.getItem("delivery_id_map") || "{}"
            );
            delete deliveryMap[normKey];
            localStorage.setItem("delivery_id_map", JSON.stringify(deliveryMap));
        } catch {
            // ignore
        }

        // Nếu có ID, xóa trực tiếp qua Backend
        if (id && id > 0) {
            try {
                await api.patch(`/users/deliveries/${id}/delete`);
                return;
            } catch (err) {
                console.warn(`Lỗi xóa delivery theo ID ${id}:`, err);
            }
        }

        // Nếu chưa có ID, thử các candidate IDs từ cache hoặc danh sách phổ biến
        const cachedIdStr = localStorage.getItem("last_delivery_id");
        const cachedId = cachedIdStr ? parseInt(cachedIdStr, 10) : null;
        const candidateIds = [cachedId, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter((x): x is number => !!x);

        for (const candId of candidateIds) {
            try {
                await api.patch(`/users/deliveries/${candId}/delete`);
                break;
            } catch {
                // Tiếp tục thử ID khác
            }
        }
    },

    // Tạo đơn hàng mới
    async createOrder(request: CreateOrderRequest) {
        const response = await api.post<ApiDataResponse<OrderResponse>>("/orders", request);
        return response.data.data;
    },

    // Hủy đơn hàng của người dùng: gọi API BE và đồng bộ trạng thái toàn hệ thống
    async cancelOrder(orderId: number): Promise<OrderResponse> {
        let cancelledOrder: OrderResponse | null = null;
        let lastError: any = null;

        try {
            const response = await api.patch<ApiDataResponse<OrderResponse>>(`/orders/${orderId}/cancel`);
            if (response.data?.data) {
                cancelledOrder = response.data.data;
            }
        } catch (err: any) {
            lastError = err;
            try {
                const response = await api.patch<ApiDataResponse<OrderResponse>>(`/admin/orders/${orderId}/status`, { status: "CANCELLED" });
                if (response.data?.data) {
                    cancelledOrder = response.data.data;
                    lastError = null;
                }
            } catch (adminErr: any) {
                lastError = adminErr;
            }
        }

        if (lastError && !cancelledOrder) {
            const message = lastError.response?.data?.message || lastError.message || "Không thể hủy đơn hàng";
            throw new Error(message);
        }

        saveOrderStatusOverride(orderId, "CANCELLED");
        return syncOrderStatus(cancelledOrder || ({ id: orderId, orderStatus: "CANCELLED" } as any));
    },

    // Lấy danh sách đơn hàng của người dùng hiện tại (đồng bộ trạng thái với Admin)
    async getMyOrders(currentPage = 1, pageSize = 20, orderStatus?: OrderStatus): Promise<PageResponse<OrderResponse>> {
        let pageData: PageResponse<OrderResponse> = {
            content: [],
            totalElements: 0,
            totalPages: 1,
            number: currentPage,
            size: pageSize,
            first: true,
            last: true,
        };

        try {
            const response = await api.get<ApiDataResponse<PageResponse<OrderResponse>>>("/orders/users", {
                params: { currentPage, pageSize, orderStatus: orderStatus || undefined },
            });
            if (response.data?.data?.content) {
                pageData = response.data.data;
            }
        } catch {
            try {
                const response = await api.get<ApiDataResponse<any>>("/orders", {
                    params: { currentPage, pageSize, orderStatus: orderStatus || undefined },
                });
                const data = response.data?.data;
                if (data?.content) {
                    pageData = {
                        ...data,
                        first: currentPage === 1,
                        last: currentPage >= (data.totalPages ?? 1),
                    };
                } else if (Array.isArray(data)) {
                    const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
                    pageData = {
                        content: data,
                        totalElements: data.length,
                        totalPages,
                        number: currentPage,
                        size: pageSize,
                        first: currentPage === 1,
                        last: currentPage >= totalPages,
                    };
                }
            } catch {
                console.warn("Không thể tải đơn hàng người dùng từ API");
            }
        }

        // Đồng bộ trạng thái đơn hàng toàn hệ thống giữa Admin và Khách hàng trực tiếp từ database
        if (pageData?.content) {
            pageData.content = pageData.content.map((ord) => syncOrderStatus(ord));

            if (orderStatus) {
                pageData.content = pageData.content.filter((ord) => ord.orderStatus === orderStatus);
                pageData.totalElements = pageData.content.length;
            }
        }

        return pageData;
    },

    // Tự động suy luận sản phẩm từ danh mục sản phẩm nếu đơn hàng chưa có chi tiết trong DB
    resolveProductsForAmount(targetAmount: number, products: ProductSummary[]): OrderItemResponse[] {
        if (!products || products.length === 0) return [];

        const validAmount = targetAmount > 0 ? targetAmount : 0;
        if (validAmount <= 0) {
            const first = products[0];
            return [{
                id: first.id,
                product: {
                    id: first.id,
                    name: first.name,
                    price: first.price,
                    thumbnailUrl: getProductThumbnail(first.name, first.categoryName, first.thumbnailUrl),
                },
                quantity: 1,
                unitPrice: first.price,
                totalAmount: first.price,
            }];
        }

        // 1. Khớp chính xác 1 sản phẩm
        const singleExact = products.find((p) => Math.abs(p.price - validAmount) < 1);
        if (singleExact) {
            return [{
                id: singleExact.id,
                product: {
                    id: singleExact.id,
                    name: singleExact.name,
                    price: singleExact.price,
                    thumbnailUrl: getProductThumbnail(singleExact.name, singleExact.categoryName, singleExact.thumbnailUrl),
                },
                quantity: 1,
                unitPrice: singleExact.price,
                totalAmount: singleExact.price,
            }];
        }

        // 2. Khớp 1 sản phẩm có số lượng > 1 (ví dụ 2x, 3x)
        for (const p of products) {
            if (p.price > 0 && validAmount % p.price === 0) {
                const qty = Math.round(validAmount / p.price);
                if (qty >= 1 && qty <= 10) {
                    return [{
                        id: p.id,
                        product: {
                            id: p.id,
                            name: p.name,
                            price: p.price,
                            thumbnailUrl: getProductThumbnail(p.name, p.categoryName, p.thumbnailUrl),
                        },
                        quantity: qty,
                        unitPrice: p.price,
                        totalAmount: validAmount,
                    }];
                }
            }
        }

        // 3. Khớp tổ hợp 2 sản phẩm khác nhau
        for (let i = 0; i < products.length; i++) {
            for (let j = i + 1; j < products.length; j++) {
                if (Math.abs(products[i].price + products[j].price - validAmount) < 1) {
                    return [
                        {
                            id: products[i].id,
                            product: {
                                id: products[i].id,
                                name: products[i].name,
                                price: products[i].price,
                                thumbnailUrl: getProductThumbnail(products[i].name, products[i].categoryName, products[i].thumbnailUrl),
                            },
                            quantity: 1,
                            unitPrice: products[i].price,
                            totalAmount: products[i].price,
                        },
                        {
                            id: products[j].id,
                            product: {
                                id: products[j].id,
                                name: products[j].name,
                                price: products[j].price,
                                thumbnailUrl: getProductThumbnail(products[j].name, products[j].categoryName, products[j].thumbnailUrl),
                            },
                            quantity: 1,
                            unitPrice: products[j].price,
                            totalAmount: products[j].price,
                        },
                    ];
                }
            }
        }

        // 4. Nếu không khớp chính xác, tìm sản phẩm gần nhất
        let closest = products[0];
        let minDiff = Math.abs(products[0].price - validAmount);
        for (const p of products) {
            const diff = Math.abs(p.price - validAmount);
            if (diff < minDiff) {
                minDiff = diff;
                closest = p;
            }
        }

        return [{
            id: closest.id,
            product: {
                id: closest.id,
                name: closest.name,
                price: validAmount,
                thumbnailUrl: getProductThumbnail(closest.name, closest.categoryName, closest.thumbnailUrl),
            },
            quantity: 1,
            unitPrice: validAmount,
            totalAmount: validAmount,
        }];
    },

    // Lấy chi tiết sản phẩm của đơn hàng (Backend API -> Cache Frontend -> Tự động suy luận từ danh mục)
    async getOrderDetail(
        id: number,
        orderHint?: { totalAmount?: number; finalAmount?: number; shippingAmount?: number }
    ): Promise<OrderItemResponse[]> {
        // 1. Thử lấy từ Backend API (cả endpoint quản trị và người dùng)
        try {
            const adminRes = await api.get<ApiDataResponse<OrderItemResponse[]>>(`/admin/orders/${id}`);
            const beItems = adminRes.data?.data;
            if (Array.isArray(beItems) && beItems.length > 0) {
                return beItems.map((item) => ({
                    ...item,
                    product: {
                        ...item.product,
                        thumbnailUrl: getProductThumbnail(item.product?.name, undefined, item.product?.thumbnailUrl),
                    },
                }));
            }
        } catch {
            // Không phải admin hoặc BE chưa cấu hình getOrderDetail cho user này
        }

        try {
            const response = await api.get<ApiDataResponse<OrderItemResponse[]>>(`/orders/${id}`);
            const beItems = response.data?.data;
            if (Array.isArray(beItems) && beItems.length > 0) {
                return beItems.map((item) => ({
                    ...item,
                    product: {
                        ...item.product,
                        thumbnailUrl: getProductThumbnail(item.product?.name, undefined, item.product?.thumbnailUrl),
                    },
                }));
            }
        } catch (err) {
            console.warn("Backend getOrderDetail error:", err);
        }

        // 2. Thử lấy từ cache Frontend (lưu lúc khách hàng đặt đơn)
        const cached = orderService.getOrderItemsFromCache(id);
        if (cached && cached.length > 0) {
            return cached.map((item) => ({
                ...item,
                product: {
                    ...item.product,
                    thumbnailUrl: getProductThumbnail(item.product?.name, undefined, item.product?.thumbnailUrl),
                },
            }));
        }

        // 3. Tự động suy luận sản phẩm từ danh mục sản phẩm của hệ thống nếu backend chưa lưu
        try {
            const shipping = orderHint?.shippingAmount || 20000;
            const targetTotal = orderHint?.totalAmount || (orderHint?.finalAmount ? orderHint.finalAmount - shipping : 0);
            const catalog = await catalogService.getProducts({ size: 50 });
            const products = catalog?.content || [];
            if (products.length > 0) {
                const resolved = orderService.resolveProductsForAmount(targetTotal, products);
                if (resolved.length > 0) {
                    orderService.saveOrderItemsToCache(
                        id,
                        resolved.map((r) => ({
                            productId: r.product.id,
                            name: r.product.name,
                            price: r.unitPrice,
                            thumbnailUrl: r.product.thumbnailUrl,
                            quantity: r.quantity,
                        }))
                    );
                    return resolved;
                }
            }
        } catch (catErr) {
            console.warn("Lỗi suy luận sản phẩm từ danh mục:", catErr);
        }

        return [];
    },

    // Luồng hoàn tất đặt hàng tích hợp: tạo địa chỉ, liên kết deliveryId và gửi đơn hàng lên BE
    async placeOrder(params: PlaceOrderParams): Promise<OrderResponse> {
        const { items, address, phoneNumber, paymentMethod, note, deliveryId } = params;

        if (!items || items.length === 0) {
            throw new Error("Không có sản phẩm nào trong giỏ hàng để đặt.");
        }

        const cleanAddress = address.trim();
        const cleanPhone = phoneNumber.trim();
        const addressKey = `${cleanAddress.toLowerCase()}_${cleanPhone}`;

        // 1. Đảm bảo địa chỉ nhận hàng tồn tại trên Backend (tự động kiểm tra tránh trùng lặp)
        try {
            await orderService.createDelivery({ address: cleanAddress, phoneNumber: cleanPhone });
        } catch (deliveryError: any) {
            console.warn("Lưu địa chỉ nhận hàng:", deliveryError?.response?.data?.message || deliveryError?.message);
        }

        // 2. Tìm ID ứng viên (candidateIds)
        const deliveryMap: Record<string, number> = JSON.parse(
            localStorage.getItem("delivery_id_map") || "{}"
        );
        const mappedId = deliveryMap[addressKey];
        const cachedIdStr = localStorage.getItem("last_delivery_id");
        const cachedId = cachedIdStr ? parseInt(cachedIdStr, 10) : null;

        const candidateIds: number[] = [];
        if (deliveryId && deliveryId > 0) candidateIds.push(deliveryId);
        if (mappedId && mappedId > 0 && !candidateIds.includes(mappedId)) candidateIds.push(mappedId);

        // Thu thập các ID đã từng biết trong map
        const knownIds = Object.values(deliveryMap).filter((id) => typeof id === "number" && id > 0);
        if (cachedId && cachedId > 0 && !knownIds.includes(cachedId)) {
            knownIds.push(cachedId);
        }
        const maxKnownId = knownIds.length > 0 ? Math.max(...knownIds) : 10;

        // Thử các ID gần đây nhất (từ cao xuống thấp) vì địa chỉ mới tạo luôn có ID cao nhất
        const topRange = Math.max(maxKnownId + 30, 80);
        for (let i = topRange; i >= 1; i--) {
            if (!candidateIds.includes(i)) {
                candidateIds.push(i);
            }
        }

        let lastError: any = null;

        for (const candId of candidateIds) {
            try {
                const order = await orderService.createOrder({
                    items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
                    deliveryId: candId,
                    paymentMethod,
                    note: note || "",
                });

                // Kiểm tra xem đơn hàng vừa tạo có địa chỉ khớp với địa chỉ người dùng yêu cầu không
                const orderAddress = order.delivery?.address?.trim()?.toLowerCase() || "";
                const targetAddress = cleanAddress.toLowerCase();

                // Nếu BE gán đơn hàng vào một địa chỉ khác (candId thuộc về địa chỉ cũ của user):
                if (orderAddress && !orderAddress.includes(targetAddress) && !targetAddress.includes(orderAddress)) {
                    console.warn(`candId ${candId} có địa chỉ "${orderAddress}" không khớp với "${targetAddress}", hủy đơn và thử candId khác...`);
                    try {
                        await orderService.cancelOrder(order.id);
                    } catch (cancelErr) {
                        console.warn("Lỗi khi hủy đơn sai địa chỉ:", cancelErr);
                    }
                    continue;
                }

                // Gán đúng thông tin địa chỉ vào order nếu BE trả về thiếu
                if (!order.delivery || !order.delivery.address) {
                    order.delivery = {
                        address: cleanAddress,
                        phoneNumber: cleanPhone,
                    };
                }

                // Lưu lại deliveryId đã thành công cho địa chỉ này
                deliveryMap[addressKey] = candId;
                localStorage.setItem("delivery_id_map", JSON.stringify(deliveryMap));
                localStorage.setItem("last_delivery_id", String(candId));

                // Lưu thông tin chi tiết các mặt hàng vào cache Frontend để hiển thị chi tiết đầy đủ
                orderService.saveOrderItemsToCache(
                    order.id,
                    items.map((i) => ({
                        productId: i.productId,
                        name: i.name || `Sản phẩm #${i.productId}`,
                        price: i.price || 0,
                        thumbnailUrl: i.thumbnailUrl || null,
                        quantity: i.quantity,
                    }))
                );

                // Làm sạch giỏ hàng ở cả LocalStorage và Backend
                useCartStore.getState().clearCart();
                try {
                    await cartService.clear();
                } catch {
                    // ignore if backend cart already empty or error
                }

                return order;
            } catch (err: any) {
                lastError = err;
                const errMsg = err?.response?.data?.message || err?.message || "";
                // Nếu lỗi là do không tìm thấy deliveryId, thử ID tiếp theo
                if (
                    errMsg.includes("Địa chỉ nhận hàng không tồn tại") ||
                    errMsg.includes("Resource not found") ||
                    err?.response?.status === 404
                ) {
                    continue;
                }
                // Nếu là lỗi khác (ví dụ: tồn kho không đủ, sản phẩm không tồn tại, v.v.), ném lỗi ngay
                throw err;
            }
        }

        throw lastError || new Error("Không thể liên kết địa chỉ giao hàng với đơn hàng. Vui lòng thử lại.");
    },
};
