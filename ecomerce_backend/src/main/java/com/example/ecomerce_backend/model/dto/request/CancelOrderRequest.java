package com.example.ecomerce_backend.model.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CancelOrderRequest(
        String accountNumber,
        String bin
) {
}
