import {
    ArrowRight,
    Calendar,
    Flame,
    Sparkles,
    Tag,
    Timer,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import FlashSaleCard from "../../components/FlashSaleCard";
import { catalogService } from "../../service/catalogService";
import { useFlashSaleStore } from "../../store/flashSaleStore";
import type { FlashSaleProduct, FlashSaleResponse } from "../../types/catalog";

const pad = (n: number) => String(n).padStart(2, "0");

const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(price);

const formatDateTime = (isoString?: string) => {
    if (!isoString) return "";
    try {
        const d = new Date(isoString);
        return d.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return isoString;
    }
};

export default function FlashSalePage() {
    const [products, setProducts] = useState<FlashSaleProduct[]>([]);
    const [sales, setSales] = useState<FlashSaleResponse[]>([]);
    const [selectedSaleId, setSelectedSaleId] = useState<number | "all">("all");
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

    const fetchActiveSales = useFlashSaleStore((s) => s.fetchActiveSales);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);

        Promise.all([
            catalogService.getActiveFlashSales(),
            catalogService.getFlashSaleProducts(),
            fetchActiveSales(true),
        ])
            .then(([salesRes, productsRes]) => {
                if (!isMounted) return;
                setSales(salesRes || []);
                setProducts(productsRes || []);
            })
            .catch(() => undefined)
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [fetchActiveSales]);

    // Lọc sản phẩm theo chương trình đang chọn
    const activeSelectedSale = useMemo(() => {
        if (selectedSaleId === "all") return null;
        return sales.find((s) => s.id === selectedSaleId) || null;
    }, [selectedSaleId, sales]);

    const filteredProducts = useMemo(() => {
        if (selectedSaleId === "all") return products;
        if (!activeSelectedSale) return products;

        return products.filter((p) => {
            if (activeSelectedSale.scope === "ALL") return true;
            if (activeSelectedSale.scope === "CATEGORY") {
                return (
                    activeSelectedSale.categoryId != null &&
                    p.categoryId != null &&
                    Number(p.categoryId) === Number(activeSelectedSale.categoryId)
                );
            }
            if (activeSelectedSale.scope === "PRODUCT") {
                return (
                    activeSelectedSale.productId != null &&
                    Number(p.id) === Number(activeSelectedSale.productId)
                );
            }
            return false;
        });
    }, [products, selectedSaleId, activeSelectedSale]);

    // Đếm ngược tới thời điểm kết thúc
    useEffect(() => {
        let targetIso = activeSelectedSale?.endAt;
        if (!targetIso) {
            const endTimes = products
                .map((p) => p.endAt)
                .filter((v): v is string => Boolean(v))
                .sort();
            targetIso = endTimes[0];
        }

        if (!targetIso) return;

        const target = new Date(targetIso).getTime();
        const tick = () => {
            const diff = Math.max(0, target - Date.now());
            setTimeLeft({
                h: Math.floor(diff / 3_600_000),
                m: Math.floor((diff % 3_600_000) / 60_000),
                s: Math.floor((diff % 60_000) / 1000),
            });
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [activeSelectedSale, products]);

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
            {/* Banner chính */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500 p-8 text-white shadow-xl sm:p-12">
                <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                <div className="absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-rose-900/30 blur-2xl pointer-events-none" />

                <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                    <div className="space-y-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold backdrop-blur-xs">
                            <Flame size={14} className="animate-pulse" /> Flash Sale Đang Diễn Ra
                        </span>
                        <h1 className="text-3xl font-black sm:text-4xl lg:text-5xl">
                            Săn deal giá sốc mỗi ngày
                        </h1>
                        <p className="max-w-xl text-sm leading-relaxed text-rose-50 sm:text-base">
                            Chương trình khuyến mãi giới hạn thời gian. Giảm giá trực tiếp lên từng sản phẩm, số lượng ưu đãi có hạn!
                        </p>
                    </div>

                    {(sales.length > 0 || products.length > 0) && (
                        <div className="flex flex-col sm:items-end gap-2 shrink-0">
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-100 uppercase tracking-wider">
                                <Timer size={15} /> Kết thúc sau:
                            </span>
                            <div className="flex items-center gap-2">
                                {[
                                    { label: "Giờ", value: timeLeft.h },
                                    { label: "Phút", value: timeLeft.m },
                                    { label: "Giây", value: timeLeft.s },
                                ].map((unit) => (
                                    <div
                                        key={unit.label}
                                        className="flex flex-col items-center rounded-2xl bg-slate-950/80 px-4 py-2.5 text-white shadow-lg backdrop-blur-sm min-w-[64px]"
                                    >
                                        <span className="text-2xl font-black leading-none tabular-nums text-amber-300">
                                            {pad(unit.value)}
                                        </span>
                                        <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            {unit.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* DANH SÁCH CHƯƠNG TRÌNH FLASH SALE ĐANG CÓ */}
            {sales.length > 0 && (
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Sparkles size={18} className="text-amber-500" />
                            <h2 className="text-lg font-black text-slate-900 sm:text-xl">
                                Các chương trình Flash Sale đang áp dụng ({sales.length})
                            </h2>
                        </div>
                    </div>

                    {/* Danh sách thẻ chương trình */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {sales.map((sale) => {
                            const isCurrentSelected = selectedSaleId === sale.id;
                            const isPercentage = sale.discountType === "PERCENTAGE";
                            const discountBadge = isPercentage
                                ? `Giảm ${sale.discountValue}%`
                                : `Giảm ${formatPrice(sale.discountValue)}`;

                            const scopeLabel =
                                sale.scope === "ALL"
                                    ? "Toàn bộ cửa hàng"
                                    : sale.scope === "CATEGORY"
                                    ? `Danh mục: ${sale.categoryName || `ID ${sale.categoryId}`}`
                                    : `Sản phẩm: ${sale.productName || `ID ${sale.productId}`}`;

                            return (
                                <div
                                    key={sale.id}
                                    onClick={() =>
                                        setSelectedSaleId(isCurrentSelected ? "all" : sale.id)
                                    }
                                    className={`relative cursor-pointer rounded-2xl border p-5 transition duration-200 shadow-xs hover:-translate-y-0.5 hover:shadow-md ${
                                        isCurrentSelected
                                            ? "border-rose-500 bg-rose-50/50 ring-2 ring-rose-500/20"
                                            : "border-slate-200/90 bg-white hover:border-rose-300"
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="space-y-1">
                                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-700">
                                                <Flame size={12} /> {discountBadge}
                                            </span>
                                            <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                                                {sale.name}
                                            </h3>
                                        </div>
                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            Đang chạy
                                        </span>
                                    </div>

                                    {sale.description && (
                                        <p className="mt-2 text-xs text-slate-600 line-clamp-2">
                                            {sale.description}
                                        </p>
                                    )}

                                    <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
                                        <div className="flex items-center gap-1.5">
                                            <Tag size={13} className="text-rose-500 shrink-0" />
                                            <span className="font-semibold text-slate-700">Phạm vi:</span>
                                            <span className="truncate">{scopeLabel}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={13} className="text-slate-400 shrink-0" />
                                            <span>
                                                Đến: {formatDateTime(sale.endAt)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex items-center justify-between text-xs pt-2">
                                        <span
                                            className={`font-bold transition ${
                                                isCurrentSelected
                                                    ? "text-rose-600 underline"
                                                    : "text-slate-500 hover:text-rose-600"
                                            }`}
                                        >
                                            {isCurrentSelected
                                                ? "Đang xem sản phẩm này"
                                                : "Lọc sản phẩm deal này &rarr;"}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Thanh lọc chương trình */}
                    {sales.length > 1 && (
                        <div className="flex flex-wrap items-center gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setSelectedSaleId("all")}
                                className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                                    selectedSaleId === "all"
                                        ? "bg-slate-900 text-white shadow-xs"
                                        : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                                }`}
                            >
                                Tất cả sản phẩm Flash Sale ({products.length})
                            </button>
                            {sales.map((sale) => (
                                <button
                                    key={sale.id}
                                    type="button"
                                    onClick={() => setSelectedSaleId(sale.id)}
                                    className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                                        selectedSaleId === sale.id
                                            ? "bg-rose-600 text-white shadow-xs"
                                            : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                                    }`}
                                >
                                    {sale.name}
                                </button>
                            ))}
                        </div>
                    )}
                </section>
            )}

            {/* DANH SÁCH SẢN PHẨM FLASH SALE */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 sm:text-2xl">
                            Sản phẩm Flash Sale
                        </h2>
                        {activeSelectedSale && (
                            <p className="text-xs font-medium text-rose-600">
                                Đang lọc theo chương trình: <strong>{activeSelectedSale.name}</strong>
                            </p>
                        )}
                    </div>
                    {filteredProducts.length > 0 && (
                        <span className="text-xs font-bold text-slate-500">
                            {filteredProducts.length} sản phẩm
                        </span>
                    )}
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div
                                key={i}
                                className="h-80 rounded-2xl border border-slate-100 bg-white p-4 animate-pulse"
                            >
                                <div className="aspect-square rounded-xl bg-slate-100" />
                                <div className="mt-4 h-4 w-2/3 rounded bg-slate-100" />
                                <div className="mt-2 h-4 w-1/3 rounded bg-slate-100" />
                            </div>
                        ))}
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {filteredProducts.map((product) => (
                            <FlashSaleCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-rose-200 bg-rose-50/50 p-16 text-center">
                        <Flame size={44} className="mx-auto text-rose-300" />
                        <h3 className="mt-4 text-xl font-bold text-slate-800">
                            {sales.length > 0
                                ? "Không tìm thấy sản phẩm phù hợp cho chương trình này"
                                : "Hiện chưa có Flash Sale nào đang diễn ra"}
                        </h3>
                        <p className="mt-2 text-sm text-slate-500">
                            {sales.length > 0
                                ? "Vui lòng chọn chương trình khác hoặc xem tất cả deal sốc."
                                : "Quay lại sau để săn những ưu đãi giá sốc nhất nhé!"}
                        </p>
                        <div className="mt-6 flex flex-wrap justify-center gap-3">
                            {sales.length > 0 && selectedSaleId !== "all" && (
                                <button
                                    type="button"
                                    onClick={() => setSelectedSaleId("all")}
                                    className="rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-rose-700"
                                >
                                    Xem tất cả deal Flash Sale
                                </button>
                            )}
                            <Link
                                to="/products"
                                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
                            >
                                Xem tất cả sản phẩm <ArrowRight size={14} />
                            </Link>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
