package com.example.ecomerce_backend.model.dto.response;

import java.math.BigDecimal;

public record PaymentStatusResponse(
        Long orderId,
        Long orderCode,
        String paymentLinkStatus,
        String paymentStatus,
        BigDecimal amount
) {
}
