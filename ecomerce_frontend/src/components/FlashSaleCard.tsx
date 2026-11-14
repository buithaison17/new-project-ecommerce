import { ArrowUpRight, Flame, ShoppingBag, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { formatProductImageUrl } from "../lib/image";
import { useCartStore } from "../store/cartStore";
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
    const addItem = useCartStore((state) => state.addItem);
    const isLowStock = product.inStock && product.stockQuantity > 0 && product.stockQuantity <= 5;

    const handleQuickAdd = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        if (!product.inStock) return;
        addItem({
            id: product.id,
            name: product.name,
            price: product.salePrice,
            stockQuantity: product.stockQuantity,
            thumbnailUrl: product.thumbnailUrl,
        });
        toast.success(`Đã thêm "${product.name}" (giá Flash Sale) vào giỏ hàng`, {
            id: `quick-add-${product.id}`,
        });
    };

    return (
        <article
            onClick={() => navigate(`/products/${product.id}`)}
            className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-rose-200/90 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-rose-400 hover:shadow-xl hover:shadow-rose-500/10"
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

                {/* Discount & Stock badge */}
                <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-rose-600 to-orange-500 px-2.5 py-1 text-[11px] font-bold tabular-nums text-white shadow-sm">
                        <Flame size={12} />
                        -{product.discountPercent}%
                    </span>
                    {!product.inStock ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/80 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm backdrop-blur-xs">
                            <XCircle size={12} />
                            Hết hàng
                        </span>
                    ) : isLowStock ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/95 px-2.5 py-1 text-[11px] font-bold tabular-nums text-white shadow-sm backdrop-blur-xs">
                            Chỉ còn {product.stockQuantity}
                        </span>
                    ) : null}
                </div>

                {/* Hover quick action overlay button */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-950/15 opacity-0 backdrop-blur-[1px] transition duration-300 group-hover:opacity-100">
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/95 px-3.5 py-2 text-xs font-bold text-slate-900 shadow-lg transition group-hover:text-rose-600">
                        Xem chi tiết <ArrowUpRight size={14} />
                    </span>
                </div>
            </div>

            {/* Content info */}
            <div className="flex flex-1 flex-col p-4 sm:p-5">
                <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
                    <span className="font-bold uppercase tracking-wider text-[11px] text-rose-600 truncate max-w-[65%]">
                        {product.saleName || product.categoryName || "Flash Sale"}
                    </span>
                    <span className="shrink-0 text-[11px] font-medium tabular-nums text-slate-400">
                        {product.inStock
                            ? `Kho: ${product.stockQuantity}`
                            : "Tạm hết"}
                    </span>
                </div>

                <h3 className="line-clamp-2 min-h-[42px] text-sm font-bold leading-5 text-slate-900 transition group-hover:text-rose-600 sm:text-[15px] sm:leading-[21px]">
                    {product.name}
                </h3>

                {/* Price and Action */}
                <div className="mt-auto pt-3.5 border-t border-slate-100 flex items-end justify-between gap-2">
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1">
                            <Flame size={11} /> Giá Flash Sale
                        </p>
                        <p className="text-xs font-medium tabular-nums text-slate-400 line-through">
                            {formatPrice(product.price)}
                        </p>
                        <p className="text-base font-extrabold tabular-nums text-rose-600 sm:text-lg leading-tight">
                            {formatPrice(product.salePrice)}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleQuickAdd}
                        disabled={!product.inStock}
                        title={product.inStock ? "Thêm nhanh vào giỏ hàng" : "Sản phẩm tạm hết hàng"}
                        aria-label={`Thêm ${product.name} vào giỏ hàng`}
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition hover:bg-rose-600 hover:text-white focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                    >
                        <ShoppingBag size={16} />
                    </button>
                </div>
            </div>
        </article>
    );
}
