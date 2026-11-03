package com.example.ecomerce_backend.model.dto.response;

import java.math.BigDecimal;

public record CartItemResponse(
        Long productId,
        String productName,
        String thumbnailUrl,
        BigDecimal unitPrice,
        Integer quantity,
        /** Tồn kho khả dụng hiện tại, để Frontend giới hạn nút tăng số lượng. */
        Integer availableQuantity,
        BigDecimal subtotal
) {
}