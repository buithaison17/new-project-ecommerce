import {
    ArrowRight,
    Baby,
    BookOpen,
    Camera,
    ChevronRight,
    Compass,
    Dumbbell,
    Flame,
    Gamepad2,
    Headphones,
    Home as HomeIcon,
    Laptop,
    Layers,
    Percent,
    ShieldCheck,
    Shirt,
    Smartphone,
    Sparkles,
    Timer,
    Utensils,
    Watch,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import FlashSaleCard from "../../components/FlashSaleCard";
import ProductCard from "../../components/ProductCard";
import { formatProductImageUrl } from "../../lib/image";
import { catalogService } from "../../service/catalogService";
import { useAuthStore } from "../../store/authStore";
import { useFlashSaleStore } from "../../store/flashSaleStore";
import type { Category, FlashSaleProduct, ProductSummary } from "../../types/catalog";

const pad = (n: number) => String(n).padStart(2, "0");

const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(price);

function getCategoryIcon(name: string) {
    const normalized = name.toLowerCase();
    if (normalized.includes("điện thoại") || normalized.includes("mobile")) return Smartphone;
    if (normalized.includes("laptop") || normalized.includes("máy tính")) return Laptop;
    if (normalized.includes("âm thanh") || normalized.includes("phụ kiện") || normalized.includes("tai nghe")) return Headphones;
    if (normalized.includes("đồng hồ")) return Watch;
    if (normalized.includes("thời trang") || normalized.includes("giày") || normalized.includes("túi")) return Shirt;
    if (normalized.includes("gia dụng") || normalized.includes("nhà cửa") || normalized.includes("nội thất")) return HomeIcon;
    if (normalized.includes("sách") || normalized.includes("văn phòng")) return BookOpen;
    if (normalized.includes("mẹ") || normalized.includes("bé") || normalized.includes("đồ chơi")) return Baby;
    if (normalized.includes("thể thao") || normalized.includes("dã ngoại")) return Dumbbell;
    if (normalized.includes("làm đẹp") || normalized.includes("mỹ phẩm") || normalized.includes("sức khỏe")) return Sparkles;
    if (normalized.includes("bách hóa") || normalized.includes("thực phẩm") || normalized.includes("đồ uống")) return Utensils;
    if (normalized.includes("máy ảnh") || normalized.includes("camera")) return Camera;
    if (normalized.includes("game") || normalized.includes("gaming")) return Gamepad2;
    return Compass;
}

export default function HomePage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [featuredProducts, setFeaturedProducts] = useState<ProductSummary[]>([]);
    const [flashProducts, setFlashProducts] = useState<FlashSaleProduct[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

    const user = useAuthStore((s) => s.user);
    const activeSales = useFlashSaleStore((s) => s.activeSales);
    const fetchActiveSales = useFlashSaleStore((s) => s.fetchActiveSales);

    useEffect(() => {
        // Fetch categories
        catalogService
            .getCategories()
            .then((res) => setCategories(res))
            .catch(() => undefined);

        // Fetch active sales & flash sale products
        fetchActiveSales().catch(() => undefined);
        catalogService
            .getFlashSaleProducts()
            .then((res) => setFlashProducts(res || []))
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
    }, [fetchActiveSales]);

    // Đếm ngược cho Flash Sale
    useEffect(() => {
        const endTimes = flashProducts
            .map((p) => p.endAt)
            .filter((v): v is string => Boolean(v))
            .sort();
        if (endTimes.length === 0) return;
        const target = new Date(endTimes[0]).getTime();
        const tick = () => {
            const diff = Math.max(0, target - Date.now());
            setTimeLeft({
                h: Math.floor(diff / 3_600_000),
                m: Math.floor((diff % 3_600_000) / 60_000),
                s: Math.floor((diff % 60_000) / 1000),
            });
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [flashProducts]);

    const spotlightFlash = flashProducts[0] || null;
    const spotlightRegular = featuredProducts[0] || null;

    return (
        <div className="space-y-16 pb-12">
            {/* HERO SECTION */}
            <section className="relative overflow-hidden bg-slate-950 text-white">
                {/* Background ambient lighting */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,.38),_transparent_42%),radial-gradient(circle_at_bottom_left,_rgba(139,92,246,.24),_transparent_35%)]" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/60 to-slate-950" />

                <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:py-20">
                    {/* Left text column */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-bold text-indigo-200 backdrop-blur-sm">
                            <ShieldCheck size={14} className="text-emerald-400" />
                            <span>Hệ thống bán lẻ đa ngành hàng chính hãng</span>
                        </div>

                        <h1 className="text-4xl font-black tracking-tight leading-[1.12] sm:text-5xl lg:text-6xl text-white">
                            Mua sắm chuẩn xác, <br />
                            <span className="bg-gradient-to-r from-indigo-300 via-indigo-200 to-violet-300 bg-clip-text text-transparent">
                                giá trị xứng tầm.
                            </span>
                        </h1>

                        <p className="max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
                            ShopNova kết nối trực tiếp kho hàng chính hãng đa danh mục — kiểm tra tồn kho theo thời gian thực, niêm yết giá minh bạch và hỗ trợ đổi trả trong 30 ngày.
                        </p>

                        <div className="flex flex-wrap items-center gap-3 pt-2">
                            <Link
                                to="/products"
                                className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition hover:-translate-y-0.5 hover:from-indigo-600 hover:to-indigo-700 focus:outline-none"
                            >
                                Khám phá gian hàng <ArrowRight size={17} />
                            </Link>
                            <Link
                                to="/flash-sale"
                                className="inline-flex items-center gap-2 rounded-xl border border-rose-400/40 bg-rose-500/15 px-6 py-3.5 text-sm font-bold text-rose-200 backdrop-blur-xs transition hover:bg-rose-500/25 hover:border-rose-400/70"
                            >
                                <Flame size={16} className="text-rose-400" />
                                Săn Flash Sale
                            </Link>
                        </div>

                        {/* Trust highlights */}
                        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80">
                            <div>
                                <p className="text-2xl font-black tabular-nums text-indigo-300">
                                    {categories.length > 0 ? `${categories.length}+` : "12+"}
                                </p>
                                <p className="text-xs text-slate-400">Ngành hàng chọn lọc</p>
                            </div>
                            <div>
                                <p className="text-2xl font-black tabular-nums text-indigo-300">100%</p>
                                <p className="text-xs text-slate-400">Hàng chính hãng & VAT</p>
                            </div>
                            <div>
                                <p className="text-2xl font-black tabular-nums text-indigo-300">30 ngày</p>
                                <p className="text-xs text-slate-400">Đổi trả miễn phí</p>
                            </div>
                        </div>
                    </div>

                    {/* Right live product / deal spotlight */}
                    <div className="relative mx-auto w-full max-w-md lg:col-span-5">
                        <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-indigo-500/20 to-violet-500/30 blur-2xl" />
                        <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-xl">
                            <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300">
                                    <Flame size={15} />
                                    {spotlightFlash ? "Deal nổi bật đang diễn ra" : "Sản phẩm mới lên kệ"}
                                </span>
                                {spotlightFlash ? (
                                    <span className="rounded-full bg-rose-500/90 px-2.5 py-0.5 text-[11px] font-bold tabular-nums text-white">
                                        -{spotlightFlash.discountPercent}%
                                    </span>
                                ) : (
                                    <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                                        Sẵn sàng giao
                                    </span>
                                )}
                            </div>

                            {spotlightFlash ? (
                                <div className="mt-4 rounded-2xl bg-white p-4 text-slate-900 shadow-xl">
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={formatProductImageUrl(spotlightFlash.thumbnailUrl)}
                                            alt={spotlightFlash.name}
                                            className="h-24 w-24 shrink-0 rounded-2xl border border-slate-100 bg-slate-50 object-cover"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-rose-600">
                                                {spotlightFlash.categoryName || "Flash Sale"}
                                            </span>
                                            <h3 className="mt-0.5 line-clamp-2 text-sm font-bold leading-snug text-slate-900">
                                                {spotlightFlash.name}
                                            </h3>
                                            <div className="mt-2">
                                                <p className="text-xs font-medium tabular-nums text-slate-400 line-through">
                                                    {formatPrice(spotlightFlash.price)}
                                                </p>
                                                <p className="text-lg font-extrabold tabular-nums text-rose-600 leading-tight">
                                                    {formatPrice(spotlightFlash.salePrice)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                                        <span className="font-semibold tabular-nums text-slate-500">
                                            Tồn kho: <strong className="text-slate-800">{spotlightFlash.stockQuantity}</strong>
                                        </span>
                                        <Link
                                            to={`/products/${spotlightFlash.id}`}
                                            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-rose-700"
                                        >
                                            Xem deal ngay <ChevronRight size={14} />
                                        </Link>
                                    </div>
                                </div>
                            ) : spotlightRegular ? (
                                <div className="mt-4 rounded-2xl bg-white p-4 text-slate-900 shadow-xl">
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={formatProductImageUrl(spotlightRegular.thumbnailUrl)}
                                            alt={spotlightRegular.name}
                                            className="h-24 w-24 shrink-0 rounded-2xl border border-slate-100 bg-slate-50 object-cover"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                                                {spotlightRegular.categoryName || "Sản phẩm mới"}
                                            </span>
                                            <h3 className="mt-0.5 line-clamp-2 text-sm font-bold leading-snug text-slate-900">
                                                {spotlightRegular.name}
                                            </h3>
                                            <p className="mt-2 text-lg font-extrabold tabular-nums text-indigo-600">
                                                {formatPrice(spotlightRegular.price)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                                        <span className="font-semibold tabular-nums text-slate-500">
                                            Kho: <strong className="text-slate-800">{spotlightRegular.stockQuantity} sản phẩm</strong>
                                        </span>
                                        <Link
                                            to={`/products/${spotlightRegular.id}`}
                                            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white transition hover:bg-indigo-600"
                                        >
                                            Xem chi tiết <ChevronRight size={14} />
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-4 rounded-2xl bg-white/95 p-5 shadow-xl space-y-3 animate-pulse">
                                    <div className="flex gap-4">
                                        <div className="h-24 w-24 rounded-2xl bg-slate-200" />
                                        <div className="flex-1 space-y-2 py-1">
                                            <div className="h-3 w-20 rounded bg-slate-200" />
                                            <div className="h-4 w-full rounded bg-slate-200" />
                                            <div className="h-5 w-28 rounded bg-slate-200" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* FLASH SALE SHOWCASE SECTION */}
            {flashProducts.length > 0 && (
                <section className="mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="relative overflow-hidden rounded-3xl border border-rose-200/80 bg-gradient-to-b from-rose-50/70 via-white to-white p-6 sm:p-8 shadow-sm">
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center mb-6 pb-5 border-b border-rose-100">
                            <div className="flex items-center gap-3">
                                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-600 to-orange-500 text-white shadow-md shadow-rose-500/20">
                                    <Flame size={24} className="animate-pulse" />
                                </span>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-black uppercase tracking-wider text-rose-600">
                                            Giờ vàng giá sốc
                                        </span>
                                        {activeSales.length > 0 && (
                                            <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-extrabold text-white">
                                                {activeSales[0].name}
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">
                                        Flash Sale Đang Diễn Ra
                                    </h2>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-white">
                                    <span className="text-xs font-bold text-rose-300 flex items-center gap-1">
                                        <Timer size={14} /> Kết thúc sau:
                                    </span>
                                    <div className="flex items-center gap-1 font-mono text-sm font-black tabular-nums text-amber-300">
                                        <span>{pad(timeLeft.h)}</span>
                                        <span className="text-white">:</span>
                                        <span>{pad(timeLeft.m)}</span>
                                        <span className="text-white">:</span>
                                        <span>{pad(timeLeft.s)}</span>
                                    </div>
                                </div>
                                <Link
                                    to="/flash-sale"
                                    className="inline-flex items-center gap-1.5 rounded-2xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-rose-700"
                                >
                                    Xem tất cả deal <ArrowRight size={14} />
                                </Link>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {flashProducts.slice(0, 4).map((product) => (
                                <FlashSaleCard key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

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
                        {categories.map((cat) => {
                            const CategoryIcon = getCategoryIcon(cat.name);
                            return (
                                <Link
                                    key={cat.id}
                                    to={`/products?categoryId=${cat.id}`}
                                    className="group relative flex flex-col items-center justify-center rounded-2xl border border-slate-200/90 bg-white p-5 text-center shadow-xs transition duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/10"
                                >
                                    <span className="flex h-13 w-13 items-center justify-center rounded-2xl bg-indigo-50/80 text-indigo-600 transition group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white">
                                        <CategoryIcon size={23} />
                                    </span>
                                    <h3 className="mt-3.5 text-sm font-bold text-slate-800 transition group-hover:text-indigo-600 line-clamp-1">
                                        {cat.name}
                                    </h3>
                                    <p className="mt-1 text-[11px] text-slate-400 line-clamp-1">
                                        {cat.description || "Xem sản phẩm"}
                                    </p>
                                </Link>
                            );
                        })}
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
                                to={user ? "/flash-sale" : "/register"}
                                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-slate-900 shadow-md transition hover:bg-indigo-50 focus:outline-none"
                            >
                                {user ? "Săn ưu đãi thành viên ngay" : "Đăng ký thành viên ngay"} <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
