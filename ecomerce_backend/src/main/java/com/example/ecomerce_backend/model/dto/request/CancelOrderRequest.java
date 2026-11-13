package com.example.ecomerce_backend.model.dto.request;

public record CancelOrderRequest(
        String accountNumber,
        String bin
) {
}
