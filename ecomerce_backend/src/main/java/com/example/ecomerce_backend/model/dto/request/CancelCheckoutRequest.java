package com.example.ecomerce_backend.model.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CancelCheckoutRequest(
        @NotBlank(message = "paymentLinkId is required")
        String paymentLinkId
) {
}
