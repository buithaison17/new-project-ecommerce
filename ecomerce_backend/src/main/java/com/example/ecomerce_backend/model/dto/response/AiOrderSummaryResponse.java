package com.example.ecomerce_backend.model.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AiOrderSummaryResponse(
        Long id,
        String orderStatus,
        String paymentMethod,
        String paymentStatus,
        BigDecimal finalAmount,
        LocalDateTime createdAt,
        Integer itemCount
) {
}
