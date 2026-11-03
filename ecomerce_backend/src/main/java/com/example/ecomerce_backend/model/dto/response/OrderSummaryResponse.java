package com.example.ecomerce_backend.model.dto.response;

import com.example.ecomerce_backend.constants.OrderStatus;
import com.example.ecomerce_backend.constants.PaymentMethod;
import com.example.ecomerce_backend.constants.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record OrderSummaryResponse(
        Long id,
        BigDecimal finalAmount,
        String orderStatus,
        PaymentMethod paymentMethod,
        PaymentStatus paymentStatus,
        LocalDateTime createdAt
) {
}
