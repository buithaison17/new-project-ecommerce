import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    LogOut,
    Menu,
    X,
    ChevronRight,
} from "lucide-react";
import { useState } from "react";

export default function AdminLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const menuItems = [
        { path: "/admin", icon: LayoutDashboard, label: "Dashboard" },
        { path: "/admin/orders", icon: ShoppingCart, label: "Đơn hàng" },
        { path: "/admin/products", icon: Package, label: "Sản phẩm" },
        { path: "/admin/categories", icon: Package, label: "Danh mục" },
        { path: "/admin/inventory", icon: Package, label: "Kho hàng" },
        { path: "/admin/users", icon: Users, label: "Người dùng" },
    ];

    return (
        <div className="flex min-h-screen bg-slate-100">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transition-transform duration-300 lg:static lg:translate-x-0 ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="flex h-16 items-center justify-between border-b border-slate-800 px-6">
                    <Link to="/admin" className="text-xl font-bold">
                        Admin Panel
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-slate-400 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="p-4 space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path ||
                            (item.path !== "/admin" && location.pathname.startsWith(item.path));
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                                    isActive
                                        ? "bg-indigo-600 text-white"
                                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                }`}
                            >
                                <Icon size={18} />
                                <span>{item.label}</span>
                                {isActive && <ChevronRight size={14} className="ml-auto" />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 border-t border-slate-800 p-4">
                    <div className="mb-3 rounded-lg bg-slate-800 p-3">
                        <p className="text-xs font-semibold text-slate-400">Đăng nhập với tư cách</p>
                        <p className="text-sm font-bold text-white">{user?.fullName}</p>
                        <p className="text-xs text-indigo-400">{user?.email}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700"
                    >
                        <LogOut size={16} />
                        Đăng xuất
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col">
                {/* Top bar */}
                <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden text-slate-600 hover:text-slate-900"
                    >
                        <Menu size={24} />
                    </button>
                    <h1 className="text-lg font-semibold text-slate-900">
                        {menuItems.find((item) =>
                            location.pathname === item.path ||
                            (item.path !== "/admin" && location.pathname.startsWith(item.path))
                        )?.label || "Admin"}
                    </h1>
                    <Link
                        to="/"
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                    >
                        Xem trang chủ
                    </Link>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
