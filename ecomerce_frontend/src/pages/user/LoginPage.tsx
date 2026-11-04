import { zodResolver } from "@hookform/resolvers/zod";
import { message } from "antd";
import { CheckCircle2, Eye, EyeOff, Lock, ShieldCheck, ShoppingBag, Sparkles, UserRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useLocation } from "react-router-dom";
import * as z from "zod";
import { useAuthStore } from "../../store/authStore";

const loginSchema = z.object({
    username: z.string().min(1, "Vui lòng nhập tên đăng nhập"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

type LoginForm = z.infer<typeof loginSchema>;

const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-sm font-medium outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100";

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const login = useAuthStore((state) => state.login);
    const [showPassword, setShowPassword] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginForm) => {
        try {
            // Kết nối với backend API thông qua authStore.login()
            await login(data);
            message.success("Đăng nhập thành công");
            const currentUser = useAuthStore.getState().user;

            const redirectPath =
                localStorage.getItem("redirectAfterLogin") ||
                (location.state as any)?.from?.pathname ||
                (currentUser?.role === "ADMIN" ? "/admin" : "/");

            localStorage.removeItem("redirectAfterLogin");
            navigate(redirectPath);
        } catch {
            message.error("Tên đăng nhập hoặc mật khẩu không chính xác");
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
                        <Sparkles size={14} /> Chào mừng bạn trở lại
                    </span>
                    <h1 className="max-w-md text-4xl font-black leading-tight text-white">
                        Mua sắm dễ dàng, bảo mật mỗi ngày.
                    </h1>
                    <p className="max-w-md text-sm leading-relaxed text-slate-300">
                        Đăng nhập để theo dõi trạng thái đơn hàng thời gian thực, lưu trữ sản phẩm yêu thích và nhận ưu đãi riêng cho bạn.
                    </p>

                    <div className="space-y-3 pt-2 text-xs text-slate-300">
                        <p className="flex items-center gap-2.5">
                            <CheckCircle2 size={16} className="text-emerald-400" />
                            <span>Bảo mật tài khoản với chuẩn mã hóa cao cấp</span>
                        </p>
                        <p className="flex items-center gap-2.5">
                            <CheckCircle2 size={16} className="text-emerald-400" />
                            <span>Quản lý lịch sử mua sắm và hóa đơn chi tiết</span>
                        </p>
                    </div>
                </div>

                <div className="relative z-10 flex items-center justify-between text-xs text-slate-500">
                    <p>© 2026 ShopNova</p>
                    <span className="flex items-center gap-1">
                        <ShieldCheck size={14} className="text-emerald-500" /> SSL 256-bit Secured
                    </span>
                </div>
            </aside>

            {/* Right Form */}
            <main className="flex items-center justify-center px-4 py-12 sm:px-6">
                <div className="w-full max-w-md rounded-3xl border border-slate-200/90 bg-white p-8 shadow-xl shadow-slate-200/50 sm:p-10">
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
                        Đăng nhập
                    </h2>
                    <p className="mt-1.5 text-xs text-slate-500">
                        Nhập thông tin tài khoản của bạn để tiếp tục trải nghiệm.
                    </p>

                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="mt-8 space-y-4"
                    >
                        <FormField
                            label="Tên đăng nhập"
                            error={errors.username?.message}
                            icon={<UserRound size={17} />}
                        >
                            <input
                                autoComplete="username"
                                {...register("username")}
                                placeholder="Nhập tên đăng nhập"
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
                                autoComplete="current-password"
                                {...register("password")}
                                placeholder="Nhập mật khẩu"
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

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="mt-2 w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập ngay"}
                        </button>
                    </form>

                    <div className="mt-8 border-t border-slate-100 pt-6 text-center text-xs text-slate-500">
                        Chưa có tài khoản ShopNova?{" "}
                        <Link
                            to="/register"
                            className="font-bold text-indigo-600 hover:text-indigo-800 transition underline underline-offset-2"
                        >
                            Đăng ký tài khoản mới
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
