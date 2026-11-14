package com.example.ecomerce_backend.model.dto.response;

import java.math.BigDecimal;

public record AiOrderItemResponse(
        Long productId,
        String productName,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal totalAmount
) {
}
