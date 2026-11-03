package com.example.ecomerce_backend.model.dto.response;

public record UserDeliveryResponse(
        String address,
        String phoneNumber
) {
}
