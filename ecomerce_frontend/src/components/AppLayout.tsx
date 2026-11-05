import {
    ChevronDown,
    ChevronRight,
    CircleUserRound,
    Clock,
    Headphones,
    Layers,
    LogOut,
    Mail,
    Menu,
    Package,
    Phone,
    Search,
    Shield,
    ShieldCheck,
    ShoppingBag,
    Sparkles,
    Truck,
    X,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { catalogService } from "../service/catalogService";
import type { Category } from "../types/catalog";
import CartButton from "./CartButton";
import { formatProductImageUrl } from "../lib/image";

export default function AppLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [keyword, setKeyword] = useState("");
    const [profileOpen, setProfileOpen] = useState(false);
    const [catalogOpen, setCatalogOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeCategory, setActiveCategory] = useState<Category | null>(null);
    const user = useAuthStore((state) => state.user);
    const loadCurrentUser = useAuthStore((state) => state.loadCurrentUser);
    const logout = useAuthStore((state) => state.logout);

    useEffect(() => {
        loadCurrentUser().catch(() => undefined);
    }, [loadCurrentUser]);

    useEffect(() => {
        catalogService
            .getCategories()
            .then((data) => {
                setCategories(data);
                setActiveCategory(data[0] || null);
            })
            .catch(() => undefined);
    }, []);

    // Close menus on route change
    useEffect(() => {
        setMobileMenuOpen(false);
        setProfileOpen(false);
        setCatalogOpen(false);
    }, [location.pathname]);

    const submitSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const search = keyword.trim();
        navigate(
            search ? `/products?keyword=${encodeURIComponent(search)}` : "/products"
        );
    };

    const handleLogout = async () => {
        await logout();
        setProfileOpen(false);
        navigate("/");
    };

    const avatarUrl = user?.avatarUrl
        ? formatProductImageUrl(user.avatarUrl)
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || "ShopNova")}&background=4f46e5&color=fff&bold=true`;

    return (
        <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 antialiased">
            {/* Top Announcement Bar */}
            <div className="border-b border-indigo-950/20 bg-slate-950 py-2 text-xs font-medium text-slate-300">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
                    <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>
                            Miễn phí giao hàng toàn quốc cho đơn từ{" "}
                            <strong className="text-amber-300">500.000đ</strong>
                        </span>
                        <Sparkles className="hidden h-3.5 w-3.5 text-amber-300 sm:inline" />
                    </div>
                    <div className="hidden items-center gap-6 sm:flex">
                        <span className="flex items-center gap-1.5 text-slate-400 hover:text-white transition">
                            <Phone size={13} className="text-indigo-400" /> Hotline:{" "}
                            <strong className="text-slate-200">1900 6868</strong>
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-400">
                            <Clock size={13} className="text-indigo-400" /> Hỗ trợ 24/7
                        </span>
                        <Link
                            to="/orders"
                            className="text-slate-300 hover:text-white transition underline-offset-4 hover:underline"
                        >
                            Tra cứu đơn hàng
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Sticky Header */}
            <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-all">
                <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
                    {/* Brand Logo */}
                    <Link
                        to="/"
                        className="group flex shrink-0 items-center gap-2.5 text-xl font-extrabold tracking-tight text-slate-900"
                    >
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20 transition-transform duration-300 group-hover:scale-105">
                            <ShoppingBag size={20} />
                        </span>
                        <span>
                            Shop<span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Nova</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden items-center gap-1 lg:flex">
                        <div
                            className="relative"
                            onMouseLeave={() => setCatalogOpen(false)}
                        >
                            <button
                                type="button"
                                onMouseEnter={() => setCatalogOpen(true)}
                                onClick={() => setCatalogOpen((open) => !open)}
                                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                                    catalogOpen
                                        ? "bg-indigo-50 text-indigo-600"
                                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                                }`}
                                aria-expanded={catalogOpen}
                            >
                                <Layers size={16} className="text-indigo-500" />
                                <span>Danh mục</span>
                                <ChevronDown
                                    size={15}
                                    className={`transition-transform duration-200 ${
                                        catalogOpen ? "rotate-180 text-indigo-600" : "text-slate-400"
                                    }`}
                                />
                            </button>
                            {catalogOpen && (
                                <CategoryMegaMenu
                                    categories={categories}
                                    activeCategory={activeCategory}
                                    onSelect={(category) => setActiveCategory(category)}
                                    onNavigate={() => setCatalogOpen(false)}
                                />
                            )}
                        </div>

                        <Link
                            to="/products"
                            className="rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-indigo-600"
                        >
                            Tất cả sản phẩm
                        </Link>
                        <Link
                            to="/products?sortBy=createdAt"
                            className="rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-indigo-600"
                        >
                            Hàng mới về
                        </Link>
                        <Link
                            to="/orders"
                            className="rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-indigo-600"
                        >
                            Đơn mua
                        </Link>
                    </nav>

                    {/* Search Bar */}
                    <form
                        onSubmit={submitSearch}
                        className="hidden max-w-md flex-1 md:block"
                    >
                        <label className="relative block">
                            <Search
                                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                size={18}
                            />
                            <input
                                value={keyword}
                                onChange={(event) => setKeyword(event.target.value)}
                                placeholder="Tìm kiếm sản phẩm, thương hiệu..."
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pl-10 pr-10 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                            />
                            {keyword && (
                                <button
                                    type="button"
                                    onClick={() => setKeyword("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    <X size={15} />
                                </button>
                            )}
                        </label>
                    </form>

                    {/* Actions Right */}
                    <div className="flex items-center gap-2">
                        <CartButton />

                        {user ? (
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setProfileOpen((open) => !open)}
                                    className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 p-1.5 pr-3 transition hover:bg-slate-100 hover:border-slate-300"
                                    aria-expanded={profileOpen}
                                    aria-label="Mở menu tài khoản"
                                >
                                    <img
                                        src={avatarUrl}
                                        alt={user.fullName}
                                        className="h-8 w-8 rounded-lg object-cover ring-1 ring-slate-200"
                                    />
                                    <div className="hidden text-left sm:block">
                                        <p className="max-w-[120px] truncate text-xs font-bold text-slate-800">
                                            {user.fullName}
                                        </p>
                                        <p className="text-[10px] text-slate-400">
                                            {user.role === "ADMIN" ? "Quản trị viên" : "Thành viên"}
                                        </p>
                                    </div>
                                    <ChevronDown
                                        size={14}
                                        className={`hidden text-slate-400 sm:block transition-transform duration-200 ${
                                            profileOpen ? "rotate-180" : ""
                                        }`}
                                    />
                                </button>
                                {profileOpen && (
                                    <ProfileMenu
                                        avatarUrl={avatarUrl}
                                        fullName={user.fullName}
                                        username={user.username}
                                        role={user.role}
                                        onLogout={handleLogout}
                                        onClose={() => setProfileOpen(false)}
                                    />
                                )}
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-600 hover:shadow-indigo-500/20 focus:outline-none"
                            >
                                <CircleUserRound size={17} />
                                <span className="hidden sm:inline">Đăng nhập</span>
                            </Link>
                        )}

                        {/* Mobile Menu Trigger */}
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(true)}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-100 lg:hidden"
                            aria-label="Mở menu điều hướng di động"
                        >
                            <Menu size={20} />
                        </button>
                    </div>
                </div>

                {/* Mobile Search input bar */}
                <div className="border-t border-slate-100 px-4 py-2.5 md:hidden">
                    <form onSubmit={submitSearch} className="w-full">
                        <label className="relative block">
                            <Search
                                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                size={16}
                            />
                            <input
                                value={keyword}
                                onChange={(event) => setKeyword(event.target.value)}
                                placeholder="Tìm kiếm sản phẩm..."
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white"
                            />
                        </label>
                    </form>
                </div>
            </header>

            {/* Mobile Drawer */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    {/* Drawer content */}
                    <div className="fixed inset-y-0 right-0 flex w-full max-w-xs flex-col bg-white shadow-2xl">
                        <div className="flex h-18 items-center justify-between border-b border-slate-100 px-5">
                            <span className="font-extrabold text-slate-900">Menu</span>
                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen(false)}
                                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                                aria-label="Đóng menu"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 space-y-6">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                    Điều hướng
                                </p>
                                <div className="space-y-1">
                                    <Link
                                        to="/"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                                    >
                                        Trang chủ
                                    </Link>
                                    <Link
                                        to="/products"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                                    >
                                        Tất cả sản phẩm
                                    </Link>
                                    <Link
                                        to="/orders"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                                    >
                                        Đơn mua của tôi
                                    </Link>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                    Danh mục sản phẩm
                                </p>
                                <div className="space-y-1">
                                    {categories.map((cat) => (
                                        <Link
                                            key={cat.id}
                                            to={`/products?categoryId=${cat.id}`}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
                                        >
                                            <span>{cat.name}</span>
                                            <ChevronRight size={14} className="text-slate-400" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-slate-100 p-5 bg-slate-50">
                            {user ? (
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white py-2.5 text-sm font-bold text-rose-600 shadow-xs hover:bg-rose-50"
                                >
                                    <LogOut size={16} /> Đăng xuất
                                </button>
                            ) : (
                                <Link
                                    to="/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-200"
                                >
                                    <CircleUserRound size={16} /> Đăng nhập / Đăng ký
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1">
                <Outlet />
            </main>

            {/* Trust Perks Banner */}
            <section className="mt-16 border-t border-b border-slate-200/80 bg-white py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                        <div className="flex items-center gap-3.5">
                            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                                <Truck size={22} />
                            </span>
                            <div>
                                <p className="text-sm font-bold text-slate-900">Giao hàng miễn phí</p>
                                <p className="text-xs text-slate-500">Đơn từ 500.000đ toàn quốc</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3.5">
                            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                <ShieldCheck size={22} />
                            </span>
                            <div>
                                <p className="text-sm font-bold text-slate-900">100% Chính hãng</p>
                                <p className="text-xs text-slate-500">Cam kết nguồn gốc minh bạch</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3.5">
                            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                                <RotateCcwIcon size={22} />
                            </span>
                            <div>
                                <p className="text-sm font-bold text-slate-900">Đổi trả 30 ngày</p>
                                <p className="text-xs text-slate-500">Thủ tục nhanh, không rủi ro</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3.5">
                            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                                <Headphones size={22} />
                            </span>
                            <div>
                                <p className="text-sm font-bold text-slate-900">Hỗ trợ 24/7</p>
                                <p className="text-xs text-slate-500">Hotline & tư vấn tận tâm</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Comprehensive Ecommerce Footer */}
            <footer className="border-t border-slate-200 bg-slate-950 text-slate-300">
                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
                    <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
                        {/* Brand Column */}
                        <div className="lg:col-span-2 space-y-4">
                            <Link to="/" className="flex items-center gap-2.5 text-xl font-black text-white">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white shadow-md">
                                    <ShoppingBag size={20} />
                                </span>
                                Shop<span className="text-indigo-400">Nova</span>
                            </Link>
                            <p className="max-w-sm text-sm leading-6 text-slate-400">
                                Nền tảng mua sắm trực tuyến tin cậy hàng đầu với hàng ngàn sản phẩm chất lượng cao, giá thành ưu đãi và trải nghiệm mua sắm hiện đại.
                            </p>
                            <div className="space-y-2 text-xs text-slate-400 pt-2">
                                <p className="flex items-center gap-2">
                                    <Phone size={14} className="text-indigo-400" />
                                    <span>Hotline CSKH: <strong>1900 6868</strong> (8h - 22h)</span>
                                </p>
                                <p className="flex items-center gap-2">
                                    <Mail size={14} className="text-indigo-400" />
                                    <span>Email: support@shopnova.vn</span>
                                </p>
                            </div>
                        </div>

                        {/* Column 2: Mua sắm */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-100">
                                Mua sắm
                            </h4>
                            <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
                                <li>
                                    <Link to="/products" className="hover:text-indigo-400 transition">
                                        Tất cả sản phẩm
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/products?sortBy=createdAt" className="hover:text-indigo-400 transition">
                                        Sản phẩm mới nhất
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/cart" className="hover:text-indigo-400 transition">
                                        Giỏ hàng của bạn
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/orders" className="hover:text-indigo-400 transition">
                                        Theo dõi đơn hàng
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Column 3: Hỗ trợ khách hàng */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-100">
                                Trợ giúp & Chính sách
                            </h4>
                            <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
                                <li>
                                    <span className="hover:text-indigo-400 transition cursor-pointer">
                                        Chính sách bảo hành
                                    </span>
                                </li>
                                <li>
                                    <span className="hover:text-indigo-400 transition cursor-pointer">
                                        Chính sách đổi trả 30 ngày
                                    </span>
                                </li>
                                <li>
                                    <span className="hover:text-indigo-400 transition cursor-pointer">
                                        Vận chuyển & giao nhận
                                    </span>
                                </li>
                                <li>
                                    <span className="hover:text-indigo-400 transition cursor-pointer">
                                        Bảo mật thông tin
                                    </span>
                                </li>
                            </ul>
                        </div>

                        {/* Column 4: Thanh toán & Chứng nhận */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-100">
                                Thanh toán bảo mật
                            </h4>
                            <p className="mt-4 text-xs text-slate-400 leading-5">
                                Hỗ trợ đa dạng phương thức thanh toán an toàn, bảo vệ người tiêu dùng tuyệt đối.
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold">
                                <span className="rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1 text-slate-300">
                                    COD
                                </span>
                                <span className="rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1 text-slate-300">
                                    ATM/Internet Banking
                                </span>
                                <span className="rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1 text-slate-300">
                                    Visa / MasterCard
                                </span>
                                <span className="rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1 text-slate-300">
                                    Ví điện tử
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800/80 pt-8 text-xs text-slate-500 sm:flex-row">
                        <p>© 2026 ShopNova. Nền tảng thương mại điện tử bảo lưu mọi quyền.</p>
                        <div className="flex items-center gap-4">
                            <span className="inline-flex items-center gap-1.5 text-emerald-400">
                                <Shield size={14} /> Bảo mật SSL 256-bit
                            </span>
                            <span>Thiết kế tiêu chuẩn UI/UX Pro Max</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function RotateCcwIcon({ size = 20 }: { size?: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
        </svg>
    );
}

function ProfileMenu({
    avatarUrl,
    fullName,
    username,
    role,
    onLogout,
    onClose,
}: {
    avatarUrl: string;
    fullName: string;
    username: string;
    role: string;
    onLogout: () => void;
    onClose: () => void;
}) {
    return (
        <div className="absolute right-0 mt-2 w-72 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl animate-in fade-in-50 zoom-in-95 duration-150 z-50">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-4 text-white">
                <div className="flex items-center gap-3">
                    <img
                        src={avatarUrl}
                        alt="Ảnh đại diện"
                        className="h-11 w-11 rounded-full border-2 border-white/80 object-cover shadow-sm"
                    />
                    <div className="min-w-0">
                        <p className="truncate font-bold text-sm">{fullName}</p>
                        <p className="truncate text-xs text-indigo-100">@{username}</p>
                    </div>
                </div>
            </div>
            <div className="p-2 space-y-1">
                <div className="mb-2 rounded-xl bg-slate-50 px-3 py-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Vai trò</span>
                    <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-[11px] font-bold text-indigo-700">
                        {role === "ADMIN" ? "Quản trị viên" : "Khách hàng"}
                    </span>
                </div>
                <Link
                    to="/profile"
                    onClick={onClose}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-indigo-600"
                >
                    <CircleUserRound size={16} className="text-indigo-500" />
                    Thông tin tài khoản
                </Link>
                <Link
                    to="/orders"
                    onClick={onClose}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-indigo-600"
                >
                    <Package size={16} className="text-indigo-500" />
                    Lịch sử đơn hàng
                </Link>
                {role === "ADMIN" && (
                    <Link
                        to="/admin"
                        onClick={onClose}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-bold text-indigo-600 transition hover:bg-indigo-50"
                    >
                        <Layers size={16} />
                        Quản trị hệ thống
                    </Link>
                )}
                <div className="border-t border-slate-100 pt-1">
                    <button
                        type="button"
                        onClick={onLogout}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-rose-600 transition hover:bg-rose-50"
                    >
                        <LogOut size={16} /> Đăng xuất
                    </button>
                </div>
            </div>
        </div>
    );
}

function CategoryMegaMenu({
    categories,
    activeCategory,
    onSelect,
    onNavigate,
}: {
    categories: Category[];
    activeCategory: Category | null;
    onSelect: (category: Category) => void;
    onNavigate: () => void;
}) {
    if (!categories.length) {
        return (
            <div className="absolute left-0 top-full mt-1 w-64 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-2xl">
                Đang tải danh mục...
            </div>
        );
    }

    return (
        <div className="absolute left-0 top-full mt-1 z-50 flex w-[680px] overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl animate-in fade-in-50 zoom-in-95 duration-150">
            {/* Sidebar list */}
            <div className="w-56 shrink-0 border-r border-slate-100 bg-slate-50/70 p-2.5">
                <p className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Tất cả danh mục
                </p>
                <div className="space-y-1">
                    {categories.map((category) => {
                        const isActive = activeCategory?.id === category.id;
                        return (
                            <Link
                                key={category.id}
                                to={`/products?categoryId=${category.id}`}
                                onMouseEnter={() => onSelect(category)}
                                onClick={onNavigate}
                                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-bold transition ${
                                    isActive
                                        ? "bg-indigo-600 text-white shadow-sm"
                                        : "text-slate-700 hover:bg-white hover:text-indigo-600"
                                }`}
                            >
                                <span className="truncate">{category.name}</span>
                                <ChevronRight size={14} className={isActive ? "text-white" : "text-slate-400"} />
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Active category preview */}
            <div className="flex flex-1 flex-col p-6 bg-gradient-to-br from-white via-indigo-50/20 to-violet-50/30">
                <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-600">
                    Khám phá ngành hàng
                </span>
                <h3 className="mt-1 text-2xl font-black text-slate-900">
                    {activeCategory?.name || "Danh mục"}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 line-clamp-3">
                    {activeCategory?.description ||
                        "Khám phá các sản phẩm chọn lọc hàng đầu với chất lượng cam kết và giá cả cạnh tranh nhất."}
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-3.5">
                        <p className="text-xs font-bold text-indigo-700">Đa dạng sản phẩm</p>
                        <p className="mt-0.5 text-[11px] text-slate-500">Cập nhật liên tục</p>
                    </div>
                    <div className="rounded-xl border border-violet-100 bg-violet-50/70 p-3.5">
                        <p className="text-xs font-bold text-violet-700">Giá tốt nhất</p>
                        <p className="mt-0.5 text-[11px] text-slate-500">Nhiều ưu đãi hấp dẫn</p>
                    </div>
                </div>

                {activeCategory && (
                    <Link
                        to={`/products?categoryId=${activeCategory.id}`}
                        onClick={onNavigate}
                        className="mt-auto inline-flex w-fit items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-600"
                    >
                        Xem sản phẩm thuộc danh mục <ChevronRight size={14} />
                    </Link>
                )}
            </div>
        </div>
    );
}
