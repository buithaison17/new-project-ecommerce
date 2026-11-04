export interface Category { id: number; name: string; description: string | null; brands?: string[]; }
export interface ProductSummary { id: number; name: string; price: number; categoryId: number; categoryName: string; thumbnailUrl: string | null; stockQuantity: number; inStock: boolean; }
export interface ProductImage { id: number; url: string; }
export interface Product extends Omit<ProductSummary, "categoryId" | "categoryName"> { description: string | null; category: Category; images: ProductImage[]; createdAt: string; updatedAt: string; }
export interface PageResponse<T> { content: T[]; page: number; size: number; totalElements: number; totalPages: number; }
export interface ApiDataResponse<T> { success: boolean; message: string; data: T; }
