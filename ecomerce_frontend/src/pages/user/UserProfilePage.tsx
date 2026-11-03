import { zodResolver } from "@hookform/resolvers/zod";
import { message, Popconfirm, Tabs } from "antd";
import {
    Calendar,
    Camera,
    CheckCircle2,
    Clock,
    CreditCard,
    Eye,
    EyeOff,
    Lock,
    Mail,
    MapPin,
    Package,
    Plus,
    Save,
    ShoppingBag,
    Trash2,
    Truck,
    User,
    UserRound,
    XCircle,
    ExternalLink,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router-dom";
import * as z from "zod";
import { useAuthStore } from "../../store/authStore";
import { userService, normalizeDate, type UserProfile } from "../../service/userService";
import { formatProductImageUrl } from "../../lib/image";
import { orderService } from "../../service/orderService";
import OrderDetailModal from "../../components/OrderDetailModal";
import type {
    OrderItemResponse,
    OrderResponse,
    OrderStatus,
    UserDeliveryResponse,
} from "../../types/order";

const profileSchema = z.object({
    fullName: z.string().trim().min(2, "Vui lòng nhập họ tên (tối thiểu 2 ký tự)"),
    email: z
        .string()
        .trim()
        .refine(
            (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
            "Email không hợp lệ"
        )
        .optional()
        .or(z.literal("")),
    dateOfBirth: z.string().optional().or(z.literal("")),
    gender: z.enum(["MALE", "FEMALE"]),
});

const passwordSchema = z
    .object({
        oldPassword: z.string().min(6, "Mật khẩu cũ tối thiểu 6 ký tự"),
        newPassword: z.string().min(6, "Mật khẩu mới tối thiểu 6 ký tự"),
        confirmPassword: z.string().min(6, "Vui lòng xác nhận mật khẩu"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Mật khẩu xác nhận không khớp",
        path: ["confirmPassword"],
    });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

const inputClass =
    "w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(price);

export default function UserProfilePage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get("tab") || "profile";

    const { loadCurrentUser } = useAuthStore();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string>("");

    // State cho tab Đơn hàng
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus | "ALL">("ALL");
    const [ordersPage, setOrdersPage] = useState(1);
    const [ordersPageSize] = useState(10);
    const [ordersTotalPages, setOrdersTotalPages] = useState(1);
    const [ordersTotalElements, setOrdersTotalElements] = useState(0);
    const [viewingOrder, setViewingOrder] = useState<OrderResponse | null>(null);

    // State cho tab Sổ địa chỉ
    const [deliveries, setDeliveries] = useState<UserDeliveryResponse[]>([]);
    const [deliveriesLoading, setDeliveriesLoading] = useState(false);
    const [newAddress, setNewAddress] = useState("");
    const [newPhone, setNewPhone] = useState("");
    const [addingDelivery, setAddingDelivery] = useState(false);

    const {
        register: registerProfile,
        handleSubmit: handleSubmitProfile,
        formState: { errors: profileErrors, isSubmitting: isSubmittingProfile },
        reset: resetProfile,
    } = useForm<ProfileForm>({
        resolver: zodResolver(profileSchema),
        values: profile
            ? {
                  fullName: profile.fullName || "",
                  email: profile.email || "",
                  dateOfBirth: normalizeDate(profile.dateOfBirth),
                  gender: (profile.gender as "MALE" | "FEMALE") || "MALE",
              }
            : undefined,
    });

    const {
        register: registerPassword,
        handleSubmit: handleSubmitPassword,
        formState: { errors: passwordErrors, isSubmitting: isSubmittingPassword },
        reset: resetPassword,
    } = useForm<PasswordForm>({
        resolver: zodResolver(passwordSchema),
    });

    useEffect(() => {
        loadProfile();
    }, []);

    useEffect(() => {
        if (profile) {
            resetProfile({
                fullName: profile.fullName || "",
                email: profile.email || "",
                dateOfBirth: normalizeDate(profile.dateOfBirth),
                gender: (profile.gender as "MALE" | "FEMALE") || "MALE",
            });
        }
    }, [profile, resetProfile]);

    useEffect(() => {
        if (activeTab === "orders") {
            loadOrders();
        } else if (activeTab === "deliveries") {
            loadDeliveries();
        }

        let timer: any;
        const handleSync = () => {
            if (activeTab === "orders") {
                clearTimeout(timer);
                timer = setTimeout(() => {
                    void loadOrders();
                }, 300);
            }
        };

        window.addEventListener("order_status_changed", handleSync);
        window.addEventListener("storage", handleSync);
        return () => {
            clearTimeout(timer);
            window.removeEventListener("order_status_changed", handleSync);
            window.removeEventListener("storage", handleSync);
        };
    }, [activeTab, orderStatusFilter, ordersPage]);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const data = await userService.getCurrentUser();
            setProfile(data);
            resetProfile({
                fullName: data.fullName || "",
                email: data.email || "",
                dateOfBirth: normalizeDate(data.dateOfBirth),
                gender: (data.gender as "MALE" | "FEMALE") || "MALE",
            });
            if (data.avatarUrl) {
                setAvatarPreview(formatProductImageUrl(data.avatarUrl));
            }
        } catch (err) {
            console.error("Lỗi khi tải thông tin người dùng:", err);
            message.error("Không thể tải thông tin người dùng");
        } finally {
            setLoading(false);
        }
    };

    const loadOrders = async () => {
        try {
            setOrdersLoading(true);
            const statusParam = orderStatusFilter === "ALL" ? undefined : orderStatusFilter;
            const res = await orderService.getMyOrders(ordersPage, ordersPageSize, statusParam);
            setOrders(res.content || []);
            setOrdersTotalPages(res.totalPages || 1);
            setOrdersTotalElements(res.totalElements ?? (res.content?.length || 0));
        } catch (err) {
            console.error("Lỗi tải đơn hàng:", err);
            message.error("Không thể tải danh sách đơn hàng của bạn");
        } finally {
            setOrdersLoading(false);
        }
    };

    const loadDeliveries = async () => {
        try {
            setDeliveriesLoading(true);
            const data = await orderService.getDeliveries(1, 20);
            setDeliveries(data || []);
        } catch (err) {
            console.error("Lỗi tải sổ địa chỉ:", err);
        } finally {
            setDeliveriesLoading(false);
        }
    };

    const handleCancelOrder = async (orderId: number) => {
        try {
            await orderService.cancelOrder(orderId);
            message.success("Hủy đơn hàng thành công!");
            await loadOrders();
            if (viewingOrder && viewingOrder.id === orderId) {
                setViewingOrder({
                    ...viewingOrder,
                    orderStatus: "CANCELLED",
                });
            }
        } catch (err: any) {
            const errMsg = err?.response?.data?.message || err?.message || "Không thể hủy đơn hàng";
            message.error(errMsg);
        }
    };

    const handleAddDelivery = async (e: React.FormEvent) => {
        e.preventDefault();
        const cleanAddress = newAddress.trim();
        const cleanPhone = newPhone.trim();

        if (!/^\d{10}$/.test(cleanPhone)) {
            message.error("Số điện thoại phải có đúng 10 chữ số!");
            return;
        }

        if (cleanAddress.length < 5) {
            message.error("Vui lòng nhập địa chỉ cụ thể và hợp lệ!");
            return;
        }

        try {
            setAddingDelivery(true);
            await orderService.createDelivery({ address: cleanAddress, phoneNumber: cleanPhone });
            message.success("Thêm địa chỉ nhận hàng thành công!");
            setNewAddress("");
            setNewPhone("");
            await loadDeliveries();
        } catch (err: any) {
            message.error(err?.response?.data?.message || "Lỗi khi lưu địa chỉ mới");
        } finally {
            setAddingDelivery(false);
        }
    };

    const handleDeleteDelivery = async (delivery: UserDeliveryResponse) => {
        try {
            await orderService.deleteDeliveryAddress({
                address: delivery.address,
                phoneNumber: delivery.phoneNumber,
            });
            message.success("Đã xóa địa chỉ nhận hàng thành công!");
            await loadDeliveries();
        } catch (err: any) {
            message.error("Không thể xóa địa chỉ nhận hàng này");
        }
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                message.error("Vui lòng chọn file hình ảnh hợp lệ (JPG, PNG, WEBP, GIF)");
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                message.error("Kích thước ảnh tối đa là 5MB");
                return;
            }
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const onSubmitProfile = async (data: ProfileForm) => {
        try {
            const formData = new FormData();
            formData.append("fullName", data.fullName.trim());
            if (data.email && data.email.trim()) {
                formData.append("email", data.email.trim());
            }
            if (data.dateOfBirth && data.dateOfBirth.trim()) {
                formData.append("dateOfBirth", normalizeDate(data.dateOfBirth.trim()));
            }
            if (data.gender) {
                formData.append("gender", data.gender);
            }
            if (avatarFile) {
                formData.append("avatarUrl", avatarFile);
            }

            const updated = await userService.updateProfile(formData);
            message.success("Cập nhật thông tin thành công");
            setProfile(updated);
            if (updated.avatarUrl) {
                setAvatarPreview(formatProductImageUrl(updated.avatarUrl));
            }
            setAvatarFile(null);

            useAuthStore.setState((prev) => ({
                user: prev.user
                    ? {
                          ...prev.user,
                          fullName: updated.fullName,
                          avatarUrl: updated.avatarUrl,
                          dateOfBirth: updated.dateOfBirth,
                          email: updated.email,
                      }
                    : null,
            }));
            await loadCurrentUser();

            resetProfile({
                fullName: updated.fullName,
                email: updated.email,
                dateOfBirth: normalizeDate(updated.dateOfBirth),
                gender: (updated.gender as "MALE" | "FEMALE") || "MALE",
            });
        } catch (err: any) {
            console.error("Lỗi cập nhật thông tin:", err);
            const errMsg =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                "Không thể cập nhật thông tin";
            message.error(errMsg);
        }
    };

    const onSubmitPassword = async (data: PasswordForm) => {
        try {
            await userService.changePassword({
                oldPassword: data.oldPassword,
                newPassword: data.newPassword,
            });
            message.success("Đổi mật khẩu thành công");
            resetPassword();
        } catch (err: any) {
            const errMsg = err?.response?.data?.message || err?.message || "Mật khẩu cũ không đúng";
            message.error(errMsg);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="flex items-center gap-2 text-base font-semibold text-slate-600">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                    Đang tải thông tin tài khoản...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 p-4 md:p-8">
            <div className="mx-auto max-w-5xl">
                <h1 className="mb-8 text-3xl font-black text-slate-900">Quản lý tài khoản</h1>

                <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
                    {/* Phần Header Avatar */}
                    <div className="mb-8 flex flex-col items-center gap-4 border-b border-slate-100 pb-8 sm:flex-row sm:items-center">
                        <div className="relative">
                            <div className="h-28 w-28 overflow-hidden rounded-full border-2 border-slate-200 bg-slate-200">
                                {avatarPreview ? (
                                    <img
                                        src={formatProductImageUrl(avatarPreview)}
                                        alt="Avatar"
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            const target = e.currentTarget;
                                            target.onerror = null;
                                            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.fullName || "User")}&background=4f46e5&color=fff&bold=true`;
                                        }}
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-slate-400">
                                        <UserRound size={56} />
                                    </div>
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-indigo-600 p-2 text-white shadow-md transition hover:bg-indigo-700">
                                <Camera size={15} />
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarChange}
                                />
                            </label>
                        </div>
                        <div className="text-center sm:text-left">
                            <h2 className="text-2xl font-black text-slate-900">{profile?.fullName || profile?.username}</h2>
                            <p className="text-sm text-slate-500">{profile?.email || profile?.username}</p>
                            <span className="mt-2 inline-block rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                                {profile?.role === "ADMIN" ? "Quản trị viên" : "Khách hàng thân thiết"}
                            </span>
                        </div>
                    </div>

                    <Tabs
                        activeKey={activeTab}
                        onChange={(key) => setSearchParams({ tab: key })}
                        items={[
                            {
                                key: "profile",
                                label: (
                                    <span className="flex items-center gap-2 font-bold">
                                        <User size={16} /> Thông tin cá nhân
                                    </span>
                                ),
                                children: (
                                    <form
                                        onSubmit={handleSubmitProfile(onSubmitProfile)}
                                        className="mt-4 space-y-6"
                                    >
                                        <div className="grid gap-6 md:grid-cols-2">
                                            <FormField
                                                label="Tên đăng nhập"
                                                icon={<UserRound size={18} />}
                                            >
                                                <input
                                                    value={profile?.username}
                                                    disabled
                                                    className={`${inputClass} bg-slate-100 text-slate-500`}
                                                />
                                            </FormField>
                                            <FormField
                                                label="Họ và tên"
                                                error={profileErrors.fullName?.message}
                                                icon={<User size={18} />}
                                            >
                                                <input
                                                    {...registerProfile("fullName")}
                                                    placeholder="Nhập họ và tên"
                                                    className={inputClass}
                                                />
                                            </FormField>
                                            <FormField
                                                label="Email"
                                                error={profileErrors.email?.message}
                                                icon={<Mail size={18} />}
                                            >
                                                <input
                                                    {...registerProfile("email")}
                                                    placeholder="Nhập email"
                                                    className={inputClass}
                                                />
                                            </FormField>
                                            <FormField
                                                label="Ngày sinh"
                                                error={profileErrors.dateOfBirth?.message}
                                                icon={<Calendar size={18} />}
                                            >
                                                <input
                                                    type="date"
                                                    {...registerProfile("dateOfBirth")}
                                                    className={inputClass}
                                                />
                                            </FormField>
                                            <FormField
                                                label="Giới tính"
                                                icon={<User size={18} />}
                                            >
                                                <select
                                                    {...registerProfile("gender")}
                                                    className={`${inputClass} bg-white`}
                                                >
                                                    <option value="MALE">Nam</option>
                                                    <option value="FEMALE">Nữ</option>
                                                </select>
                                            </FormField>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isSubmittingProfile}
                                            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white shadow-md shadow-indigo-100 transition hover:bg-indigo-700 disabled:opacity-70"
                                        >
                                            <Save size={18} />
                                            {isSubmittingProfile ? "Đang lưu..." : "Lưu thay đổi"}
                                        </button>
                                    </form>
                                ),
                            },
                            {
                                key: "orders",
                                label: (
                                    <span className="flex items-center gap-2 font-bold">
                                        <ShoppingBag size={16} /> Đơn hàng của tôi
                                    </span>
                                ),
                                children: (
                                    <div className="mt-4 space-y-6">
                                        {/* Banner điều hướng tới trang lịch sử đơn hàng chuyên biệt */}
                                        <div className="flex flex-col gap-3 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <p className="text-sm font-black text-indigo-950">
                                                    Trang quản lý đơn hàng chuyên biệt
                                                </p>
                                                <p className="mt-0.5 text-xs text-indigo-700">
                                                    Xem lịch sử, chi tiết từng sản phẩm và theo dõi đơn hàng toàn màn hình
                                                </p>
                                            </div>
                                            <Link
                                                to="/orders"
                                                className="inline-flex w-fit items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700"
                                            >
                                                Mở trang đơn hàng <ExternalLink size={14} />
                                            </Link>
                                        </div>

                                        {/* Bộ lọc trạng thái đơn hàng */}
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
                                                        setOrderStatusFilter(f.value as OrderStatus | "ALL");
                                                        setOrdersPage(1);
                                                    }}
                                                    className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                                                        orderStatusFilter === f.value
                                                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                    }`}
                                                >
                                                    {f.label}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Danh sách đơn hàng */}
                                        {ordersLoading ? (
                                            <div className="py-12 text-center text-slate-500">
                                                <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                                                <p className="mt-2 text-sm">Đang tải danh sách đơn hàng...</p>
                                            </div>
                                        ) : orders.length === 0 ? (
                                            <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center">
                                                <Package className="mx-auto text-slate-400" size={36} />
                                                <p className="mt-3 text-base font-bold text-slate-800">
                                                    Không có đơn hàng nào
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {orderStatusFilter === "ALL"
                                                        ? "Bạn chưa thực hiện đơn đặt hàng nào."
                                                        : "Không tìm thấy đơn hàng với trạng thái này."}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {orders.map((ord) => (
                                                    <div
                                                        key={ord.id}
                                                        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-indigo-200"
                                                    >
                                                        <div className="flex flex-wrap items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-3.5 text-xs text-slate-600">
                                                            <div className="flex items-center gap-3">
                                                                <span className="font-mono text-sm font-bold text-indigo-700">
                                                                    #{ord.id}
                                                                </span>
                                                                <span className="text-slate-400">•</span>
                                                                <span className="flex items-center gap-1 font-semibold">
                                                                    {ord.paymentMethod === "CREDIT_CARD" ? (
                                                                        <>
                                                                            <CreditCard size={14} className="text-indigo-600" />
                                                                            Thẻ thanh toán
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Truck size={14} className="text-indigo-600" />
                                                                            COD (Tiền mặt)
                                                                        </>
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <OrderStatusBadge status={ord.orderStatus} />
                                                        </div>

                                                        <div className="p-5">
                                                            <div className="grid gap-4 sm:grid-cols-2">
                                                                <div>
                                                                    <p className="text-xs font-semibold text-slate-500">
                                                                        Địa chỉ nhận hàng:
                                                                    </p>
                                                                    <p className="mt-1 text-sm font-bold text-slate-800">
                                                                        {ord.delivery?.address || "Chưa có địa chỉ"}
                                                                    </p>
                                                                    {ord.delivery?.phoneNumber && (
                                                                        <p className="mt-0.5 text-xs text-slate-500">
                                                                            SĐT: {ord.delivery.phoneNumber}
                                                                        </p>
                                                                    )}
                                                                    {ord.note && (
                                                                        <p className="mt-2 text-xs italic text-slate-500">
                                                                            Ghi chú: "{ord.note}"
                                                                        </p>
                                                                    )}
                                                                </div>

                                                                <div className="sm:text-right">
                                                                    <p className="text-xs font-semibold text-slate-500">
                                                                        Tổng tiền thanh toán:
                                                                    </p>
                                                                    <p className="mt-1 text-xl font-black text-indigo-700">
                                                                        {formatPrice(ord.finalAmount)}
                                                                    </p>
                                                                    <span className="mt-1 inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                                                                        {ord.paymentStatus === "COMPLETED"
                                                                            ? "Đã thanh toán"
                                                                            : "Chưa thanh toán"}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* Danh sách sản phẩm trong đơn */}
                                                            <OrderItemsPreview order={ord} />

                                                            <div className="mt-4 flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-3.5">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setViewingOrder(ord)}
                                                                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 hover:text-indigo-600"
                                                                >
                                                                    <Eye size={14} />
                                                                    Xem chi tiết đơn hàng
                                                                </button>

                                                                {ord.orderStatus === "PENDING" && (
                                                                    <Popconfirm
                                                                        title="Hủy đơn hàng"
                                                                        description="Bạn có chắc chắn muốn hủy đơn hàng này không? Số lượng sản phẩm sẽ được hoàn về tồn kho."
                                                                        onConfirm={() => handleCancelOrder(ord.id)}
                                                                        okText="Đồng ý hủy"
                                                                        cancelText="Không"
                                                                        okButtonProps={{ danger: true }}
                                                                    >
                                                                        <button
                                                                            type="button"
                                                                            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-100"
                                                                        >
                                                                            Hủy đơn
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
                                        {ordersTotalPages > 1 && (
                                            <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-5 sm:flex-row">
                                                <p className="text-sm text-slate-500">
                                                    Hiển thị trang <span className="font-bold text-slate-800">{ordersPage}</span> / <span className="font-bold text-slate-800">{ordersTotalPages}</span> (Tổng cộng <span className="font-bold text-slate-800">{ordersTotalElements}</span> đơn hàng)
                                                </p>
                                                <div className="flex items-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        disabled={ordersPage <= 1 || ordersLoading}
                                                        onClick={() => setOrdersPage((p) => Math.max(1, p - 1))}
                                                        className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                                    >
                                                        Trang trước
                                                    </button>
                                                    {Array.from({ length: ordersTotalPages }, (_, i) => i + 1)
                                                        .filter((p) => p === 1 || p === ordersTotalPages || Math.abs(p - ordersPage) <= 1)
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
                                                                    onClick={() => setOrdersPage(item)}
                                                                    className={`h-8 min-w-8 rounded-lg px-2 text-xs font-bold transition ${
                                                                        ordersPage === item
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
                                                        disabled={ordersPage >= ordersTotalPages || ordersLoading}
                                                        onClick={() => setOrdersPage((p) => p + 1)}
                                                        className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                                    >
                                                        Trang sau
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ),
                            },
                            {
                                key: "deliveries",
                                label: (
                                    <span className="flex items-center gap-2 font-bold">
                                        <MapPin size={16} /> Sổ địa chỉ
                                    </span>
                                ),
                                children: (
                                    <div className="mt-4 space-y-6">
                                        {/* Form thêm địa chỉ mới */}
                                        <form
                                            onSubmit={handleAddDelivery}
                                            className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 sm:p-6"
                                        >
                                            <h3 className="flex items-center gap-2 text-sm font-black text-slate-900">
                                                <Plus size={16} className="text-indigo-600" />
                                                Thêm địa chỉ nhận hàng mới
                                            </h3>
                                            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                                <label className="text-xs font-bold text-slate-700">
                                                    Số điện thoại <span className="text-rose-500">*</span>
                                                    <input
                                                        required
                                                        maxLength={10}
                                                        value={newPhone}
                                                        onChange={(e) =>
                                                            setNewPhone(e.target.value.replace(/\D/g, ""))
                                                        }
                                                        placeholder="09xx xxx xxx (10 số)"
                                                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
                                                    />
                                                </label>
                                                <label className="text-xs font-bold text-slate-700 sm:col-span-2">
                                                    Địa chỉ giao hàng chi tiết <span className="text-rose-500">*</span>
                                                    <textarea
                                                        required
                                                        rows={2}
                                                        value={newAddress}
                                                        onChange={(e) => setNewAddress(e.target.value)}
                                                        placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành..."
                                                        className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
                                                    />
                                                </label>
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={addingDelivery}
                                                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-70"
                                            >
                                                {addingDelivery ? "Đang lưu..." : "Lưu địa chỉ"}
                                            </button>
                                        </form>

                                        {/* Danh sách các địa chỉ hiện có */}
                                        <div>
                                            <h3 className="text-sm font-black text-slate-900">
                                                Địa chỉ đã lưu ({deliveries.length})
                                            </h3>
                                            {deliveriesLoading ? (
                                                <div className="py-8 text-center text-sm text-slate-500">
                                                    Đang tải sổ địa chỉ...
                                                </div>
                                            ) : deliveries.length === 0 ? (
                                                <p className="mt-3 text-xs text-slate-500">
                                                    Bạn chưa có địa chỉ nhận hàng nào. Hãy thêm địa chỉ đầu tiên ở form trên!
                                                </p>
                                            ) : (
                                                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                                    {deliveries.map((deliv, index) => (
                                                        <div
                                                            key={index}
                                                            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2 text-xs font-bold text-indigo-700">
                                                                    <MapPin size={15} />
                                                                    <span>Địa chỉ #{index + 1}</span>
                                                                </div>
                                                                <Popconfirm
                                                                    title="Xóa địa chỉ này?"
                                                                    description="Địa chỉ này sẽ được xóa khỏi danh sách nhận hàng của bạn."
                                                                    onConfirm={() => handleDeleteDelivery(deliv)}
                                                                    okText="Xóa"
                                                                    cancelText="Hủy"
                                                                    okButtonProps={{ danger: true }}
                                                                >
                                                                    <button
                                                                        type="button"
                                                                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-rose-500 transition hover:bg-rose-50 hover:text-rose-700"
                                                                        title="Xóa địa chỉ này"
                                                                    >
                                                                        <Trash2 size={13} />
                                                                        <span>Xóa</span>
                                                                    </button>
                                                                </Popconfirm>
                                                            </div>
                                                            <p className="mt-2 text-sm font-semibold text-slate-800">
                                                                {deliv.address}
                                                            </p>
                                                            <p className="mt-1 text-xs text-slate-500">
                                                                Số điện thoại:{" "}
                                                                <span className="font-bold text-slate-700">
                                                                    {deliv.phoneNumber}
                                                                </span>
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ),
                            },
                            {
                                key: "password",
                                label: (
                                    <span className="flex items-center gap-2 font-bold">
                                        <Lock size={16} /> Đổi mật khẩu
                                    </span>
                                ),
                                children: (
                                    <form
                                        onSubmit={handleSubmitPassword(onSubmitPassword)}
                                        className="mt-4 max-w-md space-y-6"
                                    >
                                        <FormField
                                            label="Mật khẩu cũ"
                                            error={passwordErrors.oldPassword?.message}
                                            icon={<Lock size={18} />}
                                        >
                                            <input
                                                type={showOldPassword ? "text" : "password"}
                                                {...registerPassword("oldPassword")}
                                                placeholder="Nhập mật khẩu cũ"
                                                className={`${inputClass} pr-11`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowOldPassword((v) => !v)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                            >
                                                {showOldPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                                            </button>
                                        </FormField>
                                        <FormField
                                            label="Mật khẩu mới"
                                            error={passwordErrors.newPassword?.message}
                                            icon={<Lock size={18} />}
                                        >
                                            <input
                                                type={showNewPassword ? "text" : "password"}
                                                {...registerPassword("newPassword")}
                                                placeholder="Nhập mật khẩu mới"
                                                className={`${inputClass} pr-11`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword((v) => !v)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                            >
                                                {showNewPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                                            </button>
                                        </FormField>
                                        <FormField
                                            label="Xác nhận mật khẩu mới"
                                            error={passwordErrors.confirmPassword?.message}
                                            icon={<Lock size={18} />}
                                        >
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                {...registerPassword("confirmPassword")}
                                                placeholder="Nhập lại mật khẩu mới"
                                                className={`${inputClass} pr-11`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword((v) => !v)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                            >
                                                {showConfirmPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                                            </button>
                                        </FormField>
                                        <button
                                            type="submit"
                                            disabled={isSubmittingPassword}
                                            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white shadow-md shadow-indigo-100 transition hover:bg-indigo-700 disabled:opacity-70"
                                        >
                                            <Lock size={18} />
                                            {isSubmittingPassword ? "Đang đổi..." : "Đổi mật khẩu"}
                                        </button>
                                    </form>
                                ),
                            },
                        ]}
                    />
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
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                    <Clock size={13} /> Chờ xác nhận
                </span>
            );
        case "SHIPPED":
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                    <Truck size={13} /> Đang giao hàng
                </span>
            );
        case "DELIVERED":
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                    <CheckCircle2 size={13} /> Đã giao hàng
                </span>
            );
        case "CANCELLED":
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700">
                    <XCircle size={13} /> Đã hủy
                </span>
            );
        default:
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                    {status}
                </span>
            );
    }
}

function FormField({
    label,
    error,
    icon,
    children,
}: {
    label: string;
    error?: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <label className="block text-sm font-semibold text-slate-700">
            {label}
            <span className="relative mt-1.5 block">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {icon}
                </span>
                {children}
            </span>
            {error && (
                <span className="mt-1 block text-xs font-normal text-rose-600">
                    {error}
                </span>
            )}
        </label>
    );
}

function OrderItemsPreview({ order }: { order: OrderResponse }) {
    const [previewItems, setPreviewItems] = useState<OrderItemResponse[]>([]);

    useEffect(() => {
        let isMounted = true;
        orderService.getOrderDetail(order.id, order).then((items) => {
            if (isMounted) setPreviewItems(items || []);
        });
        return () => {
            isMounted = false;
        };
    }, [order.id, order.totalAmount, order.finalAmount]);

    if (!previewItems || previewItems.length === 0) return null;

    return (
        <div className="mt-3 border-t border-slate-100 pt-3">
            <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Sản phẩm ({previewItems.reduce((s, i) => s + (i.quantity || 1), 0)}):
            </span>
            <div className="flex flex-wrap gap-2">
                {previewItems.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 p-1.5 pr-2.5"
                    >
                        <img
                            src={formatProductImageUrl(
                                item.product?.thumbnailUrl,
                                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80"
                            )}
                            alt={item.product?.name}
                            className="h-10 w-10 rounded-lg border border-slate-200 bg-white object-cover shrink-0"
                            onError={(e) => {
                                const target = e.currentTarget;
                                if (!target.src.includes("unsplash.com")) {
                                    target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80";
                                }
                            }}
                        />
                        <div className="text-xs min-w-0">
                            <p className="max-w-[180px] truncate font-bold text-slate-800">
                                {item.product?.name}
                            </p>
                            <p className="text-[11px] text-slate-500">
                                {formatPrice(item.unitPrice)} ×{" "}
                                <span className="font-bold text-slate-700">{item.quantity}</span>
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
