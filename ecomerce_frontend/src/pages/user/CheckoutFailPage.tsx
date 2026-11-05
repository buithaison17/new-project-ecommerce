import { AlertTriangle, CreditCard, Home, Package, RotateCcw, ShoppingBag, Truck } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import type { PaymentMethod } from "../../types/order";

export default function CheckoutFailPage() {
    const location = useLocation();
    const state = location.state as {
        errorMessage?: string;
        paymentMethod?: PaymentMethod;
    } | null;

    const errorMessage = state?.errorMessage || "Có lỗi xảy ra khi xử lý đơn hàng. Vui lòng thử lại!";
    const isCreditCard = state?.paymentMethod === "CREDIT_CARD";

    return (
        <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
                {/* Header biểu tượng thất bại */}
                <div className="bg-gradient-to-br from-rose-600 via-rose-700 to-red-700 p-8 text-center text-white sm:p-10">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
                        <AlertTriangle size={48} className="text-amber-300" />
                    </div>
                    <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                        Đặt hàng không thành công!
                    </h1>
                    <p className="mt-2 text-sm text-rose-100 sm:text-base">
                        Đơn hàng của bạn chưa được tạo. Vui lòng kiểm tra lại thông tin và thử lại.
                    </p>
                </div>

                {/* Thông tin lỗi */}
                <div className="p-6 sm:p-8">
                    <div className="rounded-2xl border border-rose-100 bg-rose-50 p-5 sm:p-6">
                        <h2 className="text-base font-black text-slate-900">Thông tin giao dịch</h2>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <div>
                                <span className="block text-xs font-semibold text-slate-500">
                                    Phương thức thanh toán
                                </span>
                                <span className="mt-1 flex items-center gap-1.5 text-sm font-bold text-slate-800">
                                    {isCreditCard ? (
                                        <>
                                            <CreditCard size={17} className="text-rose-600" />
                                            Thẻ thanh toán (CREDIT CARD)
                                        </>
                                    ) : (
                                        <>
                                            <Truck size={17} className="text-rose-600" />
                                            Thanh toán khi nhận hàng (COD)
                                        </>
                                    )}
                                </span>
                            </div>

                            <div>
                                <span className="block text-xs font-semibold text-slate-500">
                                    Trạng thái đơn hàng
                                </span>
                                <span className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-700">
                                    <AlertTriangle size={14} />
                                    Thất bại
                                </span>
                            </div>
                        </div>

                        <div className="mt-5 border-t border-rose-200/60 pt-4">
                            <span className="block text-xs font-semibold text-slate-500">
                                Lý do / Thông báo lỗi
                            </span>
                            <p className="mt-1 rounded-xl bg-white px-4 py-3 text-sm font-medium text-rose-700 shadow-sm">
                                {errorMessage}
                            </p>
                        </div>
                    </div>

                    {/* Hướng dẫn tiếp theo */}
                    <div className="mt-6 rounded-2xl border border-rose-100 bg-rose-50/50 p-4 text-xs leading-6 text-slate-600">
                        {isCreditCard
                            ? "Giao dịch thanh toán thẻ của bạn không thành công. Không có khoản tiền nào bị trừ. Vui lòng kiểm tra lại thông tin thẻ hoặc thử phương thức thanh toán khác."
                            : "Đơn hàng chưa được tạo do có lỗi xảy ra. Giỏ hàng của bạn vẫn được giữ nguyên, bạn có thể thử đặt hàng lại."}
                    </div>

                    {/* Các nút điều hướng */}
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <Link
                            to="/checkout"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-200 transition hover:bg-rose-700"
                        >
                            <RotateCcw size={18} />
                            Thử đặt hàng lại
                        </Link>
                        <Link
                            to="/cart"
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 hover:text-rose-600"
                        >
                            <ShoppingBag size={18} />
                            Xem giỏ hàng
                        </Link>
                        <Link
                            to="/orders"
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 hover:text-rose-600"
                        >
                            <Package size={18} />
                            Lịch sử đơn hàng
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
