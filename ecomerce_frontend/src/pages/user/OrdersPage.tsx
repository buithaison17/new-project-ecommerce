import { message, Popconfirm } from "antd";
import {
    CheckCircle2,
    Clock,
    CreditCard,
    Eye,
    FileText,
    MapPin,
    Package,
    Phone,
    Search,
    ShoppingBag,
    Truck,
    XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import OrderDetailModal from "../../components/OrderDetailModal";
import { orderService } from "../../service/orderService";
import type { OrderResponse, OrderStatus } from "../../types/order";

const formatPrice = (price?: number) => {
    if (typeof price !== "number") return "0 đ";
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(price);
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
    const [searchKeyword, setSearchKeyword] = useState("");

    // Phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    // State xem chi tiết đơn hàng
    const [viewingOrder, setViewingOrder] = useState<OrderResponse | null>(null);

    useEffect(() => {
        void loadOrders();

        let timer: any;
        const handleSync = () => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                void loadOrders();
            }, 300);
        };

        window.addEventListener("order_status_changed", handleSync);
        window.addEventListener("storage", handleSync);
        return () => {
            clearTimeout(timer);
            window.removeEventListener("order_status_changed", handleSync);
            window.removeEventListener("storage", handleSync);
        };
    }, [currentPage, statusFilter]);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const statusParam = statusFilter === "ALL" ? undefined : statusFilter;
            const res = await orderService.getMyOrders(currentPage, pageSize, statusParam);
            setOrders(res.content || []);
            setTotalPages(res.totalPages || 1);
            setTotalElements(res.totalElements ?? (res.content?.length || 0));
        } catch (err: any) {
            console.error("Lỗi tải đơn hàng:", err);
            message.error("Không thể tải danh sách đơn hàng của bạn");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async (orderId: number) => {
        try {
            await orderService.cancelOrder(orderId);
            message.success(`Đã hủy đơn hàng #${orderId} thành công!`);
            await loadOrders();
            if (viewingOrder && viewingOrder.id === orderId) {
                setViewingOrder({
                    ...viewingOrder,
                    orderStatus: "CANCELLED",
                });
            }
        } catch (err: any) {
            message.error(err?.response?.data?.message || err?.message || "Không thể hủy đơn hàng này");
        }
    };

    // Lọc theo từ khóa tìm kiếm (Mã đơn hoặc Địa chỉ)
    const filteredOrders = orders.filter((order) => {
        if (!searchKeyword.trim()) return true;
        const kw = searchKeyword.toLowerCase().trim();
        const matchId = String(order.id).includes(kw);
        const matchAddress = order.delivery?.address?.toLowerCase().includes(kw);
        const matchPhone = order.delivery?.phoneNumber?.includes(kw);
        return matchId || matchAddress || matchPhone;
    });

    return (
        <div className="min-h-screen bg-slate-50 py-8">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                {/* Header breadcrumb & title */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600">
                            <Link to="/" className="hover:underline">
                                Trang chủ
                            </Link>
                            <span>/</span>
                            <span>Lịch sử đơn hàng</span>
                        </div>
                        <h1 className="mt-2 text-3xl font-black text-slate-900">Đơn hàng của bạn</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Theo dõi tiến độ, chi tiết sản phẩm và quản lý các đơn hàng đã đặt
                        </p>
                    </div>

                    <Link
                        to="/products"
                        className="inline-flex w-fit items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-indigo-100 transition hover:bg-indigo-700"
                    >
                        <ShoppingBag size={18} />
                        Tiếp tục mua hàng
                    </Link>
                </div>

                {/* Thanh tìm kiếm & bộ lọc trạng thái */}
                <div className="mt-8 space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        {/* Bộ lọc trạng thái */}
                        <div className="flex flex-wrap gap-2">
                            {[
                                { label: "Tất cả", value: "ALL" },
                                { label: "Chờ xác nhận", value: "PENDING" },
                                { label: "Đang giao", value: "SHIPPED" },
                                { label: "Đã giao", value: "DELIVERED" },
                                { label: "Đã hủy", value: "CANCELLED" },
                            ].map((f) => (
                                <button
                                    key={f.value}
                                    type="button"
                                    onClick={() => {
                                        setStatusFilter(f.value as OrderStatus | "ALL");
                                        setCurrentPage(1);
                                    }}
                                    className={`rounded-xl px-4 py-2 text-xs font-bold transition ${statusFilter === f.value
                                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
                                        }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        {/* Ô tìm kiếm */}
                        <div className="relative w-full sm:w-72">
                            <Search
                                size={17}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                placeholder="Tìm mã đơn, SĐT, địa chỉ..."
                                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
                            />
                        </div>
                    </div>
                </div>

                {/* Danh sách đơn hàng */}
                <div className="mt-6">
                    {loading ? (
                        <div className="rounded-2xl border border-slate-200 bg-white py-20 text-center text-slate-500 shadow-sm">
                            <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                            <p className="mt-3 text-sm font-semibold">Đang tải lịch sử đơn hàng...</p>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center shadow-sm">
                            <Package size={48} className="mx-auto text-slate-300" />
                            <h2 className="mt-4 text-lg font-black text-slate-800">
                                Không tìm thấy đơn hàng nào
                            </h2>
                            <p className="mt-1 text-xs text-slate-500">
                                {searchKeyword
                                    ? "Không có đơn hàng nào khớp với từ khóa tìm kiếm của bạn."
                                    : statusFilter === "ALL"
                                        ? "Bạn chưa có đơn đặt hàng nào trong hệ thống."
                                        : "Không có đơn hàng nào với trạng thái này."}
                            </p>
                            <Link
                                to="/products"
                                className="mt-6 inline-block rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
                            >
                                Mua sắm ngay
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {filteredOrders.map((ord) => (
                                <div
                                    key={ord.id}
                                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-indigo-200"
                                >
                                    {/* Header card đơn hàng */}
                                    <div className="flex flex-wrap items-center justify-between border-b border-slate-100 bg-slate-50/60 px-5 py-4 text-xs text-slate-600">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className="font-mono text-base font-black text-indigo-700">
                                                Đơn hàng #{ord.id}
                                            </span>
                                            <span className="text-slate-300">•</span>
                                            <span className="flex items-center gap-1 font-semibold text-slate-700">
                                                {ord.paymentMethod === "CREDIT_CARD" ? (
                                                    <>
                                                        <CreditCard size={15} className="text-indigo-600" />
                                                        Thanh toán thẻ (CREDIT CARD)
                                                    </>
                                                ) : (
                                                    <>
                                                        <Truck size={15} className="text-indigo-600" />
                                                        Thanh toán tiền mặt (COD)
                                                    </>
                                                )}
                                            </span>
                                            <span className="text-slate-300">•</span>
                                            <span className="inline-flex items-center gap-1 font-medium text-slate-500">
                                                <Clock size={13} />
                                                {ord.paymentStatus === "COMPLETED"
                                                    ? "Đã thanh toán"
                                                    : "Chờ thanh toán khi nhận"}
                                            </span>
                                        </div>

                                        <OrderStatusBadge status={ord.orderStatus} />
                                    </div>

                                    {/* Nội dung đơn hàng */}
                                    <div className="p-5 sm:p-6">
                                        <div className="grid gap-6 md:grid-cols-[1fr_260px]">
                                            {/* Cột trái: Thông tin nhận hàng & ghi chú */}
                                            <div className="space-y-3">
                                                <div>
                                                    <span className="block text-xs font-semibold text-slate-400">
                                                        Địa chỉ nhận hàng:
                                                    </span>
                                                    <div className="mt-1 flex items-start gap-2 text-sm text-slate-800">
                                                        <MapPin
                                                            size={17}
                                                            className="mt-0.5 shrink-0 text-indigo-600"
                                                        />
                                                        <div>
                                                            <p className="font-bold">
                                                                {ord.delivery?.address || "Chưa có địa chỉ"}
                                                            </p>
                                                            {ord.delivery?.phoneNumber && (
                                                                <p className="flex items-center gap-1 text-xs text-slate-500">
                                                                    <Phone size={13} /> SĐT:{" "}
                                                                    <span className="font-semibold text-slate-700">
                                                                        {ord.delivery.phoneNumber}
                                                                    </span>
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {ord.note && (
                                                    <div className="flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                                                        <FileText
                                                            size={15}
                                                            className="mt-0.5 shrink-0 text-slate-400"
                                                        />
                                                        <span>
                                                            <strong>Ghi chú:</strong> {ord.note}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Cột phải: Chi tiết số tiền & tổng tiền */}
                                            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 sm:text-right">
                                                <div className="space-y-1.5 text-xs text-slate-500">
                                                    <div className="flex justify-between sm:justify-end sm:gap-4">
                                                        <span>Tiền hàng:</span>
                                                        <span className="font-semibold text-slate-700">
                                                            {formatPrice(ord.totalAmount)}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between sm:justify-end sm:gap-4">
                                                        <span>Phí giao hàng:</span>
                                                        <span className="font-semibold text-slate-700">
                                                            {formatPrice(ord.shippingAmount || 20000)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="mt-3 border-t border-slate-200/60 pt-3">
                                                    <span className="block text-xs font-semibold text-slate-500">
                                                        Tổng thanh toán
                                                    </span>
                                                    <span className="text-2xl font-black text-indigo-700">
                                                        {formatPrice(ord.finalAmount)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Thanh nút hành động ở chân đơn hàng */}
                                        <div className="mt-5 flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-4">
                                            <button
                                                type="button"
                                                onClick={() => setViewingOrder(ord)}
                                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 hover:text-indigo-600"
                                            >
                                                <Eye size={15} />
                                                Xem chi tiết đơn hàng
                                            </button>

                                            {ord.orderStatus === "PENDING" && (
                                                <Popconfirm
                                                    title="Hủy đơn hàng"
                                                    description="Bạn có chắc chắn muốn hủy đơn hàng này không? Số lượng sản phẩm sẽ được tự động hoàn về kho."
                                                    onConfirm={() => handleCancelOrder(ord.id)}
                                                    okText="Xác nhận hủy"
                                                    cancelText="Không"
                                                    okButtonProps={{ danger: true }}
                                                >
                                                    <button
                                                        type="button"
                                                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-600 transition hover:bg-rose-100"
                                                    >
                                                        <XCircle size={15} />
                                                        Hủy đơn hàng
                                                    </button>
                                                </Popconfirm>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Phân trang đơn hàng */}
                    {totalPages > 1 && (
                        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 sm:flex-row">
                            <p className="text-sm text-slate-500">
                                Hiển thị trang <span className="font-bold text-slate-800">{currentPage}</span> / <span className="font-bold text-slate-800">{totalPages}</span> (Tổng cộng <span className="font-bold text-slate-800">{totalElements}</span> đơn hàng)
                            </p>
                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    disabled={currentPage <= 1 || loading}
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Trang trước
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                                    .reduce<(number | string)[]>((acc, p, idx, arr) => {
                                        if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) {
                                            acc.push(`dots-${p}`);
                                        }
                                        acc.push(p);
                                        return acc;
                                    }, [])
                                    .map((item) =>
                                        typeof item === "string" ? (
                                            <span key={item} className="px-1 text-slate-400">...</span>
                                        ) : (
                                            <button
                                                key={item}
                                                type="button"
                                                onClick={() => setCurrentPage(item)}
                                                className={`h-9 min-w-9 rounded-xl px-2 text-sm font-bold transition ${
                                                    currentPage === item
                                                        ? "bg-indigo-600 text-white shadow-sm"
                                                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                                }`}
                                            >
                                                {item}
                                            </button>
                                        )
                                    )}
                                <button
                                    type="button"
                                    disabled={currentPage >= totalPages || loading}
                                    onClick={() => setCurrentPage((p) => p + 1)}
                                    className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Trang sau
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal xem chi tiết đơn hàng */}
            <OrderDetailModal
                order={viewingOrder}
                open={!!viewingOrder}
                onClose={() => setViewingOrder(null)}
                onCancelOrder={handleCancelOrder}
            />
        </div>
    );
}

function OrderStatusBadge({ status }: { status: OrderStatus }) {
    switch (status) {
        case "PENDING":
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                    <Clock size={13} /> Chờ xác nhận
                </span>
            );
        case "SHIPPED":
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                    <Truck size={13} /> Đang giao hàng
                </span>
            );
        case "DELIVERED":
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    <CheckCircle2 size={13} /> Đã giao hàng
                </span>
            );
        case "CANCELLED":
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">
                    <XCircle size={13} /> Đã hủy
                </span>
            );
        default:
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                    {status}
                </span>
            );
    }
}