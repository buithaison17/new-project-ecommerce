package com.example.ecomerce_backend.model.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record AiOrderDetailResponse(
        Long id,
        String orderStatus,
        String paymentMethod,
        String paymentStatus,
        BigDecimal totalAmount,
        BigDecimal shippingAmount,
        BigDecimal finalAmount,
        String note,
        LocalDateTime createdAt,
        String deliveryAddress,
        String deliveryPhone,
        List<AiOrderItemResponse> items
) {
}
