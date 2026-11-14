import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
    CheckCircle2,
    Clock,
    ExternalLink,
    Home,
    Loader2,
    Package,
    QrCode,
    XCircle,
} from "lucide-react";
import { message } from "antd";
import { paymentService } from "../../service/paymentService";

type PaymentState = "PENDING" | "PAID" | "CANCELLED" | "EXPIRED" | "ERROR";

const POLL_INTERVAL_MS = 5000;

export default function PaymentPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const orderId = location.state?.orderId;

    useEffect(() => {
        if (!orderId) {
            navigate("/cart");
        }
    }, [orderId, navigate]);

    if (!orderId) {
        navigate("/cart");
        return null;
    }

    const [paymentState, setPaymentState] = useState<PaymentState>("PENDING");
    const [qrCode, setQrCode] = useState<string>("");
    const [checkoutUrl, setCheckoutUrl] = useState<string>("");
    const [amount, setAmount] = useState<number>(0);
    const [description, setDescription] = useState<string>("");
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const orderIdNum = Number(orderId);

    // Lấy thông tin thanh toán từ location.state
    useEffect(() => {
        const stateData: any = location.state;
        let checkout = stateData?.checkout;
        if (!checkout && orderId) {
            try {
                const saved = localStorage.getItem(`payos_checkout_${orderId}`);
                if (saved) {
                    checkout = JSON.parse(saved);
                }
            } catch {
                // ignore
            }
        }

        if (checkout) {
            setQrCode(checkout.qrCode || "");
            setCheckoutUrl(checkout.checkoutUrl || "");
            setAmount(checkout.amount || stateData?.order?.finalAmount || 0);
            setDescription(
                checkout.description || `Thanh toán đơn hàng #${orderId}`,
            );
        } else if (stateData?.order) {
            const finalAmt = stateData.order.finalAmount || 0;
            setAmount(finalAmt);
            setDescription(`Thanh toán đơn hàng #${orderId}`);
            if (finalAmt > 0) {
                setQrCode(`THANHTOAN_DONHANG_${orderId}_${finalAmt}`);
            }
        }
    }, [location.state, orderId]);

    // Auto-polling trạng thái thanh toán mỗi 5 giây
    useEffect(() => {
        if (!orderIdNum || paymentState !== "PENDING") return;

        const checkStatus = async () => {
            try {
                const result = await paymentService.getPaymentStatus(orderIdNum);
                const status = result?.status?.toUpperCase() || result?.paymentStatus?.toUpperCase();

                if (status === "PAID" || status === "COMPLETED") {
                    setPaymentState("PAID");
                    message.success("Thanh toán thành công!");
                    // Redirect sau 2 giây
                    setTimeout(() => {
                        navigate(`/checkout/success?orderId=${orderIdNum}`, {
                            state: {
                                order: {
                                    id: orderIdNum,
                                    paymentMethod: "PAYOS",
                                    paymentStatus: "COMPLETED",
                                    orderStatus: "PENDING",
                                },
                                paymentMethod: "PAYOS",
                            },
                        });
                    }, 2000);
                } else if (status === "CANCELLED") {
                    setPaymentState("CANCELLED");
                } else if (status === "EXPIRED") {
                    setPaymentState("EXPIRED");
                }
            } catch (err) {
                console.warn("Lỗi kiểm tra trạng thái thanh toán:", err);
            }
        };

        // Check ngay lần đầu
        checkStatus();

        // Polling mỗi 5 giây
        pollingRef.current = setInterval(checkStatus, POLL_INTERVAL_MS);

        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
            }
        };
    }, [orderIdNum, paymentState, navigate]);

    const formatPrice = (price: number) =>
        new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(price);

    const handleCancelPayment = async () => {
        try {
            await paymentService.cancelPayment(orderIdNum);
            setPaymentState("CANCELLED");
            message.info("Đã hủy thanh toán.");
        } catch (err: any) {
            message.error(
                err?.response?.data?.message || "Không thể hủy thanh toán.",
            );
        }
    };

    return (
        <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
                {/* Header */}
                <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 p-6 text-center text-white sm:p-8">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
                        {paymentState === "PENDING" && (
                            <Clock size={36} className="text-amber-300" />
                        )}
                        {paymentState === "PAID" && (
                            <CheckCircle2 size={36} className="text-emerald-300" />
                        )}
                        {(paymentState === "CANCELLED" || paymentState === "EXPIRED" || paymentState === "ERROR") && (
                            <XCircle size={36} className="text-rose-300" />
                        )}
                    </div>
                    <h1 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
                        {paymentState === "PENDING" && "Thanh toán PayOS"}
                        {paymentState === "PAID" && "Thanh toán thành công!"}
                        {paymentState === "CANCELLED" && "Đã hủy thanh toán"}
                        {paymentState === "EXPIRED" && "Thanh toán hết hạn"}
                        {paymentState === "ERROR" && "Lỗi thanh toán"}
                    </h1>
                    {orderIdNum > 0 && (
                        <p className="mt-2 text-sm text-indigo-200">
                            Mã đơn hàng:{" "}
                            <span className="font-mono font-bold text-amber-300">
                                #{orderIdNum}
                            </span>
                        </p>
                    )}
                </div>

                {/* Body */}
                <div className="p-6 sm:p-8">
                    {/* PENDING: Hiển thị QR code và link thanh toán */}
                    {paymentState === "PENDING" && (
                        <div className="space-y-6">
                            {/* QR Code */}
                            {qrCode && (
                                <div className="flex flex-col items-center justify-center space-y-4">
                                    <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-bold text-indigo-700">
                                        <QrCode size={14} />
                                        Quét mã QR để thanh toán
                                    </div>
                                    <div className="flex items-center justify-center rounded-2xl border-2 border-indigo-100 bg-white p-6 shadow-lg">
                                        <img
                                            src={
                                                qrCode.startsWith("http") ||
                                                qrCode.startsWith("data:")
                                                    ? qrCode
                                                    : `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(qrCode)}`
                                            }
                                            alt="PayOS QR Code"
                                            className="h-64 w-64 object-contain"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Thông tin thanh toán */}
                            {amount > 0 && (
                                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center">
                                    <p className="text-xs font-semibold text-slate-500">
                                        Số tiền cần thanh toán
                                    </p>
                                    <p className="mt-1 text-2xl font-black text-indigo-700">
                                        {formatPrice(amount)}
                                    </p>
                                    {description && (
                                        <p className="mt-1 text-xs text-slate-500">
                                            {description}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Nút mở trang thanh toán */}
                            {checkoutUrl && (
                                <a
                                    href={checkoutUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
                                >
                                    <ExternalLink size={18} />
                                    Mở trang thanh toán PayOS
                                </a>
                            )}

                            {/* Trạng thái polling */}
                            <div className="flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800">
                                <Loader2 size={15} className="animate-spin" />
                                Đang chờ thanh toán... Tự động kiểm tra mỗi 5 giây
                            </div>

                            {/* Nút hủy */}
                            <button
                                type="button"
                                onClick={handleCancelPayment}
                                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-rose-600"
                            >
                                <XCircle size={16} />
                                Hủy thanh toán
                            </button>
                        </div>
                    )}

                    {/* PAID: Thanh toán thành công */}
                    {paymentState === "PAID" && (
                        <div className="space-y-5 text-center">
                            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                                <CheckCircle2
                                    size={48}
                                    className="mx-auto text-emerald-600"
                                />
                                <p className="mt-3 text-sm font-bold text-emerald-800">
                                    Thanh toán đã được xác nhận thành công!
                                </p>
                                <p className="mt-1 text-xs text-emerald-700">
                                    Đang chuyển hướng tới trang xác nhận đơn
                                    hàng...
                                </p>
                            </div>
                            <Loader2
                                size={20}
                                className="mx-auto animate-spin text-indigo-600"
                            />
                        </div>
                    )}

                    {/* CANCELLED / EXPIRED / ERROR */}
                    {(paymentState === "CANCELLED" ||
                        paymentState === "EXPIRED" ||
                        paymentState === "ERROR") && (
                        <div className="space-y-5 text-center">
                            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
                                <XCircle
                                    size={48}
                                    className="mx-auto text-rose-500"
                                />
                                <p className="mt-3 text-sm font-bold text-rose-800">
                                    {paymentState === "CANCELLED"
                                        ? "Thanh toán đã bị hủy."
                                        : paymentState === "EXPIRED"
                                          ? "Link thanh toán đã hết hạn."
                                          : "Có lỗi xảy ra trong quá trình thanh toán."}
                                </p>
                                <p className="mt-1 text-xs text-rose-700">
                                    Bạn có thể quay lại giỏ hàng để thử lại
                                    hoặc chọn phương thức thanh toán khác.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                                <Link
                                    to="/cart"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
                                >
                                    <Package size={18} />
                                    Quay lại giỏ hàng
                                </Link>
                                <Link
                                    to="/"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
                                >
                                    <Home size={18} />
                                    Trang chủ
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

