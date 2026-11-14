import { ArrowUpRight, Flame, PackageOpen, ShoppingBag, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { formatProductImageUrl } from "../lib/image";
import { useCartStore } from "../store/cartStore";
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
    const addItem = useCartStore((state) => state.addItem);
    const flashInfo = getPriceInfo(product);
    const isLowStock = product.inStock && product.stockQuantity > 0 && product.stockQuantity <= 5;

    const handleQuickAdd = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        if (!product.inStock) return;
        addItem({
            id: product.id,
            name: product.name,
            price: flashInfo.isFlashSale ? flashInfo.salePrice : product.price,
            stockQuantity: product.stockQuantity,
            thumbnailUrl: product.thumbnailUrl,
        });
        toast.success(`Đã thêm "${product.name}" vào giỏ hàng`, {
            id: `quick-add-${product.id}`,
        });
    };

    return (
        <article
            onClick={() => navigate(`/products/${product.id}`)}
            className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                flashInfo.isFlashSale
                    ? "border-rose-200/90 hover:border-rose-400 hover:shadow-rose-500/10"
                    : "border-slate-200/90 hover:border-indigo-300 hover:shadow-indigo-500/10"
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
                        <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-rose-600 to-orange-500 px-2.5 py-1 text-[11px] font-bold tabular-nums text-white shadow-sm">
                            <Flame size={12} />
                            -{flashInfo.discountPercent}%
                        </span>
                    )}
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
                    <span
                        className={`inline-flex items-center gap-1.5 rounded-xl bg-white/95 px-3.5 py-2 text-xs font-bold text-slate-900 shadow-lg transition ${
                            flashInfo.isFlashSale
                                ? "group-hover:text-rose-600"
                                : "group-hover:text-indigo-600"
                        }`}
                    >
                        Xem chi tiết <ArrowUpRight size={14} />
                    </span>
                </div>
            </div>

            {/* Content info */}
            <div className="flex flex-1 flex-col p-4 sm:p-5">
                <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
                    <span
                        className={`truncate font-bold uppercase tracking-wider text-[11px] ${
                            flashInfo.isFlashSale ? "text-rose-600" : "text-indigo-600"
                        }`}
                    >
                        {product.categoryName || "Sản phẩm"}
                    </span>
                    <span className="shrink-0 text-[11px] font-medium tabular-nums text-slate-400">
                        {product.inStock
                            ? `Kho: ${product.stockQuantity}`
                            : "Tạm hết"}
                    </span>
                </div>

                <h3
                    className={`line-clamp-2 min-h-[42px] text-sm font-bold leading-5 text-slate-900 transition sm:text-[15px] sm:leading-[21px] ${
                        flashInfo.isFlashSale
                            ? "group-hover:text-rose-600"
                            : "group-hover:text-indigo-600"
                    }`}
                >
                    {product.name}
                </h3>

                {/* Price and Action */}
                <div className="mt-auto pt-3.5 border-t border-slate-100 flex items-end justify-between gap-2">
                    <div className="min-w-0">
                        {flashInfo.isFlashSale ? (
                            <div>
                                <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1">
                                    <Flame size={11} /> Giá Flash Sale
                                </p>
                                <p className="text-xs font-medium tabular-nums text-slate-400 line-through">
                                    {formatPrice(flashInfo.originalPrice)}
                                </p>
                                <p className="text-base font-extrabold tabular-nums text-rose-600 sm:text-lg leading-tight">
                                    {formatPrice(flashInfo.salePrice)}
                                </p>
                            </div>
                        ) : (
                            <>
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                    Giá bán
                                </p>
                                <p className="text-base font-extrabold tabular-nums text-slate-900 sm:text-lg">
                                    {formatPrice(product.price)}
                                </p>
                            </>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={handleQuickAdd}
                        disabled={!product.inStock}
                        title={product.inStock ? "Thêm nhanh vào giỏ hàng" : "Sản phẩm tạm hết hàng"}
                        aria-label={`Thêm ${product.name} vào giỏ hàng`}
                        className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer ${
                            flashInfo.isFlashSale
                                ? "bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white"
                                : "bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white"
                        }`}
                    >
                        <ShoppingBag size={16} />
                    </button>
                </div>
            </div>
        </article>
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
