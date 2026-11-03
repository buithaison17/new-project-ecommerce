package com.example.ecomerce_backend.model.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/** Dùng cho trang chi tiết sản phẩm và kết quả của các API admin. */
public record ProductResponse(
        Long id,
        String name,
        String description,
        BigDecimal price,
        CategoryResponse category,
        String thumbnailUrl,
        List<ProductImageResponse> images,
        Integer stockQuantity,
        Boolean inStock,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
