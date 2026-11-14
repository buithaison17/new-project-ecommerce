package com.example.ecomerce_backend.model.dto.response;

import java.math.BigDecimal;

public record AiPlaceOrderResponse(
        Long orderId,
        String orderStatus,
        String paymentMethod,
        String paymentStatus,
        BigDecimal finalAmount,
        String checkoutUrl,
        String message
) {
}
