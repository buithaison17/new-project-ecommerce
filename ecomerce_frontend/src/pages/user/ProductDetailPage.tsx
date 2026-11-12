import {
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Flame,
    Maximize2,
    Minus,
    PackageCheck,
    Plus,
    RotateCcw,
    ShieldCheck,
    ShoppingCart,
    Timer,
    Truck,
    X,
    Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import { formatProductImageUrl } from "../../lib/image";
import { catalogService } from "../../service/catalogService";
import { useCartStore } from "../../store/cartStore";
import { useFlashSaleStore } from "../../store/flashSaleStore";
import type { Product } from "../../types/catalog";

const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(price);

export default function ProductDetailPage() {
    const { id = "" } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [error, setError] = useState("");
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    const addItem = useCartStore((state) => state.addItem);
    const getPriceInfo = useFlashSaleStore((state) => state.getPriceInfo);

    const flashInfo = useMemo(() => {
        if (!product) {
            return {
                originalPrice: 0,
                salePrice: 0,
                discountPercent: 0,
                isFlashSale: false,
            };
        }
        return getPriceInfo(product);
    }, [product, getPriceInfo]);

    const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

    useEffect(() => {
        if (!flashInfo.isFlashSale || !flashInfo.endAt) return;
        const target = new Date(flashInfo.endAt).getTime();
        const tick = () => {
            const diff = Math.max(0, target - Date.now());
            setTimeLeft({
                h: Math.floor(diff / 3_600_000),
                m: Math.floor((diff % 3_600_000) / 60_000),
                s: Math.floor((diff % 60_000) / 1000),
            });
        };
        tick();
        const timerId = setInterval(tick, 1000);
        return () => clearInterval(timerId);
    }, [flashInfo.isFlashSale, flashInfo.endAt]);

    useEffect(() => {
        let cancelled = false;

        setProduct(null);
        setError("");
        setActiveImageIndex(0);
        setQuantity(1);
        setIsLightboxOpen(false);

        catalogService
            .getProduct(id)
            .then((data) => {
                if (!cancelled) {
                    setProduct(data);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setError("Không thể tải chi tiết sản phẩm. Vui lòng thử lại sau.");
                }
            });

        return () => {
            cancelled = true;
        };
    }, [id]);

    const productImages = useMemo(() => {
        if (!product) return [];
        const list: string[] = [];

        if (product.images && Array.isArray(product.images)) {
            product.images.forEach((img) => {
                if (img?.url && typeof img.url === "string" && img.url.trim()) {
                    const formatted = formatProductImageUrl(img.url);
                    if (!list.includes(formatted)) {
                        list.push(formatted);
                    }
                }
            });
        }

        if (
            product.thumbnailUrl &&
            typeof product.thumbnailUrl === "string" &&
            product.thumbnailUrl.trim()
        ) {
            const formattedThumb = formatProductImageUrl(product.thumbnailUrl);
            if (!list.includes(formattedThumb)) {
                list.unshift(formattedThumb);
            }
        }

        if (list.length === 0) {
            list.push("https://placehold.co/900x900/f1f5f9/64748b?text=ShopNova");
        }

        return list;
    }, [product]);

    const prevImage = () => {
        setActiveImageIndex((prev) =>
            prev > 0 ? prev - 1 : productImages.length - 1
        );
    };

    const nextImage = () => {
        setActiveImageIndex((prev) =>
            prev < productImages.length - 1 ? prev + 1 : 0
        );
    };

    useEffect(() => {
        if (!isLightboxOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsLightboxOpen(false);
            if (e.key === "ArrowLeft") prevImage();
            if (e.key === "ArrowRight") nextImage();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isLightboxOpen, productImages.length]);

    if (error) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-16">
                <div className="rounded-3xl border border-rose-200 bg-rose-50/70 p-8 text-center text-rose-700">
                    <p className="text-base font-bold">{error}</p>
                    <Link
                        to="/products"
                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
                    >
                        <ArrowLeft size={15} /> Quay lại danh mục sản phẩm
                    </Link>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
                <div className="grid gap-10 lg:grid-cols-2">
                    <div className="aspect-square rounded-3xl bg-slate-200/70 animate-pulse" />
                    <div className="space-y-4 pt-4">
                        <div className="h-6 w-32 rounded-lg bg-slate-200 animate-pulse" />
                        <div className="h-10 w-3/4 rounded-xl bg-slate-200 animate-pulse" />
                        <div className="h-8 w-44 rounded-lg bg-slate-200 animate-pulse" />
                        <div className="h-40 rounded-2xl bg-slate-200 animate-pulse mt-8" />
                    </div>
                </div>
            </div>
        );
    }

    const currentImageUrl = productImages[activeImageIndex] || productImages[0];

    const handleAddToCart = () => {
        if (!product || !product.inStock) return;
        const unitPrice = flashInfo.isFlashSale ? flashInfo.salePrice : product.price;
        addItem(
            {
                ...product,
                price: unitPrice,
            },
            quantity,
        );
        toast.success(`Đã thêm ${quantity} "${product.name}" vào giỏ hàng`);
    };

    const handleBuyNow = () => {
        if (!product || !product.inStock) return;
        const unitPrice = flashInfo.isFlashSale ? flashInfo.salePrice : product.price;
        addItem(
            {
                ...product,
                price: unitPrice,
            },
            quantity,
        );
        navigate("/checkout");
    };

    return (
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
            {/* Breadcrumbs */}
            <nav className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-500 overflow-x-auto whitespace-nowrap pb-1">
                <Link to="/" className="hover:text-indigo-600 transition">
                    Trang chủ
                </Link>
                <ChevronRight size={13} className="text-slate-400 shrink-0" />
                <Link to="/products" className="hover:text-indigo-600 transition">
                    Sản phẩm
                </Link>
                <ChevronRight size={13} className="text-slate-400 shrink-0" />
                <Link
                    to={`/products?categoryId=${product.category.id}`}
                    className="hover:text-indigo-600 transition"
                >
                    {product.category.name}
                </Link>
                <ChevronRight size={13} className="text-slate-400 shrink-0" />
                <span className="text-slate-900 font-bold truncate max-w-xs">
                    {product.name}
                </span>
            </nav>

            <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
                {/* GALLERY COLUMN */}
                <div className="space-y-4">
                    {/* Main Image Frame */}
                    <div className="group relative aspect-square w-full overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs">
                        <img
                            src={currentImageUrl}
                            alt={`${product.name} - Ảnh ${activeImageIndex + 1}`}
                            className="h-full w-full cursor-zoom-in object-cover transition duration-300 will-change-transform group-hover:scale-102"
                            onClick={() => setIsLightboxOpen(true)}
                            onError={(e) => {
                                const target = e.currentTarget;
                                if (!target.src.includes("placehold.co")) {
                                    target.src =
                                        "https://placehold.co/900x900/f1f5f9/64748b?text=ShopNova";
                                }
                            }}
                        />

                        {/* Image counter badge */}
                        <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-slate-950/70 px-3 py-1 text-xs font-bold text-white shadow-sm backdrop-blur-md">
                            Ảnh {activeImageIndex + 1} / {productImages.length}
                        </span>

                        {/* Lightbox button */}
                        <button
                            type="button"
                            onClick={() => setIsLightboxOpen(true)}
                            className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3.5 py-1.5 text-xs font-bold text-slate-800 shadow-md backdrop-blur-md transition hover:bg-white hover:text-indigo-600 focus:outline-none"
                            title="Xem kích thước lớn"
                        >
                            <Maximize2 size={13} /> Phóng to
                        </button>

                        {/* Arrows if multiple */}
                        {productImages.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        prevImage();
                                    }}
                                    aria-label="Xem ảnh trước"
                                    className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-lg backdrop-blur-sm transition hover:bg-white hover:scale-105 active:scale-95"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        nextImage();
                                    }}
                                    aria-label="Xem ảnh kế tiếp"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-lg backdrop-blur-sm transition hover:bg-white hover:scale-105 active:scale-95"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Thumbnails */}
                    {productImages.length > 1 && (
                        <div>
                            <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
                                {productImages.map((imgUrl, idx) => {
                                    const isActive = idx === activeImageIndex;
                                    return (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setActiveImageIndex(idx)}
                                            className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition ${
                                                isActive
                                                    ? "border-indigo-600 ring-4 ring-indigo-500/20 shadow-md"
                                                    : "border-slate-200 bg-white opacity-70 hover:opacity-100 hover:border-slate-300"
                                            }`}
                                        >
                                            <img
                                                src={imgUrl}
                                                alt={`${product.name} thu nhỏ ${idx + 1}`}
                                                className="h-full w-full object-cover"
                                                onError={(e) => {
                                                    const target = e.currentTarget;
                                                    if (!target.src.includes("placehold.co")) {
                                                        target.src =
                                                            "https://placehold.co/160x160/f1f5f9/64748b?text=ShopNova";
                                                    }
                                                }}
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* DETAILS COLUMN */}
                <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                        {product.category.name}
                    </span>

                    <h1 className="mt-2 text-2xl font-black leading-tight text-slate-900 sm:text-3xl">
                        {product.name}
                    </h1>

                    {/* Price and Stock status */}
                    {flashInfo.isFlashSale && (
                        <div className="mt-5 flex items-center justify-between rounded-2xl bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500 p-4 text-white shadow-md">
                            <div className="flex items-center gap-2">
                                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xs">
                                    <Flame size={18} className="animate-pulse" />
                                </span>
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-100">
                                        Đang áp dụng ưu đãi
                                    </span>
                                    <h4 className="text-sm font-black">
                                        {flashInfo.appliedSale?.name || "Flash Sale Giảm Sốc"}
                                    </h4>
                                </div>
                            </div>
                            {flashInfo.endAt && (
                                <div className="flex items-center gap-1.5 rounded-xl bg-black/30 px-3 py-1.5 text-xs font-bold backdrop-blur-xs">
                                    <Timer size={14} className="text-amber-300" />
                                    <span>
                                        {String(timeLeft.h).padStart(2, "0")}:
                                        {String(timeLeft.m).padStart(2, "0")}:
                                        {String(timeLeft.s).padStart(2, "0")}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    <div
                        className={`mt-4 flex flex-wrap items-baseline gap-4 rounded-2xl border p-4 ${
                            flashInfo.isFlashSale
                                ? "border-rose-200 bg-rose-50/60"
                                : "border-slate-100 bg-slate-50/70"
                        }`}
                    >
                        {flashInfo.isFlashSale ? (
                            <div>
                                <p className="text-xs font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1">
                                    <Flame size={13} /> Giá Flash Sale
                                </p>
                                <div className="mt-1 flex items-center gap-2">
                                    <span className="text-sm font-semibold tabular-nums text-slate-400 line-through sm:text-base">
                                        {formatPrice(product.price)}
                                    </span>
                                    <span className="rounded-full bg-rose-600 px-2.5 py-0.5 text-xs font-black tabular-nums text-white shadow-xs">
                                        -{flashInfo.discountPercent}%
                                    </span>
                                </div>
                                <div className="mt-0.5">
                                    <p className="text-3xl font-black tabular-nums text-rose-600">
                                        {formatPrice(flashInfo.salePrice)}
                                    </p>
                                </div>
                                <p className="mt-1 text-xs font-semibold tabular-nums text-rose-700">
                                    Tiết kiệm ngay: {formatPrice(product.price - flashInfo.salePrice)}
                                </p>
                            </div>
                        ) : (
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    Giá niêm yết
                                </p>
                                <p className="text-3xl font-black tabular-nums text-indigo-600 mt-0.5">
                                    {formatPrice(product.price)}
                                </p>
                            </div>
                        )}

                        <span
                            className={`ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tabular-nums ${
                                product.inStock
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-rose-100 text-rose-800"
                            }`}
                        >
                            <span
                                className={`h-2 w-2 rounded-full ${
                                    product.inStock ? "bg-emerald-500" : "bg-rose-500"
                                }`}
                            />
                            {product.inStock
                                ? `Còn ${product.stockQuantity} sản phẩm trong kho`
                                : "Tạm hết hàng"}
                        </span>
                    </div>

                    {/* Quantity Selector & Actions */}
                    <div className="mt-6 space-y-3">
                        {product.inStock && (
                            <div className="flex items-center gap-4">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Số lượng
                                </span>
                                <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
                                    <button
                                        type="button"
                                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                        disabled={quantity <= 1}
                                        aria-label="Giảm số lượng"
                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                                    >
                                        <Minus size={15} />
                                    </button>
                                    <span className="w-11 text-center text-sm font-bold tabular-nums text-slate-900">
                                        {quantity}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                                        disabled={quantity >= product.stockQuantity}
                                        aria-label="Tăng số lượng"
                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                                    >
                                        <Plus size={15} />
                                    </button>
                                </div>
                                <span className="text-xs text-slate-400 tabular-nums">
                                    Tối đa {product.stockQuantity} sản phẩm
                                </span>
                            </div>
                        )}

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <button
                                type="button"
                                disabled={!product.inStock}
                                onClick={handleAddToCart}
                                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-3.5 text-sm font-bold text-indigo-700 transition hover:bg-indigo-100 active:scale-[0.99] disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 cursor-pointer"
                            >
                                <ShoppingCart size={18} />
                                {product.inStock
                                    ? "Thêm vào giỏ hàng"
                                    : "Sản phẩm tạm hết hàng"}
                            </button>
                            <button
                                type="button"
                                disabled={!product.inStock}
                                onClick={handleBuyNow}
                                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none cursor-pointer"
                            >
                                <Zap size={18} />
                                Mua ngay
                            </button>
                        </div>
                    </div>

                    {/* Stock Status Box */}
                    <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-4">
                        <div className="flex items-center gap-3">
                            <span
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                    product.inStock
                                        ? "bg-emerald-50 text-emerald-600"
                                        : "bg-rose-50 text-rose-600"
                                }`}
                            >
                                <PackageCheck size={20} />
                            </span>
                            <div>
                                <p className="text-xs font-bold text-slate-900">
                                    {product.inStock
                                        ? "Sẵn sàng giao hàng ngay"
                                        : "Sản phẩm đang được bổ sung"}
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {product.inStock
                                        ? "Được kiểm định chất lượng và đóng gói cẩn thận trước khi xuất kho."
                                        : "Vui lòng liên hệ hỗ trợ hoặc quay lại sau."}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mt-8 border-t border-slate-100 pt-6">
                        <h2 className="text-base font-bold text-slate-900">
                            Mô tả chi tiết sản phẩm
                        </h2>
                        <div className="mt-3 text-sm leading-relaxed text-slate-600 whitespace-pre-line">
                            {product.description ||
                                "Thông tin mô tả đang được hệ thống cập nhật."}
                        </div>
                    </div>

                    {/* Guarantee Perks */}
                    <div className="mt-8 grid grid-cols-3 gap-3 border-t border-slate-100 pt-6">
                        <div className="flex flex-col items-center rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-center">
                            <ShieldCheck size={20} className="text-indigo-600 mb-1" />
                            <span className="text-xs font-bold text-slate-800">Chính hãng 100%</span>
                            <span className="text-[10px] text-slate-400 mt-0.5">Cam kết nguồn gốc</span>
                        </div>
                        <div className="flex flex-col items-center rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-center">
                            <RotateCcw size={20} className="text-indigo-600 mb-1" />
                            <span className="text-xs font-bold text-slate-800">Đổi trả 30 ngày</span>
                            <span className="text-[10px] text-slate-400 mt-0.5">Nếu có lỗi từ NSX</span>
                        </div>
                        <div className="flex flex-col items-center rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-center">
                            <Truck size={20} className="text-indigo-600 mb-1" />
                            <span className="text-xs font-bold text-slate-800">Giao siêu tốc</span>
                            <span className="text-[10px] text-slate-400 mt-0.5">Nội thành 2-4h</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lightbox Modal */}
            {isLightboxOpen && (
                <div
                    className="fixed inset-0 z-50 flex flex-col justify-between bg-slate-950/95 p-4 backdrop-blur-md animate-in fade-in sm:p-6"
                    onClick={() => setIsLightboxOpen(false)}
                >
                    <div
                        className="flex items-center justify-between text-white"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div>
                            <h3 className="text-base font-bold sm:text-lg">
                                {product.name}
                            </h3>
                            <p className="text-xs text-slate-400">
                                Ảnh {activeImageIndex + 1} / {productImages.length}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsLightboxOpen(false)}
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                            aria-label="Đóng"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div
                        className="relative flex flex-1 items-center justify-center p-2"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={currentImageUrl}
                            alt={`${product.name} phóng to`}
                            className="max-h-[72vh] max-w-[90vw] select-none rounded-2xl object-contain shadow-2xl transition duration-200"
                        />

                        {productImages.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={prevImage}
                                    className="absolute left-2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25 active:scale-95 sm:left-6"
                                    aria-label="Ảnh trước"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <button
                                    type="button"
                                    onClick={nextImage}
                                    className="absolute right-2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25 active:scale-95 sm:right-6"
                                    aria-label="Ảnh sau"
                                >
                                    <ChevronRight size={24} />
                                </button>
                            </>
                        )}
                    </div>

                    {productImages.length > 1 && (
                        <div
                            className="flex justify-center overflow-x-auto pb-2 scrollbar-thin"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex gap-2">
                                {productImages.map((imgUrl, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setActiveImageIndex(idx)}
                                        className={`h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                                            idx === activeImageIndex
                                                ? "border-indigo-400 ring-2 ring-indigo-400/50 scale-105"
                                                : "border-white/20 opacity-50 hover:opacity-90"
                                        }`}
                                    >
                                        <img
                                            src={imgUrl}
                                            alt=""
                                            className="h-full w-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}
