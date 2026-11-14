import {
    ArrowRight,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Filter,
    Flame,
    Layers,
    RotateCcw,
    SlidersHorizontal,
    Sparkles,
    Tag,
    Timer,
    X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import FlashSaleCard from "../../components/FlashSaleCard";
import { EmptyProducts } from "../../components/ProductCard";
import ProductCard from "../../components/ProductCard";
import {
    enrichCategoryWithBrands,
    getDefaultBrandsForCategory,
    matchProductBrand,
} from "../../lib/brandHelper";
import { formatProductImageUrl } from "../../lib/image";
import { catalogService } from "../../service/catalogService";
import { useFlashSaleStore } from "../../store/flashSaleStore";
import type {
    Category,
    FlashSaleProduct,
    FlashSaleResponse,
    PageResponse,
    ProductSummary,
} from "../../types/catalog";

type SortBy = "createdAt" | "price" | "name";

const FLASH_PAGE_SIZE = 4;
const FLASH_AUTO_INTERVAL_MS = 4500;

const padTime = (n: number) => String(n).padStart(2, "0");

function buildPaginationItems(
    currentPage: number,
    totalPages: number,
    radius = 2,
): (number | string)[] {
    return Array.from({ length: totalPages }, (_, i) => i)
        .filter(
            (p) =>
                p === 0 ||
                p === totalPages - 1 ||
                Math.abs(p - currentPage) <= radius,
        )
        .reduce<(number | string)[]>((acc, p, idx, arr) => {
            if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) {
                acc.push(`dots-${p}`);
            }
            acc.push(p);
            return acc;
        }, []);
}

interface FilterGroupDefinition {
    title: string;
    options: string[];
}

interface PriceRange {
    label: string;
    min: string;
    max: string;
}

const priceRanges: PriceRange[] = [
    { label: "Dưới 5 triệu", min: "0", max: "5000000" },
    { label: "5 - 10 triệu", min: "5000000", max: "10000000" },
    { label: "10 - 20 triệu", min: "10000000", max: "20000000" },
    { label: "Trên 20 triệu", min: "20000000", max: "" },
];

export default function ProductsPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [categories, setCategories] = useState<Category[]>([]);
    const [result, setResult] = useState<PageResponse<ProductSummary> | null>(
        null,
    );
    const [categorySamples, setCategorySamples] = useState<ProductSummary[]>([]);
    const [flashProducts, setFlashProducts] = useState<FlashSaleProduct[]>([]);
    const [flashPage, setFlashPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

    const activeSales = useFlashSaleStore((state) => state.activeSales);
    const fetchActiveSales = useFlashSaleStore((state) => state.fetchActiveSales);

    const keyword = searchParams.get("keyword") || "";
    const brand = searchParams.get("brand") || "";
    const categoryId = searchParams.get("categoryId") || "";
    const minPrice = searchParams.get("minPrice") || "";
    const maxPrice = searchParams.get("maxPrice") || "";
    const isAllProductsView = !categoryId && !keyword;

    const rawSortBy = searchParams.get("sortBy");
    const sortBy: SortBy =
        rawSortBy === "price" || rawSortBy === "name" ? rawSortBy : "createdAt";

    const page = Number(searchParams.get("page") || 0);

    const selectedCategory =
        categories.find((category) => String(category.id) === categoryId) ||
        null;

    const availableBrands = useMemo(() => {
        if (selectedCategory && selectedCategory.brands && selectedCategory.brands.length > 0) {
            return selectedCategory.brands;
        }
        if (selectedCategory) {
            return getDefaultBrandsForCategory(selectedCategory.name);
        }
        const all = categories.flatMap((c) =>
            c.brands && c.brands.length > 0
                ? c.brands
                : getDefaultBrandsForCategory(c.name),
        );
        const unique = Array.from(new Set(all)).filter(Boolean);
        return unique.length > 0
            ? unique
            : ["Apple", "Samsung", "Xiaomi", "OPPO", "Dell", "HP", "Asus", "Sony", "Anker"];
    }, [selectedCategory, categories]);

    useEffect(() => {
        catalogService
            .getCategories()
            .then((cats) => {
                setCategories(cats.map(enrichCategoryWithBrands));
            })
            .catch(() => {
                setError("Không thể tải danh mục.");
            });

        fetchActiveSales().catch(() => undefined);
    }, [fetchActiveSales]);

    // Tải sản phẩm Flash Sale đang chạy khi ở trang Tất cả sản phẩm
    useEffect(() => {
        if (!isAllProductsView) {
            setFlashProducts([]);
            setFlashPage(0);
            return;
        }

        let cancelled = false;
        catalogService
            .getFlashSaleProducts()
            .then((items) => {
                if (!cancelled) {
                    setFlashProducts(items || []);
                    setFlashPage(0);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setFlashProducts([]);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [isAllProductsView]);

    useEffect(() => {
        let cancelled = false;

        setLoading(true);

        catalogService
            .getProducts({
                keyword: keyword || undefined,
                brand: categoryId ? (brand || undefined) : undefined,
                categoryId: categoryId ? Number(categoryId) : undefined,
                minPrice: categoryId && minPrice ? Number(minPrice) : undefined,
                maxPrice: categoryId && maxPrice ? Number(maxPrice) : undefined,
                sortBy,
                sortDir: sortBy === "price" ? "asc" : "desc",
                page,
                size: 12,
            })
            .then((value) => {
                if (cancelled) return;

                setResult(value);
                setError("");
            })
            .catch(() => {
                if (!cancelled) {
                    setError(
                        "Không thể tải sản phẩm. Vui lòng kiểm tra kết nối tới máy chủ.",
                    );
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [keyword, brand, categoryId, minPrice, maxPrice, sortBy, page]);

    // Lấy các mẫu nổi bật hiển thị ở trên khi xem danh mục
    useEffect(() => {
        if (!categoryId) {
            setCategorySamples([]);
            return;
        }
        let cancelled = false;
        catalogService
            .getProducts({
                categoryId: Number(categoryId),
                size: 6,
                sortBy: "createdAt",
                sortDir: "desc",
            })
            .then((res) => {
                if (!cancelled) {
                    setCategorySamples(res.content || []);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setCategorySamples([]);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [categoryId]);

    const updateFilter = (key: string, value: string) => {
        const next = new URLSearchParams(searchParams);

        if (value) {
            next.set(key, value);
        } else {
            next.delete(key);
        }

        if (key !== "page") {
            next.delete("page");
        }
        setSearchParams(next);
    };

    const updatePriceRange = (min: string, max: string) => {
        const next = new URLSearchParams(searchParams);

        if (min) next.set("minPrice", min);
        else next.delete("minPrice");

        if (max) next.set("maxPrice", max);
        else next.delete("maxPrice");

        next.delete("page");
        setSearchParams(next);
    };

    const onInput =
        (key: string) =>
        (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            updateFilter(key, event.target.value);
        };

    const clearFilters = () => {
        setSearchParams({});
    };

    const hasActiveFilters = Boolean(
        keyword || (selectedCategory && (brand || minPrice || maxPrice)),
    );

    const filteredProducts = useMemo(() => {
        const list = result?.content || [];
        if (!categoryId || !brand) return list;
        return list.filter((p) => matchProductBrand(p.name, brand));
    }, [result, brand, categoryId]);

    const displayedSamples = useMemo(() => {
        if (categorySamples.length > 0) return categorySamples;
        return (result?.content || []).slice(0, 6);
    }, [categorySamples, result]);

    return (
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
            <CategoryHeader
                category={selectedCategory}
                totalElements={result?.totalElements}
            />

            {/* Flash Sale đang chạy trên trang Tất cả sản phẩm (chuyển theo từng trang) */}
            {isAllProductsView && flashProducts.length > 0 && (
                <AllProductsFlashSaleSection
                    products={flashProducts}
                    activeSales={activeSales}
                    page={flashPage}
                    onPageChange={setFlashPage}
                />
            )}

            {isAllProductsView && flashProducts.length > 0 && (
                <div className="mt-10 flex items-center justify-between border-b border-slate-200/80 pb-3">
                    <h2 className="text-lg font-black text-slate-900 sm:text-xl">
                        Tất cả sản phẩm
                    </h2>
                </div>
            )}

            {/* Mẫu nổi bật hiển thị ở trên (ảnh nhỏ) khi xem danh mục */}
            {selectedCategory && displayedSamples.length > 0 && (
                <div className="mt-6 rounded-2xl border border-slate-200/90 bg-gradient-to-r from-slate-50/70 via-white to-indigo-50/30 p-4 shadow-xs sm:p-5">
                    <div className="mb-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                                <Flame size={14} />
                            </span>
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                                    Mẫu nổi bật trong ngành hàng ({selectedCategory.name})
                                </h3>
                                <p className="text-[11px] text-slate-500">
                                    Một số mẫu tiêu biểu được người dùng quan tâm nhiều nhất
                                </p>
                            </div>
                        </div>
                        <span className="hidden text-[11px] font-medium text-slate-400 sm:inline">
                            Bấm vào mẫu để xem chi tiết
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                        {displayedSamples.map((product) => {
                            const img = formatProductImageUrl(
                                product.thumbnailUrl,
                            );
                            return (
                                <div
                                    key={product.id}
                                    onClick={() =>
                                        navigate(`/products/${product.id}`)
                                    }
                                    className="group flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white p-2 shadow-2xs transition hover:-translate-y-0.5 hover:border-indigo-400 hover:shadow-md cursor-pointer"
                                >
                                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-100">
                                        <img
                                            src={img}
                                            alt={product.name}
                                            className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                                            onError={(e) => {
                                                (
                                                    e.currentTarget as HTMLImageElement
                                                ).src =
                                                    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=60";
                                            }}
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p
                                            className="truncate text-xs font-bold text-slate-800 group-hover:text-indigo-600"
                                            title={product.name}
                                        >
                                            {product.name}
                                        </p>
                                        <p className="mt-0.5 text-xs font-black text-rose-600">
                                            {new Intl.NumberFormat(
                                                "vi-VN",
                                                {
                                                    style: "currency",
                                                    currency: "VND",
                                                    maximumFractionDigits: 0,
                                                },
                                            ).format(product.price)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Quick Filter Bar for active tags, mobile toggle & category toolbar */}
            {(selectedCategory || keyword) && (
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Chỉ hiện nút mở bộ lọc mobile khi đang ở trong danh mục sản phẩm */}
                        {selectedCategory && (
                            <button
                                type="button"
                                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 shadow-xs lg:hidden"
                            >
                                <Filter size={14} className="text-indigo-600" />
                                <span>Bộ lọc tìm kiếm</span>
                                {hasActiveFilters && (
                                    <span className="flex h-2 w-2 rounded-full bg-indigo-600" />
                                )}
                            </button>
                        )}

                        {/* Active filter badges */}
                        {selectedCategory && brand && (
                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/80 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                                Thương hiệu: {brand}
                                <button
                                    type="button"
                                    onClick={() => updateFilter("brand", "")}
                                    className="hover:text-indigo-900"
                                    title="Xóa lọc thương hiệu"
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        )}

                        {keyword && (
                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/80 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                                Từ khóa: "{keyword}"
                                <button
                                    type="button"
                                    onClick={() => updateFilter("keyword", "")}
                                    className="hover:text-indigo-900"
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        )}

                        {selectedCategory && (
                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/80 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                                Danh mục: {selectedCategory.name}
                                <button
                                    type="button"
                                    onClick={() => updateFilter("categoryId", "")}
                                    className="hover:text-indigo-900"
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        )}

                        {selectedCategory && (minPrice || maxPrice) && (
                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/80 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                                Giá: {minPrice ? `${Number(minPrice).toLocaleString("vi-VN")}đ` : "0đ"} -{" "}
                                {maxPrice ? `${Number(maxPrice).toLocaleString("vi-VN")}đ` : "Tối đa"}
                                <button
                                    type="button"
                                    onClick={() => updatePriceRange("", "")}
                                    className="hover:text-indigo-900"
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        )}

                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="text-xs font-bold text-rose-600 hover:text-rose-700 underline underline-offset-2 ml-1"
                            >
                                Xóa tất cả
                            </button>
                        )}
                    </div>

                    {selectedCategory && (
                        <ProductToolbar
                            result={result}
                            sortBy={sortBy}
                            onChange={onInput("sortBy")}
                        />
                    )}
                </div>
            )}

            <div
                className={`${
                    selectedCategory ||
                    keyword ||
                    (isAllProductsView && flashProducts.length > 0)
                        ? "mt-5"
                        : "mt-7"
                } ${
                    selectedCategory ? "grid gap-6 lg:grid-cols-[280px_1fr]" : ""
                }`}
            >
                {/* Desktop and Mobile Filter Sidebar: chỉ hiện khi có danh mục sản phẩm */}
                {selectedCategory && (
                    <div
                        className={`${
                            mobileFilterOpen ? "block" : "hidden"
                        } lg:block`}
                    >
                        <FilterPanel
                            brands={availableBrands}
                            selectedBrand={brand}
                            onToggleBrand={(b) => updateFilter("brand", b === brand ? "" : b)}
                            minPrice={minPrice}
                            maxPrice={maxPrice}
                            onPriceRange={updatePriceRange}
                            onClear={clearFilters}
                            selectedCategory={selectedCategory}
                        />
                    </div>
                )}

                <div className="min-w-0">
                    <ProductResults
                        loading={loading}
                        error={error}
                        products={filteredProducts}
                        isFullWidth={!selectedCategory}
                    />

                    {result && result.totalPages > 1 && (
                        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200/90 pt-6 sm:flex-row">
                            <p className="text-xs text-slate-500 font-medium tabular-nums">
                                Hiển thị trang{" "}
                                <strong className="text-slate-900">{page + 1}</strong> /{" "}
                                <strong className="text-slate-900">{result.totalPages}</strong> (Tổng cộng{" "}
                                <strong className="text-slate-900">{result.totalElements}</strong> sản phẩm)
                            </p>
                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    disabled={page <= 0 || loading}
                                    onClick={() =>
                                        updateFilter("page", String(page - 1))
                                    }
                                    className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                                >
                                    Trang trước
                                </button>
                                {buildPaginationItems(page, result.totalPages).map((item) =>
                                    typeof item === "string" ? (
                                        <span
                                            key={item}
                                            className="px-1 text-slate-400 text-xs"
                                        >
                                            ...
                                        </span>
                                    ) : (
                                        <button
                                            key={item}
                                            type="button"
                                            onClick={() =>
                                                updateFilter("page", String(item))
                                            }
                                            className={`h-8 min-w-8 rounded-lg px-2 text-xs font-bold tabular-nums transition cursor-pointer ${
                                                page === item
                                                    ? "bg-indigo-600 text-white shadow-sm"
                                                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                            }`}
                                        >
                                            {item + 1}
                                        </button>
                                    ),
                                )}
                                <button
                                    type="button"
                                    disabled={
                                        page >= result.totalPages - 1 || loading
                                    }
                                    onClick={() =>
                                        updateFilter("page", String(page + 1))
                                    }
                                    className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                                >
                                    Trang sau
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

function AllProductsFlashSaleSection({
    products,
    activeSales,
    page,
    onPageChange,
}: {
    products: FlashSaleProduct[];
    activeSales: FlashSaleResponse[];
    page: number;
    onPageChange: (nextPage: number) => void;
}) {
    const [timeLeft, setTimeLeft] = useState<{ h: number; m: number; s: number } | null>(null);
    const [isPausedByHover, setIsPausedByHover] = useState(false);

    const totalPages = Math.max(1, Math.ceil(products.length / FLASH_PAGE_SIZE));
    const safePage = Math.min(Math.max(0, page), totalPages - 1);
    const startIdx = safePage * FLASH_PAGE_SIZE;
    const endIdx = Math.min(products.length, startIdx + FLASH_PAGE_SIZE);
    const visibleProducts = products.slice(startIdx, endIdx);

    useEffect(() => {
        if (isPausedByHover || totalPages <= 1) return;

        const timerId = setTimeout(() => {
            onPageChange((safePage + 1) % totalPages);
        }, FLASH_AUTO_INTERVAL_MS);

        return () => clearTimeout(timerId);
    }, [isPausedByHover, safePage, totalPages, onPageChange]);

    useEffect(() => {
        const endTimes = products
            .map((p) => p.endAt)
            .filter((v): v is string => Boolean(v))
            .sort();

        if (endTimes.length === 0) {
            setTimeLeft(null);
            return;
        }

        const target = new Date(endTimes[0]).getTime();
        if (Number.isNaN(target)) {
            setTimeLeft(null);
            return;
        }

        const tick = () => {
            const diff = Math.max(0, target - Date.now());
            setTimeLeft({
                h: Math.floor(diff / 3_600_000),
                m: Math.floor((diff % 3_600_000) / 60_000),
                s: Math.floor((diff % 60_000) / 1000),
            });
        };

        tick();
        const intervalId = setInterval(tick, 1000);
        return () => clearInterval(intervalId);
    }, [products]);

    const paginationItems = buildPaginationItems(safePage, totalPages, 1);

    return (
        <div
            onMouseEnter={() => setIsPausedByHover(true)}
            onMouseLeave={() => setIsPausedByHover(false)}
            className="mt-7 overflow-hidden rounded-3xl border border-rose-200/80 bg-gradient-to-b from-rose-50/75 via-white to-white p-5 sm:p-7 shadow-sm"
        >
            {/* Header row */}
            <div className="flex flex-col justify-between gap-4 pb-5 lg:flex-row lg:items-center">
                <div className="flex items-center gap-3.5">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-600 to-orange-500 text-white shadow-md shadow-rose-500/20">
                        <Flame size={22} />
                    </span>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-black uppercase tracking-wider text-rose-600">
                                Giờ vàng giá sốc
                            </span>
                            {activeSales.length > 0 && (
                                <span className="rounded-full bg-rose-600 px-2.5 py-0.5 text-[10px] font-extrabold text-white">
                                    {activeSales[0].name}
                                </span>
                            )}
                            <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold tabular-nums text-rose-700">
                                {products.length} deal đang chạy
                            </span>
                        </div>
                        <h2 className="mt-0.5 text-xl font-black text-slate-900 sm:text-2xl">
                            Flash Sale Đang Chạy
                        </h2>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                    {timeLeft && (
                        <div className="flex items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2 text-white">
                            <span className="flex items-center gap-1 text-[11px] font-bold text-rose-300">
                                <Timer size={13} /> Kết thúc sau:
                            </span>
                            <div className="flex items-center gap-1 font-mono text-xs font-black tabular-nums text-amber-300 sm:text-sm">
                                <span>{padTime(timeLeft.h)}</span>
                                <span className="text-white">:</span>
                                <span>{padTime(timeLeft.m)}</span>
                                <span className="text-white">:</span>
                                <span>{padTime(timeLeft.s)}</span>
                            </div>
                        </div>
                    )}

                    <Link
                        to="/flash-sale"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-rose-700"
                    >
                        Xem tất cả <ArrowRight size={14} />
                    </Link>
                </div>
            </div>

            {/* Progress / Divider track */}
            {totalPages > 1 ? (
                <div className="h-[2px] w-full overflow-hidden rounded-full bg-rose-100">
                    {!isPausedByHover ? (
                        <div
                            key={`${safePage}-run`}
                            className="h-full w-full bg-gradient-to-r from-rose-500 to-orange-500 animate-flash-progress"
                        />
                    ) : (
                        <div className="h-full w-1/3 bg-rose-300/60" />
                    )}
                </div>
            ) : (
                <div className="border-b border-rose-100" />
            )}

            {/* 4-column per-page Flash Sale cards */}
            <div
                key={safePage}
                className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 animate-flash-enter"
            >
                {visibleProducts.map((product) => (
                    <FlashSaleCard key={product.id} product={product} />
                ))}
            </div>

            {/* Bottom pagination bar when more than 1 page */}
            {totalPages > 1 && (
                <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-rose-100/90 pt-4 sm:flex-row">
                    <p className="text-xs font-medium tabular-nums text-slate-500">
                        Hiển thị{" "}
                        <strong className="text-slate-800">
                            {startIdx + 1}–{endIdx}
                        </strong>{" "}
                        trong{" "}
                        <strong className="text-slate-800">{products.length}</strong>{" "}
                        sản phẩm Flash Sale
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-1.5">
                        <button
                            type="button"
                            disabled={safePage <= 0}
                            onClick={() => onPageChange(safePage - 1)}
                            className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                        >
                            <ChevronLeft size={14} />
                            Trước
                        </button>

                        {paginationItems.map((item) =>
                            typeof item === "string" ? (
                                <span
                                    key={item}
                                    className="px-1 text-xs text-slate-400"
                                >
                                    ...
                                </span>
                            ) : (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => onPageChange(item)}
                                    className={`h-8 min-w-8 rounded-lg px-2 text-xs font-bold tabular-nums transition cursor-pointer ${
                                        safePage === item
                                            ? "bg-rose-600 text-white shadow-sm"
                                            : "border border-slate-200 bg-white text-slate-700 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                                    }`}
                                >
                                    {item + 1}
                                </button>
                            ),
                        )}

                        <button
                            type="button"
                            disabled={safePage >= totalPages - 1}
                            onClick={() => onPageChange(safePage + 1)}
                            className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                        >
                            Sau
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function CategoryHeader({
    category,
    totalElements,
}: {
    category: Category | null;
    totalElements?: number;
}) {
    if (category) {
        return (
            <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-violet-50 p-6 sm:p-8 shadow-xs">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600">
                            <Layers size={14} /> Danh mục sản phẩm
                        </div>
                        <h1 className="mt-1.5 text-2xl font-black text-slate-900 sm:text-3xl">
                            {category.name}
                        </h1>
                        <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
                            {category.description ||
                                "Khám phá danh sách các sản phẩm chọn lọc thuộc ngành hàng với mức giá và chính sách ưu đãi tốt nhất."}
                        </p>
                    </div>

                    {totalElements !== undefined && (
                        <div className="shrink-0 rounded-2xl border border-indigo-100 bg-white px-5 py-3 shadow-xs text-center">
                            <p className="text-2xl font-black text-indigo-600">
                                {totalElements}
                            </p>
                            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                Sản phẩm
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 px-6 py-8 sm:px-10 sm:py-10 text-white shadow-lg">
            <div className="absolute right-0 top-0 -mt-8 -mr-8 h-48 w-48 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />
            <div className="relative z-10 max-w-2xl space-y-2">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-300">
                    <Sparkles size={13} /> Khám phá danh mục hàng ngàn sản phẩm
                </div>
                <h1 className="text-2xl font-black sm:text-3xl lg:text-4xl">
                    Tất cả sản phẩm tại ShopNova
                </h1>
                <p className="text-xs text-slate-300 leading-relaxed sm:text-sm">
                    Khám phá toàn bộ danh mục sản phẩm chính hãng với mức giá ưu đãi và chính sách bảo hành tốt nhất.
                </p>
            </div>
        </div>
    );
}

interface FilterPanelProps {
    brands: string[];
    selectedBrand: string;
    onToggleBrand: (brand: string) => void;
    minPrice: string;
    maxPrice: string;
    onPriceRange: (min: string, max: string) => void;
    onClear: () => void;
    selectedCategory: Category | null;
}

function FilterPanel({
    brands,
    selectedBrand,
    onToggleBrand,
    minPrice,
    maxPrice,
    onPriceRange,
    onClear,
    selectedCategory,
}: FilterPanelProps) {
    return (
        <aside className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs lg:sticky lg:top-24">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 bg-slate-50/50">
                <h2 className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                    <SlidersHorizontal size={16} className="text-indigo-600" />
                    Bộ lọc tìm kiếm
                </h2>

                <button
                    type="button"
                    onClick={onClear}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 transition hover:text-indigo-800"
                >
                    <RotateCcw size={13} />
                    Đặt lại
                </button>
            </div>

            {/* Brand Filter Group (Hiện lên trên cùng) */}
            <BrandFilterGroup
                brands={brands}
                selectedBrand={selectedBrand}
                onToggle={onToggleBrand}
            />

            <FilterGroup
                title="Mức giá phổ biến"
                options={priceRanges.map((range) => range.label)}
                selected={priceRanges
                    .filter(
                        (range) =>
                            range.min === minPrice && range.max === maxPrice,
                    )
                    .map((range) => range.label)}
                onToggle={(label) => {
                    const range = priceRanges.find(
                        (item) => item.label === label,
                    );

                    if (range) {
                        if (range.min === minPrice && range.max === maxPrice) {
                            onPriceRange("", "");
                        } else {
                            onPriceRange(range.min, range.max);
                        }
                    }
                }}
            />

            <div className="border-b border-slate-100 px-5 py-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Khoảng giá (VNĐ)
                </p>
                <div className="grid grid-cols-2 gap-2">
                    <input
                        value={minPrice}
                        onChange={(e) => onPriceRange(e.target.value, maxPrice)}
                        type="number"
                        min="0"
                        placeholder="Từ (đ)"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium outline-none focus:border-indigo-500 focus:bg-white"
                    />
                    <input
                        value={maxPrice}
                        onChange={(e) => onPriceRange(minPrice, e.target.value)}
                        type="number"
                        min="0"
                        placeholder="Đến (đ)"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium outline-none focus:border-indigo-500 focus:bg-white"
                    />
                </div>
            </div>

            {selectedCategory && (
                <CategorySpecificFilters category={selectedCategory} />
            )}
        </aside>
    );
}

function BrandFilterGroup({
    brands,
    selectedBrand,
    onToggle,
}: {
    brands: string[];
    selectedBrand: string;
    onToggle: (brand: string) => void;
}) {
    const [open, setOpen] = useState(true);
    const [search, setSearch] = useState("");

    const displayedBrands = useMemo(() => {
        if (!search.trim()) return brands;
        return brands.filter((b) =>
            b.toLowerCase().includes(search.toLowerCase().trim()),
        );
    }, [brands, search]);

    return (
        <div className="border-b border-slate-100 px-5 py-4">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                className="flex w-full items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-slate-700"
            >
                <span className="flex items-center gap-1.5">
                    <Tag size={14} className="text-indigo-600" />
                    Thương hiệu
                    {selectedBrand && (
                        <span className="ml-1 rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700">
                            1
                        </span>
                    )}
                </span>
                {open ? (
                    <ChevronUp size={15} className="text-slate-400" />
                ) : (
                    <ChevronDown size={15} className="text-slate-400" />
                )}
            </button>

            {open && (
                <div className="mt-3 space-y-2">
                    {brands.length > 6 && (
                        <div className="relative mb-2">
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Tìm kiếm hãng..."
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs outline-none focus:border-indigo-500 focus:bg-white"
                            />
                        </div>
                    )}

                    <div className="max-h-48 space-y-1.5 overflow-y-auto pr-1">
                        {displayedBrands.length > 0 ? (
                            displayedBrands.map((b) => {
                                const isChecked =
                                    selectedBrand.toLowerCase() === b.toLowerCase();
                                return (
                                    <label
                                        key={b}
                                        className={`flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-xs font-medium transition ${
                                            isChecked
                                                ? "bg-indigo-50/80 font-bold text-indigo-700"
                                                : "text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                                        }`}
                                    >
                                        <span className="flex items-center gap-2.5">
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => onToggle(b)}
                                                className="h-4 w-4 rounded border-slate-300 accent-indigo-600 cursor-pointer"
                                            />
                                            <span>{b}</span>
                                        </span>
                                        {isChecked && (
                                            <span className="text-[10px] font-bold text-indigo-600 uppercase">
                                                Đang chọn
                                            </span>
                                        )}
                                    </label>
                                );
                            })
                        ) : (
                            <p className="py-2 text-center text-xs text-slate-400">
                                Không tìm thấy hãng
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}


function ProductToolbar({
    result,
    sortBy,
    onChange,
}: {
    result: PageResponse<ProductSummary> | null;
    sortBy: SortBy;
    onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
}) {
    return (
        <div className="flex items-center gap-3">
            {result !== null && (
                <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                    Tìm thấy <strong className="text-slate-800">{result.totalElements}</strong> sản phẩm
                </span>
            )}
            <label className="text-xs text-slate-500 font-semibold hidden md:inline">
                Sắp xếp:
            </label>
            <select
                value={sortBy}
                onChange={onChange}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 shadow-xs outline-none transition focus:border-indigo-500 cursor-pointer"
            >
                <option value="createdAt">Mới cập nhật</option>
                <option value="price">Giá: Thấp đến cao</option>
                <option value="name">Tên sản phẩm A-Z</option>
            </select>
        </div>
    );
}

function ProductResults({
    loading,
    error,
    products,
    isFullWidth = false,
}: {
    loading: boolean;
    error: string;
    products: ProductSummary[];
    isFullWidth?: boolean;
}) {
    if (error) {
        return (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 font-medium">
                {error}
            </div>
        );
    }

    const gridClass = isFullWidth
        ? "grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4"
        : "grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4";

    if (loading) {
        return (
            <div className={gridClass}>
                {Array.from({ length: 8 }, (_, index) => (
                    <div
                        key={index}
                        className="h-80 animate-pulse rounded-2xl bg-slate-100 border border-slate-200/50"
                    />
                ))}
            </div>
        );
    }

    return (
        <div className={gridClass}>
            {products.length ? (
                products.map((product) => (
                    <ProductCard product={product} key={product.id} />
                ))
            ) : (
                <div className="col-span-full">
                    <EmptyProducts />
                </div>
            )}
        </div>
    );
}

function CategorySpecificFilters({ category }: { category: Category }) {
    const groups = useMemo(
        () =>
            getCategoryFilters(category.name).filter(
                (g) => g.title !== "Thương hiệu",
            ),
        [category.name],
    );

    return (
        <>
            {groups.map((group) => (
                <FilterGroup
                    key={group.title}
                    title={group.title}
                    options={group.options}
                    selected={[]}
                    onToggle={() => {
                        // Preserved behavior
                    }}
                />
            ))}
        </>
    );
}

function FilterGroup({
    title,
    options,
    selected,
    onToggle,
}: {
    title: string;
    options: string[];
    selected: string[];
    onToggle: (option: string) => void;
}) {
    const [open, setOpen] = useState(true);

    return (
        <div className="border-b border-slate-100 px-5 py-4">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                className="flex w-full items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-slate-700"
            >
                {title}
                {open ? (
                    <ChevronUp size={15} className="text-slate-400" />
                ) : (
                    <ChevronDown size={15} className="text-slate-400" />
                )}
            </button>

            {open && (
                <div className="mt-3 space-y-2">
                    {options.map((option) => (
                        <label
                            className="flex cursor-pointer items-center gap-2.5 text-xs font-medium text-slate-700 hover:text-indigo-600 transition"
                            key={option}
                        >
                            <input
                                type="checkbox"
                                checked={selected.includes(option)}
                                onChange={() => onToggle(option)}
                                className="h-4 w-4 rounded border-slate-300 accent-indigo-600 cursor-pointer"
                            />
                            <span>{option}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
}

function getCategoryFilters(categoryName: string): FilterGroupDefinition[] {
    const name = categoryName.toLowerCase();

    if (name.includes("laptop") || name.includes("pc")) {
        return [
            {
                title: "Nhu cầu",
                options: [
                    "Văn phòng",
                    "Gaming",
                    "Đồ họa - kỹ thuật",
                    "Mỏng nhẹ",
                ],
            },
            {
                title: "CPU",
                options: [
                    "Intel Core i3",
                    "Intel Core i5",
                    "Intel Core i7",
                    "AMD Ryzen 5",
                    "AMD Ryzen 7",
                ],
            },
            {
                title: "Card đồ họa",
                options: ["NVIDIA GeForce", "AMD Radeon", "Card tích hợp"],
            },
        ];
    }

    if (name.includes("điện thoại") || name.includes("phone")) {
        return [
            {
                title: "Thương hiệu",
                options: ["Apple", "Samsung", "Xiaomi", "OPPO", "vivo"],
            },
            {
                title: "Dung lượng",
                options: ["64GB", "128GB", "256GB", "512GB"],
            },
            {
                title: "Tính năng",
                options: ["5G", "Sạc nhanh", "Camera tốt", "Pin lớn"],
            },
        ];
    }

    return [
        {
            title: "Thương hiệu",
            options: ["Apple", "Samsung", "Sony", "Baseus", "Anker"],
        },
        {
            title: "Nhu cầu sử dụng",
            options: ["Học tập", "Làm việc", "Giải trí", "Du lịch"],
        },
    ];
}
