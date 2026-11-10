import {
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    Edit3,
    PackagePlus,
    RefreshCw,
    Search,
    X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import { adminService } from "../../service/adminService";
import { catalogService } from "../../service/catalogService";
import type { InventoryItem } from "../../types/admin";
import type { Category, ProductSummary } from "../../types/catalog";

export default function AdminInventoryPage() {
    const [searchParams] = useSearchParams();
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [lowStockOnly, setLowStockOnly] = useState(
        searchParams.get("filter") === "low",
    );
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [quantity, setQuantity] = useState(0);
    const [mode, setMode] = useState<"restock" | "set">("restock");
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<ProductSummary[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | "all">(
        "all",
    );

    // Phân trang
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(15);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    const loadInventory = useCallback(() => {
        setLoading(true);
        adminService
            .getInventories(lowStockOnly, currentPage, pageSize)
            .then((pageData) => {
                setItems(pageData.content || []);
                setTotalPages(pageData.totalPages || 1);
                setTotalElements(
                    pageData.totalElements ?? (pageData.content?.length || 0),
                );
            })
            .catch(() =>
                toast.error("Không tải được dữ liệu tồn kho. Hãy kiểm tra quyền Admin."),
            )
            .finally(() => setLoading(false));
    }, [lowStockOnly, currentPage, pageSize]);

    useEffect(() => {
        void Promise.resolve().then(loadInventory);
    }, [loadInventory]);

    useEffect(() => {
        void catalogService.getCategories().then(setCategories);
        void catalogService
            .getProducts({ page: 0, size: 100 })
            .then((page) => setProducts(page.content));
    }, []);

    const openEditor = (item: InventoryItem, nextMode: "restock" | "set") => {
        setEditingItem(item);
        setMode(nextMode);
        setQuantity(nextMode === "set" ? item.quantity : 1);
    };

    const saveStock = async () => {
        if (!editingItem || quantity < 0 || (mode === "restock" && quantity === 0))
            return;
        try {
            setSaving(true);
            if (mode === "restock")
                await adminService.restock(editingItem.productId, quantity);
            else await adminService.updateStock(editingItem.productId, quantity);
            toast.success(
                mode === "restock"
                    ? "Đã nhập thêm hàng vào kho thành công"
                    : "Đã thiết lập lại số lượng tồn kho",
            );
            setEditingItem(null);
            loadInventory();
        } catch {
            toast.error("Không thể cập nhật tồn kho");
        } finally {
            setSaving(false);
        }
    };

    const productCategories = useMemo(
        () =>
            new Map(
                products.map((product) => [product.id, product.categoryId]),
            ),
        [products],
    );

    const shownItems = items.filter(
        (item) =>
            item.productName.toLowerCase().includes(search.toLowerCase()) &&
            (selectedCategoryId === "all" ||
                productCategories.get(item.productId) === selectedCategoryId),
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                        Quản lý lưu kho
                    </span>
                    <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
                        Kiểm soát tồn kho
                    </h1>
                    <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                        Theo dõi lượng hàng sẵn sàng bán, lượng đang giữ và nhập bổ sung kịp thời.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => loadInventory()}
                    className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 cursor-pointer"
                >
                    <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Đồng bộ kho hàng
                </button>
            </section>

            {/* Quick Metrics */}
            <section className="grid gap-5 sm:grid-cols-3">
                <article className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Tổng mặt hàng
                    </p>
                    <p className="mt-2 text-2xl font-black text-slate-900">
                        {items.length} mặt hàng
                    </p>
                </article>

                <article className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Sẵn sàng xuất kho
                    </p>
                    <p className="mt-2 text-2xl font-black text-emerald-600">
                        {items.reduce((total, item) => total + item.availableQuantity, 0)} đơn vị
                    </p>
                </article>

                <article className="rounded-2xl border border-rose-200 bg-rose-50/50 p-5 shadow-xs">
                    <p className="text-xs font-bold uppercase tracking-wider text-rose-500">
                        Cảnh báo sắp hết
                    </p>
                    <p className="mt-2 text-2xl font-black text-rose-700">
                        {items.filter((item) => item.lowStock).length} sản phẩm
                    </p>
                </article>
            </section>

            {/* Category Filter Pills & Search */}
            <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <label className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5">
                        <Search size={16} className="text-slate-400" />
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            className="w-full bg-transparent text-xs font-medium text-slate-800 outline-none placeholder:text-slate-400"
                            placeholder="Tìm kiếm theo tên sản phẩm..."
                        />
                    </label>

                    <button
                        type="button"
                        onClick={() => {
                            setLowStockOnly(!lowStockOnly);
                            setCurrentPage(0);
                        }}
                        className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
                            lowStockOnly
                                ? "border-rose-300 bg-rose-50 text-rose-700"
                                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                    >
                        <AlertTriangle size={15} /> Chỉ hàng sắp hết
                    </button>
                </div>

                {/* Categories filter chips */}
                <div className="border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                        <button
                            type="button"
                            onClick={() => setSelectedCategoryId("all")}
                            className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                                selectedCategoryId === "all"
                                    ? "bg-indigo-600 text-white shadow-xs"
                                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                            }`}
                        >
                            Tất cả ngành hàng
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                type="button"
                                onClick={() => setSelectedCategoryId(category.id)}
                                className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                                    selectedCategoryId === category.id
                                        ? "bg-indigo-600 text-white shadow-xs"
                                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Inventory Data Table */}
            <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] text-left text-xs">
                        <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Sản phẩm</th>
                                <th className="px-6 py-4">Tổng số lượng</th>
                                <th className="px-6 py-4">Đang giữ</th>
                                <th className="px-6 py-4">Sẵn sàng bán</th>
                                <th className="px-6 py-4">Cập nhật gần nhất</th>
                                <th className="px-6 py-4 text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center text-slate-400">
                                        Đang tải dữ liệu tồn kho...
                                    </td>
                                </tr>
                            ) : shownItems.map((item) => (
                                <tr key={item.productId} className="hover:bg-slate-50/60 transition">
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-slate-900">{item.productName}</p>
                                        <p className="mt-0.5 text-[11px] text-slate-400">Mã #{item.productId}</p>
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-slate-800">
                                        {item.quantity}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {item.reservedQuantity}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                                                item.lowStock
                                                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                                                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                            }`}
                                        >
                                            <span
                                                className={`h-1.5 w-1.5 rounded-full ${
                                                    item.lowStock ? "bg-rose-500" : "bg-emerald-500"
                                                }`}
                                            />
                                            {item.availableQuantity} {item.lowStock ? "• Sắp hết" : "• Ổn định"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {item.updatedAt
                                            ? new Date(item.updatedAt).toLocaleDateString("vi-VN")
                                            : "—"}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => openEditor(item, "restock")}
                                                className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition"
                                            >
                                                <PackagePlus size={14} /> Nhập hàng
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => openEditor(item, "set")}
                                                aria-label="Chỉnh sửa tồn kho"
                                                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 transition"
                                                title="Sửa số lượng"
                                            >
                                                <Edit3 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!loading && !shownItems.length && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center text-slate-400">
                                        Không tìm thấy mặt hàng nào phù hợp với bộ lọc.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Table pagination */}
                <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4 text-xs text-slate-500 sm:flex-row">
                    <span>
                        Hiển thị <strong>{shownItems.length}</strong> / tổng <strong>{totalElements}</strong> mặt hàng
                    </span>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-medium">
                            Trang {currentPage + 1} / {Math.max(1, totalPages)}
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                disabled={currentPage <= 0 || loading}
                                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                                title="Trang trước"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                type="button"
                                disabled={currentPage >= totalPages - 1 || loading}
                                onClick={() => setCurrentPage((p) => p + 1)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                                title="Trang sau"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Restock / Set Modal */}
            {editingItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in">
                    <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div>
                                <h2 className="text-base font-extrabold text-slate-900">
                                    {mode === "restock"
                                        ? "Nhập thêm hàng vào kho"
                                        : "Thiết lập lại số lượng kho"}
                                </h2>
                                <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">
                                    {editingItem.productName}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setEditingItem(null)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="mt-5 space-y-4">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                                {mode === "restock"
                                    ? "Số lượng nhập thêm (+)"
                                    : "Số lượng tồn kho thực tế"}
                                <input
                                    autoFocus
                                    type="number"
                                    min="0"
                                    value={quantity}
                                    onChange={(event) => setQuantity(Number(event.target.value))}
                                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-bold text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white"
                                />
                            </label>

                            {mode === "restock" && (
                                <p className="text-xs text-slate-500">
                                    Hiện tại đang có:{" "}
                                    <strong className="text-slate-800">{editingItem.availableQuantity}</strong> đơn vị. Sau khi nhập sẽ có:{" "}
                                    <strong className="text-emerald-600 font-extrabold">
                                        {editingItem.availableQuantity + Math.max(0, quantity)}
                                    </strong>{" "}
                                    đơn vị.
                                </p>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end gap-2.5 border-t border-slate-100 pt-4">
                            <button
                                type="button"
                                onClick={() => setEditingItem(null)}
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                type="button"
                                disabled={saving}
                                onClick={saveStock}
                                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 transition disabled:opacity-50"
                            >
                                {saving ? "Đang lưu..." : "Xác nhận cập nhật"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
