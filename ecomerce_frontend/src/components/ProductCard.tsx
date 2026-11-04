import { ArrowUpRight, PackageOpen, ShoppingBag, XCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { formatProductImageUrl } from "../lib/image";
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

    return (
        <div
            onClick={() => navigate(`/products/${product.id}`)}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/10"
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

                {/* Stock status badge */}
                <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-1.5">
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
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-900 shadow-xl transition hover:bg-indigo-600 hover:text-white">
                        Xem chi tiết <ArrowUpRight size={14} />
                    </span>
                </div>
            </div>

            {/* Content info */}
            <div className="flex flex-1 flex-col p-4 sm:p-5">
                <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="font-bold uppercase tracking-wider text-indigo-600">
                        {product.categoryName || "Sản phẩm"}
                    </span>
                    <span className="text-[11px] text-slate-400">
                        {product.inStock
                            ? `Kho: ${product.stockQuantity}`
                            : "Tạm hết"}
                    </span>
                </div>

                <h3 className="line-clamp-2 min-h-[44px] text-sm font-bold leading-5 text-slate-800 transition group-hover:text-indigo-600 sm:text-base sm:leading-6">
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
                        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                            Giá bán
                        </p>
                        <p className="text-base font-extrabold text-slate-900 sm:text-lg text-indigo-600">
                            {formatPrice(product.price)}
                        </p>
                    </div>

                    <Link
                        to={`/products/${product.id}`}
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition hover:bg-indigo-600 hover:text-white focus:outline-none"
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
