import { Link } from "react-router-dom";
import { ShoppingBag, Sparkles, Truck, ShieldCheck, Headphones } from "lucide-react";

export default function HomePage() {
    return (
        <div className="space-y-12">
            {/* Hero Section */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600 px-8 py-16 text-white shadow-xl">
                <div className="relative z-10 mx-auto max-w-4xl text-center">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold backdrop-blur-sm">
                        <Sparkles size={16} />
                        <span>Chào mừng đến với ShopNova</span>
                    </div>
                    <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                        Mua sắm trực tuyến
                        <br />
                        <span className="text-indigo-200">tiện lợi & an toàn</span>
                    </h1>
                    <p className="mb-8 text-lg text-indigo-100">
                        Khám phá hàng ngàn sản phẩm chất lượng cao với giá ưu đãi nhất
                    </p>
                    <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                        <Link
                            to="/products"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-bold text-indigo-600 shadow-lg transition hover:bg-indigo-50"
                        >
                            <ShoppingBag size={20} />
                            Mua ngay
                        </Link>
                        <Link
                            to="/register"
                            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/30 px-8 py-3.5 text-base font-bold text-white backdrop-blur-sm transition hover:bg-white/10"
                        >
                            Đăng ký tài khoản
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                        <Truck size={24} />
                    </div>
                    <h3 className="mb-2 font-bold text-slate-900">Giao hàng miễn phí</h3>
                    <p className="text-sm text-slate-500">Đơn từ 500.000đ toàn quốc</p>
                </div>
                <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <ShieldCheck size={24} />
                    </div>
                    <h3 className="mb-2 font-bold text-slate-900">100% Chính hãng</h3>
                    <p className="text-sm text-slate-500">Cam kết nguồn gốc minh bạch</p>
                </div>
                <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                        <Sparkles size={24} />
                    </div>
                    <h3 className="mb-2 font-bold text-slate-900">Đổi trả 30 ngày</h3>
                    <p className="text-sm text-slate-500">Thủ tục nhanh, không rủi ro</p>
                </div>
                <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                        <Headphones size={24} />
                    </div>
                    <h3 className="mb-2 font-bold text-slate-900">Hỗ trợ 24/7</h3>
                    <p className="text-sm text-slate-500">Hotline & tư vấn tận tâm</p>
                </div>
            </section>

            {/* CTA */}
            <section className="rounded-3xl bg-slate-900 px-8 py-12 text-center text-white">
                <h2 className="mb-4 text-2xl font-bold">Bắt đầu mua sắm ngay hôm nay</h2>
                <p className="mb-6 text-slate-300">
                    Đăng ký tài khoản để nhận ưu đãi độc quyền và theo dõi đơn hàng dễ dàng
                </p>
                <Link
                    to="/products"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-base font-bold text-white shadow-lg transition hover:bg-indigo-500"
                >
                    Xem tất cả sản phẩm
                </Link>
            </section>
        </div>
    );
}
