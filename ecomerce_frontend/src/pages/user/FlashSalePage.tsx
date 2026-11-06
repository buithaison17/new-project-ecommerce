import { ArrowRight, Flame, Timer } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import FlashSaleCard from "../../components/FlashSaleCard";
import { catalogService } from "../../service/catalogService";
import type { FlashSaleProduct } from "../../types/catalog";

const pad = (n: number) => String(n).padStart(2, "0");

export default function FlashSalePage() {
    const [products, setProducts] = useState<FlashSaleProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

    useEffect(() => {
        setLoading(true);
        catalogService
            .getFlashSaleProducts()
            .then((res) => setProducts(res || []))
            .catch(() => undefined)
            .finally(() => setLoading(false));
    }, []);

    // Đếm ngược tới thời điểm kết thúc sớm nhất
    useEffect(() => {
        const endTimes = products
            .map((p) => p.endAt)
            .filter((v): v is string => Boolean(v))
            .sort();
        if (endTimes.length === 0) {
            return;
        }
        const target = new Date(endTimes[0]).getTime();
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
    }, [products]);

    return (
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
            {/* Banner */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500 p-8 text-white shadow-xl sm:p-12">
                <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                <div className="absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-rose-900/30 blur-2xl pointer-events-none" />

                <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                    <div className="space-y-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold backdrop-blur-xs">
                            <Flame size={14} /> Flash Sale
                        </span>
                        <h1 className="text-3xl font-black sm:text-4xl">
                            Săn deal sốc mỗi ngày
                        </h1>
                        <p className="max-w-xl text-sm leading-relaxed text-rose-50 sm:text-base">
                            Hàng trăm sản phẩm được giảm giá sâu trong thời gian giới hạn.
                            Nhanh tay kẻo lỡ — số lượng ưu đãi có hạn!
                        </p>
                    </div>

                    {products.length > 0 && (
                        <div className="flex items-center gap-3">
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-50">
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
                                        className="flex flex-col items-center rounded-xl bg-slate-950/80 px-3.5 py-2 text-white shadow-lg"
                                    >
                                        <span className="text-xl font-black leading-none tabular-nums">
                                            {pad(unit.value)}
                                        </span>
                                        <span className="mt-1 text-[10px] font-bold uppercase text-slate-400">
                                            {unit.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Product grid */}
            <section className="mt-10">
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
                ) : products.length > 0 ? (
                    <>
                        <p className="mb-5 text-sm font-semibold text-slate-500">
                            {products.length} sản phẩm đang giảm giá
                        </p>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {products.map((product) => (
                                <FlashSaleCard key={product.id} product={product} />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="rounded-2xl border border-dashed border-rose-200 bg-rose-50/50 p-16 text-center">
                        <Flame size={44} className="mx-auto text-rose-300" />
                        <h3 className="mt-4 text-xl font-bold text-slate-800">
                            Hiện chưa có Flash Sale nào đang diễn ra
                        </h3>
                        <p className="mt-2 text-sm text-slate-500">
                            Quay lại sau để săn những ưu đãi sốc nhất nhé!
                        </p>
                        <Link
                            to="/products"
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-rose-600"
                        >
                            Xem tất cả sản phẩm <ArrowRight size={15} />
                        </Link>
                    </div>
                )}
            </section>
        </div>
    );
}
