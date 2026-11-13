import {
    AlertTriangle,
    ArrowRight,
    BarChart3,
    Boxes,
    CheckCircle2,
    CircleDollarSign,
    Clock,
    PackageCheck,
    Percent,
    ReceiptText,
    RefreshCw,
    TrendingUp,
    Truck,
    Users,
    XCircle,
    Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
    CategoryAnalyticsChart,
    InventoryHealthChart,
    OrderStatusDonutChart,
    PaymentAndRevenueChart,
    formatCompactVnd,
    type OrderStatusSegment,
} from "../../components/admin/DashboardCharts";
import { adminService } from "../../service/adminService";
import { catalogService } from "../../service/catalogService";
import type { AdminOrder, DashboardSummaryResponse, InventoryItem } from "../../types/admin";
import type { Category, ProductSummary } from "../../types/catalog";
import type { FlashSaleResponse } from "../../types/flashSale";

const currency = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
});
const numberFormatter = new Intl.NumberFormat("vi-VN");

export default function AdminDashboardPage() {
    const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [orders, setOrders] = useState<AdminOrder[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<ProductSummary[]>([]);
    const [totalUsers, setTotalUsers] = useState<number>(0);
    const [flashSales, setFlashSales] = useState<FlashSaleResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [lastUpdatedAt, setLastUpdatedAt] = useState<string>("");

    const loadData = (showToast = false) => {
        setLoading(true);
        setHasError(false);

        Promise.allSettled([
            adminService.getDashboardSummary(),
            adminService.getInventories(false, 0, 100),
            adminService.getOrders(1),
            catalogService.getCategories(),
            catalogService.getProducts({ size: 100 }),
            adminService.getUsers(undefined, undefined, 1, 1),
            adminService.getFlashSales(undefined, undefined, 0, 20),
        ])
            .then(
                async ([
                    summaryRes,
                    inventoriesRes,
                    ordersRes,
                    categoriesRes,
                    productsRes,
                    usersRes,
                    flashSalesRes,
                ]) => {
                    if (summaryRes.status === "fulfilled") {
                        setSummary(summaryRes.value);
                    } else {
                        console.warn("Không tải được dashboard summary:", summaryRes.reason);
                    }

                    if (inventoriesRes.status === "fulfilled") {
                        setItems(inventoriesRes.value.content || []);
                    } else {
                        console.warn("Không tải được inventories:", inventoriesRes.reason);
                        if (summaryRes.status === "rejected") {
                            setHasError(true);
                        }
                    }

                    if (ordersRes.status === "fulfilled") {
                        let collectedOrders = [...(ordersRes.value.content || [])];
                        const extraPages = Math.min(ordersRes.value.totalPages || 1, 3);
                        if (extraPages > 1) {
                            const pageResults = await Promise.allSettled(
                                Array.from({ length: extraPages - 1 }, (_, i) =>
                                    adminService.getOrders(i + 2),
                                ),
                            );
                            for (const res of pageResults) {
                                if (res.status === "fulfilled" && res.value.content?.length) {
                                    collectedOrders = collectedOrders.concat(res.value.content);
                                }
                            }
                        }
                        setOrders(collectedOrders);
                    }

                    if (categoriesRes.status === "fulfilled") {
                        setCategories(categoriesRes.value || []);
                    }

                    if (productsRes.status === "fulfilled") {
                        setProducts(productsRes.value.content || []);
                    }

                    if (usersRes.status === "fulfilled") {
                        setTotalUsers(usersRes.value.totalElements ?? 0);
                    }

                    if (flashSalesRes.status === "fulfilled") {
                        setFlashSales(flashSalesRes.value.content || []);
                    }

                    setLastUpdatedAt(
                        new Date().toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                        }),
                    );

                    if (showToast) {
                        toast.success("Làm mới dữ liệu tổng quan thành công!", {
                            id: "dashboard-reload",
                        });
                    }
                },
            )
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        loadData(false);

        let timer: any;
        const handleSync = () => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                loadData(false);
            }, 500);
        };

        const handleAdminRefresh = () => {
            loadData(false);
        };

        window.addEventListener("order_status_changed", handleSync);
        window.addEventListener("storage", handleSync);
        window.addEventListener("admin_refresh_data", handleAdminRefresh);
        return () => {
            clearTimeout(timer);
            window.removeEventListener("order_status_changed", handleSync);
            window.removeEventListener("storage", handleSync);
            window.removeEventListener("admin_refresh_data", handleAdminRefresh);
        };
    }, []);

    const overview = useMemo(() => {
        const totalStock = items.reduce(
            (total, item) => total + item.availableQuantity,
            0,
        );
        const lowStockCount = items.filter((item) => item.lowStock).length;
        const outOfStockCount = items.filter(
            (item) => item.availableQuantity <= 0,
        ).length;

        return {
            totalRevenue: summary?.totalRevenue ?? 0,
            totalOrders: summary?.totalOrders ?? 0,
            ordersToday: summary?.ordersToday ?? 0,
            totalProducts: summary?.totalProducts ?? items.length,
            lowStockProducts: summary?.lowStockProducts ?? lowStockCount,
            outOfStockProducts: summary?.outOfStockProducts ?? outOfStockCount,
            lowStockThreshold: summary?.lowStockThreshold ?? 5,
            totalStock,
        };
    }, [summary, items]);

    const ordersByStatus = useMemo(() => {
        const raw = summary?.ordersByStatus || {};
        const pending = Number(raw.PENDING || 0);
        const shipped = Number(raw.SHIPPED || 0);
        const delivered = Number(raw.DELIVERED || 0);
        const cancelled = Number(raw.CANCELLED || 0);
        const total =
            overview.totalOrders || (pending + shipped + delivered + cancelled) || 1;

        return [
            {
                status: "PENDING" as const,
                label: "Chờ xác nhận",
                count: pending,
                percent: Math.round((pending / total) * 100),
                icon: Clock,
                color: "text-amber-600",
                bgColor: "bg-amber-50/70",
                borderColor: "border-amber-200/80",
                barColor: "bg-amber-500",
                strokeColor: "#f59e0b",
                dotClass: "bg-amber-500",
                badgeClass: "bg-amber-100 text-amber-700",
            },
            {
                status: "SHIPPED" as const,
                label: "Đang giao hàng",
                count: shipped,
                percent: Math.round((shipped / total) * 100),
                icon: Truck,
                color: "text-blue-600",
                bgColor: "bg-blue-50/70",
                borderColor: "border-blue-200/80",
                barColor: "bg-blue-500",
                strokeColor: "#3b82f6",
                dotClass: "bg-blue-500",
                badgeClass: "bg-blue-100 text-blue-700",
            },
            {
                status: "DELIVERED" as const,
                label: "Đã giao thành công",
                count: delivered,
                percent: Math.round((delivered / total) * 100),
                icon: CheckCircle2,
                color: "text-emerald-600",
                bgColor: "bg-emerald-50/70",
                borderColor: "border-emerald-200/80",
                barColor: "bg-emerald-500",
                strokeColor: "#10b981",
                dotClass: "bg-emerald-500",
                badgeClass: "bg-emerald-100 text-emerald-700",
            },
            {
                status: "CANCELLED" as const,
                label: "Đã hủy",
                count: cancelled,
                percent: Math.round((cancelled / total) * 100),
                icon: XCircle,
                color: "text-rose-600",
                bgColor: "bg-rose-50/70",
                borderColor: "border-rose-200/80",
                barColor: "bg-rose-500",
                strokeColor: "#f43f5e",
                dotClass: "bg-rose-500",
                badgeClass: "bg-rose-100 text-rose-700",
            },
        ];
    }, [summary, overview.totalOrders]);

    const chartSegments: OrderStatusSegment[] = useMemo(
        () =>
            ordersByStatus.map((item) => ({
                status: item.status,
                label: item.label,
                count: item.count,
                percent: item.percent,
                strokeColor: item.strokeColor,
                dotClass: item.dotClass,
                badgeClass: item.badgeClass,
            })),
        [ordersByStatus],
    );

    const operationalStats = useMemo(() => {
        const deliveredEntry = ordersByStatus.find((s) => s.status === "DELIVERED");
        const cancelledEntry = ordersByStatus.find((s) => s.status === "CANCELLED");
        const deliveredCount = deliveredEntry?.count ?? 0;
        const cancelledCount = cancelledEntry?.count ?? 0;
        const totalOrdersCount = overview.totalOrders || 0;

        const nonCancelledOrders = orders.filter((o) => o.orderStatus !== "CANCELLED");
        const sampledSum = nonCancelledOrders.reduce(
            (sum, o) => sum + Number(o.finalAmount ?? o.totalAmount ?? 0),
            0,
        );

        const avgOrderValue =
            deliveredCount > 0 && overview.totalRevenue > 0
                ? Math.round(overview.totalRevenue / deliveredCount)
                : nonCancelledOrders.length > 0
                  ? Math.round(sampledSum / nonCancelledOrders.length)
                  : 0;

        const completionRate =
            totalOrdersCount > 0 ? Math.round((deliveredCount / totalOrdersCount) * 100) : 0;
        const cancelRate =
            totalOrdersCount > 0 ? Math.round((cancelledCount / totalOrdersCount) * 100) : 0;

        const estimatedInventoryValue = products.reduce(
            (sum, prod) =>
                sum + Math.max(0, Number(prod.price || 0)) * Math.max(0, Number(prod.stockQuantity || 0)),
            0,
        );

        const now = Date.now();
        const runningFlashSalesCount = flashSales.filter(
            (sale) =>
                sale.isRunning ||
                (sale.isActive &&
                    now >= new Date(sale.startAt).getTime() &&
                    now <= new Date(sale.endAt).getTime()),
        ).length;

        return {
            avgOrderValue,
            completionRate,
            cancelRate,
            estimatedInventoryValue,
            runningFlashSalesCount,
            totalFlashSalesCount: flashSales.length,
        };
    }, [ordersByStatus, overview.totalOrders, overview.totalRevenue, orders, products, flashSales]);

    const cards = [
        {
            label: "Doanh thu thực tế",
            value: currency.format(overview.totalRevenue),
            icon: CircleDollarSign,
            color: "bg-emerald-500 text-white shadow-emerald-200",
            iconBg: "bg-emerald-50 text-emerald-600",
            detail: "Đơn giao thành công (DELIVERED)",
        },
        {
            label: "Tổng đơn hàng",
            value: numberFormatter.format(overview.totalOrders),
            icon: ReceiptText,
            color: "bg-indigo-500 text-white shadow-indigo-200",
            iconBg: "bg-indigo-50 text-indigo-600",
            detail: `Hôm nay: ${overview.ordersToday} đơn mới`,
        },
        {
            label: "Sản phẩm kinh doanh",
            value: numberFormatter.format(overview.totalProducts),
            icon: PackageCheck,
            color: "bg-violet-500 text-white shadow-violet-200",
            iconBg: "bg-violet-50 text-violet-600",
            detail: `Tổng kho: ${numberFormatter.format(overview.totalStock)} đơn vị`,
        },
        {
            label: "Cảnh báo kho hàng",
            value: `${overview.lowStockProducts} mặt hàng`,
            icon: AlertTriangle,
            color: "bg-rose-500 text-white shadow-rose-200",
            iconBg: "bg-rose-50 text-rose-600",
            detail: `Hết hàng: ${overview.outOfStockProducts} (Ngưỡng tồn ≤ ${overview.lowStockThreshold})`,
        },
    ];

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                        Bảng điều khiển quản trị
                    </span>
                    <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
                        Tổng quan hoạt động kinh doanh
                    </h1>
                    <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                        Số liệu doanh thu, phân bổ đơn hàng và tồn kho đồng bộ thời gian thực.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                    {lastUpdatedAt && (
                        <span className="hidden text-[11px] font-semibold tabular-nums text-slate-400 md:inline">
                            Đồng bộ lúc {lastUpdatedAt}
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={() => loadData(true)}
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                    >
                        <RefreshCw size={14} className={`text-indigo-600 ${loading ? "animate-spin" : ""}`} />
                        <span>{loading ? "Đang tải lại..." : "Làm mới dữ liệu"}</span>
                    </button>
                    <Link
                        to="/admin/orders"
                        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700"
                    >
                        <ReceiptText size={15} /> Xử lý đơn hàng
                    </Link>
                </div>
            </section>

            {hasError && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-medium text-amber-800">
                    Không tải được một số số liệu từ máy chủ. Hãy kiểm tra kết nối Backend và quyền tài khoản Quản trị viên.
                </div>
            )}

            {/* 4 KPI Cards */}
            <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {cards.map(({ label, value, icon: Icon, iconBg, detail }) => (
                    <article
                        key={label}
                        className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:border-indigo-200 hover:shadow-md"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    {label}
                                </p>
                                {loading ? (
                                    <div className="mt-2.5 h-8 w-28 animate-pulse rounded-lg bg-slate-100" />
                                ) : (
                                    <p className="mt-2 text-2xl font-black tabular-nums text-slate-900 xl:text-3xl">
                                        {value}
                                    </p>
                                )}
                            </div>
                            <span
                                className={`flex h-11 w-11 items-center justify-center rounded-2xl ${iconBg}`}
                            >
                                <Icon size={20} />
                            </span>
                        </div>
                        <p className="mt-4 text-xs font-medium text-slate-500 border-t border-slate-100 pt-3">
                            {detail}
                        </p>
                    </article>
                ))}
            </section>

            {/* Secondary Operational Metrics */}
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <article className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white px-4 py-3.5 shadow-2xs">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                        <BarChart3 size={18} />
                    </span>
                    <div className="min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Giá trị đơn TB (AOV)
                        </p>
                        <p className="truncate text-base font-black tabular-nums text-slate-900">
                            {loading ? "—" : currency.format(operationalStats.avgOrderValue)}
                        </p>
                    </div>
                </article>

                <article className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white px-4 py-3.5 shadow-2xs">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <Percent size={18} />
                    </span>
                    <div className="min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Tỷ lệ hoàn tất đơn
                        </p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-base font-black tabular-nums text-emerald-700">
                                {loading ? "—" : `${operationalStats.completionRate}%`}
                            </p>
                            <span className="text-[11px] font-semibold tabular-nums text-rose-500">
                                Hủy {loading ? "—" : `${operationalStats.cancelRate}%`}
                            </span>
                        </div>
                    </div>
                </article>

                <article
                    className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white px-4 py-3.5 shadow-2xs"
                    title={currency.format(operationalStats.estimatedInventoryValue)}
                >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                        <Boxes size={18} />
                    </span>
                    <div className="min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Tổng giá trị tồn kho
                        </p>
                        <p className="truncate text-base font-black tabular-nums text-slate-900">
                            {loading ? "—" : formatCompactVnd(operationalStats.estimatedInventoryValue)}
                        </p>
                    </div>
                </article>

                <article className="flex items-center justify-between gap-2 rounded-2xl border border-slate-200/80 bg-white px-4 py-3.5 shadow-2xs">
                    <div className="flex items-center gap-3.5 min-w-0">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                            <Users size={18} />
                        </span>
                        <div className="min-w-0">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                Thành viên & Flash Sale
                            </p>
                            <p className="truncate text-base font-black tabular-nums text-slate-900">
                                {loading
                                    ? "—"
                                    : `${numberFormatter.format(totalUsers)} user`}
                            </p>
                        </div>
                    </div>
                    <Link
                        to="/admin/flash-sales"
                        className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1 text-[11px] font-bold tabular-nums text-rose-600 hover:bg-rose-100 transition"
                    >
                        <Zap size={12} />
                        {operationalStats.runningFlashSalesCount}/{operationalStats.totalFlashSalesCount}
                    </Link>
                </article>
            </section>

            {/* Analytics Charts Row 1: Order Donut + Payment/Revenue */}
            <section className="grid gap-6 xl:grid-cols-2">
                <OrderStatusDonutChart
                    segments={chartSegments}
                    totalOrders={overview.totalOrders}
                    ordersToday={overview.ordersToday}
                    loading={loading}
                />
                <PaymentAndRevenueChart
                    orders={orders}
                    summary={summary}
                    loading={loading}
                />
            </section>

            {/* Analytics Charts Row 2: Category Distribution + Inventory Health */}
            <section className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
                <CategoryAnalyticsChart
                    categories={categories}
                    products={products}
                    loading={loading}
                />
                <InventoryHealthChart
                    items={items}
                    lowStockThreshold={overview.lowStockThreshold}
                    lowStockCount={overview.lowStockProducts}
                    outOfStockCount={overview.outOfStockProducts}
                    totalProducts={overview.totalProducts}
                    loading={loading}
                />
            </section>

            {/* Orders Status Distribution Quick Cards */}
            <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
                    <div>
                        <h2 className="text-base font-extrabold text-slate-900">
                            Phân bổ trạng thái đơn hàng
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-500 tabular-nums">
                            Tổng cộng {numberFormatter.format(overview.totalOrders)} đơn đặt hàng trong toàn bộ hệ thống
                        </p>
                    </div>
                    <Link
                        to="/admin/orders"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition"
                    >
                        Xem danh sách đơn &rarr;
                    </Link>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {ordersByStatus.map(
                        ({
                            status,
                            label,
                            count,
                            percent,
                            icon: Icon,
                            color,
                            bgColor,
                            borderColor,
                            barColor,
                        }) => (
                            <Link
                                key={status}
                                to={`/admin/orders?status=${status}`}
                                className={`block rounded-2xl border ${borderColor} ${bgColor} p-4 transition hover:-translate-y-0.5 hover:shadow-sm`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-2 text-xs font-bold text-slate-800">
                                        <Icon size={16} className={color} /> {label}
                                    </span>
                                    <span className={`text-lg font-black tabular-nums ${color}`}>
                                        {loading ? "—" : count}
                                    </span>
                                </div>
                                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                                    <span>Tỷ trọng</span>
                                    <span className="font-bold tabular-nums text-slate-800">
                                        {loading ? "—" : `${percent}%`}
                                    </span>
                                </div>
                                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/80">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                                        style={{ width: `${percent}%` }}
                                    />
                                </div>
                            </Link>
                        ),
                    )}
                </div>
            </section>

            {/* Inventory Insight & Quick Actions */}
            <section className="grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
                {/* Top ready stock products */}
                <article className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div>
                            <h2 className="text-base font-extrabold text-slate-900">
                                Sản phẩm sẵn bán nhiều nhất
                            </h2>
                            <p className="mt-0.5 text-xs text-slate-500">
                                Số lượng hàng thực tế đang có sẵn trong kho
                            </p>
                        </div>
                        <TrendingUp size={20} className="text-indigo-600" />
                    </div>

                    <div className="mt-6 space-y-4">
                        {(loading
                            ? Array.from({ length: 5 })
                            : [...items]
                                  .sort((a, b) => b.availableQuantity - a.availableQuantity)
                                  .slice(0, 5)
                        ).map((item, index) => {
                            const inventory = item as InventoryItem | undefined;
                            const max = Math.max(
                                ...items.map((entry) => entry.availableQuantity),
                                1,
                            );
                            const width = inventory
                                ? Math.max((inventory.availableQuantity / max) * 100, 5)
                                : 60 - index * 8;

                            return (
                                <div
                                    key={inventory?.productId ?? index}
                                    className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-5 gap-y-1.5"
                                >
                                    <span
                                        className={`truncate text-xs font-bold ${
                                            inventory
                                                ? "text-slate-800"
                                                : "h-4 w-40 animate-pulse rounded bg-slate-100"
                                        }`}
                                    >
                                        {inventory?.productName || "Đang tải dữ liệu..."}
                                    </span>
                                    <span className="text-xs font-black tabular-nums text-indigo-600">
                                        {inventory
                                            ? `${numberFormatter.format(inventory.availableQuantity)} đơn vị`
                                            : ""}
                                    </span>
                                    <div className="col-span-2 h-2 overflow-hidden rounded-full bg-slate-100">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                                            style={{ width: `${width}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </article>

                {/* Quick actions box */}
                <article className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 p-6 text-white shadow-md flex flex-col justify-between">
                    <div>
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-indigo-300">
                            <Boxes size={22} />
                        </span>
                        <h2 className="mt-5 text-xl font-black">
                            Quản trị kho & sản phẩm
                        </h2>
                        <p className="mt-2 text-xs leading-relaxed text-indigo-200">
                            Kiểm soát biến động tồn kho, bổ sung số lượng nhanh chóng, cấu hình Flash Sale và cập nhật danh mục sản phẩm.
                        </p>
                    </div>

                    <div className="mt-6 flex flex-col gap-2.5">
                        <Link
                            to="/admin/products"
                            className="inline-flex items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-xs font-bold text-white transition hover:bg-white/20"
                        >
                            <span>Thêm sản phẩm mới</span>
                            <ArrowRight size={14} className="text-indigo-300" />
                        </Link>
                        <Link
                            to="/admin/flash-sales"
                            className="inline-flex items-center justify-between rounded-xl bg-rose-500/20 border border-rose-400/30 px-4 py-3 text-xs font-bold text-rose-100 transition hover:bg-rose-500/30"
                        >
                            <span>Quản lý chương trình Flash Sale</span>
                            <Zap size={14} className="text-amber-300" />
                        </Link>
                        <Link
                            to="/admin/inventory"
                            className="inline-flex items-center justify-between rounded-xl bg-white px-4 py-3 text-xs font-bold text-slate-950 transition hover:bg-indigo-50"
                        >
                            <span>Kiểm soát tồn kho</span>
                            <Boxes size={15} />
                        </Link>
                    </div>
                </article>
            </section>

            {/* Low Stock Warning Section */}
            <section className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 p-5 sm:px-6">
                    <div>
                        <h2 className="text-base font-extrabold text-slate-900">
                            Cảnh báo tồn kho thấp
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-500">
                            Các sản phẩm có số lượng sẵn bán ≤ {overview.lowStockThreshold} đơn vị cần nhập bổ sung sớm.
                        </p>
                    </div>
                    <Link
                        to="/admin/inventory?filter=low"
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition"
                    >
                        Xem tất cả ({overview.lowStockProducts}) &rarr;
                    </Link>
                </div>

                <div className="divide-y divide-slate-100">
                    {!loading &&
                        items
                            .filter(
                                (item) =>
                                    item.lowStock ||
                                    item.availableQuantity <= overview.lowStockThreshold,
                            )
                            .slice(0, 5)
                            .map((item) => (
                                <div
                                    key={item.productId}
                                    className="flex items-center justify-between gap-4 px-5 py-3.5 sm:px-6 hover:bg-slate-50/50 transition"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-xs font-bold text-slate-900">
                                            {item.productName}
                                        </p>
                                        <p className="mt-0.5 text-[11px] text-slate-400">
                                            Mã sản phẩm #{item.productId}
                                        </p>
                                    </div>
                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                                            item.availableQuantity <= 0
                                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                                : "bg-amber-50 text-amber-700 border border-amber-200"
                                        }`}
                                    >
                                        {item.availableQuantity <= 0
                                            ? "Hết hàng (0)"
                                            : `Còn ${item.availableQuantity}`}
                                    </span>
                                </div>
                            ))}

                    {!loading &&
                        !items.some(
                            (item) =>
                                item.lowStock ||
                                item.availableQuantity <= overview.lowStockThreshold,
                        ) && (
                            <p className="px-6 py-8 text-center text-xs text-slate-400">
                                Tồn kho đang ở mức an toàn. Tất cả sản phẩm đều có số lượng dồi dào.
                            </p>
                        )}
                </div>
            </section>
        </div>
    );
}
