package com.example.ecomerce_backend.model.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record FlashSaleResponse(
        Long id,
        String name,
        String description,
        String scope,
        Long categoryId,
        String categoryName,
        Long productId,
        String productName,
        String discountType,
        BigDecimal discountValue,
        LocalDateTime startAt,
        LocalDateTime endAt,
        Boolean isActive,
        Boolean isRunning,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
