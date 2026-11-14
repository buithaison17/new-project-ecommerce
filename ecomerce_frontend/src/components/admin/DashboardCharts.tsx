import {
    AlertTriangle,
    ArrowUpRight,
    CheckCircle2,
    CreditCard,
    Layers,
    PackageCheck,
    ShieldAlert,
    Truck,
    Wallet,
    XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { AdminOrder, DashboardSummaryResponse, InventoryItem } from "../../types/admin";
import type { Category, ProductSummary } from "../../types/catalog";

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("vi-VN");

export function formatCompactVnd(amount: number): string {
    if (amount >= 1_000_000_000) {
        return `${(amount / 1_000_000_000).toFixed(2).replace(/\.?0+$/, "")} tỷ đ`;
    }
    if (amount >= 1_000_000) {
        return `${(amount / 1_000_000).toFixed(1).replace(/\.0$/, "")} tr đ`;
    }
    return currencyFormatter.format(amount);
}

export interface OrderStatusSegment {
    status: "PENDING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
    label: string;
    count: number;
    percent: number;
    strokeColor: string;
    dotClass: string;
    badgeClass: string;
}

export function OrderStatusDonutChart({
    segments,
    totalOrders,
    ordersToday = 0,
    loading,
}: {
    segments: OrderStatusSegment[];
    totalOrders: number;
    ordersToday?: number;
    loading: boolean;
}) {
    const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);

    const size = 200;
    const center = size / 2;
    const radius = 74;
    const circumference = 2 * Math.PI * radius;

    const totalSum = segments.reduce((sum, s) => sum + s.count, 0);
    const divisor = totalSum > 0 ? totalSum : 1;
    const nonZeroCount = segments.filter((s) => s.count > 0).length;
    const gap = nonZeroCount > 1 ? 3 : 0;

    let cumulative = 0;
    const arcs = segments.map((seg) => {
        const len = totalSum > 0 ? (seg.count / divisor) * circumference : 0;
        const arc = {
            ...seg,
            dashLength: Math.max(0, len - gap),
            dashOffset: -cumulative,
        };
        cumulative += len;
        return arc;
    });

    const activeSegment = hoveredStatus
        ? segments.find((s) => s.status === hoveredStatus) || null
        : null;

    return (
        <article className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                    <h2 className="text-base font-extrabold text-slate-900">
                        Biểu đồ cơ cấu đơn hàng
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                        Tỷ lệ phân bổ theo trạng thái xử lý thực tế
                    </p>
                </div>
                <Link
                    to="/admin/orders"
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-indigo-600 transition hover:bg-indigo-50"
                >
                    Chi tiết <ArrowUpRight size={13} />
                </Link>
            </div>

            {loading ? (
                <div className="my-6 flex flex-col items-center gap-6 sm:flex-row">
                    <div className="h-48 w-48 shrink-0 animate-pulse rounded-full bg-slate-100" />
                    <div className="w-full flex-1 space-y-3">
                        {Array.from({ length: 4 }, (_, i) => (
                            <div key={i} className="h-10 animate-pulse rounded-xl bg-slate-100" />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="my-5 flex flex-col items-center gap-6 sm:flex-row">
                    {/* SVG Donut */}
                    <div className="relative flex h-[200px] w-[200px] shrink-0 items-center justify-center">
                        <svg
                            width={size}
                            height={size}
                            viewBox={`0 0 ${size} ${size}`}
                            className="-rotate-90"
                            role="img"
                            aria-label="Biểu đồ tỷ trọng trạng thái đơn hàng"
                        >
                            <circle
                                cx={center}
                                cy={center}
                                r={radius}
                                fill="none"
                                stroke="#f1f5f9"
                                strokeWidth={22}
                            />
                            {arcs.map((arc) => {
                                if (arc.count <= 0) return null;
                                const isActive = hoveredStatus === arc.status;
                                const isDimmed = Boolean(hoveredStatus && !isActive);
                                return (
                                    <circle
                                        key={arc.status}
                                        cx={center}
                                        cy={center}
                                        r={radius}
                                        fill="none"
                                        stroke={arc.strokeColor}
                                        strokeWidth={isActive ? 26 : 22}
                                        strokeLinecap="butt"
                                        strokeDasharray={`${arc.dashLength} ${circumference}`}
                                        strokeDashoffset={arc.dashOffset}
                                        onMouseEnter={() => setHoveredStatus(arc.status)}
                                        onMouseLeave={() => setHoveredStatus(null)}
                                        className={`cursor-pointer transition-all duration-300 ${
                                            isDimmed ? "opacity-40" : "opacity-100"
                                        }`}
                                    />
                                );
                            })}
                        </svg>

                        {/* Center Metric */}
                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                {activeSegment ? activeSegment.label : "Tổng đơn"}
                            </span>
                            <span className="mt-0.5 text-2xl font-black tabular-nums text-slate-900">
                                {numberFormatter.format(
                                    activeSegment ? activeSegment.count : totalOrders,
                                )}
                            </span>
                            <span className="mt-0.5 text-[11px] font-bold tabular-nums text-indigo-600">
                                {activeSegment
                                    ? `${activeSegment.percent}% tổng đơn`
                                    : `${totalSum > 0 ? "100%" : "0%"} hệ thống`}
                            </span>
                        </div>
                    </div>

                    {/* Interactive Legend */}
                    <div className="w-full flex-1 space-y-2.5">
                        {segments.map((seg) => {
                            const isActive = hoveredStatus === seg.status;
                            return (
                                <Link
                                    key={seg.status}
                                    to={`/admin/orders?status=${seg.status}`}
                                    onMouseEnter={() => setHoveredStatus(seg.status)}
                                    onMouseLeave={() => setHoveredStatus(null)}
                                    className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 transition ${
                                        isActive
                                            ? "border-indigo-300 bg-indigo-50/40 shadow-2xs"
                                            : "border-slate-100 bg-slate-50/60 hover:border-slate-200 hover:bg-white"
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${seg.dotClass}`} />
                                        <span className="truncate text-xs font-bold text-slate-700">
                                            {seg.label}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2.5 shrink-0">
                                        <span className="text-xs font-black tabular-nums text-slate-900">
                                            {numberFormatter.format(seg.count)}
                                        </span>
                                        <span
                                            className={`min-w-[42px] rounded-md px-1.5 py-0.5 text-center text-[11px] font-bold tabular-nums ${seg.badgeClass}`}
                                        >
                                            {seg.percent}%
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-[11px] text-slate-500">
                <span>Rê chuột vào từng cung tròn để xem chi tiết</span>
                <span className="font-semibold tabular-nums text-slate-700">
                    Đơn mới hôm nay: {numberFormatter.format(ordersToday)} đơn
                </span>
            </div>
        </article>
    );
}

const PAYMENT_METHOD_META: Record<
    string,
    { label: string; barClass: string; badgeClass: string }
> = {
    PAYOS: {
        label: "Chuyển khoản QR (PayOS)",
        barClass: "bg-indigo-500",
        badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
    },
    CASH: {
        label: "Thanh toán khi nhận (COD)",
        barClass: "bg-emerald-500",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    CREDIT_CARD: {
        label: "Thẻ tín dụng / Ghi nợ",
        barClass: "bg-violet-500",
        badgeClass: "bg-violet-50 text-violet-700 border-violet-200",
    },
};

export function PaymentAndRevenueChart({
    orders,
    summary,
    loading,
}: {
    orders: AdminOrder[];
    summary: DashboardSummaryResponse | null;
    loading: boolean;
}) {
    const paymentStats = useMemo(() => {
        const grouped = new Map<string, { method: string; count: number; amount: number }>();

        for (const order of orders) {
            const method = order.paymentMethod || "CASH";
            const current = grouped.get(method) || { method, count: 0, amount: 0 };
            current.count += 1;
            current.amount += Number(order.finalAmount ?? order.totalAmount ?? 0);
            grouped.set(method, current);
        }

        const totalCount = orders.length || 1;
        return Array.from(grouped.values())
            .sort((a, b) => b.count - a.count)
            .map((entry) => ({
                ...entry,
                percent: orders.length ? Math.round((entry.count / totalCount) * 100) : 0,
                meta: PAYMENT_METHOD_META[entry.method] || {
                    label: entry.method,
                    barClass: "bg-slate-500",
                    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
                },
            }));
    }, [orders]);

    const pipelineStats = useMemo(() => {
        const deliveredRevenue = summary?.totalRevenue ?? 0;
        let inTransitAmount = 0;
        let cancelledAmount = 0;
        let paidCount = 0;

        for (const order of orders) {
            const amount = Number(order.finalAmount ?? order.totalAmount ?? 0);
            if (order.orderStatus === "PENDING" || order.orderStatus === "SHIPPED") {
                inTransitAmount += amount;
            } else if (order.orderStatus === "CANCELLED") {
                cancelledAmount += amount;
            }
            if (order.paymentStatus === "COMPLETED") {
                paidCount += 1;
            }
        }

        const rows = [
            {
                key: "delivered",
                label: "Đã thu thực tế (DELIVERED)",
                amount: deliveredRevenue,
                barClass: "bg-gradient-to-r from-emerald-500 to-teal-500",
                textClass: "text-emerald-700",
            },
            {
                key: "pipeline",
                label: "Đang xử lý & giao (PENDING/SHIPPED)",
                amount: inTransitAmount,
                barClass: "bg-gradient-to-r from-blue-500 to-indigo-500",
                textClass: "text-blue-700",
            },
            {
                key: "cancelled",
                label: "Đơn đã hủy (CANCELLED)",
                amount: cancelledAmount,
                barClass: "bg-gradient-to-r from-rose-400 to-rose-500",
                textClass: "text-rose-600",
            },
        ];

        const maxAmount = Math.max(...rows.map((r) => r.amount), 1);

        return {
            rows: rows.map((row) => ({
                ...row,
                widthPercent: row.amount > 0 ? Math.max(8, Math.round((row.amount / maxAmount) * 100)) : 0,
            })),
            paidRate: orders.length ? Math.round((paidCount / orders.length) * 100) : 0,
            paidCount,
        };
    }, [orders, summary?.totalRevenue]);

    const sampleNote =
        summary && summary.totalOrders > orders.length && orders.length > 0
            ? `Thống kê trên ${orders.length}/${summary.totalOrders} đơn gần nhất`
            : `Tổng hợp từ ${orders.length} đơn hàng`;

    return (
        <article className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                    <h2 className="text-base font-extrabold text-slate-900">
                        Dòng tiền & Phương thức thanh toán
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                        {orders.length > 0 ? sampleNote : "Theo dõi trạng thái thu tiền và kênh thanh toán"}
                    </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold tabular-nums text-emerald-700">
                    <Wallet size={13} /> Đã thanh toán: {loading ? "—" : `${pipelineStats.paidRate}%`}
                </span>
            </div>

            {loading ? (
                <div className="my-6 space-y-4">
                    {Array.from({ length: 4 }, (_, i) => (
                        <div key={i} className="h-11 animate-pulse rounded-xl bg-slate-100" />
                    ))}
                </div>
            ) : (
                <div className="my-5 space-y-6">
                    {/* Revenue Pipeline Bars */}
                    <div>
                        <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Phân tầng giá trị đơn hàng
                        </p>
                        <div className="space-y-3">
                            {pipelineStats.rows.map((row) => (
                                <div key={row.key}>
                                    <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
                                        <span className="font-semibold text-slate-700 truncate">
                                            {row.label}
                                        </span>
                                        <span
                                            className={`font-black tabular-nums shrink-0 ${row.textClass}`}
                                            title={currencyFormatter.format(row.amount)}
                                        >
                                            {currencyFormatter.format(row.amount)}
                                        </span>
                                    </div>
                                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${row.barClass}`}
                                            style={{ width: `${row.widthPercent}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Payment Method Split */}
                    <div className="border-t border-slate-100 pt-4">
                        <div className="mb-3 flex items-center justify-between">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                Kênh thanh toán ưa chuộng
                            </p>
                            <CreditCard size={14} className="text-slate-400" />
                        </div>

                        {paymentStats.length > 0 ? (
                            <div className="space-y-2.5">
                                {paymentStats.map((stat) => (
                                    <div
                                        key={stat.method}
                                        className="rounded-xl border border-slate-100 bg-slate-50/70 p-3"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-xs font-bold text-slate-800">
                                                {stat.meta.label}
                                            </span>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="text-xs font-bold tabular-nums text-slate-600">
                                                    {stat.count} đơn ({stat.percent}%)
                                                </span>
                                                <span
                                                    className={`rounded-md border px-1.5 py-0.5 text-[11px] font-bold tabular-nums ${stat.meta.badgeClass}`}
                                                >
                                                    {formatCompactVnd(stat.amount)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/70">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${stat.meta.barClass}`}
                                                style={{ width: `${stat.percent}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="py-4 text-center text-xs text-slate-400">
                                Chưa có giao dịch đơn hàng nào để thống kê kênh thanh toán.
                            </p>
                        )}
                    </div>
                </div>
            )}

            <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-[11px] text-slate-500">
                <span>Thanh toán thành công</span>
                <span className="font-bold tabular-nums text-slate-700">
                    {pipelineStats.paidCount}/{orders.length} đơn đã ghi nhận
                </span>
            </div>
        </article>
    );
}

type CategoryMetricMode = "value" | "stock" | "count";

export function CategoryAnalyticsChart({
    categories,
    products,
    loading,
}: {
    categories: Category[];
    products: ProductSummary[];
    loading: boolean;
}) {
    const [metric, setMetric] = useState<CategoryMetricMode>("value");

    const rows = useMemo(() => {
        const map = new Map<
            number,
            { id: number; name: string; productCount: number; stockUnits: number; inventoryValue: number }
        >();

        for (const cat of categories) {
            map.set(cat.id, {
                id: cat.id,
                name: cat.name,
                productCount: 0,
                stockUnits: 0,
                inventoryValue: 0,
            });
        }

        for (const product of products) {
            const catId = product.categoryId ?? 0;
            const existing = map.get(catId) || {
                id: catId,
                name: product.categoryName || "Khác",
                productCount: 0,
                stockUnits: 0,
                inventoryValue: 0,
            };
            const stock = Math.max(0, Number(product.stockQuantity || 0));
            const price = Math.max(0, Number(product.price || 0));
            existing.productCount += 1;
            existing.stockUnits += stock;
            existing.inventoryValue += stock * price;
            map.set(catId, existing);
        }

        const list = Array.from(map.values()).filter(
            (entry) => entry.productCount > 0 || entry.stockUnits > 0,
        );

        const getScore = (item: (typeof list)[number]) => {
            if (metric === "stock") return item.stockUnits;
            if (metric === "count") return item.productCount;
            return item.inventoryValue;
        };

        list.sort((a, b) => getScore(b) - getScore(a));
        const topList = list.slice(0, 8);
        const maxScore = Math.max(...topList.map(getScore), 1);

        return topList.map((item) => {
            const score = getScore(item);
            return {
                ...item,
                score,
                barWidth: score > 0 ? Math.max(6, Math.round((score / maxScore) * 100)) : 0,
            };
        });
    }, [categories, products, metric]);

    const formatMetric = (row: (typeof rows)[number]) => {
        if (metric === "stock") return `${numberFormatter.format(row.stockUnits)} đv`;
        if (metric === "count") return `${numberFormatter.format(row.productCount)} SP`;
        return formatCompactVnd(row.inventoryValue);
    };

    const barColors = [
        "from-indigo-600 to-violet-500",
        "from-blue-600 to-indigo-500",
        "from-violet-600 to-purple-500",
        "from-emerald-600 to-teal-500",
        "from-amber-500 to-orange-500",
        "from-rose-500 to-pink-500",
        "from-cyan-600 to-sky-500",
        "from-slate-600 to-slate-500",
    ];

    return (
        <article className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col justify-between">
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <Layers size={16} className="text-indigo-600" />
                        <h2 className="text-base font-extrabold text-slate-900">
                            Phân tích danh mục & giá trị kho
                        </h2>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                        Xếp hạng top ngành hàng theo quy mô sản phẩm và vốn tồn kho
                    </p>
                </div>

                {/* Metric toggle */}
                <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                    {(
                        [
                            { id: "value", label: "Giá trị kho" },
                            { id: "stock", label: "Số lượng tồn" },
                            { id: "count", label: "Số mẫu SP" },
                        ] as const
                    ).map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setMetric(tab.id)}
                            className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition cursor-pointer ${
                                metric === tab.id
                                    ? "bg-white text-indigo-600 shadow-2xs"
                                    : "text-slate-500 hover:text-slate-800"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="my-6 space-y-3.5">
                    {Array.from({ length: 6 }, (_, i) => (
                        <div key={i} className="h-9 animate-pulse rounded-xl bg-slate-100" />
                    ))}
                </div>
            ) : rows.length > 0 ? (
                <div className="my-5 space-y-3.5">
                    {rows.map((row, index) => (
                        <div key={row.id} className="group">
                            <div className="flex items-center justify-between gap-3 text-xs mb-1.5">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[10px] font-black tabular-nums text-slate-600">
                                        {index + 1}
                                    </span>
                                    <span className="truncate font-bold text-slate-800">
                                        {row.name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="hidden sm:inline text-[11px] font-medium tabular-nums text-slate-400">
                                        {row.productCount} mẫu · {numberFormatter.format(row.stockUnits)} đv
                                    </span>
                                    <span
                                        className="font-black tabular-nums text-indigo-700"
                                        title={currencyFormatter.format(row.inventoryValue)}
                                    >
                                        {formatMetric(row)}
                                    </span>
                                </div>
                            </div>
                            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                                <div
                                    className={`h-full rounded-full bg-gradient-to-r ${barColors[index % barColors.length]} transition-all duration-500`}
                                    style={{ width: `${row.barWidth}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="py-12 text-center text-xs text-slate-400">
                    Chưa có dữ liệu sản phẩm theo danh mục để lập biểu đồ.
                </p>
            )}

            <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-[11px] text-slate-500">
                <span>Tổng {categories.length} danh mục · {products.length} sản phẩm</span>
                <Link
                    to="/admin/categories"
                    className="font-bold text-indigo-600 hover:text-indigo-800 transition"
                >
                    Quản lý danh mục &rarr;
                </Link>
            </div>
        </article>
    );
}

export function InventoryHealthChart({
    items,
    lowStockThreshold,
    lowStockCount,
    outOfStockCount,
    totalProducts,
    loading,
}: {
    items: InventoryItem[];
    lowStockThreshold: number;
    lowStockCount: number;
    outOfStockCount: number;
    totalProducts: number;
    loading: boolean;
}) {
    const metrics = useMemo(() => {
        const totalPhysical = items.reduce((s, it) => s + Math.max(0, it.quantity), 0);
        const totalReserved = items.reduce((s, it) => s + Math.max(0, it.reservedQuantity), 0);
        const totalAvailable = items.reduce((s, it) => s + Math.max(0, it.availableQuantity), 0);

        const hasFullSample = items.length > 0 && items.length >= totalProducts;
        const outCount = hasFullSample
            ? items.filter((it) => it.availableQuantity <= 0).length
            : outOfStockCount;
        const lowOnlyCount = hasFullSample
            ? items.filter(
                  (it) =>
                      it.availableQuantity > 0 &&
                      (it.lowStock || it.availableQuantity <= lowStockThreshold),
              ).length
            : Math.max(0, lowStockCount - outCount);
        const skuTotal = hasFullSample ? items.length : Math.max(totalProducts, lowOnlyCount + outCount);
        const healthyCount = Math.max(0, skuTotal - lowOnlyCount - outCount);
        const denom = Math.max(skuTotal, healthyCount + lowOnlyCount + outCount, 1);

        const healthyPct = healthyCount > 0 ? Math.round((healthyCount / denom) * 100) : 0;
        const lowPct = lowOnlyCount > 0 ? Math.round((lowOnlyCount / denom) * 100) : 0;
        const outPct = outCount > 0 ? Math.max(0, 100 - healthyPct - lowPct) : 0;

        return {
            totalPhysical,
            totalReserved,
            totalAvailable,
            healthyCount,
            lowOnlyCount,
            outCount,
            healthyPct,
            lowPct,
            outPct,
        };
    }, [items, lowStockCount, lowStockThreshold, outOfStockCount, totalProducts]);

    return (
        <article className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                    <h2 className="text-base font-extrabold text-slate-900">
                        Sức khỏe tồn kho & Giữ chỗ
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                        Tỷ lệ an toàn hàng hóa theo ngưỡng cảnh báo (&le; {lowStockThreshold} đv)
                    </p>
                </div>
                <Link
                    to="/admin/inventory"
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-indigo-600 transition hover:bg-indigo-50"
                >
                    Kho hàng <ArrowUpRight size={13} />
                </Link>
            </div>

            {loading ? (
                <div className="my-6 space-y-4">
                    <div className="h-5 animate-pulse rounded-full bg-slate-100" />
                    <div className="grid grid-cols-3 gap-3">
                        <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
                        <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
                        <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
                    </div>
                </div>
            ) : (
                <div className="my-5 space-y-5">
                    {/* Multi-segment Horizontal Stacked Bar */}
                    <div>
                        <div className="mb-2 flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-700">
                                Tỷ lệ SKU đạt chuẩn sẵn bán
                            </span>
                            <span className="font-black tabular-nums text-emerald-600">
                                {metrics.healthyPct}% an toàn
                            </span>
                        </div>
                        <div className="flex h-4 w-full overflow-hidden rounded-full bg-slate-100 gap-0.5">
                            {metrics.healthyCount > 0 && (
                                <div
                                    className="h-full bg-emerald-500 transition-all duration-500"
                                    style={{ width: `${metrics.healthyPct}%` }}
                                    title={`Dồi dào: ${metrics.healthyCount} mặt hàng`}
                                />
                            )}
                            {metrics.lowOnlyCount > 0 && (
                                <div
                                    className="h-full bg-amber-400 transition-all duration-500"
                                    style={{ width: `${metrics.lowPct}%` }}
                                    title={`Sắp hết: ${metrics.lowOnlyCount} mặt hàng`}
                                />
                            )}
                            {metrics.outCount > 0 && (
                                <div
                                    className="h-full bg-rose-500 transition-all duration-500"
                                    style={{ width: `${metrics.outPct}%` }}
                                    title={`Hết hàng: ${metrics.outCount} mặt hàng`}
                                />
                            )}
                        </div>
                    </div>

                    {/* 3 SKU Status Tiles */}
                    <div className="grid grid-cols-3 gap-2.5">
                        <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/60 p-3">
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                                <CheckCircle2 size={13} /> Dồi dào
                            </div>
                            <p className="mt-1.5 text-xl font-black tabular-nums text-slate-900">
                                {metrics.healthyCount}
                            </p>
                            <p className="text-[11px] font-semibold tabular-nums text-emerald-600">
                                {metrics.healthyPct}% mặt hàng
                            </p>
                        </div>

                        <Link
                            to="/admin/inventory?filter=low"
                            className="rounded-xl border border-amber-200/80 bg-amber-50/60 p-3 transition hover:border-amber-300"
                        >
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700">
                                <AlertTriangle size={13} /> Sắp hết
                            </div>
                            <p className="mt-1.5 text-xl font-black tabular-nums text-slate-900">
                                {metrics.lowOnlyCount}
                            </p>
                            <p className="text-[11px] font-semibold tabular-nums text-amber-600">
                                {metrics.lowPct}% mặt hàng
                            </p>
                        </Link>

                        <Link
                            to="/admin/inventory?filter=low"
                            className="rounded-xl border border-rose-200/80 bg-rose-50/60 p-3 transition hover:border-rose-300"
                        >
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-700">
                                <XCircle size={13} /> Hết hàng
                            </div>
                            <p className="mt-1.5 text-xl font-black tabular-nums text-slate-900">
                                {metrics.outCount}
                            </p>
                            <p className="text-[11px] font-semibold tabular-nums text-rose-600">
                                {metrics.outPct}% mặt hàng
                            </p>
                        </Link>
                    </div>

                    {/* Capacity Snapshot */}
                    <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 grid grid-cols-3 gap-3 text-center">
                        <div>
                            <p className="text-[11px] font-semibold text-slate-500">Tổng vật lý</p>
                            <p className="mt-0.5 text-sm font-black tabular-nums text-slate-900">
                                {numberFormatter.format(metrics.totalPhysical)}
                            </p>
                        </div>
                        <div className="border-x border-slate-200/80">
                            <p className="text-[11px] font-semibold text-indigo-600 flex items-center justify-center gap-1">
                                <PackageCheck size={12} /> Sẵn bán
                            </p>
                            <p className="mt-0.5 text-sm font-black tabular-nums text-indigo-700">
                                {numberFormatter.format(metrics.totalAvailable)}
                            </p>
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold text-amber-600 flex items-center justify-center gap-1">
                                <Truck size={12} /> Giữ chỗ
                            </p>
                            <p className="mt-0.5 text-sm font-black tabular-nums text-amber-700">
                                {numberFormatter.format(metrics.totalReserved)}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-[11px] text-slate-500">
                <span className="inline-flex items-center gap-1">
                    <ShieldAlert size={12} className="text-amber-500" />
                    Tổng cảnh báo cần nhập: <strong className="text-slate-700 tabular-nums">{lowStockCount}</strong>
                </span>
                <span className="tabular-nums font-semibold text-slate-700">
                    Đo lường {items.length} SKU
                </span>
            </div>
        </article>
    );
}
