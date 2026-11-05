import {
    ArrowRight,
    CheckCircle2,
    Minus,
    Plus,
    ShieldCheck,
    ShoppingBag,
    Trash2,
    Truck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatProductImageUrl } from "../../lib/image";
import { useCartStore } from "../../store/cartStore";

const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(price);

export default function CartPage() {
    const items = useCartStore((state) => state.items);
    const updateQuantity = useCartStore((state) => state.updateQuantity);
    const removeItem = useCartStore((state) => state.removeItem);
    const total = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
    );

    if (!items.length) return <EmptyCart />;

    const freeShippingThreshold = 500000;
    const progressPercent = Math.min(
        100,
        Math.round((total / freeShippingThreshold) * 100),
    );
    const isFreeShipping = total >= freeShippingThreshold;
    const remainingForFreeShipping = Math.max(0, freeShippingThreshold - total);

    return (
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                        Giỏ hàng của bạn
                    </span>
                    <h1 className="text-2xl font-black text-slate-900 sm:text-3xl mt-1">
                        Danh sách sản phẩm ({items.length})
                    </h1>
                </div>
                <Link
                    to="/products"
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition"
                >
                    Tiếp tục mua sắm &rarr;
                </Link>
            </div>

            {/* Free Shipping Progress Bar */}
            <div className="mt-6 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/90 to-violet-50/90 p-4">
                <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-xs">
                        <Truck size={17} />
                    </span>
                    <div className="flex-1 min-w-0">
                        {isFreeShipping ? (
                            <p className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                                <CheckCircle2 size={15} /> Bạn đủ điều kiện được Miễn Phí Vận Chuyển toàn quốc!
                            </p>
                        ) : (
                            <p className="text-xs font-semibold text-slate-700">
                                Mua thêm{" "}
                                <strong className="font-extrabold text-indigo-600">
                                    {formatPrice(remainingForFreeShipping)}
                                </strong>{" "}
                                để được <span className="font-bold text-emerald-600">Miễn phí vận chuyển</span>
                            </p>
                        )}
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-indigo-100">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
                {/* Items list */}
                <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs divide-y divide-slate-100">
                    {items.map((item) => (
                        <article
                            key={item.productId}
                            className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5"
                        >
                            <img
                                src={formatProductImageUrl(item.thumbnailUrl)}
                                alt={item.name}
                                className="h-24 w-24 shrink-0 rounded-2xl border border-slate-100 object-cover"
                                onError={(e) => {
                                    const t = e.currentTarget;
                                    if (!t.src.includes("placehold.co"))
                                        t.src =
                                            "https://placehold.co/160x160/f1f5f9/64748b?text=ShopNova";
                                }}
                            />

                            <div className="min-w-0 flex-1">
                                <Link
                                    to={`/products/${item.productId}`}
                                    className="line-clamp-2 text-sm font-bold text-slate-900 transition hover:text-indigo-600"
                                >
                                    {item.name}
                                </Link>

                                <div className="mt-2 flex flex-wrap items-baseline gap-2">
                                    <span className="text-base font-extrabold text-indigo-600">
                                        {formatPrice(item.price)}
                                    </span>
                                    <span className="text-xs text-slate-400">
                                        / 1 sản phẩm
                                    </span>
                                </div>

                                <p className="mt-1 text-[11px] text-slate-400">
                                    Kho còn tối đa {item.stockQuantity} sản phẩm
                                </p>
                            </div>

                            {/* Quantity and Actions */}
                            <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-3 sm:border-0 sm:pt-0">
                                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50/50 p-1">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            updateQuantity(
                                                item.productId,
                                                item.quantity - 1,
                                            )
                                        }
                                        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:text-slate-800 transition"
                                        aria-label="Giảm số lượng"
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <span className="w-9 text-center text-xs font-bold text-slate-800">
                                        {item.quantity}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            updateQuantity(
                                                item.productId,
                                                item.quantity + 1,
                                            )
                                        }
                                        disabled={
                                            item.quantity >= item.stockQuantity
                                        }
                                        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:text-slate-800 transition disabled:opacity-30 disabled:cursor-not-allowed"
                                        aria-label="Tăng số lượng"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>

                                <div className="text-right sm:min-w-28">
                                    <p className="text-sm font-extrabold text-slate-900">
                                        {formatPrice(item.price * item.quantity)}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => removeItem(item.productId)}
                                        className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-rose-600 transition hover:text-rose-800"
                                    >
                                        <Trash2 size={13} /> Xóa
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

                {/* Summary card */}
                <OrderSummary
                    total={total}
                    itemCount={items.length}
                    isFreeShipping={isFreeShipping}
                />
            </div>
        </section>
    );
}

function OrderSummary({
    total,
    itemCount,
    isFreeShipping,
}: {
    total: number;
    itemCount: number;
    isFreeShipping: boolean;
}) {
    const shippingFee = isFreeShipping ? 0 : 20000;
    const finalTotal = total + shippingFee;

    return (
        <aside className="h-fit rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs lg:sticky lg:top-24">
            <h2 className="text-base font-extrabold text-slate-900">
                Tóm tắt đơn hàng
            </h2>

            <div className="mt-5 space-y-3 border-b border-slate-100 pb-5 text-xs">
                <div className="flex justify-between text-slate-600">
                    <span>Tạm tính ({itemCount} sản phẩm)</span>
                    <span className="font-bold text-slate-800">
                        {formatPrice(total)}
                    </span>
                </div>
                <div className="flex justify-between text-slate-600">
                    <span>Phí vận chuyển</span>
                    <span
                        className={
                            isFreeShipping
                                ? "font-bold text-emerald-600"
                                : "font-bold text-slate-800"
                        }
                    >
                        {isFreeShipping ? "Miễn phí" : formatPrice(shippingFee)}
                    </span>
                </div>
            </div>

            <div className="mt-5 flex items-baseline justify-between">
                <div>
                    <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                        Tổng thanh toán
                    </span>
                    <span className="block text-[11px] text-slate-400">
                        (Đã bao gồm VAT và vận chuyển)
                    </span>
                </div>
                <span className="text-2xl font-black text-indigo-600">
                    {formatPrice(finalTotal)}
                </span>
            </div>

            <Link
                to="/checkout"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 active:scale-[0.99]"
            >
                Tiến hành đặt hàng <ArrowRight size={16} />
            </Link>

            <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
                <p className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                    <span>Cam kết bảo mật thông tin & thanh toán an toàn.</span>
                </p>
                <p className="flex items-center gap-2">
                    <Truck size={16} className="text-indigo-600 shrink-0" />
                    <span>Hỗ trợ kiểm tra hàng trước khi nhận.</span>
                </p>
            </div>
        </aside>
    );
}

function EmptyCart() {
    return (
        <section className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-20 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600 shadow-xs">
                <ShoppingBag size={36} />
            </div>
            <h1 className="mt-6 text-2xl font-black text-slate-900">
                Giỏ hàng của bạn đang trống
            </h1>
            <p className="mt-2 max-w-sm text-sm text-slate-500 leading-relaxed">
                Hãy lựa chọn những sản phẩm ưng ý trong bộ sưu tập để bắt đầu mua sắm cùng ShopNova!
            </p>
            <Link
                to="/products"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700"
            >
                Khám phá sản phẩm ngay <ArrowRight size={16} />
            </Link>
        </section>
    );
}
