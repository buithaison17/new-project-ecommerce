import { CheckCircle2, Clock, CreditCard, Home, MapPin, Package, Phone, ShoppingBag, Truck } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import type { OrderResponse, PaymentMethod } from "../../types/order";

const formatPrice = (price?: number) => {
    if (typeof price !== "number") return "0 đ";
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(price);
};

export default function CheckoutSuccessPage() {
    const location = useLocation();
    const state = location.state as {
        order?: OrderResponse;
        paymentMethod?: PaymentMethod;
        customerName?: string;
    } | null;

    const order = state?.order;
    const isCreditCard = state?.paymentMethod === "CREDIT_CARD" || order?.paymentMethod === "CREDIT_CARD";

    return (
        <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
                {/* Header biểu tượng thành công */}
                <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 p-8 text-center text-white sm:p-10">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
                        <CheckCircle2 size={48} className="text-emerald-300" />
                    </div>
                    <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                        Đặt hàng thành công!
                    </h1>
                    <p className="mt-2 text-sm text-indigo-100 sm:text-base">
                        Cảm ơn bạn đã tin tưởng và mua sắm tại <strong>ShopNova</strong>.
                    </p>
                    {order?.id && (
                        <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                            <span>Mã đơn hàng:</span>
                            <span className="font-mono text-base font-bold text-amber-300">
                                #{order.id}
                            </span>
                        </div>
                    )}
                </div>

                {/* Chi tiết đơn hàng */}
                <div className="p-6 sm:p-8">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 sm:p-6">
                        <h2 className="text-base font-black text-slate-900">Chi tiết đơn hàng vừa tạo</h2>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <div>
                                <span className="block text-xs font-semibold text-slate-500">
                                    Phương thức thanh toán
                                </span>
                                <span className="mt-1 flex items-center gap-1.5 text-sm font-bold text-slate-800">
                                    {isCreditCard ? (
                                        <>
                                            <CreditCard size={17} className="text-indigo-600" />
                                            Thẻ thanh toán (CREDIT CARD)
                                        </>
                                    ) : (
                                        <>
                                            <Truck size={17} className="text-indigo-600" />
                                            Thanh toán khi nhận hàng (COD)
                                        </>
                                    )}
                                </span>
                            </div>

                            <div>
                                <span className="block text-xs font-semibold text-slate-500">
                                    Trạng thái thanh toán
                                </span>
                                <span className="mt-1 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold bg-amber-50 text-amber-700">
                                    <Clock size={14} />
                                    {order?.paymentStatus === "COMPLETED"
                                        ? "Đã thanh toán"
                                        : "Chờ thanh toán khi nhận"}
                                </span>
                            </div>

                            <div>
                                <span className="block text-xs font-semibold text-slate-500">
                                    Tổng tiền thanh toán
                                </span>
                                <span className="mt-1 text-lg font-black text-indigo-700">
                                    {formatPrice(order?.finalAmount)}
                                </span>
                                <span className="block text-xs text-slate-400">
                                    (Gồm phí vận chuyển 20.000 đ)
                                </span>
                            </div>

                            <div>
                                <span className="block text-xs font-semibold text-slate-500">
                                    Trạng thái xử lý
                                </span>
                                <span className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                                    <Package size={14} />
                                    {order?.orderStatus || "PENDING"} (Đang chờ xử lý)
                                </span>
                            </div>
                        </div>

                        {/* Thông tin giao nhận */}
                        <div className="mt-5 border-t border-slate-200/60 pt-4">
                            <span className="block text-xs font-semibold text-slate-500">
                                Địa chỉ nhận hàng
                            </span>
                            <div className="mt-1 flex items-start gap-2 text-sm text-slate-800">
                                <MapPin size={17} className="mt-0.5 shrink-0 text-indigo-600" />
                                <div>
                                    <p className="font-semibold">{order?.delivery?.address || "Địa chỉ mặc định"}</p>
                                    {order?.delivery?.phoneNumber && (
                                        <p className="flex items-center gap-1.5 text-xs text-slate-600">
                                            <Phone size={13} />
                                            <span>SĐT: {order.delivery.phoneNumber}</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {order?.note && (
                            <div className="mt-4 border-t border-slate-200/60 pt-4 text-xs">
                                <span className="font-semibold text-slate-500">Ghi chú:</span>{" "}
                                <span className="text-slate-700">{order.note}</span>
                            </div>
                        )}
                    </div>

                    {/* Hướng dẫn tiếp theo */}
                    <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 text-xs leading-6 text-slate-600">
                        {isCreditCard
                            ? "Giao dịch thanh toán thẻ của bạn đã được ghi nhận. Đơn hàng đang được chuẩn bị và chuyển sang đơn vị vận chuyển."
                            : "Đơn hàng đã được tiếp nhận thành công. Nhân viên sẽ liên hệ với bạn để xác nhận đơn và tiến hành đóng gói giao hàng."}
                    </div>

                    {/* Các nút điều hướng */}
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <Link
                            to="/orders"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
                        >
                            <Package size={18} />
                            Xem lịch sử đơn hàng
                        </Link>
                        <Link
                            to="/products"
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 hover:text-indigo-600"
                        >
                            <ShoppingBag size={18} />
                            Tiếp tục mua sắm
                        </Link>
                        <Link
                            to="/"
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-bold text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
                        >
                            <Home size={18} />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
