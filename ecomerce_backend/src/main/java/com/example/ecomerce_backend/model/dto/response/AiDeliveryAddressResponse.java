package com.example.ecomerce_backend.model.dto.response;

public record AiDeliveryAddressResponse(
        Long id,
        String address,
        String phoneNumber
) {
}
