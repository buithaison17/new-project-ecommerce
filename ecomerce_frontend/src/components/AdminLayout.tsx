import {
    ArrowUpRight,
    Bell,
    Boxes,
    ChevronDown,
    FolderTree,
    LayoutDashboard,
    LogOut,
    Menu,
    Package,
    ReceiptText,
    Search,
    ShoppingBag,
    Store,
    Users,
    X,
} from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { formatProductImageUrl } from "../lib/image";

const navigation = [
    { to: "/admin", label: "Tổng quan", icon: LayoutDashboard, end: true },
    { to: "/admin/orders", label: "Quản lý đơn hàng", icon: ReceiptText },
    { to: "/admin/categories", label: "Danh mục sản phẩm", icon: FolderTree },
    { to: "/admin/products", label: "Danh sách sản phẩm", icon: Package },
    { to: "/admin/inventory", label: "Kiểm soát tồn kho", icon: Boxes },
    { to: "/admin/users", label: "Quản lý người dùng", icon: Users },
];

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    const handleLogout = async () => {
        await logout();
        navigate("/login");
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
                    <div className="hidden max-w-md flex-1 items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2 md:flex">
                        <Search size={16} className="text-slate-400" />
                        <input
                            className="w-full bg-transparent text-xs font-medium text-slate-800 outline-none placeholder:text-slate-400"
                            placeholder="Tra cứu nhanh đơn hàng, sản phẩm, khách hàng..."
                        />
                    </div>

                    {/* Actions right */}
                    <div className="flex items-center gap-3 ml-auto">
                        <Link
                            to="/products"
                            target="_blank"
                            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:text-indigo-600"
                        >
                            <Store size={14} className="text-indigo-500" /> Xem gian hàng
                        </Link>

                        <button
                            type="button"
                            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100"
                            aria-label="Thông báo"
                        >
                            <Bell size={18} />
                            <span className="absolute right-2.5 top-2.5 flex h-2 w-2 rounded-full bg-indigo-600 ring-2 ring-white animate-pulse" />
                        </button>

                        {/* Profile dropdown */}
                        <div className="relative">
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
                </header>

                {/* Page Content Outlet */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
