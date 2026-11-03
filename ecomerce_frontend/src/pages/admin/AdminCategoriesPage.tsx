import { Edit3, FolderPlus, Layers3, Plus, Tag, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { KeyboardEvent } from "react";
import toast from "react-hot-toast";
import {
    enrichCategoryWithBrands,
    getDefaultBrandsForCategory,
    saveStoredCategoryBrands,
} from "../../lib/brandHelper";
import { adminService } from "../../service/adminService";
import { catalogService } from "../../service/catalogService";
import type { Category } from "../../types/catalog";

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [editing, setEditing] = useState<Category | null | "new">(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [brands, setBrands] = useState<string[]>([]);
    const [brandInput, setBrandInput] = useState("");
    const [saving, setSaving] = useState(false);

    const loadCategories = () =>
        catalogService
            .getCategories()
            .then((cats) => {
                const enriched = cats.map(enrichCategoryWithBrands);
                setCategories(enriched);
            })
            .catch(() => toast.error("Không tải được danh mục"));

    useEffect(() => {
        void Promise.resolve().then(loadCategories);
    }, []);

    const openForm = (category: Category | "new") => {
        setEditing(category);
        if (category === "new") {
            setName("");
            setDescription("");
            setBrands([]);
        } else {
            setName(category.name);
            setDescription(category.description || "");
            setBrands(category.brands && category.brands.length > 0 ? [...category.brands] : getDefaultBrandsForCategory(category.name));
        }
        setBrandInput("");
    };

    const addBrand = (brandToAdd?: string) => {
        const target = (brandToAdd || brandInput).trim();
        if (!target) return;
        if (brands.some((b) => b.toLowerCase() === target.toLowerCase())) {
            toast.error(`Hãng "${target}" đã có trong danh mục`);
            return;
        }
        setBrands([...brands, target]);
        setBrandInput("");
    };

    const removeBrand = (brandToRemove: string) => {
        setBrands(brands.filter((b) => b !== brandToRemove));
    };

    const handleKeyDownBrand = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addBrand();
        }
    };

    const save = async () => {
        if (!name.trim()) return toast.error("Vui lòng nhập tên danh mục");
        try {
            setSaving(true);
            const trimmedName = name.trim();
            const trimmedDesc = description.trim();
            let savedCategory: Category | null = null;

            if (editing === "new") {
                savedCategory = await adminService.createCategory({
                    name: trimmedName,
                    description: trimmedDesc,
                    brands,
                });
            } else if (editing) {
                savedCategory = await adminService.updateCategory(editing.id, {
                    name: trimmedName,
                    description: trimmedDesc,
                    brands,
                });
            }

            const targetId = savedCategory?.id || (editing !== "new" && editing ? editing.id : null);
            if (targetId) {
                saveStoredCategoryBrands(targetId, brands);
            }

            toast.success(editing === "new" ? "Đã thêm danh mục mới thành công" : "Đã cập nhật danh mục");
            setEditing(null);
            loadCategories();
        } catch {
            toast.error("Không thể lưu danh mục");
        } finally {
            setSaving(false);
        }
    };

    const remove = async (category: Category) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa danh mục “${category.name}”?`)) return;
        try {
            await adminService.deleteCategory(category.id);
            toast.success("Đã xóa danh mục thành công");
            loadCategories();
        } catch {
            toast.error("Không thể xóa danh mục đang có sản phẩm liên kết");
        }
    };

    const suggestedBrands = getDefaultBrandsForCategory(name).filter(
        (b) => !brands.some((existing) => existing.toLowerCase() === b.toLowerCase()),
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                        Quản lý catalogue
                    </span>
                    <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
                        Danh mục & Hãng sản phẩm
                    </h1>
                    <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                        Quản lý danh mục và cấu hình các hãng/thương hiệu để tối ưu hóa bộ lọc tìm kiếm cho khách hàng.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => openForm("new")}
                    className="inline-flex w-fit items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 cursor-pointer"
                >
                    <FolderPlus size={16} /> Thêm danh mục mới
                </button>
            </section>

            {/* Grid list of categories */}
            <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {categories.map((category) => (
                    <article
                        key={category.id}
                        className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:border-indigo-200 hover:shadow-md"
                    >
                        <div>
                            <div className="flex items-start justify-between">
                                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                                    <Layers3 size={20} />
                                </span>
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        aria-label="Sửa danh mục"
                                        onClick={() => openForm(category)}
                                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition"
                                        title="Chỉnh sửa danh mục & các hãng"
                                    >
                                        <Edit3 size={15} />
                                    </button>
                                    <button
                                        type="button"
                                        aria-label="Xóa danh mục"
                                        onClick={() => remove(category)}
                                        className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                                        title="Xóa danh mục"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                            <h2 className="mt-4 text-base font-extrabold text-slate-900">
                                {category.name}
                            </h2>
                            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed line-clamp-2">
                                {category.description || "Chưa có mô tả cho ngành hàng này."}
                            </p>

                            {/* Brands section */}
                            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                                        <Tag size={12} className="text-indigo-500" />
                                        Các hãng ({category.brands?.length || 0})
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => openForm(category)}
                                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
                                    >
                                        + Thêm hãng
                                    </button>
                                </div>
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    {category.brands && category.brands.length > 0 ? (
                                        category.brands.map((b) => (
                                            <span
                                                key={b}
                                                className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-2xs"
                                            >
                                                {b}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-[11px] italic text-slate-400">
                                            Chưa thêm hãng nào. Nhấn sửa để cấu hình.
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 border-t border-slate-100 pt-3 flex items-center justify-between text-[11px] text-slate-400">
                            <span>Mã danh mục #{category.id}</span>
                            <span className="font-semibold text-emerald-600">Đang hoạt động</span>
                        </div>
                    </article>
                ))}

                {!categories.length && (
                    <p className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center text-xs text-slate-400">
                        Chưa có danh mục sản phẩm nào trong hệ thống.
                    </p>
                )}
            </section>

            {/* Modal Form */}
            {editing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in">
                    <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div>
                                <h2 className="text-base font-extrabold text-slate-900">
                                    {editing === "new" ? "Thêm danh mục mới" : "Chỉnh sửa danh mục & các hãng"}
                                </h2>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Cài đặt thông tin nhóm hàng và các thương hiệu tương ứng
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setEditing(null)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="mt-5 space-y-4">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                                Tên danh mục *
                                <input
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    placeholder="Ví dụ: Thiết bị di động, Laptop..."
                                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium outline-none transition focus:border-indigo-500 focus:bg-white"
                                />
                            </label>

                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                                Mô tả ngành hàng
                                <textarea
                                    value={description}
                                    onChange={(event) => setDescription(event.target.value)}
                                    rows={3}
                                    placeholder="Nhập mô tả ngắn gọn về nhóm sản phẩm này..."
                                    className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium outline-none transition focus:border-indigo-500 focus:bg-white"
                                />
                            </label>

                            {/* Brand management in modal */}
                            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/30 p-4">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
                                    Thêm các hãng / thương hiệu của danh mục
                                </label>
                                <p className="mt-1 text-[11px] text-slate-500">
                                    Các hãng này sẽ xuất hiện trên thanh bộ lọc sản phẩm trang người dùng.
                                </p>

                                <div className="mt-3 flex gap-2">
                                    <input
                                        value={brandInput}
                                        onChange={(e) => setBrandInput(e.target.value)}
                                        onKeyDown={handleKeyDownBrand}
                                        placeholder="Nhập tên hãng (ví dụ: Apple, Samsung, Dell...)"
                                        className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium outline-none transition focus:border-indigo-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => addBrand()}
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition"
                                    >
                                        <Plus size={14} /> Thêm hãng
                                    </button>
                                </div>

                                {/* Current brands chips */}
                                <div className="mt-3.5">
                                    <span className="text-[11px] font-semibold text-slate-500">
                                        Hãng đã thêm ({brands.length}):
                                    </span>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {brands.length > 0 ? (
                                            brands.map((b) => (
                                                <span
                                                    key={b}
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-2.5 py-1 text-xs font-bold text-indigo-700 shadow-2xs"
                                                >
                                                    {b}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeBrand(b)}
                                                        className="text-slate-400 hover:text-rose-600 transition"
                                                        title={`Xóa hãng ${b}`}
                                                    >
                                                        <X size={13} />
                                                    </button>
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-xs italic text-slate-400">
                                                Chưa có hãng nào được thêm. Hãy nhập tên hãng ở trên.
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Suggested brands */}
                                {suggestedBrands.length > 0 && (
                                    <div className="mt-4 border-t border-indigo-100/60 pt-3">
                                        <span className="text-[11px] font-semibold text-slate-500">
                                            Gợi ý hãng phổ biến (nhấn để thêm nhanh):
                                        </span>
                                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                                            {suggestedBrands.slice(0, 8).map((suggestion) => (
                                                <button
                                                    key={suggestion}
                                                    type="button"
                                                    onClick={() => addBrand(suggestion)}
                                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600 hover:border-indigo-400 hover:text-indigo-600 transition"
                                                >
                                                    <Plus size={11} /> {suggestion}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-2.5 border-t border-slate-100 pt-4">
                            <button
                                type="button"
                                onClick={() => setEditing(null)}
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                type="button"
                                disabled={saving}
                                onClick={save}
                                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 transition disabled:opacity-50"
                            >
                                {saving ? "Đang lưu..." : "Lưu danh mục & các hãng"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
