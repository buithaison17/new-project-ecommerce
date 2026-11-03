package com.example.ecomerce_backend.model.dto.response;

import java.math.BigDecimal;

public record OrderItemResponse(
        Long id,
        ProductResponse product,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal totalAmount
) {
}
