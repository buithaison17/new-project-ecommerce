import {
    ChevronLeft,
    ChevronRight,
    Edit3,
    ImagePlus,
    PackagePlus,
    Plus,
    RefreshCw,
    Trash2,
    UploadCloud,
    X,
} from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import toast from "react-hot-toast";
import { adminService } from "../../service/adminService";
import { catalogService } from "../../service/catalogService";
import type { Category, ProductImage, ProductSummary } from "../../types/catalog";

const currency = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
});

interface SelectedLocalFile {
    id: string;
    file: File;
    preview: string;
    name: string;
    sizeFormatted: string;
}

import { formatProductImageUrl } from "../../lib/image";

const formatImageUrl = (url?: string | null) => {
    if (!url) return null;
    return formatProductImageUrl(url);
};

export default function AdminProductsPage() {
    const fileInputId = useId();
    const [products, setProducts] = useState<ProductSummary[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | "all">("all");
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editingProductId, setEditingProductId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [savingMessage, setSavingMessage] = useState("");

    // Phân trang
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(12);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    // Form inputs
    const [form, setForm] = useState({
        name: "",
        description: "",
        price: "",
        categoryId: "",
        initialQuantity: "0",
        imageUrls: "",
    });

    // Device upload state
    const [selectedFiles, setSelectedFiles] = useState<SelectedLocalFile[]>([]);
    const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
    const [deletingImageId, setDeletingImageId] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const load = () => {
        setLoading(true);
        Promise.all([
            catalogService.getProducts({
                page: currentPage,
                size: pageSize,
                categoryId: selectedCategoryId === "all" ? undefined : selectedCategoryId,
            }),
            catalogService.getCategories(),
        ])
            .then(([prodPage, cats]) => {
                setProducts(prodPage.content || []);
                setTotalPages(prodPage.totalPages || 1);
                setTotalElements(prodPage.totalElements ?? (prodPage.content?.length || 0));
                setCategories(cats || []);
            })
            .catch(() => toast.error("Không thể tải danh sách sản phẩm hoặc danh mục"))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        load();
    }, [currentPage, selectedCategoryId]);

    const filteredProducts = products;

    const change = (key: keyof typeof form, value: string) =>
        setForm((old) => ({ ...old, [key]: value }));

    const clearSelectedFiles = () => {
        selectedFiles.forEach((item) => URL.revokeObjectURL(item.preview));
        setSelectedFiles([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleFilesChosen = (files: FileList | File[] | null) => {
        if (!files || files.length === 0) return;

        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        const currentTotal = existingImages.length + selectedFiles.length;
        const maxImages = 10;

        const newSelections: SelectedLocalFile[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            if (!allowedTypes.includes(file.type)) {
                toast.error(`"${file.name}" không hợp lệ. Chỉ chấp nhận JPG, PNG, WEBP, GIF.`);
                continue;
            }

            if (file.size > 5 * 1024 * 1024) {
                toast.error(`Ảnh "${file.name}" vượt quá 5MB. Vui lòng nén hoặc chọn ảnh nhỏ hơn.`);
                continue;
            }

            if (currentTotal + newSelections.length >= maxImages) {
                toast.error(`Mỗi sản phẩm chỉ được tối đa ${maxImages} ảnh.`);
                break;
            }

            const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
            newSelections.push({
                id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                file,
                preview: URL.createObjectURL(file),
                name: file.name,
                sizeFormatted: `${sizeMb} MB`,
            });
        }

        if (newSelections.length > 0) {
            setSelectedFiles((prev) => [...prev, ...newSelections]);
            toast.success(`Đã chọn ${newSelections.length} ảnh từ thiết bị`);
        }
    };

    const removeSelectedFile = (id: string) => {
        setSelectedFiles((prev) => {
            const found = prev.find((item) => item.id === id);
            if (found) URL.revokeObjectURL(found.preview);
            return prev.filter((item) => item.id !== id);
        });
    };

    const handleDeleteExistingImage = async (imageId: number) => {
        if (!editingProductId) return;
        setDeletingImageId(imageId);
        try {
            await adminService.deleteProductImage(editingProductId, imageId);
            setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
            toast.success("Đã xóa ảnh sản phẩm");
        } catch {
            toast.error("Không thể xóa ảnh. Hãy thử lại.");
        } finally {
            setDeletingImageId(null);
        }
    };

    const handleDeleteProduct = async (product: ProductSummary) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"?`)) return;
        try {
            await adminService.deleteProduct(product.id);
            toast.success(`Đã xóa sản phẩm "${product.name}"`);
            load();
        } catch {
            toast.error("Không thể xóa sản phẩm");
        }
    };

    const saveProduct = async () => {
        if (!form.name.trim()) return toast.error("Vui lòng nhập tên sản phẩm");
        if (!form.categoryId) return toast.error("Vui lòng chọn danh mục cho sản phẩm");
        if (!form.price || Number(form.price) <= 0)
            return toast.error("Vui lòng nhập giá bán hợp lệ (> 0 VNĐ)");
        if (!form.description.trim()) return toast.error("Vui lòng nhập mô tả sản phẩm");

        try {
            setSaving(true);

            const manualUrls = form.imageUrls
                .split("\n")
                .map((url) => url.trim())
                .filter(Boolean);

            if (editingProductId) {
                setSavingMessage("Đang cập nhật thông tin...");
                await adminService.updateProduct(editingProductId, {
                    name: form.name.trim(),
                    description: form.description.trim(),
                    price: Number(form.price),
                    categoryId: Number(form.categoryId),
                    imageUrls: manualUrls,
                });

                if (selectedFiles.length > 0) {
                    setSavingMessage(`Đang tải lên ${selectedFiles.length} ảnh từ thiết bị...`);
                    for (let i = 0; i < selectedFiles.length; i++) {
                        const fileItem = selectedFiles[i];
                        try {
                            await adminService.uploadProductImage(editingProductId, fileItem.file);
                        } catch (uploadErr) {
                            console.error(`Lỗi tải ảnh ${fileItem.name}:`, uploadErr);
                            toast.error(`Không thể tải lên ảnh "${fileItem.name}"`);
                        }
                    }
                }

                toast.success("Đã cập nhật sản phẩm thành công!");
            } else {
                setSavingMessage("Đang tạo sản phẩm...");
                const newProduct = await adminService.createProduct({
                    name: form.name.trim(),
                    description: form.description.trim(),
                    price: Number(form.price),
                    categoryId: Number(form.categoryId),
                    initialQuantity: Math.max(0, Number(form.initialQuantity) || 0),
                    imageUrls: manualUrls,
                });

                if (selectedFiles.length > 0 && newProduct?.id) {
                    setSavingMessage(`Đang tải lên ${selectedFiles.length} ảnh từ thiết bị...`);
                    for (let i = 0; i < selectedFiles.length; i++) {
                        const fileItem = selectedFiles[i];
                        try {
                            await adminService.uploadProductImage(newProduct.id, fileItem.file);
                        } catch (uploadErr) {
                            console.error(`Lỗi tải ảnh ${fileItem.name}:`, uploadErr);
                            toast.error(`Không thể tải lên ảnh "${fileItem.name}"`);
                        }
                    }
                }

                toast.success("Tạo sản phẩm và tải ảnh lên thành công!");
            }

            closeModal();
            load();
        } catch (err: any) {
            console.error("Lỗi lưu sản phẩm:", err);
            const msg =
                err.response?.data?.message ||
                (editingProductId ? "Không thể cập nhật sản phẩm" : "Không thể tạo sản phẩm");
            toast.error(msg);
        } finally {
            setSaving(false);
            setSavingMessage("");
        }
    };

    const openEditor = async (product: ProductSummary) => {
        clearSelectedFiles();
        try {
            const details = await catalogService.getProduct(String(product.id));
            setEditingProductId(product.id);
            setExistingImages(details.images || []);
            setForm({
                name: details.name,
                description: details.description || "",
                price: String(details.price),
                categoryId: String(details.category?.id || ""),
                initialQuantity: String(product.stockQuantity || 0),
                imageUrls: "",
            });
            setOpen(true);
        } catch {
            toast.error("Không tải được chi tiết sản phẩm");
        }
    };

    const openCreator = () => {
        clearSelectedFiles();
        setEditingProductId(null);
        setExistingImages([]);
        setForm({
            name: "",
            description: "",
            price: "",
            categoryId: categories[0]?.id ? String(categories[0].id) : "",
            initialQuantity: "10",
            imageUrls: "",
        });
        setOpen(true);
    };

    const closeModal = () => {
        clearSelectedFiles();
        setOpen(false);
        setEditingProductId(null);
        setExistingImages([]);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                        Quản lý kho hàng & danh mục
                    </span>
                    <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
                        Danh sách sản phẩm
                    </h1>
                    <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                        Đăng bán sản phẩm, tải ảnh trực tiếp từ thiết bị, phân loại danh mục và định giá bán.
                    </p>
                </div>
                <div className="flex items-center gap-2.5">
                    <button
                        type="button"
                        onClick={load}
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Làm mới
                    </button>
                    <button
                        type="button"
                        onClick={openCreator}
                        className="inline-flex w-fit items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 cursor-pointer"
                    >
                        <PackagePlus size={16} /> Thêm sản phẩm mới
                    </button>
                </div>
            </section>

            {/* Filter by Category */}
            <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                            Lọc theo danh mục
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-400">
                            Hiển thị {filteredProducts.length} sản phẩm phù hợp.
                        </p>
                    </div>
                </div>
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                    <button
                        type="button"
                        onClick={() => {
                            setSelectedCategoryId("all");
                            setCurrentPage(0);
                        }}
                        className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                            selectedCategoryId === "all"
                                ? "bg-indigo-600 text-white shadow-xs"
                                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                        Tất cả danh mục
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            type="button"
                            onClick={() => {
                                setSelectedCategoryId(category.id);
                                setCurrentPage(0);
                            }}
                            className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                                selectedCategoryId === category.id
                                    ? "bg-indigo-600 text-white shadow-xs"
                                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                            }`}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
            </section>

            {/* Products Grid */}
            <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product) => {
                    const imgUrl = formatImageUrl(product.thumbnailUrl);

                    return (
                        <article
                            key={product.id}
                            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs transition hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10"
                        >
                            <div className="relative">
                                {/* Action buttons */}
                                <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5 opacity-90 transition group-hover:opacity-100">
                                    <button
                                        type="button"
                                        onClick={() => openEditor(product)}
                                        aria-label={`Sửa ${product.name}`}
                                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/90 text-slate-700 shadow-md backdrop-blur-xs transition hover:bg-indigo-600 hover:text-white"
                                        title="Chỉnh sửa sản phẩm & ảnh"
                                    >
                                        <Edit3 size={14} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteProduct(product)}
                                        aria-label={`Xóa ${product.name}`}
                                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/90 text-rose-600 shadow-md backdrop-blur-xs transition hover:bg-rose-600 hover:text-white"
                                        title="Xóa sản phẩm"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>

                                {/* Thumbnail */}
                                <div className="flex h-48 w-full items-center justify-center overflow-hidden bg-slate-100">
                                    {imgUrl ? (
                                        <img
                                            src={imgUrl}
                                            alt={product.name}
                                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                            onError={(e) => {
                                                const target = e.currentTarget;
                                                if (!target.src.includes("placehold.co")) {
                                                    target.src =
                                                        "https://placehold.co/600x600/f1f5f9/64748b?text=ShopNova";
                                                }
                                            }}
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-slate-400">
                                            <ImagePlus size={32} />
                                            <span className="text-xs">Chưa có ảnh</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 flex flex-1 flex-col justify-between">
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                                        {product.categoryName}
                                    </p>
                                    <h3
                                        className="mt-1 line-clamp-2 text-sm font-bold text-slate-800 title={product.name}"
                                    >
                                        {product.name}
                                    </h3>
                                </div>

                                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                                    <span className="text-base font-extrabold text-indigo-600">
                                        {currency.format(product.price)}
                                    </span>
                                    <span
                                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                                            product.stockQuantity <= 5
                                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                        }`}
                                    >
                                        Kho: {product.stockQuantity}
                                    </span>
                                </div>
                            </div>
                        </article>
                    );
                })}
            </section>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 text-xs text-slate-500 shadow-xs sm:flex-row">
                    <span>
                        Hiển thị <strong>{products.length}</strong> / tổng <strong>{totalElements}</strong> sản phẩm
                    </span>
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            disabled={currentPage <= 0 || loading}
                            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                            title="Trang trước"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i)
                            .filter(
                                (p) =>
                                    p === 0 ||
                                    p === totalPages - 1 ||
                                    Math.abs(p - currentPage) <= 1,
                            )
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
                                        className={`h-8 min-w-8 rounded-lg px-2 text-xs font-bold transition ${
                                            currentPage === item
                                                ? "bg-indigo-600 text-white shadow-xs"
                                                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                        }`}
                                    >
                                        {item + 1}
                                    </button>
                                ),
                            )}
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
            )}

            {!loading && !filteredProducts.length && (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center text-slate-400">
                    <p className="text-sm font-semibold">
                        Chưa có sản phẩm nào trong danh mục này.
                    </p>
                    <button
                        type="button"
                        onClick={openCreator}
                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
                    >
                        <Plus size={15} /> Thêm sản phẩm đầu tiên
                    </button>
                </div>
            )}

            {/* Modal Create / Edit Product */}
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in">
                    <div className="my-8 w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div>
                                <h2 className="text-lg font-black text-slate-900">
                                    {editingProductId ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
                                </h2>
                                <p className="mt-0.5 text-xs text-slate-500">
                                    {editingProductId
                                        ? "Cập nhật thông tin chi tiết và tải thêm ảnh chụp từ thiết bị."
                                        : "Điền thông tin và tải ảnh chụp sản phẩm từ thiết bị lên hệ thống."}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closeModal}
                                aria-label="Đóng"
                                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="mt-5 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field label="Tên sản phẩm *">
                                    <input
                                        value={form.name}
                                        onChange={(e) => change("name", e.target.value)}
                                        placeholder="Ví dụ: iPhone 15 Pro Max 256GB"
                                    />
                                </Field>

                                <Field label="Danh mục *">
                                    <select
                                        value={form.categoryId}
                                        onChange={(e) => change("categoryId", e.target.value)}
                                    >
                                        <option value="">-- Chọn danh mục --</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </Field>

                                <Field label="Giá bán (VNĐ) *">
                                    <input
                                        type="number"
                                        min="1"
                                        step="1000"
                                        value={form.price}
                                        onChange={(e) => change("price", e.target.value)}
                                        placeholder="Ví dụ: 29990000"
                                    />
                                </Field>

                                {!editingProductId && (
                                    <Field label="Số lượng ban đầu trong kho">
                                        <input
                                            type="number"
                                            min="0"
                                            value={form.initialQuantity}
                                            onChange={(e) =>
                                                change("initialQuantity", e.target.value)
                                            }
                                            placeholder="10"
                                        />
                                    </Field>
                                )}
                            </div>

                            <Field label="Mô tả sản phẩm *">
                                <textarea
                                    rows={3}
                                    value={form.description}
                                    onChange={(e) => change("description", e.target.value)}
                                    placeholder="Nhập mô tả chi tiết tính năng, thông số kỹ thuật của sản phẩm..."
                                />
                            </Field>

                            {/* Device image upload zone */}
                            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                                            <UploadCloud size={17} className="text-indigo-600" /> Tải ảnh từ thiết bị (Khuyên dùng)
                                        </h3>
                                        <p className="mt-0.5 text-[11px] text-slate-500">
                                            Hỗ trợ định dạng JPG, PNG, WEBP, GIF (tối đa 5MB/ảnh, tối đa 10 ảnh).
                                        </p>
                                    </div>
                                    <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700">
                                        {existingImages.length + selectedFiles.length} / 10 ảnh
                                    </span>
                                </div>

                                {/* Dropzone */}
                                <div
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        handleFilesChosen(e.dataTransfer.files);
                                    }}
                                    onClick={() => fileInputRef.current?.click()}
                                    className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-indigo-300 bg-white px-6 py-6 text-center transition hover:border-indigo-500 hover:bg-indigo-50/50"
                                >
                                    <input
                                        id={fileInputId}
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        accept="image/png,image/jpeg,image/webp,image/gif"
                                        className="hidden"
                                        onChange={(e) => handleFilesChosen(e.target.files)}
                                    />
                                    <UploadCloud size={28} className="text-indigo-600" />
                                    <p className="mt-2 text-xs font-bold text-slate-900">
                                        Nhấp để chọn ảnh từ máy tính hoặc kéo thả vào đây
                                    </p>
                                    <p className="mt-1 text-[11px] text-slate-400">
                                        Bạn có thể chọn cùng lúc nhiều ảnh
                                    </p>
                                </div>

                                {/* Previews of newly selected files */}
                                {selectedFiles.length > 0 && (
                                    <div className="mt-4">
                                        <p className="text-xs font-bold text-indigo-700 mb-2">
                                            Ảnh mới chọn từ máy ({selectedFiles.length}):
                                        </p>
                                        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                                            {selectedFiles.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="group relative overflow-hidden rounded-xl border border-indigo-200 bg-white shadow-xs"
                                                >
                                                    <img
                                                        src={item.preview}
                                                        alt={item.name}
                                                        className="h-24 w-full object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeSelectedFile(item.id);
                                                        }}
                                                        className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-white shadow-md hover:bg-rose-700 transition"
                                                        title="Bỏ chọn ảnh này"
                                                    >
                                                        <X size={13} />
                                                    </button>
                                                    <div className="p-1.5 text-[10px] text-slate-600 truncate bg-slate-50">
                                                        <p className="truncate font-semibold">{item.name}</p>
                                                        <p className="text-slate-400">{item.sizeFormatted}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Existing images in edit mode */}
                                {editingProductId && existingImages.length > 0 && (
                                    <div className="mt-4 border-t border-slate-200/80 pt-3">
                                        <p className="text-xs font-bold text-slate-700 mb-2">
                                            Ảnh hiện có trên sản phẩm:
                                        </p>
                                        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                                            {existingImages.map((img) => {
                                                const url = formatImageUrl(img.url);
                                                const isDeleting = deletingImageId === img.id;

                                                return (
                                                    <div
                                                        key={img.id}
                                                        className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs"
                                                    >
                                                        <img
                                                            src={url || ""}
                                                            alt={`Ảnh sản phẩm #${img.id}`}
                                                            className="h-24 w-full object-cover"
                                                        />
                                                        <button
                                                            type="button"
                                                            disabled={isDeleting}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteExistingImage(img.id);
                                                            }}
                                                            className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-white shadow-md transition hover:bg-rose-700 disabled:opacity-50"
                                                            title="Xóa ảnh này khỏi sản phẩm"
                                                        >
                                                            <Trash2 size={13} />
                                                        </button>
                                                        <div className="p-1 text-[10px] text-center text-slate-400 bg-slate-50 font-mono">
                                                            {isDeleting ? "Đang xóa..." : `#${img.id}`}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Additional image URLs */}
                            <details className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs">
                                <summary className="cursor-pointer font-bold text-slate-700 select-none">
                                    Hoặc thêm URL ảnh bên ngoài (Tùy chọn)
                                </summary>
                                <div className="mt-2">
                                    <Field label="URL ảnh (mỗi URL trên 1 dòng)">
                                        <textarea
                                            rows={2}
                                            value={form.imageUrls}
                                            onChange={(e) => change("imageUrls", e.target.value)}
                                            placeholder="https://example.com/image.jpg"
                                        />
                                    </Field>
                                </div>
                            </details>
                        </div>

                        {/* Modal Footer */}
                        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                            <span className="text-xs font-semibold text-indigo-600">
                                {saving ? savingMessage || "Đang xử lý..." : ""}
                            </span>
                            <div className="flex gap-2.5">
                                <button
                                    type="button"
                                    disabled={saving}
                                    onClick={closeModal}
                                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="button"
                                    disabled={saving}
                                    onClick={saveProduct}
                                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    <Plus size={15} />
                                    {saving
                                        ? "Đang lưu..."
                                        : editingProductId
                                        ? "Lưu thay đổi"
                                        : "Tạo sản phẩm & Tải ảnh"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            {label}
            <span className="mt-1.5 block [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-slate-200 [&_input]:bg-slate-50/50 [&_input]:px-3.5 [&_input]:py-2.5 [&_input]:text-xs [&_input]:font-medium [&_input]:text-slate-900 [&_input]:outline-none [&_input]:focus:border-indigo-500 [&_input]:focus:bg-white [&_select]:w-full [&_select]:rounded-xl [&_select]:border [&_select]:border-slate-200 [&_select]:bg-slate-50/50 [&_select]:px-3.5 [&_select]:py-2.5 [&_select]:text-xs [&_select]:font-medium [&_select]:text-slate-900 [&_select]:outline-none [&_select]:focus:border-indigo-500 [&_select]:focus:bg-white [&_textarea]:w-full [&_textarea]:resize-none [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-slate-200 [&_textarea]:bg-slate-50/50 [&_textarea]:px-3.5 [&_textarea]:py-2.5 [&_textarea]:text-xs [&_textarea]:font-medium [&_textarea]:text-slate-900 [&_textarea]:outline-none [&_textarea]:focus:border-indigo-500 [&_textarea]:focus:bg-white">
                {children}
            </span>
        </label>
    );
}
