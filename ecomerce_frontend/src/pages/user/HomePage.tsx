import {
    ArrowRight,
    ChevronRight,
    Compass,
    Flame,
    Layers,
    Percent,
    Search,
    Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../../components/ProductCard";
import { catalogService } from "../../service/catalogService";
import type { Category, ProductSummary } from "../../types/catalog";

export default function HomePage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [featuredProducts, setFeaturedProducts] = useState<ProductSummary[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);

    useEffect(() => {
        // Fetch categories
        catalogService
            .getCategories()
            .then((res) => setCategories(res))
            .catch(() => undefined);

        // Fetch featured products (latest)
        setLoadingProducts(true);
        catalogService
            .getProducts({ size: 8, sortBy: "createdAt", sortDir: "desc" })
            .then((latestRes) => {
                setFeaturedProducts(latestRes?.content || []);
            })
            .catch(() => undefined)
            .finally(() => setLoadingProducts(false));
    }, []);

    return (
        <div className="space-y-16 pb-12">
            {/* HERO SECTION */}
            <section className="relative overflow-hidden bg-slate-950 text-white">
                {/* Background ambient lighting */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,.4),_transparent_40%),radial-gradient(circle_at_bottom_left,_rgba(139,92,246,.25),_transparent_35%)]" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/60 to-slate-950" />

                <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:py-24">
                    {/* Left text column */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-bold text-indigo-200 backdrop-blur-sm">
                            <Sparkles size={14} className="text-amber-300" />
                            <span>Khám phá bộ sưu tập chất lượng 2026</span>
                        </div>

                        <h1 className="text-4xl font-black tracking-tight leading-[1.15] sm:text-5xl lg:text-6xl text-white">
                            Mua sắm thông minh, <br />
                            <span className="bg-gradient-to-r from-indigo-300 via-indigo-200 to-violet-300 bg-clip-text text-transparent">
                                trải nghiệm vượt trội.
                            </span>
                        </h1>

                        <p className="max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
                            ShopNova mang tới hàng ngàn sản phẩm chính hãng với mức giá minh bạch, tồn kho tức thì và dịch vụ chăm sóc khách hàng 24/7.
                        </p>

                        <div className="flex flex-wrap items-center gap-3 pt-2">
                            <Link
                                to="/products"
                                className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition hover:-translate-y-0.5 hover:from-indigo-600 hover:to-indigo-700 focus:outline-none"
                            >
                                Khám phá ngay <ArrowRight size={17} />
                            </Link>
                            <Link
                                to="/products?sortBy=createdAt"
                                className="rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-xs transition hover:bg-white/10 hover:border-white/40"
                            >
                                Hàng mới cập bến
                            </Link>
                        </div>

                        {/* Trust highlights */}
                        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80">
                            <div>
                                <p className="text-2xl font-black text-indigo-300">10k+</p>
                                <p className="text-xs text-slate-400">Khách hàng tin chọn</p>
                            </div>
                            <div>
                                <p className="text-2xl font-black text-indigo-300">100%</p>
                                <p className="text-xs text-slate-400">Cam kết chính hãng</p>
                            </div>
                            <div>
                                <p className="text-2xl font-black text-indigo-300">24h</p>
                                <p className="text-xs text-slate-400">Giao hàng siêu tốc</p>
                            </div>
                        </div>
                    </div>

                    {/* Right interactive card preview */}
                    <div className="relative mx-auto w-full max-w-md lg:col-span-5">
                        <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-indigo-500/20 to-violet-500/30 blur-2xl" />
                        <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
                            {/* Card badge */}
                            <div className="flex items-center justify-between pb-4 border-b border-white/10">
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300">
                                    <Flame size={15} /> Bán chạy tuần này
                                </span>
                                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                                    Flash Deal
                                </span>
                            </div>

                            {/* Quick search promo card */}
                            <div className="mt-5 rounded-2xl bg-white p-5 text-slate-900 shadow-xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                                            ShopNova Express
                                        </p>
                                        <p className="text-base font-extrabold text-slate-900 mt-0.5">
                                            Tìm kiếm & Lọc siêu nhanh
                                        </p>
                                    </div>
                                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                        <Search size={18} />
                                    </span>
                                </div>

                                <div className="mt-4 space-y-2">
                                    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 text-xs">
                                        <span className="font-semibold text-slate-600">Bộ lọc danh mục</span>
                                        <span className="font-bold text-indigo-600">Đầy đủ & Trực quan</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 text-xs">
                                        <span className="font-semibold text-slate-600">Cập nhật kho</span>
                                        <span className="font-bold text-emerald-600">Thời gian thực</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 text-xs">
                                        <span className="font-semibold text-slate-600">Thanh toán</span>
                                        <span className="font-bold text-slate-800">Bảo mật mã hóa</span>
                                    </div>
                                </div>

                                <Link
                                    to="/products"
                                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-600"
                                >
                                    Xem kho hàng hôm nay <ChevronRight size={14} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CATEGORIES SECTION */}
            <section className="mx-auto max-w-7xl px-4 sm:px-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end mb-8">
                    <div>
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-indigo-600">
                            <Layers size={14} />
                            <span>Ngành hàng nổi bật</span>
                        </div>
                        <h2 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
                            Khám phá theo danh mục
                        </h2>
                    </div>
                    <Link
                        to="/products"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700"
                    >
                        Tất cả danh mục <ChevronRight size={15} />
                    </Link>
                </div>

                {categories.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                        {categories.map((cat) => (
                            <Link
                                key={cat.id}
                                to={`/products?categoryId=${cat.id}`}
                                className="group relative flex flex-col items-center justify-center rounded-2xl border border-slate-200/90 bg-white p-5 text-center shadow-xs transition duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/10"
                            >
                                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50/80 text-indigo-600 transition group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white">
                                    <Compass size={24} />
                                </span>
                                <h3 className="mt-3.5 text-sm font-bold text-slate-800 transition group-hover:text-indigo-600 line-clamp-1">
                                    {cat.name}
                                </h3>
                                <p className="mt-1 text-[11px] text-slate-400 line-clamp-1">
                                    {cat.description || "Xem sản phẩm"}
                                </p>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="h-28 rounded-2xl border border-slate-100 bg-white p-4 animate-pulse"
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* FEATURED PRODUCTS SECTION */}
            <section className="mx-auto max-w-7xl px-4 sm:px-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end mb-8">
                    <div>
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-indigo-600">
                            <Sparkles size={14} className="text-amber-500" />
                            <span>Gợi ý cho bạn</span>
                        </div>
                        <h2 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
                            Sản phẩm nổi bật mới nhất
                        </h2>
                    </div>
                    <Link
                        to="/products"
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-800 transition hover:bg-indigo-600 hover:text-white"
                    >
                        Xem tất cả sản phẩm <ArrowRight size={14} />
                    </Link>
                </div>

                {loadingProducts ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div
                                key={i}
                                className="h-80 rounded-2xl border border-slate-100 bg-white p-4 animate-pulse"
                            >
                                <div className="aspect-square rounded-xl bg-slate-100" />
                                <div className="mt-4 h-4 w-2/3 rounded bg-slate-100" />
                                <div className="mt-2 h-4 w-1/3 rounded bg-slate-100" />
                            </div>
                        ))}
                    </div>
                ) : featuredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {featuredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-500">
                        Chưa có sản phẩm nào. Hãy kiểm tra lại sau!
                    </div>
                )}
            </section>

            {/* PROMOTIONAL VALUE BANNER */}
            <section className="mx-auto max-w-7xl px-4 sm:px-6">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 p-8 sm:p-12 text-white shadow-xl">
                    <div className="absolute right-0 top-0 -mt-10 -mr-10 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
                    <div className="relative z-10 max-w-2xl space-y-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/30 px-3.5 py-1 text-xs font-bold text-indigo-200">
                            <Percent size={14} /> Ưu đãi đặc quyền
                        </span>
                        <h2 className="text-3xl font-black sm:text-4xl">
                            Miễn phí giao hàng cho mọi đơn từ 500k
                        </h2>
                        <p className="text-sm leading-relaxed text-indigo-100 sm:text-base">
                            Đăng ký tài khoản ngay hôm nay để nhận thông báo khuyến mãi độc quyền, quản lý đơn hàng thông minh và tích điểm thưởng.
                        </p>
                        <div className="pt-2">
                            <Link
                                to="/register"
                                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-slate-900 shadow-md transition hover:bg-indigo-50 focus:outline-none"
                            >
                                Đăng ký thành viên ngay <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
