import { ArrowUpRight, Flame, PackageOpen, ShoppingBag, XCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { formatProductImageUrl } from "../lib/image";
import { useFlashSaleStore } from "../store/flashSaleStore";
import type { ProductSummary } from "../types/catalog";

const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(price);

export default function ProductCard({ product }: { product: ProductSummary }) {
    const imageUrl = formatProductImageUrl(product.thumbnailUrl);
    const navigate = useNavigate();
    const getPriceInfo = useFlashSaleStore((state) => state.getPriceInfo);
    const flashInfo = getPriceInfo(product);

    return (
        <div
            onClick={() => navigate(`/products/${product.id}`)}
            className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                flashInfo.isFlashSale
                    ? "border-rose-200 hover:border-rose-400 hover:shadow-rose-500/10"
                    : "border-slate-200/90 hover:border-indigo-200 hover:shadow-indigo-500/10"
            }`}
        >
            {/* Image container */}
            <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
                <img
                    src={imageUrl}
                    alt={product.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 will-change-transform group-hover:scale-105"
                    onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.src.includes("placehold.co")) {
                            target.src =
                                "https://placehold.co/600x600/f1f5f9/64748b?text=ShopNova";
                        }
                    }}
                />

                {/* Stock & Flash Sale status badge */}
                <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-1.5">
                    {flashInfo.isFlashSale && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-rose-600 to-orange-500 px-2.5 py-1 text-[11px] font-black text-white shadow-sm">
                            <Flame size={12} />
                            -{flashInfo.discountPercent}%
                        </span>
                    )}
                    {product.inStock ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm backdrop-blur-xs">
                            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                            Còn hàng
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/90 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm backdrop-blur-xs">
                            <XCircle size={12} />
                            Hết hàng
                        </span>
                    )}
                </div>

                {/* Hover quick action overlay button */}
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/20 opacity-0 backdrop-blur-[2px] transition duration-300 group-hover:opacity-100">
                    <span
                        className={`inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-900 shadow-xl transition ${
                            flashInfo.isFlashSale
                                ? "hover:bg-rose-600 hover:text-white"
                                : "hover:bg-indigo-600 hover:text-white"
                        }`}
                    >
                        Xem chi tiết <ArrowUpRight size={14} />
                    </span>
                </div>
            </div>

            {/* Content info */}
            <div className="flex flex-1 flex-col p-4 sm:p-5">
                <div className="mb-2 flex items-center justify-between text-xs">
                    <span
                        className={`font-bold uppercase tracking-wider ${
                            flashInfo.isFlashSale ? "text-rose-600" : "text-indigo-600"
                        }`}
                    >
                        {product.categoryName || "Sản phẩm"}
                    </span>
                    <span className="text-[11px] text-slate-400">
                        {product.inStock
                            ? `Kho: ${product.stockQuantity}`
                            : "Tạm hết"}
                    </span>
                </div>

                <h3
                    className={`line-clamp-2 min-h-[44px] text-sm font-bold leading-5 text-slate-800 transition sm:text-base sm:leading-6 ${
                        flashInfo.isFlashSale
                            ? "group-hover:text-rose-600"
                            : "group-hover:text-indigo-600"
                    }`}
                >
                    <Link
                        to={`/products/${product.id}`}
                        className="focus:outline-none focus:underline"
                    >
                        {product.name}
                    </Link>
                </h3>

                {/* Price and Action */}
                <div className="mt-auto pt-4 border-t border-slate-100 flex items-end justify-between gap-2">
                    <div>
                        {flashInfo.isFlashSale ? (
                            <>
                                <p className="text-[11px] font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1">
                                    <Flame size={12} /> Giá Flash Sale
                                </p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-base font-extrabold text-rose-600 sm:text-lg">
                                        {formatPrice(flashInfo.salePrice)}
                                    </p>
                                    <p className="text-xs font-medium text-slate-400 line-through">
                                        {formatPrice(flashInfo.originalPrice)}
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                                    Giá bán
                                </p>
                                <p className="text-base font-extrabold text-slate-900 sm:text-lg text-indigo-600">
                                    {formatPrice(product.price)}
                                </p>
                            </>
                        )}
                    </div>

                    <Link
                        to={`/products/${product.id}`}
                        className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition focus:outline-none ${
                            flashInfo.isFlashSale
                                ? "bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white"
                                : "bg-slate-100 text-slate-700 hover:bg-indigo-600 hover:text-white"
                        }`}
                        aria-label={`Xem chi tiết ${product.name}`}
                    >
                        <ShoppingBag size={16} />
                    </Link>
                </div>
            </div>
        </div>
    );
}

export function EmptyProducts() {
    return (
        <div className="col-span-full flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-xs">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
                <PackageOpen size={32} />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">
                Không tìm thấy sản phẩm nào
            </h3>
            <p className="mt-1.5 max-w-md text-sm text-slate-500">
                Hãy thử kiểm tra lại từ khóa tìm kiếm hoặc điều chỉnh lại các
                tiêu chí bộ lọc giá, danh mục.
            </p>
        </div>
    );
}
