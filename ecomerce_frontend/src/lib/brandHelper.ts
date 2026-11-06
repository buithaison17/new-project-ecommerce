import type { Category } from "../types/catalog";

const STORAGE_KEY = "ecommerce_category_brands_map";

export const DEFAULT_SUGGESTED_BRANDS = [
    "Apple",
    "Samsung",
    "Xiaomi",
    "Sony",
    "Logitech",
    "Anker",
    "Philips",
    "Nike",
    "Coolmate",
    "La Roche-Posay",
    "Lock&Lock",
];

export function getDefaultBrandsForCategory(categoryName = ""): string[] {
    const name = categoryName.toLowerCase();
    if (name.includes("laptop") || name.includes("pc") || name.includes("máy tính")) {
        return ["Apple", "Dell", "HP", "Asus", "Acer", "Lenovo", "MSI"];
    }
    if (name.includes("điện thoại") || name.includes("phone")) {
        return ["Apple", "Samsung", "Xiaomi", "OPPO", "vivo", "Realme"];
    }
    if (name.includes("phụ kiện") || name.includes("tai nghe") || name.includes("loa")) {
        return ["Sony", "Baseus", "Anker", "Logitech", "JBL", "Marshall"];
    }
    if (name.includes("đồng hồ") || name.includes("trang sức") || name.includes("watch")) {
        return ["Apple", "Samsung", "Garmin", "Casio", "Swarovski"];
    }
    if (name.includes("thời trang nam")) {
        return ["Coolmate", "Levi's", "Routine", "The North Face", "Nike", "Adidas"];
    }
    if (name.includes("thời trang nữ") || name.includes("thời trang")) {
        return ["Routine", "Zara", "Mango", "H&M", "Elise", "Chanel"];
    }
    if (name.includes("mỹ phẩm") || name.includes("làm đẹp") || name.includes("chăm sóc")) {
        return ["La Roche-Posay", "Anessa", "Cerave", "Chanel", "L'Oreal", "MAC"];
    }
    if (name.includes("gia dụng") || name.includes("điện gia dụng")) {
        return ["Philips", "Toshiba", "Xiaomi", "Dyson", "Panasonic", "Tefal"];
    }
    if (name.includes("nhà cửa") || name.includes("đời sống")) {
        return ["Sihoo", "Lock&Lock", "Panasonic", "IKEA", "Sunhouse"];
    }
    if (name.includes("bách hóa") || name.includes("thực phẩm")) {
        return ["Đắk Lắk", "Danisa", "Lâm Đồng", "Trung Nguyên", "Vinamilk"];
    }
    if (name.includes("thể thao") || name.includes("dã ngoại")) {
        return ["Nike", "Adidas", "Naturehike", "Yonex", "Puma", "Decathlon"];
    }
    if (name.includes("mẹ & bé") || name.includes("mẹ và bé")) {
        return ["Meiji", "Bobby", "Pigeon", "LEGO", "Huggies"];
    }
    if (name.includes("sách") || name.includes("văn phòng")) {
        return ["Kindle", "Parker", "First News", "NXB Trẻ", "Nhã Nam"];
    }
    return ["Apple", "Samsung", "Sony", "Xiaomi", "Asus", "Dell", "Logitech"];
}

function getStorageMap(): Record<string, string[]> {
    if (typeof window === "undefined") return {};
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

export function getStoredCategoryBrands(categoryId: number | string, categoryName = ""): string[] {
    const map = getStorageMap();
    if (map[String(categoryId)] && Array.isArray(map[String(categoryId)]) && map[String(categoryId)].length > 0) {
        return map[String(categoryId)];
    }
    return getDefaultBrandsForCategory(categoryName);
}

export function saveStoredCategoryBrands(categoryId: number | string, brands: string[]): void {
    if (typeof window === "undefined") return;
    try {
        const map = getStorageMap();
        map[String(categoryId)] = brands;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    } catch {
        // Ignore storage errors
    }
}

export function enrichCategoryWithBrands(category: Category): Category {
    const stored = getStoredCategoryBrands(category.id, category.name);
    const brands =
        category.brands && category.brands.length > 0
            ? category.brands
            : stored;
    return { ...category, brands };
}

export function matchProductBrand(productName = "", brand = ""): boolean {
    if (!brand.trim()) return true;
    const p = productName.toLowerCase();
    const b = brand.toLowerCase().trim();

    if (p.includes(b)) return true;

    if (b === "apple") {
        return p.includes("iphone") || p.includes("ipad") || p.includes("macbook") || p.includes("airpods");
    }
    if (b === "samsung") {
        return p.includes("galaxy");
    }
    if (b === "sony") {
        return p.includes("wh-") || p.includes("wf-") || p.includes("playstation");
    }
    if (b === "levi's" || b === "levis") {
        return p.includes("levi") || p.includes("511");
    }
    if (b === "the north face") {
        return p.includes("north face");
    }
    return false;
}
