import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Flame,
    Loader2,
    Pencil,
    Plus,
    RefreshCw,
    Tag,
    Trash2,
    X,
    Zap,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { adminService } from "../../service/adminService";
import { catalogService } from "../../service/catalogService";
import type { Category, ProductSummary } from "../../types/catalog";
import type {
    FlashSaleDiscountType,
    FlashSaleRequest,
    FlashSaleResponse,
    FlashSaleScope,
} from "../../types/flashSale";

const currency = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
});

const formatDateTime = (iso?: string | null) => {
    if (!iso) return "—";
    try {
        return new Date(iso).toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return iso;
    }
};

const toLocalInputValue = (iso?: string | null) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const toIsoString = (localValue: string) => {
    if (!localValue) return "";
    const d = new Date(localValue);
    return Number.isNaN(d.getTime()) ? "" : d.toISOString();
};

const scopeLabels: Record<FlashSaleScope, string> = {
    ALL: "Toàn bộ cửa hàng",
    CATEGORY: "Theo danh mục",
    PRODUCT: "Theo sản phẩm",
};

interface FormState {
    name: string;
    description: string;
    scope: FlashSaleScope;
    categoryId: string;
    productId: string;
    discountType: FlashSaleDiscountType;
    discountValue: string;
    startAt: string;
    endAt: string;
    isActive: boolean;
}

const emptyForm: FormState = {
    name: "",
    description: "",
    scope: "ALL",
    categoryId: "",
    productId: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    startAt: "",
    endAt: "",
    isActive: true,
};

export default function AdminFlashSalePage() {
    const [sales, setSales] = useState<FlashSaleResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [scopeFilter, setScopeFilter] = useState<string>("all");
    const [activeFilter, setActiveFilter] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const pageSize = 10;

    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<ProductSummary[]>([]);

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<FlashSaleResponse | null>(null);
    const [form, setForm] = useState<FormState>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<FlashSaleResponse | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const loadSales = useCallback(() => {
        setLoading(true);
        adminService
            .getFlashSales(
                scopeFilter === "all" ? undefined : scopeFilter,
                activeFilter === "all" ? undefined : activeFilter === "active",
                currentPage,
                pageSize,
            )
            .then((res) => {
                setSales(res.content || []);
                setTotalPages(res.totalPages || 1);
                setTotalElements(res.totalElements ?? 0);
            })
            .catch(() => toast.error("Không thể tải danh sách Flash Sale"))
            .finally(() => setLoading(false));
    }, [scopeFilter, activeFilter, currentPage]);

    useEffect(() => {
        loadSales();
    }, [loadSales]);

    useEffect(() => {
        catalogService
            .getCategories()
            .then(setCategories)
            .catch(() => undefined);
        catalogService
            .getProducts({ size: 100 })
            .then((res) => setProducts(res.content || []))
            .catch(() => undefined);
    }, []);

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setModalOpen(true);
    };

    const openEdit = (sale: FlashSaleResponse) => {
        setEditing(sale);
        setForm({
            name: sale.name,
            description: sale.description || "",
            scope: sale.scope,
            categoryId: sale.categoryId != null ? String(sale.categoryId) : "",
            productId: sale.productId != null ? String(sale.productId) : "",
            discountType: sale.discountType,
            discountValue: String(sale.discountValue),
            startAt: toLocalInputValue(sale.startAt),
            endAt: toLocalInputValue(sale.endAt),
            isActive: sale.isActive,
        });
        setModalOpen(true);
    };

    const handleSubmit = async () => {
        if (!form.name.trim()) {
            toast.error("Vui lòng nhập tên chương trình");
            return;
        }
        const discountValue = Number(form.discountValue);
        if (!discountValue || discountValue <= 0) {
            toast.error("Giá trị giảm phải lớn hơn 0");
            return;
        }
        const startAt = toIsoString(form.startAt);
        const endAt = toIsoString(form.endAt);
        if (!startAt || !endAt) {
            toast.error("Vui lòng chọn thời gian bắt đầu và kết thúc");
            return;
        }
        if (new Date(startAt) >= new Date(endAt)) {
            toast.error("Thời gian bắt đầu phải trước thời gian kết thúc");
            return;
        }
        if (form.scope === "CATEGORY" && !form.categoryId) {
            toast.error("Vui lòng chọn danh mục áp dụng");
            return;
        }
        if (form.scope === "PRODUCT" && !form.productId) {
            toast.error("Vui lòng chọn sản phẩm áp dụng");
            return;
        }

        const payload: FlashSaleRequest = {
            name: form.name.trim(),
            description: form.description.trim() || null,
            scope: form.scope,
            categoryId: form.scope === "CATEGORY" ? Number(form.categoryId) : null,
            productId: form.scope === "PRODUCT" ? Number(form.productId) : null,
            discountType: form.discountType,
            discountValue,
            startAt,
            endAt,
            isActive: form.isActive,
        };

        setSaving(true);
        try {
            if (editing) {
                await adminService.updateFlashSale(editing.id, payload);
                toast.success("Cập nhật Flash Sale thành công");
            } else {
                await adminService.createFlashSale(payload);
                toast.success("Tạo Flash Sale thành công");
            }
            setModalOpen(false);
            loadSales();
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } }; message?: string };
            toast.error(e?.response?.data?.message || e?.message || "Lưu Flash Sale thất bại");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleting) return;
        setDeleteLoading(true);
        try {
            await adminService.deleteFlashSale(deleting.id);
            toast.success("Đã xóa Flash Sale");
            setDeleting(null);
            loadSales();
        } catch {
            toast.error("Không thể xóa Flash Sale");
        } finally {
            setDeleteLoading(false);
        }
    };

    const discountLabel = (sale: FlashSaleResponse) =>
        sale.discountType === "PERCENTAGE"
            ? `Giảm ${sale.discountValue}%`
            : `Giảm ${currency.format(sale.discountValue)}`;

    const statusBadge = (sale: FlashSaleResponse) => {
        if (sale.isRunning) {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Đang chạy
                </span>
            );
        }
        if (sale.isActive) {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 border border-amber-200">
                    <Calendar size={11} /> Chưa tới giờ
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600 border border-slate-200">
                Đã tắt
            </span>
        );
    };

    const scopeLabel = (sale: FlashSaleResponse) => {
        if (sale.scope === "CATEGORY") return `Danh mục: ${sale.categoryName || `#${sale.categoryId}`}`;
        if (sale.scope === "PRODUCT") return `SP: ${sale.productName || `#${sale.productId}`}`;
        return "Toàn bộ cửa hàng";
    };

    const inputCls =
        "w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium outline-none transition focus:border-indigo-500 focus:bg-white";
    const labelCls = "block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5";

    return (
        <div className="space-y-6">
            {/* Header */}
            <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                        Khuyến mãi & Ưu đãi
                    </span>
                    <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
                        Quản lý Flash Sale
                    </h1>
                    <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                        Tạo và quản lý các chương trình giảm giá giới hạn thời gian trên toàn cửa hàng, theo danh mục hoặc sản phẩm.
                    </p>
                </div>
                <div className="flex items-center gap-2.5">
                    <button
                        type="button"
                        onClick={loadSales}
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Làm mới
                    </button>
                    <button
                        type="button"
                        onClick={openCreate}
                        className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-200 transition hover:bg-rose-700 cursor-pointer"
                    >
                        <Plus size={15} /> Tạo Flash Sale
                    </button>
                </div>
            </section>

            {/* Filters */}
            <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
                <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                        <label className={labelCls}>Phạm vi áp dụng</label>
                        <select
                            value={scopeFilter}
                            onChange={(e) => {
                                setScopeFilter(e.target.value);
                                setCurrentPage(0);
                            }}
                            className={`${inputCls} cursor-pointer`}
                        >
                            <option value="all">Tất cả phạm vi</option>
                            <option value="ALL">Toàn bộ cửa hàng</option>
                            <option value="CATEGORY">Theo danh mục</option>
                            <option value="PRODUCT">Theo sản phẩm</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelCls}>Trạng thái</label>
                        <select
                            value={activeFilter}
                            onChange={(e) => {
                                setActiveFilter(e.target.value);
                                setCurrentPage(0);
                            }}
                            className={`${inputCls} cursor-pointer`}
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="active">Đang bật</option>
                            <option value="inactive">Đã tắt</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <p className="text-xs text-slate-500">
                            Tổng cộng <strong className="text-slate-800">{totalElements}</strong> chương trình Flash Sale
                        </p>
                    </div>
                </div>
            </section>

            {/* Table */}
            <section className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-600">ID</th>
                                <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-600">Chương trình</th>
                                <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-600">Phạm vi</th>
                                <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-600">Giảm giá</th>
                                <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-600">Thời gian</th>
                                <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-600">Trạng thái</th>
                                <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-600 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sales.map((sale) => (
                                <tr key={sale.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/30 transition">
                                    <td className="px-5 py-4 text-xs font-medium text-slate-500">#{sale.id}</td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2.5">
                                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
                                                <Flame size={16} />
                                            </span>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-bold text-slate-900 max-w-[220px]">{sale.name}</p>
                                                {sale.description && (
                                                    <p className="truncate text-[11px] text-slate-400 max-w-[220px]">{sale.description}</p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700 border border-indigo-200">
                                            <Tag size={11} /> {scopeLabels[sale.scope]}
                                        </span>
                                        <p className="mt-1 text-[11px] text-slate-500 truncate max-w-[200px]">{scopeLabel(sale)}</p>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-black text-amber-700 border border-amber-200">
                                            {discountLabel(sale)}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-[11px] text-slate-600 whitespace-nowrap">
                                        <p>{formatDateTime(sale.startAt)}</p>
                                        <p className="text-slate-400">→ {formatDateTime(sale.endAt)}</p>
                                    </td>
                                    <td className="px-5 py-4">{statusBadge(sale)}</td>
                                    <td className="px-5 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => openEdit(sale)}
                                                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-[11px] font-bold text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition cursor-pointer"
                                            >
                                                <Pencil size={12} /> Sửa
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setDeleting(sale)}
                                                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-[11px] font-bold text-rose-700 border border-rose-200 hover:bg-rose-100 transition cursor-pointer"
                                            >
                                                <Trash2 size={12} /> Xóa
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {!loading && sales.length === 0 && (
                    <div className="py-16 text-center">
                        <Zap size={48} className="mx-auto text-slate-300 mb-3" />
                        <p className="text-sm font-semibold text-slate-400">
                            Chưa có chương trình Flash Sale nào. Nhấn "Tạo Flash Sale" để bắt đầu.
                        </p>
                    </div>
                )}
            </section>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 text-xs text-slate-500 shadow-xs sm:flex-row">
                    <span>
                        Trang <strong>{currentPage + 1}</strong> / <strong>{totalPages}</strong> — {totalElements} chương trình
                    </span>
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            disabled={currentPage <= 0 || loading}
                            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            type="button"
                            disabled={currentPage >= totalPages - 1 || loading}
                            onClick={() => setCurrentPage((p) => p + 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Create/Edit Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150 overflow-y-auto">
                    <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150 my-8">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
                                    <Flame size={22} />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-slate-900">
                                        {editing ? "Chỉnh sửa Flash Sale" : "Tạo Flash Sale mới"}
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        {editing ? `Đang sửa chương trình #${editing.id}` : "Cấu hình chương trình giảm giá giới hạn thời gian"}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => !saving && setModalOpen(false)}
                                disabled={saving}
                                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer disabled:opacity-50"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <label className={labelCls}>Tên chương trình *</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="VD: Flash Sale 11.11 - Giảm sâu toàn shop"
                                    className={inputCls}
                                    maxLength={255}
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className={labelCls}>Mô tả</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Mô tả ngắn về chương trình khuyến mãi..."
                                    rows={2}
                                    className={`${inputCls} resize-none`}
                                    maxLength={1000}
                                />
                            </div>

                            <div>
                                <label className={labelCls}>Phạm vi áp dụng *</label>
                                <select
                                    value={form.scope}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            scope: e.target.value as FlashSaleScope,
                                            categoryId: "",
                                            productId: "",
                                        })
                                    }
                                    className={`${inputCls} cursor-pointer`}
                                >
                                    <option value="ALL">Toàn bộ cửa hàng</option>
                                    <option value="CATEGORY">Theo danh mục</option>
                                    <option value="PRODUCT">Theo sản phẩm</option>
                                </select>
                            </div>

                            {form.scope === "CATEGORY" && (
                                <div>
                                    <label className={labelCls}>Danh mục *</label>
                                    <select
                                        value={form.categoryId}
                                        onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                                        className={`${inputCls} cursor-pointer`}
                                    >
                                        <option value="">-- Chọn danh mục --</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {form.scope === "PRODUCT" && (
                                <div className="sm:col-span-2">
                                    <label className={labelCls}>Sản phẩm *</label>
                                    <select
                                        value={form.productId}
                                        onChange={(e) => setForm({ ...form, productId: e.target.value })}
                                        className={`${inputCls} cursor-pointer`}
                                    >
                                        <option value="">-- Chọn sản phẩm --</option>
                                        {products.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                #{p.id} — {p.name} ({currency.format(p.price)})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className={labelCls}>Loại giảm giá *</label>
                                <select
                                    value={form.discountType}
                                    onChange={(e) =>
                                        setForm({ ...form, discountType: e.target.value as FlashSaleDiscountType })
                                    }
                                    className={`${inputCls} cursor-pointer`}
                                >
                                    <option value="PERCENTAGE">Phần trăm (%)</option>
                                    <option value="FIXED_AMOUNT">Số tiền cố định (VNĐ)</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>
                                    Giá trị giảm * {form.discountType === "PERCENTAGE" ? "(%)" : "(VNĐ)"}
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step={form.discountType === "PERCENTAGE" ? "0.01" : "1000"
                                    }
                                    value={form.discountValue}
                                    onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                                    placeholder={form.discountType === "PERCENTAGE" ? "VD: 20" : "VD: 50000"}
                                    className={inputCls}
                                />
                            </div>

                            <div>
                                <label className={labelCls}>Bắt đầu *</label>
                                <input
                                    type="datetime-local"
                                    value={form.startAt}
                                    onChange={(e) => setForm({ ...form, startAt: e.target.value })}
                                    className={inputCls}
                                />
                            </div>
                            <div>
                                <label className={labelCls}>Kết thúc *</label>
                                <input
                                    type="datetime-local"
                                    value={form.endAt}
                                    onChange={(e) => setForm({ ...form, endAt: e.target.value })}
                                    className={inputCls}
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="flex items-center gap-2.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.isActive}
                                        onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                                        className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                                    />
                                    <span className="text-xs font-bold text-slate-700">
                                        Kích hoạt chương trình ngay (isActive)
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                disabled={saving}
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={saving}
                                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-200 hover:bg-rose-700 transition cursor-pointer disabled:opacity-60"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin" /> Đang lưu...
                                    </>
                                ) : editing ? (
                                    "Cập nhật"
                                ) : (
                                    "Tạo Flash Sale"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            {deleting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
                                    <Trash2 size={22} />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-slate-900">Xóa Flash Sale</h3>
                                    <p className="text-xs text-slate-500">Hành động này không thể hoàn tác</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => !deleteLoading && setDeleting(null)}
                                disabled={deleteLoading}
                                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer disabled:opacity-50"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <p className="mt-4 text-xs text-slate-600 leading-relaxed">
                            Bạn có chắc chắn muốn xóa chương trình{" "}
                            <strong className="text-slate-900">"{deleting.name}"</strong>? Sau khi xóa,
                            chương trình sẽ không còn áp dụng giảm giá cho sản phẩm.
                        </p>

                        <div className="mt-6 flex items-center justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={() => setDeleting(null)}
                                disabled={deleteLoading}
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={deleteLoading}
                                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-200 hover:bg-rose-700 transition cursor-pointer disabled:opacity-60"
                            >
                                {deleteLoading ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin" /> Đang xóa...
                                    </>
                                ) : (
                                    "Xác nhận xóa"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
