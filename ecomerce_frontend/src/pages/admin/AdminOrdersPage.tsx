import {
    AlertCircle,
    Banknote,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    Clock,
    CreditCard,
    Eye,
    FileText,
    Loader2,
    MapPin,
    Package,
    Phone,
    RefreshCw,
    Search,
    Truck,
    X,
    XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import OrderDetailModal from "../../components/OrderDetailModal";
import { adminService } from "../../service/adminService";
import { normalizeOrderStatus } from "../../service/orderStatusSync";
import type { AdminOrder, PageResponse } from "../../types/admin";
import type { OrderStatus } from "../../types/order";

interface BackendUserInformation {
    id?: number;
    fullName?: string;
    avatarUrl?: string;
    dateOfBirth?: string;
    gender?: string;
}

interface BackendUserDelivery {
    address?: string;
    phoneNumber?: string;
    fullName?: string;
}

export interface AdminOrderExtended extends Omit<AdminOrder, "delivery"> {
    user?: BackendUserInformation;
    delivery?: BackendUserDelivery;
    updatedAt?: string;
}

const statusFilters = [
    { key: "", label: "Tất cả" },
    { key: "PENDING", label: "Chờ xác nhận" },
    { key: "SHIPPED", label: "Đang giao hàng" },
    { key: "DELIVERED", label: "Đã giao thành công" },
    { key: "CANCELLED", label: "Đã hủy đơn" },
] as const;

const labels: Record<string, string> = {
    PENDING: "Chờ xác nhận",
    SHIPPED: "Đang giao hàng",
    DELIVERED: "Đã giao thành công",
    CANCELLED: "Đã hủy đơn",
};

const statusConfig: Record<string, { bg: string; text: string; border: string; icon: typeof Clock }> = {
    PENDING: {
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
        icon: Clock,
    },
    SHIPPED: {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
        icon: Truck,
    },
    DELIVERED: {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        icon: CheckCircle2,
    },
    CANCELLED: {
        bg: "bg-rose-50",
        text: "text-rose-700",
        border: "border-rose-200",
        icon: XCircle,
    },
};

const currency = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
});

export default function AdminOrdersPage() {
    const [page, setPage] = useState<PageResponse<AdminOrderExtended>>({
        content: [],
        totalElements: 0,
        totalPages: 1,
        number: 1,
        size: 20,
    });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("");
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
    const [viewingOrder, setViewingOrder] = useState<AdminOrderExtended | null>(null);

    const loadOrders = useCallback(
        async (targetPage: number, targetFilter: string) => {
            setLoading(true);
            try {
                const data = await adminService.getOrders(targetPage, targetFilter);
                setPage(data as unknown as PageResponse<AdminOrderExtended>);
            } catch {
                toast.error("Không tải được đơn hàng. Hãy kiểm tra quyền Admin.");
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    useEffect(() => {
        void loadOrders(currentPage, filter);
    }, [currentPage, filter, loadOrders]);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        const handleSync = () => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                void loadOrders(currentPage, filter);
            }, 300);
        };

        window.addEventListener("order_status_changed", handleSync);
        window.addEventListener("storage", handleSync);
        return () => {
            clearTimeout(timer);
            window.removeEventListener("order_status_changed", handleSync);
            window.removeEventListener("storage", handleSync);
        };
    }, [currentPage, filter, loadOrders]);

    const handleFilterChange = (val: string) => {
        setFilter(val);
        setCurrentPage(1);
    };

    const updateStatus = async (orderId: number, nextStatus: AdminOrder["orderStatus"]) => {
        const canonical = normalizeOrderStatus(nextStatus);
        setUpdatingOrderId(orderId);
        try {
            await adminService.updateOrderStatus(orderId, canonical as OrderStatus);
            toast.success(`Đơn #${orderId} chuyển sang: ${labels[canonical] || canonical}`);
            setPage((prev) => ({
                ...prev,
                content: prev.content.map((ord) =>
                    ord.id === orderId
                        ? {
                            ...ord,
                            orderStatus: canonical as AdminOrder["orderStatus"],
                            updatedAt: new Date().toISOString(),
                        }
                        : ord,
                ),
            }));
            window.dispatchEvent(
                new CustomEvent("order_status_changed", { detail: { orderId, nextStatus: canonical } }),
            );
        } catch (err: unknown) {
            void loadOrders(currentPage, filter);
            const errObj = err as { response?: { data?: { message?: string } }; message?: string };
            const message = errObj?.response?.data?.message || errObj?.message || "Không thể cập nhật trạng thái đơn hàng";
            toast.error(message);
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const orders = useMemo(() => {
        return (page.content || []).filter((order) => {
            const query = search.trim().toLowerCase();
            if (!query) return true;
            const idMatch = String(order.id).includes(query);
            const customerName = (order.user?.fullName || order.delivery?.fullName || "").toLowerCase();
            const nameMatch = customerName.includes(query);
            const phoneMatch = (order.delivery?.phoneNumber || "").toLowerCase().includes(query);
            const addressMatch = (order.delivery?.address || "").toLowerCase().includes(query);
            const noteMatch = (order.note || "").toLowerCase().includes(query);
            const userIdMatch = order.user?.id ? String(order.user.id).includes(query) : false;
            return idMatch || nameMatch || phoneMatch || addressMatch || noteMatch || userIdMatch;
        });
    }, [page.content, search]);

    const counts = useMemo(() => {
        const list = page.content || [];
        return {
            total: page.totalElements || list.length,
            pending: list.filter((o) => o.orderStatus === "PENDING").length,
            shipped: list.filter((o) => o.orderStatus === "SHIPPED").length,
            delivered: list.filter((o) => o.orderStatus === "DELIVERED").length,
            cancelled: list.filter((o) => o.orderStatus === "CANCELLED").length,
        };
    }, [page.content, page.totalElements]);

    const renderCustomerAvatar = (fullName?: string, avatarUrl?: string) => {
        if (avatarUrl) {
            return (
                <img
                    src={avatarUrl}
                    alt={fullName || "Avatar"}
                    className="h-9 w-9 rounded-full object-cover border border-slate-200 shadow-2xs shrink-0"
                    onError={(e) => {
                        e.currentTarget.style.display = "none";
                    }}
                />
            );
        }
        const initials =
            (fullName || "K")
                .trim()
                .split(" ")
                .filter(Boolean)
                .slice(-2)
                .map((n) => n[0])
                .join("")
                .toUpperCase() || "KH";

        return (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 text-xs font-bold text-white shadow-2xs">
                {initials}
            </div>
        );
    };

    const renderPaymentMethod = (method?: string) => {
        const m = (method || "").toUpperCase();
        if (m === "CASH") {
            return (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                    <Banknote size={15} className="text-emerald-600 shrink-0" />
                    Tiền mặt (COD)
                </span>
            );
        }
        if (m === "CREDIT_CARD") {
            return (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                    <CreditCard size={15} className="text-indigo-600 shrink-0" />
                    Thẻ tín dụng / Online
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                <CreditCard size={15} className="text-slate-500 shrink-0" />
                {method || "Chưa xác định"}
            </span>
        );
    };

    const renderPaymentStatus = (status?: string) => {
        const s = (status || "").toUpperCase();
        if (s === "COMPLETED") {
            return (
                <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                    <CheckCircle2 size={11} className="shrink-0" />
                    Đã thanh toán
                </span>
            );
        }
        if (s === "PENDING") {
            return (
                <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                    <Clock size={11} className="shrink-0" />
                    Chờ thanh toán
                </span>
            );
        }
        if (s === "FAILED") {
            return (
                <span className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700">
                    <AlertCircle size={11} className="shrink-0" />
                    Thanh toán lỗi
                </span>
            );
        }
        if (s === "CANCELLED") {
            return (
                <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                    <XCircle size={11} className="shrink-0" />
                    Đã hủy TT
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                {status || "—"}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                        Quản lý bán hàng
                    </span>
                    <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
                        Danh sách đơn hàng
                    </h1>
                    <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                        Theo dõi tiến độ, kiểm tra thông tin khách hàng, địa chỉ nhận hàng và quản lý trạng thái đơn theo hệ thống.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => loadOrders(currentPage, filter)}
                    disabled={loading}
                    className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                >
                    <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Làm mới danh sách
                </button>
            </section>

            {/* Metric stat cards */}
            <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <button
                    type="button"
                    onClick={() => handleFilterChange("")}
                    className={`flex flex-col rounded-2xl border p-4 text-left transition cursor-pointer ${filter === ""
                            ? "border-indigo-500 bg-indigo-50/40 ring-1 ring-indigo-500/20"
                            : "border-slate-200/90 bg-white hover:border-slate-300 shadow-xs"
                        }`}
                >
                    <div className="flex items-center justify-between text-slate-500">
                        <span className="text-xs font-semibold">Tất cả đơn</span>
                        <Package size={16} className="text-indigo-600" />
                    </div>
                    <span className="mt-2 text-2xl font-black text-slate-900">
                        {counts.total}
                    </span>
                    <span className="mt-0.5 text-[11px] text-slate-400">Toàn bộ đơn hàng</span>
                </button>

                <button
                    type="button"
                    onClick={() => handleFilterChange("PENDING")}
                    className={`flex flex-col rounded-2xl border p-4 text-left transition cursor-pointer ${filter === "PENDING"
                            ? "border-amber-500 bg-amber-50/40 ring-1 ring-amber-500/20"
                            : "border-slate-200/90 bg-white hover:border-slate-300 shadow-xs"
                        }`}
                >
                    <div className="flex items-center justify-between text-slate-500">
                        <span className="text-xs font-semibold">Chờ xác nhận</span>
                        <Clock size={16} className="text-amber-600" />
                    </div>
                    <span className="mt-2 text-2xl font-black text-amber-700">
                        {counts.pending}
                    </span>
                    <span className="mt-0.5 text-[11px] text-slate-400">Cần xử lý & xuất kho</span>
                </button>

                <button
                    type="button"
                    onClick={() => handleFilterChange("SHIPPED")}
                    className={`flex flex-col rounded-2xl border p-4 text-left transition cursor-pointer ${filter === "SHIPPED"
                            ? "border-blue-500 bg-blue-50/40 ring-1 ring-blue-500/20"
                            : "border-slate-200/90 bg-white hover:border-slate-300 shadow-xs"
                        }`}
                >
                    <div className="flex items-center justify-between text-slate-500">
                        <span className="text-xs font-semibold">Đang giao hàng</span>
                        <Truck size={16} className="text-blue-600" />
                    </div>
                    <span className="mt-2 text-2xl font-black text-blue-700">
                        {counts.shipped}
                    </span>
                    <span className="mt-0.5 text-[11px] text-slate-400">Đơn vị vận chuyển đang phát</span>
                </button>

                <button
                    type="button"
                    onClick={() => handleFilterChange("DELIVERED")}
                    className={`flex flex-col rounded-2xl border p-4 text-left transition cursor-pointer ${filter === "DELIVERED"
                            ? "border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500/20"
                            : "border-slate-200/90 bg-white hover:border-slate-300 shadow-xs"
                        }`}
                >
                    <div className="flex items-center justify-between text-slate-500">
                        <span className="text-xs font-semibold">Đã giao thành công</span>
                        <CheckCircle2 size={16} className="text-emerald-600" />
                    </div>
                    <span className="mt-2 text-2xl font-black text-emerald-700">
                        {counts.delivered}
                    </span>
                    <span className="mt-0.5 text-[11px] text-slate-400">Đơn hàng hoàn tất</span>
                </button>
            </section>

            {/* Filter and search bar */}
            <section className="space-y-3 rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs">
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    {/* Search box */}
                    <label className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 transition focus-within:border-indigo-500 focus-within:bg-white">
                        <Search size={16} className="text-slate-400 shrink-0" />
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            className="w-full bg-transparent text-xs font-medium text-slate-800 outline-none placeholder:text-slate-400"
                            placeholder="Tìm kiếm theo mã đơn (#12), tên khách hàng, mã KH, SĐT, địa chỉ, ghi chú..."
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch("")}
                                className="text-slate-400 hover:text-slate-600"
                                title="Xóa tìm kiếm"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </label>

                    {/* Filter dropdown */}
                    <div className="flex items-center gap-2 shrink-0">
                        <select
                            value={filter}
                            onChange={(event) => handleFilterChange(event.target.value)}
                            className="rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none transition focus:border-indigo-500 cursor-pointer"
                        >
                            {statusFilters.map((st) => (
                                <option key={st.key} value={st.key}>
                                    {st.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Status Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 border-t border-slate-100 text-xs">
                    {statusFilters.map((st) => {
                        const active = filter === st.key;
                        return (
                            <button
                                key={st.key}
                                type="button"
                                onClick={() => handleFilterChange(st.key)}
                                className={`rounded-lg px-3 py-1.5 font-bold transition whitespace-nowrap cursor-pointer ${active
                                        ? "bg-indigo-600 text-white shadow-xs"
                                        : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/70"
                                    }`}
                            >
                                {st.label}
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Orders Table */}
            <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[980px] text-left text-xs">
                        <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Mã đơn & Ghi chú</th>
                                <th className="px-6 py-4">Khách hàng & Giao hàng</th>
                                <th className="px-6 py-4">Hình thức & TT thanh toán</th>
                                <th className="px-6 py-4">Số tiền (VNĐ)</th>
                                <th className="px-6 py-4">Trạng thái đơn</th>
                                <th className="px-6 py-4">Cập nhật tiến độ</th>
                                <th className="px-6 py-4 text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading && !orders.length ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center text-slate-400">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Loader2 size={24} className="animate-spin text-indigo-600" />
                                            <span className="text-xs font-semibold">Đang tải danh sách đơn hàng...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : orders.length ? (
                                orders.map((order) => {
                                    const isUpdating = updatingOrderId === order.id;
                                    const isCancelled = order.orderStatus === "CANCELLED";
                                    const isDelivered = order.orderStatus === "DELIVERED";
                                    const customerName =
                                        order.user?.fullName || order.delivery?.fullName || "Khách hàng";
                                    const config = statusConfig[order.orderStatus] || {
                                        bg: "bg-slate-100",
                                        text: "text-slate-700",
                                        border: "border-slate-200",
                                        icon: Clock,
                                    };
                                    const StatusIcon = config.icon;

                                    return (
                                        <tr
                                            key={order.id}
                                            className="text-slate-700 transition hover:bg-slate-50/70"
                                        >
                                            {/* Mã đơn & Ghi chú */}
                                            <td className="px-6 py-4 align-top">
                                                <span className="font-mono font-bold text-indigo-600 text-xs">
                                                    #{order.id}
                                                </span>
                                                {order.note ? (
                                                    <div
                                                        className="mt-1.5 flex items-start gap-1 rounded-lg bg-amber-50/90 px-2 py-1 text-[11px] text-amber-800 border border-amber-200/70 max-w-[210px]"
                                                        title={order.note}
                                                    >
                                                        <FileText size={12} className="text-amber-600 shrink-0 mt-0.5" />
                                                        <span className="line-clamp-2 leading-tight">
                                                            {order.note}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="block mt-1 text-[10px] text-slate-400 italic">
                                                        Không có ghi chú
                                                    </span>
                                                )}
                                            </td>

                                            {/* Khách hàng & Giao hàng */}
                                            <td className="px-6 py-4 align-top max-w-[280px]">
                                                <div className="flex items-start gap-3">
                                                    {renderCustomerAvatar(customerName, order.user?.avatarUrl)}
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            <span className="font-bold text-slate-900 text-xs">
                                                                {customerName}
                                                            </span>
                                                            {order.user?.id && (
                                                                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                                                                    ID #{order.user.id}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-600">
                                                            <Phone size={12} className="text-slate-400 shrink-0" />
                                                            <span>{order.delivery?.phoneNumber || "—"}</span>
                                                        </div>
                                                        {order.delivery?.address ? (
                                                            <div
                                                                className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500 max-w-[220px]"
                                                                title={order.delivery.address}
                                                            >
                                                                <MapPin size={12} className="text-slate-400 shrink-0" />
                                                                <span className="truncate">{order.delivery.address}</span>
                                                            </div>
                                                        ) : (
                                                            <div className="mt-0.5 text-[11px] text-slate-400 italic">
                                                                Chưa có địa chỉ
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Phương thức & Trạng thái thanh toán */}
                                            <td className="px-6 py-4 align-top">
                                                <div>{renderPaymentMethod(order.paymentMethod)}</div>
                                                <div className="mt-1.5">
                                                    {renderPaymentStatus(order.paymentStatus)}
                                                </div>
                                            </td>

                                            {/* Tổng tiền */}
                                            <td className="px-6 py-4 align-top">
                                                <p className="font-extrabold text-slate-900 text-sm">
                                                    {currency.format(order.finalAmount || order.totalAmount || 0)}
                                                </p>
                                                <div className="mt-1 space-y-0.5 text-[10px] text-slate-500">
                                                    {typeof order.totalAmount === "number" &&
                                                        order.finalAmount !== order.totalAmount && (
                                                            <p>Tiền hàng: {currency.format(order.totalAmount)}</p>
                                                        )}
                                                    {typeof order.shippingAmount === "number" && order.shippingAmount > 0 && (
                                                        <p className="text-indigo-600 font-medium">
                                                            Phí ship: +{currency.format(order.shippingAmount)}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Trạng thái đơn hiện tại */}
                                            <td className="px-6 py-4 align-top">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold border ${config.bg} ${config.text} ${config.border}`}
                                                >
                                                    <StatusIcon size={12} className="shrink-0" />
                                                    {labels[order.orderStatus] || order.orderStatus}
                                                </span>
                                            </td>

                                            {/* Cập nhật tiến độ */}
                                            <td className="px-6 py-4 align-top">
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        aria-label={`Trạng thái đơn ${order.id}`}
                                                        value={order.orderStatus}
                                                        disabled={isUpdating || isCancelled || isDelivered}
                                                        onChange={(event) =>
                                                            updateStatus(
                                                                order.id,
                                                                event.target.value as AdminOrder["orderStatus"],
                                                            )
                                                        }
                                                        title={
                                                            isCancelled
                                                                ? "Đơn hàng đã hủy, không thể thay đổi trạng thái"
                                                                : isDelivered
                                                                    ? "Đơn hàng đã giao thành công"
                                                                    : `Đang ở trạng thái: ${labels[order.orderStatus] || order.orderStatus}`
                                                        }
                                                        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 outline-none transition focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                                                    >
                                                        <option value="PENDING">Chờ xác nhận</option>
                                                        <option value="SHIPPED">Đang giao</option>
                                                        <option value="DELIVERED">Đã giao</option>
                                                        <option
                                                            value="CANCELLED"
                                                            disabled={order.orderStatus !== "PENDING" && !isCancelled}
                                                        >
                                                            Đã hủy
                                                        </option>
                                                    </select>
                                                    {isUpdating && (
                                                        <Loader2
                                                            size={15}
                                                            className="animate-spin text-indigo-600"
                                                        />
                                                    )}
                                                </div>
                                                {order.orderStatus !== "PENDING" && !isCancelled && !isDelivered && (
                                                    <span className="block mt-1 text-[10px] text-slate-400">
                                                        *Chỉ đơn Chờ xác nhận mới có thể hủy
                                                    </span>
                                                )}
                                            </td>

                                            {/* Thao tác */}
                                            <td className="px-6 py-4 align-top text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => setViewingOrder(order)}
                                                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-indigo-600 shadow-xs transition hover:bg-indigo-50 hover:border-indigo-200 cursor-pointer"
                                                    title="Xem chi tiết đơn hàng"
                                                >
                                                    <Eye size={14} /> Chi tiết
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <ClipboardList className="mx-auto mb-2 text-slate-300" size={36} />
                                        <p className="font-bold text-slate-800 text-sm">
                                            Không có đơn hàng nào phù hợp
                                        </p>
                                        <p className="mt-1 text-xs text-slate-400">
                                            Hãy thử thay đổi điều kiện lọc trạng thái hoặc từ khóa tìm kiếm.
                                        </p>
                                        {(search || filter) && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSearch("");
                                                    setFilter("");
                                                }}
                                                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 cursor-pointer"
                                            >
                                                Đặt lại bộ lọc
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination footer */}
                <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4 text-xs text-slate-500 sm:flex-row">
                    <span>
                        Hiển thị <strong>{orders.length}</strong> / tổng số <strong>{page.totalElements}</strong> đơn hàng
                    </span>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-medium">
                            Trang {currentPage} / {Math.max(1, page.totalPages)}
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                disabled={currentPage <= 1 || loading}
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                                title="Trang trước"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                type="button"
                                disabled={currentPage >= page.totalPages || loading}
                                onClick={() => setCurrentPage((p) => p + 1)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                                title="Trang sau"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Modal Detail */}
            <OrderDetailModal
                order={viewingOrder as any}
                open={!!viewingOrder}
                onClose={() => setViewingOrder(null)}
                onCancelOrder={(orderId) => {
                    void updateStatus(orderId, "CANCELLED");
                }}
            />
        </div>
    );
}
