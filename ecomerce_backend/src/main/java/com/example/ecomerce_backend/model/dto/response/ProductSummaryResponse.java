package com.example.ecomerce_backend.model.dto.response;

import java.math.BigDecimal;

/** Dùng cho danh sách sản phẩm dạng lưới (Product Grid). */
public record ProductSummaryResponse(
        Long id,
        String name,
        BigDecimal price,
        Long categoryId,
        String categoryName,
        String thumbnailUrl,
        Integer stockQuantity,
        Boolean inStock
) {
}
