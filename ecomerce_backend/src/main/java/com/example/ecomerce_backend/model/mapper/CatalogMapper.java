package com.example.ecomerce_backend.model.mapper;

import com.example.ecomerce_backend.model.dto.response.*;
import com.example.ecomerce_backend.model.entity.Category;
import com.example.ecomerce_backend.model.entity.Inventory;
import com.example.ecomerce_backend.model.entity.Product;
import com.example.ecomerce_backend.model.entity.ProductImage;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;

/**
 * Mapper viết tay cho nhóm Catalog (Category / Product / Inventory).
 */
@Component
public class CatalogMapper {

    public CategoryResponse toCategoryResponse(Category category) {
        return new CategoryResponse(category.getId(), category.getName(), category.getDescription());
    }

    public ProductSummaryResponse toProductSummary(Product product, int stockQuantity) {
        List<ProductImageResponse> images = activeImages(product);
        Category category = product.getCategory();
        return new ProductSummaryResponse(
                product.getId(),
                product.getName(),
                product.getPrice(),
                category.getId(),
                category.getName(),
                images.isEmpty() ? null : images.get(0).url(),
                stockQuantity,
                stockQuantity > 0
        );
    }

    public ProductResponse toProductDetail(Product product, int stockQuantity) {
        List<ProductImageResponse> images = activeImages(product);
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                toCategoryResponse(product.getCategory()),
                images.isEmpty() ? null : images.get(0).url(),
                images,
                stockQuantity,
                stockQuantity > 0,
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }

    public InventoryResponse toInventoryResponse(Inventory inventory, int lowStockThreshold) {
        int available = inventory.availableQuantity();
        return new InventoryResponse(
                inventory.getProduct().getId(),
                inventory.getProduct().getName(),
                inventory.getQuantity(),
                inventory.getReservedQuantity(),
                available,
                available < lowStockThreshold,
                inventory.getUpdatedAt()
        );
    }

    /**
     * Ảnh đầu tiên chưa bị xóa của sản phẩm; null nếu chưa có ảnh.
     */
    public String thumbnailUrl(Product product) {
        List<ProductImageResponse> images = activeImages(product);
        return images.isEmpty() ? null : images.get(0).url();
    }

    private List<ProductImageResponse> activeImages(Product product) {
        return product.getProductImages().stream()
                .filter(image -> !Boolean.TRUE.equals(image.getIsDeleted()))
                .sorted(Comparator.comparing(ProductImage::getId, Comparator.nullsLast(Comparator.naturalOrder())))
                .map(image -> new ProductImageResponse(image.getId(), image.getUrl()))
                .toList();
    }
}