import {
    AlertTriangle,
    ArrowUpRight,
    Bell,
    Boxes,
    ChevronDown,
    Clock,
    FolderTree,
    LayoutDashboard,
    LogOut,
    Menu,
    Package,
    ReceiptText,
    RefreshCw,
    Search,
    ShoppingBag,
    Store,
    Users,
    X,
    Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { adminService } from "../service/adminService";
import { useAuthStore } from "../store/authStore";
import { formatProductImageUrl } from "../lib/image";
import type { DashboardSummaryResponse } from "../types/admin";

const navigation = [
    { to: "/admin", label: "Tổng quan", icon: LayoutDashboard, end: true, keywords: "tong quan dashboard doanh thu kpi" },
    { to: "/admin/orders", label: "Quản lý đơn hàng", icon: ReceiptText, keywords: "don hang order giao hang thanh toan" },
    { to: "/admin/categories", label: "Danh mục sản phẩm", icon: FolderTree, keywords: "danh muc category hang thuong hieu" },
    { to: "/admin/products", label: "Danh sách sản phẩm", icon: Package, keywords: "san pham product gia anh" },
    { to: "/admin/inventory", label: "Kiểm soát tồn kho", icon: Boxes, keywords: "ton kho nhap hang sap het" },
    { to: "/admin/users", label: "Quản lý người dùng", icon: Users, keywords: "nguoi dung khach hang tai khoan" },
    { to: "/admin/flash-sales", label: "Flash Sale", icon: Zap, keywords: "flash sale giam gia khuyen mai" },
];

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [notifyOpen, setNotifyOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchFocused, setSearchFocused] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
    const searchRef = useRef<HTMLDivElement>(null);
    const notifyRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuthStore();

    const fetchAlerts = useCallback(() => {
        adminService
            .getDashboardSummary()
            .then(setSummary)
            .catch(() => undefined);
    }, []);

    useEffect(() => {
        fetchAlerts();
        const onSync = () => fetchAlerts();
        window.addEventListener("admin_refresh_data", onSync);
        window.addEventListener("order_status_changed", onSync);
        return () => {
            window.removeEventListener("admin_refresh_data", onSync);
            window.removeEventListener("order_status_changed", onSync);
        };
    }, [fetchAlerts]);

    useEffect(() => {
        setProfileOpen(false);
        setNotifyOpen(false);
        setSearchFocused(false);
        setSidebarOpen(false);
    }, [location.pathname, location.search]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (searchRef.current && !searchRef.current.contains(target)) {
                setSearchFocused(false);
            }
            if (notifyRef.current && !notifyRef.current.contains(target)) {
                setNotifyOpen(false);
            }
            if (profileRef.current && !profileRef.current.contains(target)) {
                setProfileOpen(false);
            }
        };
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setSearchFocused(false);
                setNotifyOpen(false);
                setProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    const matchedNavItems = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return [];
        return navigation.filter(
            (item) =>
                item.label.toLowerCase().includes(q) ||
                item.keywords.includes(q),
        );
    }, [searchQuery]);

    const pendingOrdersCount = summary?.ordersByStatus?.PENDING || 0;
    const lowStockCount = summary?.lowStockProducts || 0;
    const outOfStockCount = summary?.outOfStockProducts || 0;
    const totalAlerts = (pendingOrdersCount > 0 ? 1 : 0) + (lowStockCount > 0 ? 1 : 0) + (outOfStockCount > 0 ? 1 : 0);

    const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const q = searchQuery.trim();
        if (!q) return;
        setSearchFocused(false);
        if (matchedNavItems.length === 1 && !/^\d+$/.test(q)) {
            navigate(matchedNavItems[0].to);
            setSearchQuery("");
            return;
        }
        navigate(`/admin/orders?search=${encodeURIComponent(q)}`);
    };

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const handleGlobalRefresh = () => {
        if (isRefreshing) return;
        setIsRefreshing(true);
        window.dispatchEvent(new CustomEvent("admin_refresh_data"));
        setTimeout(() => {
            setIsRefreshing(false);
            toast.success("Làm mới dữ liệu thành công!", { id: "admin-global-refresh" });
        }, 700);
    };

    const avatarUrl = user?.avatarUrl
        ? formatProductImageUrl(user.avatarUrl)
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || "Admin")}&background=4f46e5&color=fff&bold=true`;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
            {/* Mobile backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs transition-opacity lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-800 bg-slate-950 text-slate-300 transition-transform duration-300 lg:translate-x-0 ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                {/* Brand header */}
                <div className="flex h-18 items-center justify-between border-b border-slate-800/80 px-6">
                    <Link
                        to="/admin"
                        className="group flex items-center gap-2.5 text-lg font-black tracking-tight text-white"
                    >
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/20 transition-transform group-hover:scale-105">
                            <ShoppingBag size={18} />
                        </span>
                        <span>
                            Shop<span className="text-indigo-400">Nova</span>{" "}
                            <span className="rounded-md bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
                                Quản trị
                            </span>
                        </span>
                    </Link>
                    <button
                        type="button"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Đóng thanh điều hướng"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Nav links */}
                <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-6 scrollbar-thin">
                    <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-widest text-slate-300">
                        Hệ thống quản lý
                    </p>

                    {navigation.map(({ to, label, icon: Icon, end }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={end}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition duration-200 ${
                                    isActive
                                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                                        : "text-slate-200 hover:bg-slate-900 hover:text-white"
                                }`
                            }
                        >
                            <Icon size={18} />
                            <span>{label}</span>
                        </NavLink>
                    ))}

                    <div className="my-5 border-t border-slate-800/80" />

                    <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-widest text-slate-300">
                        Cửa hàng & Người dùng
                    </p>

                    <Link
                        to="/"
                        target="_blank"
                        className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-200 transition hover:bg-slate-900 hover:text-white"
                    >
                        <span className="flex items-center gap-3">
                            <Store size={18} className="text-indigo-400" /> Xem website khách hàng
                        </span>
                        <ArrowUpRight size={14} className="text-slate-400" />
                    </Link>
                </nav>

                {/* User quick info footer in sidebar */}
                <div className="border-t border-slate-800/80 p-4 bg-slate-950/80">
                    <div className="flex items-center gap-3 rounded-xl bg-slate-900 p-3">
                        <img
                            src={avatarUrl}
                            alt={user?.fullName || "Admin"}
                            className="h-9 w-9 rounded-lg object-cover ring-1 ring-white/10"
                        />
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-bold text-white">
                                {user?.fullName || "Quản trị viên"}
                            </p>
                            <p className="truncate text-[10px] text-indigo-400 font-semibold">
                                Toàn quyền hệ thống
                            </p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Area */}
            <div className="flex flex-col lg:pl-72 min-h-screen">
                {/* Topbar */}
                <header className="sticky top-0 z-30 flex h-18 items-center justify-between gap-4 border-b border-slate-200/90 bg-white/90 px-4 sm:px-6 lg:px-8 backdrop-blur-md">
                    {/* Mobile toggle */}
                    <button
                        type="button"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 lg:hidden"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Mở thanh điều hướng"
                    >
                        <Menu size={20} />
                    </button>

                    {/* Search bar in topbar */}
                    <div ref={searchRef} className="relative hidden max-w-md flex-1 md:block">
                        <form
                            onSubmit={handleSearchSubmit}
                            className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2 transition focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100"
                        >
                            <Search size={16} className="text-slate-400 shrink-0" />
                            <input
                                value={searchQuery}
                                onFocus={() => setSearchFocused(true)}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setSearchFocused(true);
                                }}
                                className="w-full bg-transparent text-xs font-medium text-slate-800 outline-none placeholder:text-slate-400"
                                placeholder="Tìm nhanh đơn hàng (#ID, SĐT) hoặc trang quản trị..."
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery("")}
                                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                                    aria-label="Xóa tìm kiếm"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </form>

                        {searchFocused && searchQuery.trim() && (
                            <div className="absolute left-0 right-0 top-full mt-2 z-50 overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-2 shadow-xl">
                                {matchedNavItems.map(({ to, label, icon: Icon }) => (
                                    <button
                                        key={to}
                                        type="button"
                                        onClick={() => {
                                            navigate(to);
                                            setSearchFocused(false);
                                            setSearchQuery("");
                                        }}
                                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer"
                                    >
                                        <span className="flex items-center gap-2.5">
                                            <Icon size={15} className="text-indigo-500" />
                                            Đi tới: {label}
                                        </span>
                                        <ArrowUpRight size={13} className="text-slate-400" />
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => {
                                        navigate(`/admin/orders?search=${encodeURIComponent(searchQuery.trim())}`);
                                        setSearchFocused(false);
                                    }}
                                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-bold text-indigo-600 hover:bg-indigo-50 cursor-pointer"
                                >
                                    <span className="flex items-center gap-2">
                                        <Search size={14} />
                                        Tra cứu đơn hàng khớp "{searchQuery.trim()}"
                                    </span>
                                    <span className="text-[10px] font-medium text-slate-400">Enter ↵</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Actions right */}
                    <div className="flex items-center gap-2.5 ml-auto">
                        <button
                            type="button"
                            onClick={handleGlobalRefresh}
                            disabled={isRefreshing}
                            className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold shadow-xs transition cursor-pointer ${
                                isRefreshing
                                    ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-indigo-600 hover:border-slate-300"
                            }`}
                            title="Làm mới lại toàn bộ dữ liệu trang quản trị"
                        >
                            <RefreshCw
                                size={14}
                                className={`text-indigo-600 transition-transform ${
                                    isRefreshing ? "animate-spin" : ""
                                }`}
                            />
                            <span className="hidden sm:inline">
                                {isRefreshing ? "Đang làm mới..." : "Làm mới dữ liệu"}
                            </span>
                        </button>

                        <Link
                            to="/products"
                            target="_blank"
                            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:text-indigo-600"
                        >
                            <Store size={14} className="text-indigo-500" /> Xem gian hàng
                        </Link>

                        <div ref={notifyRef} className="relative">
                            <button
                                type="button"
                                onClick={() => setNotifyOpen((o) => !o)}
                                aria-expanded={notifyOpen}
                                className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition cursor-pointer ${
                                    notifyOpen
                                        ? "border-indigo-300 bg-indigo-50 text-indigo-600"
                                        : "border-slate-200 text-slate-600 hover:bg-slate-100"
                                }`}
                                aria-label="Cảnh báo vận hành"
                            >
                                <Bell size={18} />
                                {totalAlerts > 0 && (
                                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-black tabular-nums text-white ring-2 ring-white">
                                        {totalAlerts}
                                    </span>
                                )}
                            </button>

                            {notifyOpen && (
                                <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl z-50">
                                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-slate-50/70">
                                        <p className="text-xs font-extrabold text-slate-900">
                                            Cảnh báo vận hành
                                        </p>
                                        <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700 tabular-nums">
                                            {totalAlerts} mục cần chú ý
                                        </span>
                                    </div>
                                    <div className="divide-y divide-slate-100 p-2">
                                        <Link
                                            to="/admin/orders?status=PENDING"
                                            onClick={() => setNotifyOpen(false)}
                                            className="flex items-start gap-3 rounded-xl p-2.5 transition hover:bg-slate-50"
                                        >
                                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                                                <Clock size={16} />
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-bold text-slate-900">
                                                    Đơn hàng chờ xác nhận
                                                </p>
                                                <p className="text-[11px] text-slate-500 tabular-nums">
                                                    {pendingOrdersCount > 0
                                                        ? `Hiện có ${pendingOrdersCount} đơn đang chờ duyệt`
                                                        : "Tất cả đơn hàng đã được xử lý"}
                                                </p>
                                            </div>
                                        </Link>

                                        <Link
                                            to="/admin/inventory?filter=low"
                                            onClick={() => setNotifyOpen(false)}
                                            className="flex items-start gap-3 rounded-xl p-2.5 transition hover:bg-slate-50"
                                        >
                                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                                                <AlertTriangle size={16} />
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-bold text-slate-900">
                                                    Cảnh báo tồn kho thấp
                                                </p>
                                                <p className="text-[11px] text-slate-500 tabular-nums">
                                                    {lowStockCount} mã sắp hết • {outOfStockCount} mã hết hàng
                                                </p>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Profile dropdown */}
                        <div ref={profileRef} className="relative">
                            <button
                                type="button"
                                className="flex items-center gap-2.5 rounded-xl border border-slate-200/90 p-1.5 pr-3 transition hover:bg-slate-100 hover:border-slate-300"
                                onClick={() => setProfileOpen(!profileOpen)}
                                aria-expanded={profileOpen}
                            >
                                <img
                                    src={avatarUrl}
                                    alt="Admin"
                                    className="h-8 w-8 rounded-lg object-cover ring-1 ring-slate-200"
                                />
                                <div className="hidden text-left sm:block">
                                    <p className="max-w-[120px] truncate text-xs font-bold text-slate-800">
                                        {user?.fullName || "Quản trị viên"}
                                    </p>
                                    <p className="text-[10px] font-semibold text-indigo-600">
                                        Admin
                                    </p>
                                </div>
                                <ChevronDown
                                    size={14}
                                    className={`hidden sm:block text-slate-400 transition-transform ${
                                        profileOpen ? "rotate-180" : ""
                                    }`}
                                />
                            </button>

                            {profileOpen && (
                                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200/90 bg-white p-2 shadow-xl animate-in fade-in-50 zoom-in-95 duration-150 z-50">
                                    <div className="border-b border-slate-100 px-3 py-2.5">
                                        <p className="text-xs font-bold text-slate-900">
                                            {user?.fullName || "Quản trị viên"}
                                        </p>
                                        <p className="truncate text-[11px] text-slate-500">
                                            @{user?.username || "admin"}
                                        </p>
                                    </div>
                                    <div className="py-1">
                                        <Link
                                            to="/"
                                            className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                                            onClick={() => setProfileOpen(false)}
                                        >
                                            <Store size={15} /> Trang chủ khách hàng
                                        </Link>
                                    </div>
                                    <div className="border-t border-slate-100 pt-1">
                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-50"
                                        >
                                            <LogOut size={15} /> Đăng xuất quản trị
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Animated Loading Bar during refresh */}
                    {isRefreshing && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden bg-indigo-100">
                            <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600 animate-shimmer-bar" />
                        </div>
                    )}
                </header>

                {/* Page Content Outlet */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
