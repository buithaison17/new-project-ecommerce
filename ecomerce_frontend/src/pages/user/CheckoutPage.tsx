import {
    Check,
    CheckCircle2,
    CreditCard,
    Edit3,
    FileText,
    Lock,
    MapPin,
    Package,
    Plus,
    ShieldCheck,
    Trash2,
    Truck,
    WalletCards,
    X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { message } from "antd";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
import { formatProductImageUrl } from "../../lib/image";
import { orderService } from "../../service/orderService";
import type { PaymentMethod, UserDeliveryResponse } from "../../types/order";

const SHIPPING_FEE = 20000;

const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(price);

export default function CheckoutPage() {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const items = useCartStore((state) => state.items);

    const [savedDeliveries, setSavedDeliveries] = useState<UserDeliveryResponse[]>([]);
    // Bảng thông tin chỉ hiện khi người dùng chọn một địa chỉ hoặc bấm thêm địa chỉ mới
    const [selectedDeliveryIndex, setSelectedDeliveryIndex] = useState<number | "new" | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [note, setNote] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
    const [submitting, setSubmitting] = useState(false);
    const [loadingDeliveries, setLoadingDeliveries] = useState(true);
    const [savingDelivery, setSavingDelivery] = useState(false);

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = subtotal + SHIPPING_FEE;

    // Tự động điền thông tin người dùng nếu có
    useEffect(() => {
        if (user?.fullName) {
            setFullName(user.fullName);
        }
        if (user?.username?.includes("@")) {
            setEmail(user.username);
        }
    }, [user]);

    // Tải danh sách địa chỉ nhận hàng đã lưu của người dùng
    useEffect(() => {
        let isMounted = true;
        setLoadingDeliveries(true);
        orderService
            .getDeliveries(1, 10)
            .then((deliveries) => {
                if (!isMounted) return;
                const list = deliveries || [];
                setSavedDeliveries(list);
                // Nếu tài khoản chưa có địa chỉ nào thì tự động mở biểu mẫu thêm mới để nhập ngay
                if (list.length === 0) {
                    setSelectedDeliveryIndex("new");
                    setIsEditing(true);
                } else {
                    setSelectedDeliveryIndex(null);
                }
            })
            .catch(() => {
                // Có thể chưa có địa chỉ nào, mở form thêm mới
                if (isMounted) {
                    setSelectedDeliveryIndex("new");
                    setIsEditing(true);
                }
            })
            .finally(() => {
                if (isMounted) setLoadingDeliveries(false);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    // Xử lý khi chọn một địa chỉ đã lưu hoặc bấm thêm mới
    const handleSelectDelivery = (index: number | "new") => {
        setSelectedDeliveryIndex(index);
        if (index === "new") {
            // Khi thêm địa chỉ mới: mở khóa để điền trực tiếp
            setIsEditing(true);
            setAddress("");
            setPhone("");
        } else {
            // Khi chọn địa chỉ có sẵn: mặc định là readOnly, bấm 'Sửa' mới cho điền
            setIsEditing(false);
            const selected = savedDeliveries[index];
            if (selected) {
                setAddress(selected.address);
                setPhone(selected.phoneNumber);
            }
        }
    };

    // Hủy chỉnh sửa địa chỉ đã chọn, khôi phục lại dữ liệu gốc
    const handleCancelEdit = () => {
        if (typeof selectedDeliveryIndex === "number" && savedDeliveries[selectedDeliveryIndex]) {
            const original = savedDeliveries[selectedDeliveryIndex];
            setAddress(original.address);
            setPhone(original.phoneNumber);
        }
        setIsEditing(false);
    };

    // Lưu chỉnh sửa địa chỉ đã chọn
    const handleSaveEditedAddress = async () => {
        const cleanPhone = phone.trim();
        const cleanAddress = address.trim();

        if (!/^\d{10}$/.test(cleanPhone)) {
            message.error("Số điện thoại nhận hàng phải gồm đúng 10 chữ số (Ví dụ: 0912345678)!");
            return;
        }

        if (cleanAddress.length < 5) {
            message.error("Vui lòng nhập địa chỉ nhận hàng chi tiết và hợp lệ!");
            return;
        }

        try {
            setSavingDelivery(true);

            // Xóa địa chỉ cũ nếu nội dung bị thay đổi
            if (typeof selectedDeliveryIndex === "number" && savedDeliveries[selectedDeliveryIndex]) {
                const old = savedDeliveries[selectedDeliveryIndex];
                if (old.address !== cleanAddress || old.phoneNumber !== cleanPhone) {
                    await orderService.deleteDeliveryAddress({
                        address: old.address,
                        phoneNumber: old.phoneNumber,
                    });
                }
            }

            await orderService.createDelivery({
                address: cleanAddress,
                phoneNumber: cleanPhone,
            });

            message.success("Cập nhật địa chỉ nhận hàng thành công!");
            const updated = await orderService.getDeliveries(1, 10);
            setSavedDeliveries(updated || []);
            const newIndex = (updated || []).findIndex(
                (d) => d.address.trim() === cleanAddress && d.phoneNumber.trim() === cleanPhone
            );
            setSelectedDeliveryIndex(newIndex >= 0 ? newIndex : 0);
            setIsEditing(false);
        } catch (err: any) {
            message.error(err?.response?.data?.message || "Không thể cập nhật địa chỉ nhận hàng");
        } finally {
            setSavingDelivery(false);
        }
    };

    // Lưu địa chỉ mới tạo vào sổ địa chỉ
    const handleSaveCurrentAddress = async () => {
        const cleanPhone = phone.trim();
        const cleanAddress = address.trim();

        if (!/^\d{10}$/.test(cleanPhone)) {
            message.error("Số điện thoại nhận hàng phải gồm đúng 10 chữ số (Ví dụ: 0912345678)!");
            return;
        }

        if (cleanAddress.length < 5) {
            message.error("Vui lòng nhập địa chỉ nhận hàng chi tiết và hợp lệ!");
            return;
        }

        try {
            setSavingDelivery(true);
            await orderService.createDelivery({
                address: cleanAddress,
                phoneNumber: cleanPhone,
            });
            message.success("Đã lưu địa chỉ vào sổ địa chỉ nhận hàng!");
            const updated = await orderService.getDeliveries(1, 10);
            setSavedDeliveries(updated || []);
            const newIndex = (updated || []).findIndex(
                (d) => d.address.trim() === cleanAddress && d.phoneNumber.trim() === cleanPhone
            );
            setSelectedDeliveryIndex(newIndex >= 0 ? newIndex : 0);
            setIsEditing(false);
        } catch (err: any) {
            message.error(err?.response?.data?.message || "Không thể lưu địa chỉ nhận hàng");
        } finally {
            setSavingDelivery(false);
        }
    };

    // Xóa địa chỉ đã lưu
    const handleDeleteDelivery = async (deliv: UserDeliveryResponse) => {
        try {
            await orderService.deleteDeliveryAddress({
                address: deliv.address,
                phoneNumber: deliv.phoneNumber,
            });
            message.success("Đã xóa địa chỉ nhận hàng!");
            const updated = await orderService.getDeliveries(1, 10);
            setSavedDeliveries(updated || []);
            setSelectedDeliveryIndex(null);
            setIsEditing(false);
            setAddress("");
            setPhone("");
        } catch {
            message.error("Không thể xóa địa chỉ nhận hàng");
        }
    };

    // Kiểm tra hiển thị bảng và chế độ chỉ đọc
    const shouldShowForm = selectedDeliveryIndex !== null;
    const isReadOnly = selectedDeliveryIndex !== "new" && !isEditing;

    if (!items.length) {
        return (
            <section className="mx-auto max-w-7xl px-4 py-20 text-center">
                <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                    <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
                        <Package size={32} />
                    </span>
                    <h1 className="mt-4 text-2xl font-black text-slate-900">
                        Chưa có sản phẩm để thanh toán
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                        Giỏ hàng của bạn đang trống. Vui lòng thêm sản phẩm vào giỏ trước khi tiến hành thanh toán.
                    </p>
                    <Link
                        to="/products"
                        className="mt-6 inline-block rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white transition hover:bg-indigo-700"
                    >
                        Quay lại mua sắm
                    </Link>
                </div>
            </section>
        );
    }

    const submitOrder = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (selectedDeliveryIndex === null) {
            message.warning("Vui lòng chọn hoặc thêm địa chỉ nhận hàng trước khi thanh toán!");
            return;
        }

        const cleanPhone = phone.trim();
        const cleanAddress = address.trim();

        // Kiểm tra số điện thoại: BE quy định chính xác 10 ký tự (@Size(min = 10, max = 10))
        if (!/^\d{10}$/.test(cleanPhone)) {
            message.error("Số điện thoại nhận hàng phải gồm đúng 10 chữ số (Ví dụ: 0912345678)!");
            return;
        }

        if (cleanAddress.length < 5) {
            message.error("Vui lòng nhập địa chỉ nhận hàng chi tiết và hợp lệ!");
            return;
        }

        try {
            setSubmitting(true);

            const orderPayloadItems = items.map((item) => ({
                productId: item.productId,
                name: item.name,
                price: item.price,
                thumbnailUrl: item.thumbnailUrl,
                quantity: item.quantity,
            }));

            // Gọi orderService để gửi dữ liệu lên Backend
            const createdOrder = await orderService.placeOrder({
                items: orderPayloadItems,
                address: cleanAddress,
                phoneNumber: cleanPhone,
                paymentMethod,
                note: note.trim() || undefined,
            });

            // Đảm bảo thông tin địa chỉ nhận hàng luôn hiển thị chính xác theo dữ liệu đã nhập
            if (!createdOrder.delivery || !createdOrder.delivery.address) {
                createdOrder.delivery = {
                    address: cleanAddress,
                    phoneNumber: cleanPhone,
                };
            }

            message.success("Đặt hàng thành công!");

            // Chuyển hướng sang trang hoàn tất với thông tin đơn hàng vừa tạo
            navigate("/checkout/success", {
                state: {
                    order: createdOrder,
                    paymentMethod,
                    customerName: fullName,
                },
            });
        } catch (error: any) {
            console.error("Lỗi đặt hàng:", error);
            const errorMsg =
                error?.response?.data?.message ||
                error?.message ||
                "Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại!";
            message.error(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600">
                <Link to="/cart" className="hover:underline">
                    Giỏ hàng
                </Link>
                <span>/</span>
                <span>Thanh toán</span>
            </div>
            <h1 className="mt-2 text-3xl font-black text-slate-900">Hoàn tất đơn hàng</h1>

            <form onSubmit={submitOrder} className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
                <div className="space-y-6">
                    {/* Phần địa chỉ giao hàng */}
                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="flex items-center justify-between">
                            <h2 className="flex items-center gap-2.5 text-lg font-black text-slate-900">
                                <MapPin className="text-indigo-600" size={22} />
                                Thông tin nhận hàng
                            </h2>
                            <button
                                type="button"
                                onClick={() => handleSelectDelivery("new")}
                                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition shadow-xs ${selectedDeliveryIndex === "new"
                                        ? "bg-indigo-700 text-white ring-2 ring-indigo-200"
                                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                                    }`}
                            >
                                <Plus size={15} /> Thêm địa chỉ mới
                            </button>
                        </div>

                        {/* Banner thông báo và nút thêm khi chưa có địa chỉ nhận hàng nào */}
                        {!loadingDeliveries && savedDeliveries.length === 0 && (
                            <div className="mt-4 flex flex-col gap-3 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-start gap-2.5">
                                    <MapPin size={18} className="mt-0.5 text-indigo-600 shrink-0" />
                                    <div>
                                        <p className="text-xs font-bold text-slate-800">
                                            Chưa có địa chỉ giao hàng được lưu
                                        </p>
                                        <p className="text-[11px] text-slate-500">
                                            Bấm nút 'Thêm địa chỉ mới' để nhập thông tin người nhận và địa chỉ giao hàng.
                                        </p>
                                    </div>
                                </div>
                                {selectedDeliveryIndex !== "new" && (
                                    <button
                                        type="button"
                                        onClick={() => handleSelectDelivery("new")}
                                        className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-indigo-700"
                                    >
                                        <Plus size={14} /> Thêm địa chỉ mới
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Danh sách địa chỉ đã lưu */}
                        {!loadingDeliveries && savedDeliveries.length > 0 && (
                            <div className="mt-4 space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-semibold text-slate-600">
                                        Địa chỉ đã lưu trong tài khoản của bạn:
                                    </p>
                                    {selectedDeliveryIndex === null && (
                                        <span className="text-[11px] font-medium text-amber-600">
                                            * Vui lòng chọn một địa chỉ bên dưới
                                        </span>
                                    )}
                                </div>
                                <div className="grid gap-2.5 sm:grid-cols-2">
                                    {savedDeliveries.map((deliv, idx) => {
                                        const isSelected = selectedDeliveryIndex === idx;
                                        return (
                                            <div
                                                key={idx}
                                                onClick={() => handleSelectDelivery(idx)}
                                                className={`cursor-pointer rounded-xl border p-3.5 transition ${isSelected
                                                        ? "border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-200 shadow-xs"
                                                        : "border-slate-200 bg-slate-50/40 hover:border-indigo-300 hover:bg-slate-50"
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-slate-800">
                                                            Địa chỉ #{idx + 1}
                                                        </span>
                                                        {isSelected && (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white">
                                                                <CheckCircle2 size={11} /> Đang chọn
                                                            </span>
                                                        )}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteDelivery(deliv);
                                                        }}
                                                        className="rounded p-1 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                                                        title="Xóa địa chỉ này"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                                <p className="mt-1.5 line-clamp-2 text-xs font-medium text-slate-800">
                                                    {deliv.address}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    SĐT: <span className="font-semibold text-slate-700">{deliv.phoneNumber}</span>
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Hướng dẫn khi chưa chọn địa chỉ nào và chưa bấm thêm mới */}
                        {!loadingDeliveries && savedDeliveries.length > 0 && selectedDeliveryIndex === null && (
                            <div className="mt-4 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/30 p-4 text-center text-xs text-slate-600">
                                👉 Vui lòng <strong>bấm chọn một địa chỉ ở trên</strong> hoặc bấm <strong>+ Thêm địa chỉ mới</strong> để điền thông tin giao hàng.
                            </div>
                        )}

                        {/* BẢNG THÔNG TIN NHẬN HÀNG: Chỉ xuất hiện khi chọn địa chỉ hoặc bấm thêm địa chỉ mới */}
                        {shouldShowForm && (
                            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/30 p-4 sm:p-5">
                                {/* Thanh tiêu đề và nút thao tác */}
                                <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-slate-800">
                                            {selectedDeliveryIndex === "new"
                                                ? "Thêm địa chỉ giao hàng mới"
                                                : "Chi tiết thông tin nhận hàng"}
                                        </span>
                                        {selectedDeliveryIndex !== "new" && (
                                            <span
                                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${isReadOnly
                                                        ? "bg-slate-200/80 text-slate-700"
                                                        : "bg-emerald-100 text-emerald-800"
                                                    }`}
                                            >
                                                {isReadOnly ? (
                                                    <>
                                                        <Lock size={11} /> Chỉ đọc
                                                    </>
                                                ) : (
                                                    <>
                                                        <Edit3 size={11} /> Đang sửa
                                                    </>
                                                )}
                                            </span>
                                        )}
                                    </div>

                                    {/* Các nút hành động: Sửa, Lưu, Hủy */}
                                    <div className="flex items-center gap-2">
                                        {selectedDeliveryIndex !== "new" && !isEditing && (
                                            <button
                                                type="button"
                                                onClick={() => setIsEditing(true)}
                                                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600 transition hover:bg-indigo-100"
                                            >
                                                <Edit3 size={13} /> Sửa
                                            </button>
                                        )}

                                        {selectedDeliveryIndex !== "new" && isEditing && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={handleSaveEditedAddress}
                                                    disabled={savingDelivery}
                                                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                                                >
                                                    <Check size={13} /> {savingDelivery ? "Đang lưu..." : "Lưu thay đổi"}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleCancelEdit}
                                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                                                >
                                                    <X size={13} /> Hủy
                                                </button>
                                            </>
                                        )}

                                        {selectedDeliveryIndex === "new" && (
                                            <>
                                                {phone.trim() && address.trim().length >= 5 && (
                                                    <button
                                                        type="button"
                                                        onClick={handleSaveCurrentAddress}
                                                        disabled={savingDelivery}
                                                        className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                                                    >
                                                        <Check size={13} /> {savingDelivery ? "Đang lưu..." : "Lưu vào sổ địa chỉ"}
                                                    </button>
                                                )}
                                                {savedDeliveries.length > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedDeliveryIndex(null);
                                                            setIsEditing(false);
                                                        }}
                                                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                                                    >
                                                        <X size={13} /> Đóng
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Thông báo chế độ chỉ đọc nếu chưa bấm sửa */}
                                {isReadOnly && (
                                    <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-600 shadow-2xs">
                                        <span className="flex items-center gap-1.5">
                                            <Lock size={13} className="text-slate-400" />
                                            Thông tin ở chế độ chỉ đọc. Bấm <strong>'Sửa'</strong> để điền / thay đổi thông tin.
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(true)}
                                            className="font-bold text-indigo-600 hover:underline"
                                        >
                                            Sửa ngay
                                        </button>
                                    </div>
                                )}

                                {/* Các trường input y hệt bảng */}
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <label className="text-sm font-bold text-slate-700 sm:col-span-2">
                                        Họ và tên người nhận
                                        <input
                                            required
                                            readOnly={isReadOnly}
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className={`mt-1.5 w-full rounded-xl border px-3.5 py-3 text-sm outline-none transition ${isReadOnly
                                                    ? "cursor-default border-slate-200 bg-slate-50/90 text-slate-700 select-text focus:border-slate-300"
                                                    : "border-slate-200 bg-white text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                                }`}
                                            placeholder="Ví dụ: Bùi Thái Sơn"
                                        />
                                    </label>

                                    <label className="text-sm font-bold text-slate-700">
                                        Số điện thoại nhận hàng <span className="text-rose-500">*</span>
                                        <input
                                            required
                                            type="tel"
                                            inputMode="numeric"
                                            maxLength={10}
                                            readOnly={isReadOnly}
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                                            className={`mt-1.5 w-full rounded-xl border px-3.5 py-3 text-sm outline-none transition ${isReadOnly
                                                    ? "cursor-default border-slate-200 bg-slate-50/90 text-slate-700 select-text focus:border-slate-300"
                                                    : "border-slate-200 bg-white text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                                }`}
                                            placeholder="09xx xxx xxx (đúng 10 số)"
                                        />
                                    </label>

                                    <label className="text-sm font-bold text-slate-700">
                                        Email liên hệ (tùy chọn)
                                        <input
                                            type="email"
                                            readOnly={isReadOnly}
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className={`mt-1.5 w-full rounded-xl border px-3.5 py-3 text-sm outline-none transition ${isReadOnly
                                                    ? "cursor-default border-slate-200 bg-slate-50/90 text-slate-700 select-text focus:border-slate-300"
                                                    : "border-slate-200 bg-white text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                                }`}
                                            placeholder="email@example.com"
                                        />
                                    </label>

                                    <label className="text-sm font-bold text-slate-700 sm:col-span-2">
                                        Địa chỉ giao hàng chi tiết <span className="text-rose-500">*</span>
                                        <textarea
                                            required
                                            rows={3}
                                            readOnly={isReadOnly}
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            className={`mt-1.5 w-full resize-none rounded-xl border px-3.5 py-3 text-sm outline-none transition ${isReadOnly
                                                    ? "cursor-default border-slate-200 bg-slate-50/90 text-slate-700 select-text focus:border-slate-300"
                                                    : "border-slate-200 bg-white text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                                }`}
                                            placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                                        />
                                        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                                            <span className="text-[11px] text-slate-400">
                                                Ví dụ: 123 Đường Nguyễn Trãi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh
                                            </span>
                                        </div>
                                    </label>

                                    <label className="text-sm font-bold text-slate-700 sm:col-span-2">
                                        <span className="flex items-center gap-1.5">
                                            <FileText size={16} className="text-slate-500" />
                                            Ghi chú cho đơn hàng (tuỳ chọn)
                                        </span>
                                        <input
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                            placeholder="Ví dụ: Giao vào giờ hành chính, gọi trước khi đến..."
                                        />
                                    </label>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Phương thức thanh toán */}
                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <h2 className="flex items-center gap-2.5 text-lg font-black text-slate-900">
                            <WalletCards className="text-indigo-600" size={22} />
                            Phương thức thanh toán
                        </h2>
                        <div className="mt-5 grid gap-3">
                            <PaymentOption
                                checked={paymentMethod === "CASH"}
                                onChange={() => setPaymentMethod("CASH")}
                                icon={Truck}
                                title="Thanh toán khi nhận hàng (COD)"
                                description="Thanh toán trực tiếp bằng tiền mặt khi shipper giao hàng tới địa chỉ của bạn."
                            />
                            <PaymentOption
                                checked={paymentMethod === "CREDIT_CARD"}
                                onChange={() => setPaymentMethod("CREDIT_CARD")}
                                icon={CreditCard}
                                title="Thẻ thanh toán / Thẻ tín dụng"
                                description="Thanh toán trực tuyến bảo mật qua thẻ quốc tế hoặc cổng thanh toán."
                            />
                        </div>
                        {paymentMethod === "CREDIT_CARD" && (
                            <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50/70 p-4 text-xs leading-5 text-indigo-900">
                                ℹ️ Hệ thống backend sẽ tự động cập nhật trạng thái đơn hàng thành{" "}
                                <strong>COMPLETED (Đã thanh toán)</strong> ngay sau khi xác nhận đơn.
                            </div>
                        )}
                    </section>
                </div>

                {/* Tóm tắt đơn hàng bên cột phải */}
                <aside className="h-fit space-y-5">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="text-lg font-black text-slate-900">Đơn hàng của bạn</h2>
                        <p className="mt-0.5 text-xs text-slate-500">
                            {items.length} mặt hàng trong giỏ
                        </p>

                        <div className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
                            {items.map((item) => (
                                <div className="flex gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0" key={item.productId}>
                                    <img
                                        src={formatProductImageUrl(
                                            item.thumbnailUrl,
                                            "https://placehold.co/96x96/f1f5f9/64748b?text=ShopNova"
                                        )}
                                        alt={item.name}
                                        className="h-14 w-14 rounded-xl border border-slate-100 object-cover"
                                        onError={(e) => {
                                            const target = e.currentTarget;
                                            if (!target.src.includes("placehold.co")) {
                                                target.src = "https://placehold.co/96x96/f1f5f9/64748b?text=ShopNova";
                                            }
                                        }}
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="line-clamp-1 text-sm font-bold text-slate-800">
                                            {item.name}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            Số lượng: <span className="font-semibold text-slate-700">{item.quantity}</span>
                                        </p>
                                        <p className="text-xs font-bold text-indigo-700">
                                            {formatPrice(item.price)}
                                        </p>
                                    </div>
                                    <p className="text-sm font-bold text-slate-900">
                                        {formatPrice(item.price * item.quantity)}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-5 space-y-2.5 border-t border-slate-100 pt-4 text-sm">
                            <div className="flex justify-between text-slate-600">
                                <span>Tạm tính</span>
                                <span className="font-bold text-slate-800">{formatPrice(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Phí vận chuyển tiêu chuẩn</span>
                                <span className="font-bold text-slate-800">{formatPrice(SHIPPING_FEE)}</span>
                            </div>
                            <div className="mt-3 flex items-end justify-between border-t border-slate-100 pt-3">
                                <div>
                                    <span className="block text-sm font-bold text-slate-800">Tổng cộng</span>
                                    <span className="block text-xs text-slate-500">(Đã bao gồm VAT & phí ship)</span>
                                </div>
                                <span className="text-2xl font-black text-indigo-700">
                                    {formatPrice(total)}
                                </span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-4 font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {submitting ? (
                                <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Đang tạo đơn hàng...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 size={18} />
                                    Xác nhận đặt hàng
                                </>
                            )}
                        </button>

                        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                            <ShieldCheck size={16} className="text-emerald-600" />
                            Giao dịch an toàn & bảo mật tuyệt đối
                        </div>
                    </div>
                </aside>
            </form>

        </section>
    );
}

function PaymentOption({
    checked,
    onChange,
    icon: Icon,
    title,
    description,
}: {
    checked: boolean;
    onChange: () => void;
    icon: typeof Truck;
    title: string;
    description: string;
}) {
    return (
        <label
            className={
                checked
                    ? "flex cursor-pointer gap-3.5 rounded-xl border-2 border-indigo-600 bg-indigo-50/50 p-4 transition"
                    : "flex cursor-pointer gap-3.5 rounded-xl border border-slate-200 p-4 transition hover:border-indigo-300"
            }
        >
            <input
                type="radio"
                checked={checked}
                onChange={onChange}
                className="mt-1 h-4 w-4 accent-indigo-600"
            />
            <Icon size={22} className="mt-0.5 shrink-0 text-indigo-600" />
            <div className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-slate-900">{title}</span>
                <span className="mt-0.5 block text-xs leading-5 text-slate-600">{description}</span>
            </div>
        </label>
    );
}
