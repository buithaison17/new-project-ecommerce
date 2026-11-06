import { ArrowUpRight, Flame, ShoppingBag, XCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { formatProductImageUrl } from "../lib/image";
import type { FlashSaleProduct } from "../types/catalog";

const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(price);

export default function FlashSaleCard({ product }: { product: FlashSaleProduct }) {
    const imageUrl = formatProductImageUrl(product.thumbnailUrl);
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/products/${product.id}`)}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-rose-200/80 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-rose-300 hover:shadow-xl hover:shadow-rose-500/10"
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

                {/* Discount badge */}
                <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 px-2.5 py-1 text-[11px] font-black text-white shadow-sm">
                        <Flame size={12} />
                        -{product.discountPercent}%
                    </span>
                    {product.inStock ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm backdrop-blur-xs">
                            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                            Còn hàng
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/90 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm backdrop-blur-xs">
                            <XCircle size={12} />
                            Hết hàng
                        </span>
                    )}
                </div>

                {/* Hover quick action overlay button */}
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/20 opacity-0 backdrop-blur-[2px] transition duration-300 group-hover:opacity-100">
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-900 shadow-xl transition hover:bg-rose-600 hover:text-white">
                        Xem chi tiết <ArrowUpRight size={14} />
                    </span>
                </div>
            </div>

            {/* Content info */}
            <div className="flex flex-1 flex-col p-4 sm:p-5">
                <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="font-bold uppercase tracking-wider text-rose-600">
                        {product.categoryName || "Flash Sale"}
                    </span>
                    <span className="text-[11px] text-slate-400">
                        {product.inStock
                            ? `Kho: ${product.stockQuantity}`
                            : "Tạm hết"}
                    </span>
                </div>

                <h3 className="line-clamp-2 min-h-[44px] text-sm font-bold leading-5 text-slate-800 transition group-hover:text-rose-600 sm:text-base sm:leading-6">
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
                            Giá Flash Sale
                        </p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-base font-extrabold text-rose-600 sm:text-lg">
                                {formatPrice(product.salePrice)}
                            </p>
                            <p className="text-xs font-medium text-slate-400 line-through">
                                {formatPrice(product.price)}
                            </p>
                        </div>
                    </div>

                    <Link
                        to={`/products/${product.id}`}
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition hover:bg-rose-600 hover:text-white focus:outline-none"
                        aria-label={`Xem chi tiết ${product.name}`}
                    >
                        <ShoppingBag size={16} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
