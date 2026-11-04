import { zodResolver } from "@hookform/resolvers/zod";
import { message } from "antd";
import {
    Calendar,
    CheckCircle2,
    Eye,
    EyeOff,
    Lock,
    Mail,
    ShieldCheck,
    ShoppingBag,
    Sparkles,
    User,
    UserRound,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import * as z from "zod";
import { api } from "../../lib/axios";
import { normalizeDate } from "../../service/userService";

const schema = z.object({
    username: z.string().min(3, "Tên đăng nhập tối thiểu 3 ký tự"),
    fullName: z.string().min(2, "Vui lòng nhập họ tên"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
    dateOfBirth: z.string().min(1, "Vui lòng chọn ngày sinh"),
    gender: z.enum(["MALE", "FEMALE"]),
});

type RegisterForm = z.infer<typeof schema>;

const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-sm font-medium outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100";

export default function RegisterPage() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterForm>({
        resolver: zodResolver(schema),
        defaultValues: { gender: "MALE" },
    });

    const onSubmit = async (data: RegisterForm) => {
        try {
            // Kết nối với backend API đăng ký người dùng
            const res = await api.post("/auth/register", data);
            const userObj = res.data?.data?.user;
            const userInfoObj = res.data?.data?.userInformation;
            try {
                localStorage.setItem(
                    "currentUserProfile",
                    JSON.stringify({
                        id: userObj?.id ?? userInfoObj?.id ?? 0,
                        username: userObj?.username || data.username,
                        email: userObj?.email || data.email,
                        fullName: userInfoObj?.fullName || data.fullName,
                        avatarUrl: userInfoObj?.avatarUrl || null,
                        dateOfBirth: normalizeDate(
                            userInfoObj?.dateOfBirth || data.dateOfBirth,
                        ),
                        gender: userInfoObj?.gender || data.gender,
                        role: userObj?.role || "CUSTOMER",
                    }),
                );
            } catch {}
            message.success("Đăng ký thành công. Hãy đăng nhập.");
            navigate("/login");
        } catch (err: any) {
            const errMsg =
                err?.response?.data?.message ||
                "Không thể đăng ký. Email hoặc tên đăng nhập có thể đã tồn tại.";
            message.error(errMsg);
        }
    };

    return (
        <div className="grid min-h-screen bg-slate-50 lg:grid-cols-2">
            {/* Left Showcase Banner */}
            <aside className="relative hidden flex-col justify-between overflow-hidden bg-slate-950 p-12 text-white lg:flex">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,.35),_transparent_40%),radial-gradient(circle_at_bottom_left,_rgba(139,92,246,.2),_transparent_35%)]" />

                <div className="relative z-10">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2.5 text-2xl font-black tracking-tight"
                    >
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 shadow-md">
                            <ShoppingBag size={20} />
                        </span>
                        Shop<span className="text-indigo-400">Nova</span>
                    </Link>
                </div>

                <div className="relative z-10 space-y-6">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-bold text-indigo-300">
                        <Sparkles size={14} /> Gia nhập cộng đồng ShopNova
                    </span>
                    <h1 className="max-w-md text-4xl font-black leading-tight text-white">
                        Tạo tài khoản nhận ưu đãi độc quyền.
                    </h1>
                    <p className="max-w-md text-sm leading-relaxed text-slate-300">
                        Đăng ký thành viên chỉ trong 1 phút để tích điểm thưởng, lưu địa chỉ giao hàng và nhận mã giảm giá lên tới 50%.
                    </p>

                    <div className="space-y-3 pt-2 text-xs text-slate-300">
                        <p className="flex items-center gap-2.5">
                            <CheckCircle2 size={16} className="text-emerald-400" />
                            <span>Miễn phí vận chuyển cho đơn hàng đầu tiên</span>
                        </p>
                        <p className="flex items-center gap-2.5">
                            <CheckCircle2 size={16} className="text-emerald-400" />
                            <span>Nhận thông báo ưu đãi flash deal chớp nhoáng</span>
                        </p>
                    </div>
                </div>

                <div className="relative z-10 flex items-center justify-between text-xs text-slate-500">
                    <p>© 2026 ShopNova</p>
                    <span className="flex items-center gap-1">
                        <ShieldCheck size={14} className="text-emerald-500" /> An toàn & Bảo mật
                    </span>
                </div>
            </aside>

            {/* Right Form */}
            <main className="flex items-center justify-center px-4 py-12 sm:px-6">
                <div className="w-full max-w-lg rounded-3xl border border-slate-200/90 bg-white p-8 shadow-xl shadow-slate-200/50 sm:p-10">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-xl font-black text-slate-900 lg:hidden mb-6"
                    >
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
                            <ShoppingBag size={18} />
                        </span>
                        Shop<span className="text-indigo-600">Nova</span>
                    </Link>

                    <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">
                        Đăng ký tài khoản
                    </h2>
                    <p className="mt-1.5 text-xs text-slate-500">
                        Điền đầy đủ các thông tin bên dưới để bắt đầu.
                    </p>

                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="mt-8 space-y-4"
                    >
                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormField
                                label="Tên đăng nhập"
                                error={errors.username?.message}
                                icon={<UserRound size={17} />}
                            >
                                <input
                                    {...register("username")}
                                    placeholder="Tên tài khoản"
                                    className={inputClass}
                                />
                            </FormField>
                            <FormField
                                label="Họ và tên"
                                error={errors.fullName?.message}
                                icon={<User size={17} />}
                            >
                                <input
                                    {...register("fullName")}
                                    placeholder="Họ và tên bạn"
                                    className={inputClass}
                                />
                            </FormField>
                        </div>

                        <FormField
                            label="Địa chỉ Email"
                            error={errors.email?.message}
                            icon={<Mail size={17} />}
                        >
                            <input
                                type="email"
                                {...register("email")}
                                placeholder="name@example.com"
                                className={inputClass}
                            />
                        </FormField>

                        <FormField
                            label="Mật khẩu"
                            error={errors.password?.message}
                            icon={<Lock size={17} />}
                        >
                            <input
                                type={showPassword ? "text" : "password"}
                                {...register("password")}
                                placeholder="Tối thiểu 6 ký tự"
                                className={`${inputClass} pr-11`}
                            />
                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword((value) => !value)
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                            >
                                {showPassword ? (
                                    <EyeOff size={18} />
                                ) : (
                                    <Eye size={18} />
                                )}
                            </button>
                        </FormField>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormField
                                label="Ngày sinh"
                                error={errors.dateOfBirth?.message}
                                icon={<Calendar size={17} />}
                            >
                                <input
                                    type="date"
                                    {...register("dateOfBirth")}
                                    className={inputClass}
                                />
                            </FormField>
                            <FormField
                                label="Giới tính"
                                error={undefined}
                                icon={<User size={17} />}
                            >
                                <select
                                    {...register("gender")}
                                    className={`${inputClass} bg-white cursor-pointer`}
                                >
                                    <option value="MALE">Nam</option>
                                    <option value="FEMALE">Nữ</option>
                                </select>
                            </FormField>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="mt-2 w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Đang tạo tài khoản..." : "Tạo tài khoản ngay"}
                        </button>
                    </form>

                    <div className="mt-8 border-t border-slate-100 pt-6 text-center text-xs text-slate-500">
                        Đã có tài khoản ShopNova?{" "}
                        <Link
                            to="/login"
                            className="font-bold text-indigo-600 hover:text-indigo-800 transition underline underline-offset-2"
                        >
                            Đăng nhập ngay
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
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
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            {label}
            <span className="relative mt-1.5 block">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    {icon}
                </span>
                {children}
            </span>
            {error && (
                <span className="mt-1.5 block text-xs font-semibold text-rose-600">
                    {error}
                </span>
            )}
        </label>
    );
}
