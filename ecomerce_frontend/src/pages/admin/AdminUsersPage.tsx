import {
    AlertTriangle,
    Ban,
    ChevronLeft,
    ChevronRight,
    Loader2,
    RefreshCw,
    Search,
    ShieldCheck,
    ShieldX,
    UserCog,
    X,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { adminService } from "../../service/adminService";
import type { AdminUserResponse } from "../../types/admin";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<AdminUserResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    // Modals for confirmation
    const [userToBlock, setUserToBlock] = useState<AdminUserResponse | null>(null);
    const [userToUnblock, setUserToUnblock] = useState<AdminUserResponse | null>(null);

    const loadUsers = () => {
        setLoading(true);
        adminService
            .getUsers(
                keyword || undefined,
                roleFilter === "all" ? undefined : roleFilter,
                currentPage,
                pageSize
            )
            .then((response) => {
                setUsers(response.content || []);
                setTotalPages(response.totalPages || 1);
                setTotalElements(response.totalElements ?? 0);
            })
            .catch(() => toast.error("Không thể tải danh sách người dùng"))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadUsers();
    }, [currentPage, roleFilter]);

    const handleSearch = () => {
        setCurrentPage(1);
        loadUsers();
    };

    const handleConfirmBlock = async () => {
        if (!userToBlock) return;
        try {
            setActionLoading(userToBlock.id);
            await adminService.blockUser(userToBlock.id);
            toast.success(`Đã khóa tài khoản "${userToBlock.username}" thành công`);
            setUserToBlock(null);
            loadUsers();
        } catch {
            toast.error("Không thể khóa tài khoản");
        } finally {
            setActionLoading(null);
        }
    };

    const handleConfirmUnblock = async () => {
        if (!userToUnblock) return;
        try {
            setActionLoading(userToUnblock.id);
            await adminService.unblockUser(userToUnblock.id);
            toast.success(`Đã mở khóa tài khoản "${userToUnblock.username}" thành công`);
            setUserToUnblock(null);
            loadUsers();
        } catch {
            toast.error("Không thể mở khóa tài khoản");
        } finally {
            setActionLoading(null);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                        Quản lý hệ thống
                    </span>
                    <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
                        Quản lý người dùng
                    </h1>
                    <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                        Xem danh sách người dùng, khóa/mở khóa tài khoản và quản lý quyền truy cập.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={loadUsers}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                >
                    <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Làm mới
                </button>
            </section>

            {/* Filters */}
            <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
                <div className="grid gap-4 sm:grid-cols-3">
                    {/* Search */}
                    <div className="sm:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                            Tìm kiếm người dùng
                        </label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                    placeholder="Tìm theo tên đăng nhập hoặc email..."
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-3.5 py-2.5 text-xs font-medium outline-none transition focus:border-indigo-500 focus:bg-white"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleSearch}
                                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition cursor-pointer"
                            >
                                Tìm kiếm
                            </button>
                        </div>
                    </div>

                    {/* Role Filter */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                            Lọc theo vai trò
                        </label>
                        <select
                            value={roleFilter}
                            onChange={(e) => {
                                setRoleFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium outline-none transition focus:border-indigo-500 focus:bg-white cursor-pointer"
                        >
                            <option value="all">Tất cả vai trò</option>
                            <option value="ADMIN">Quản trị viên</option>
                            <option value="USER">Người dùng</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* Users Table */}
            <section className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                                    ID
                                </th>
                                <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                                    Tên đăng nhập
                                </th>
                                <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                                    Email
                                </th>
                                <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                                    Vai trò
                                </th>
                                <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                                    Trạng thái
                                </th>
                                <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                                    Ngày tạo
                                </th>
                                <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-600 text-right">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/30 transition">
                                    <td className="px-5 py-4 text-xs font-medium text-slate-500">#{user.id}</td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold text-xs">
                                                {user.username.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-sm font-bold text-slate-900">{user.username}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-xs text-slate-600">{user.email}</td>
                                    <td className="px-5 py-4">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                                                user.role === "ADMIN"
                                                    ? "bg-purple-50 text-purple-700 border border-purple-200"
                                                    : "bg-slate-100 text-slate-700 border border-slate-200"
                                            }`}
                                        >
                                            {user.role === "ADMIN" ? "Quản trị viên" : "Người dùng"}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        {user.isEnabled ? (
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                                                <ShieldCheck size={12} /> Hoạt động
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-700 border border-rose-200">
                                                <ShieldX size={12} /> Đã khóa
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-5 py-4 text-xs text-slate-500">{formatDate(user.createdAt)}</td>
                                    <td className="px-5 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            {user.isEnabled ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setUserToBlock(user)}
                                                    disabled={actionLoading === user.id}
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-[11px] font-bold text-rose-700 border border-rose-200 hover:bg-rose-100 transition disabled:opacity-50 cursor-pointer"
                                                >
                                                    <Ban size={12} /> Khóa
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => setUserToUnblock(user)}
                                                    disabled={actionLoading === user.id}
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition disabled:opacity-50 cursor-pointer"
                                                >
                                                    <ShieldCheck size={12} /> Mở khóa
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {!loading && users.length === 0 && (
                    <div className="py-16 text-center">
                        <UserCog size={48} className="mx-auto text-slate-300 mb-3" />
                        <p className="text-sm font-semibold text-slate-400">
                            Không tìm thấy người dùng nào.
                        </p>
                    </div>
                )}
            </section>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 text-xs text-slate-500 shadow-xs sm:flex-row">
                    <span>
                        Hiển thị <strong>{users.length}</strong> / tổng <strong>{totalElements}</strong> người dùng
                    </span>
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            disabled={currentPage <= 1 || loading}
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                            title="Trang trước"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                            .reduce<(number | string)[]>((acc, p, idx, arr) => {
                                if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) {
                                    acc.push(`dots-${p}`);
                                }
                                acc.push(p);
                                return acc;
                            }, [])
                            .map((item) =>
                                typeof item === "string" ? (
                                    <span key={item} className="px-1 text-slate-400">
                                        ...
                                    </span>
                                ) : (
                                    <button
                                        key={item}
                                        type="button"
                                        onClick={() => setCurrentPage(item)}
                                        className={`h-8 min-w-8 rounded-lg px-2 text-xs font-bold transition cursor-pointer ${
                                            currentPage === item
                                                ? "bg-indigo-600 text-white shadow-xs"
                                                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                        }`}
                                    >
                                        {item}
                                    </button>
                                ),
                            )}
                        <button
                            type="button"
                            disabled={currentPage >= totalPages || loading}
                            onClick={() => setCurrentPage((p) => p + 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                            title="Trang sau"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Modal xác nhận Khóa tài khoản */}
            {userToBlock && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
                    <div
                        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150"
                        role="dialog"
                        aria-modal="true"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
                                    <AlertTriangle size={24} />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-slate-900">
                                        Xác nhận khóa tài khoản
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Hành động tạm dừng quyền truy cập người dùng
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => !actionLoading && setUserToBlock(null)}
                                disabled={actionLoading !== null}
                                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer disabled:opacity-50"
                                title="Đóng"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* User Card */}
                        <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-black text-sm">
                                    {userToBlock.username.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-900 text-sm truncate">
                                            {userToBlock.username}
                                        </span>
                                        <span className="text-[10px] font-semibold text-slate-500 rounded bg-slate-200/70 px-1.5 py-0.5">
                                            #{userToBlock.id}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 truncate mt-0.5">
                                        {userToBlock.email}
                                    </p>
                                </div>
                                <span
                                    className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                        userToBlock.role === "ADMIN"
                                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                                            : "bg-slate-100 text-slate-700 border border-slate-200"
                                    }`}
                                >
                                    {userToBlock.role === "ADMIN" ? "Quản trị viên" : "Người dùng"}
                                </span>
                            </div>
                        </div>

                        {/* Warning description */}
                        <p className="mt-4 text-xs text-slate-600 leading-relaxed">
                            Bạn có chắc chắn muốn khóa tài khoản{" "}
                            <strong className="text-slate-900">"{userToBlock.username}"</strong>?
                            Sau khi bị khóa, người dùng này sẽ{" "}
                            <span className="font-bold text-rose-600">
                                không thể đăng nhập
                            </span>{" "}
                            hoặc thực hiện các giao dịch trên hệ thống cho tới khi được mở khóa.
                        </p>

                        {/* Actions */}
                        <div className="mt-6 flex items-center justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={() => setUserToBlock(null)}
                                disabled={actionLoading !== null}
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmBlock}
                                disabled={actionLoading !== null}
                                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-200 hover:bg-rose-700 transition cursor-pointer disabled:opacity-60"
                            >
                                {actionLoading === userToBlock.id ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin" />
                                        Đang khóa...
                                    </>
                                ) : (
                                    <>
                                        <Ban size={14} />
                                        Xác nhận khóa
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal xác nhận Mở khóa tài khoản */}
            {userToUnblock && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
                    <div
                        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150"
                        role="dialog"
                        aria-modal="true"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                                    <ShieldCheck size={24} />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-slate-900">
                                        Xác nhận mở khóa tài khoản
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Khôi phục quyền truy cập cho người dùng
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => !actionLoading && setUserToUnblock(null)}
                                disabled={actionLoading !== null}
                                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer disabled:opacity-50"
                                title="Đóng"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* User Card */}
                        <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-black text-sm">
                                    {userToUnblock.username.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-900 text-sm truncate">
                                            {userToUnblock.username}
                                        </span>
                                        <span className="text-[10px] font-semibold text-slate-500 rounded bg-slate-200/70 px-1.5 py-0.5">
                                            #{userToUnblock.id}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 truncate mt-0.5">
                                        {userToUnblock.email}
                                    </p>
                                </div>
                                <span
                                    className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                        userToUnblock.role === "ADMIN"
                                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                                            : "bg-slate-100 text-slate-700 border border-slate-200"
                                    }`}
                                >
                                    {userToUnblock.role === "ADMIN" ? "Quản trị viên" : "Người dùng"}
                                </span>
                            </div>
                        </div>

                        {/* Notice description */}
                        <p className="mt-4 text-xs text-slate-600 leading-relaxed">
                            Bạn có chắc chắn muốn mở lại quyền truy cập cho tài khoản{" "}
                            <strong className="text-slate-900">"{userToUnblock.username}"</strong>?
                            Người dùng sẽ có thể đăng nhập và tiếp tục mua hàng trên hệ thống.
                        </p>

                        {/* Actions */}
                        <div className="mt-6 flex items-center justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={() => setUserToUnblock(null)}
                                disabled={actionLoading !== null}
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmUnblock}
                                disabled={actionLoading !== null}
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-200 hover:bg-emerald-700 transition cursor-pointer disabled:opacity-60"
                            >
                                {actionLoading === userToUnblock.id ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin" />
                                        Đang mở khóa...
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck size={14} />
                                        Xác nhận mở khóa
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
