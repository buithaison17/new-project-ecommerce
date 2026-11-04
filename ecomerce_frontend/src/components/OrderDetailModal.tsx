import { Modal, Popconfirm } from "antd";
import {
    CheckCircle2,
    Clock,
    CreditCard,
    ExternalLink,
    FileText,
    MapPin,
    Package,
    Phone,
    Truck,
    XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatProductImageUrl } from "../lib/image";
import { orderService } from "../service/orderService";
import { syncOrderStatus } from "../service/orderStatusSync";
import type { OrderItemResponse, OrderResponse, OrderStatus } from "../types/order";

const formatPrice = (price?: number) => {
    if (typeof price !== "number") return "0 đ";
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(price);
};

interface OrderDetailModalProps {
    order:
        | (OrderResponse & {
              delivery?: { address?: string; phoneNumber?: string; fullName?: string };
              createdAt?: string;
          })
        | any
        | null;
    open: boolean;
    onClose: () => void;
    onCancelOrder?: (orderId: number) => void;
}

export default function OrderDetailModal({
    order,
    open,
    onClose,
    onCancelOrder,
}: OrderDetailModalProps) {
    const [items, setItems] = useState<OrderItemResponse[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open || !order?.id) {
            setItems([]);
            return;
        }

        let isMounted = true;
        setLoading(true);

        orderService
            .getOrderDetail(order.id, order)
            .then((res) => {
                if (isMounted) {
                    setItems(res || []);
                }
            })
            .catch((err) => {
                console.warn("Lỗi tải chi tiết đơn hàng:", err);
            })
            .finally(() => {
                if (isMounted) {
                    setLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [open, order?.id, order?.totalAmount, order?.finalAmount]);

    if (!order) return null;

    const syncedOrder = syncOrderStatus(order);
    const shippingFee = syncedOrder.shippingAmount || 20000;
    const subtotal = syncedOrder.totalAmount || (syncedOrder.finalAmount ? syncedOrder.finalAmount - shippingFee : 0);

    return (
        <Modal
            title={
                <div className="flex items-center gap-2 pr-6">
                    <span className="text-lg font-black text-slate-900">
                        Chi tiết đơn hàng #{syncedOrder.id}
                    </span>
                    <OrderStatusBadge status={syncedOrder.orderStatus} />
                </div>
            }
            open={open}
            onCancel={onClose}
            footer={
                <div className="flex items-center justify-between pt-2">
                    {syncedOrder.orderStatus === "PENDING" && onCancelOrder ? (
                        <Popconfirm
                            title="Xác nhận hủy đơn hàng"
                            description="Bạn có chắc chắn muốn hủy đơn hàng này không? Số lượng sản phẩm sẽ được tự động hoàn về kho."
                            onConfirm={() => {
                                onCancelOrder(syncedOrder.id);
                                onClose();
                            }}
                            okText="Hủy đơn"
                            cancelText="Đóng"
                            okButtonProps={{ danger: true }}
                        >
                            <button
                                type="button"
                                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-100"
                            >
                                <XCircle size={15} />
                                Hủy đơn hàng này
                            </button>
                        </Popconfirm>
                    ) : (
                        <div />
                    )}
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-600"
                    >
                        Đóng
                    </button>
                </div>
            }
            width={740}
            destroyOnClose
        >
            <div className="space-y-5 pt-3">
                {/* Khối tóm tắt thông tin giao hàng & thanh toán */}
                <div className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-2">
                    <div>
                        <span className="block text-xs font-semibold text-slate-400">
                            Địa chỉ nhận hàng:
                        </span>
                        <div className="mt-1 flex items-start gap-2 text-sm text-slate-800">
                            <MapPin size={16} className="mt-0.5 shrink-0 text-indigo-600" />
                            <div>
                                {order.delivery?.fullName && (
                                    <p className="font-bold text-slate-900">{order.delivery.fullName}</p>
                                )}
                                <p className="font-semibold leading-5 text-slate-700">
                                    {order.delivery?.address || "Địa chỉ mặc định"}
                                </p>
                                {order.delivery?.phoneNumber && (
                                    <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                                        <Phone size={12} /> SĐT:{" "}
                                        <span className="font-semibold text-slate-700">
                                            {order.delivery.phoneNumber}
                                        </span>
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-200/50 pt-2 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
                        <span className="block text-xs font-semibold text-slate-400">
                            Thanh toán & Trạng thái:
                        </span>
                        <div className="mt-1 space-y-1 text-xs text-slate-700">
                            <p className="flex items-center gap-1.5 font-bold">
                                {order.paymentMethod === "CREDIT_CARD" ? (
                                    <>
                                        <CreditCard size={15} className="text-indigo-600" />
                                        Thẻ thanh toán (CREDIT CARD)
                                    </>
                                ) : (
                                    <>
                                        <Truck size={15} className="text-indigo-600" />
                                        Tiền mặt khi nhận hàng (COD)
                                    </>
                                )}
                            </p>
                            <p className="flex items-center gap-1.5">
                                <Clock size={13} className="text-slate-400" />
                                {order.paymentStatus === "COMPLETED" ? (
                                    <span className="font-semibold text-emerald-600">Đã thanh toán</span>
                                ) : (
                                    <span className="font-semibold text-amber-600">
                                        Chờ thanh toán khi nhận hàng
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>

                    {order.note && (
                        <div className="col-span-full flex items-start gap-2 border-t border-slate-200/50 pt-2 text-xs text-slate-600">
                            <FileText size={14} className="mt-0.5 shrink-0 text-slate-400" />
                            <span>
                                <strong>Ghi chú:</strong> {order.note}
                            </span>
                        </div>
                    )}
                </div>

                {/* Danh sách mặt hàng trong đơn */}
                <div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <h3 className="flex items-center gap-2 text-sm font-black text-slate-900">
                            <Package size={18} className="text-indigo-600" />
                            Chi tiết sản phẩm đã đặt
                        </h3>
                        {items.length > 0 && (
                            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                                Tổng {items.reduce((sum, it) => sum + (it.quantity || 1), 0)} sản phẩm
                            </span>
                        )}
                    </div>

                    <div className="mt-3">
                        {loading ? (
                            <div className="rounded-2xl border border-slate-100 bg-slate-50/50 py-12 text-center text-xs text-slate-500">
                                <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                                <p className="mt-2.5 font-medium">Đang tải danh sách mặt hàng...</p>
                            </div>
                        ) : items.length > 0 ? (
                            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                {/* Header bảng sản phẩm */}
                                <div className="grid grid-cols-[1fr_120px_80px_130px] items-center border-b border-slate-100 bg-slate-50 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                    <span>Sản phẩm</span>
                                    <span className="text-right">Đơn giá</span>
                                    <span className="text-center">Số lượng</span>
                                    <span className="text-right">Thành tiền</span>
                                </div>

                                {/* Danh sách các sản phẩm */}
                                <div className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
                                    {items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="grid grid-cols-[1fr_120px_80px_130px] items-center gap-2 px-4 py-3.5 transition hover:bg-slate-50/70"
                                        >
                                            {/* Cột 1: Ảnh, tên và link sản phẩm */}
                                            <div className="flex items-center gap-3 min-w-0 pr-2">
                                                <img
                                                    src={formatProductImageUrl(
                                                        item.product?.thumbnailUrl,
                                                        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80"
                                                    )}
                                                    alt={item.product?.name || "Sản phẩm"}
                                                    className="h-16 w-16 rounded-xl border border-slate-200 bg-white object-cover shrink-0 shadow-xs"
                                                    onError={(e) => {
                                                        const target = e.currentTarget;
                                                        if (!target.src.includes("unsplash.com")) {
                                                            target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80";
                                                        }
                                                    }}
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <Link
                                                        to={`/products/${item.product?.id || item.id}`}
                                                        target="_blank"
                                                        className="group inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 transition hover:text-indigo-600"
                                                        title="Xem chi tiết sản phẩm này"
                                                    >
                                                        <span className="line-clamp-2 leading-snug">
                                                            {item.product?.name || `Sản phẩm #${item.id}`}
                                                        </span>
                                                        <ExternalLink
                                                            size={13}
                                                            className="shrink-0 text-slate-400 opacity-0 transition group-hover:opacity-100 group-hover:text-indigo-600"
                                                        />
                                                    </Link>
                                                    <div className="mt-1 flex items-center gap-2">
                                                        <span className="font-mono text-[11px] font-medium text-slate-400">
                                                            Mã: #{item.product?.id || item.id}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Cột 2: Đơn giá */}
                                            <div className="text-right text-xs font-semibold text-slate-700">
                                                {formatPrice(item.unitPrice)}
                                            </div>

                                            {/* Cột 3: Số lượng */}
                                            <div className="text-center">
                                                <span className="inline-block rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-800">
                                                    x{item.quantity}
                                                </span>
                                            </div>

                                            {/* Cột 4: Thành tiền */}
                                            <div className="text-right text-sm font-black text-indigo-700">
                                                {formatPrice(item.totalAmount)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3.5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4">
                                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                                    <Package size={22} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-slate-800">
                                        Kiện hàng đặt tại ShopNova
                                    </p>
                                    <p className="text-[11px] text-slate-500">
                                        Tổng tiền hàng tương ứng đã xác nhận thành công
                                    </p>
                                </div>
                                <span className="text-sm font-black text-indigo-700">
                                    {formatPrice(subtotal)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Khối tính tiền chi tiết */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="space-y-1.5 text-xs text-slate-600">
                        <div className="flex justify-between">
                            <span>Tạm tính tiền hàng:</span>
                            <span className="font-semibold text-slate-800">{formatPrice(subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Phí vận chuyển tiêu chuẩn:</span>
                            <span className="font-semibold text-slate-800">{formatPrice(shippingFee)}</span>
                        </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-slate-200/60 pt-3">
                        <span className="text-sm font-black text-slate-900">Tổng thanh toán:</span>
                        <span className="text-xl font-black text-indigo-700">
                            {formatPrice(order.finalAmount)}
                        </span>
                    </div>
                </div>
            </div>
        </Modal>
    );
}

function OrderStatusBadge({ status }: { status: OrderStatus }) {
    switch (status) {
        case "PENDING":
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                    <Clock size={12} /> Chờ xác nhận
                </span>
            );
        case "SHIPPED":
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                    <Truck size={12} /> Đang giao
                </span>
            );
        case "DELIVERED":
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                    <CheckCircle2 size={12} /> Đã giao
                </span>
            );
        case "CANCELLED":
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700">
                    <XCircle size={12} /> Đã hủy
                </span>
            );
        default:
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                    {status}
                </span>
            );
    }
}
