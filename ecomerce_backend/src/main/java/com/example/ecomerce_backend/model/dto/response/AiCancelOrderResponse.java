package com.example.ecomerce_backend.model.dto.response;

public record AiCancelOrderResponse(
        Long orderId,
        String orderStatus,
        String message
) {
}
