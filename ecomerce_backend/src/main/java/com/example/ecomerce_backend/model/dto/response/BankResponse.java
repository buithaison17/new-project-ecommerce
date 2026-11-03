package com.example.ecomerce_backend.model.dto.response;

public record BankResponse(
        String name,
        String code,
        String bin,
        String shortName,
        String logo
) {
}
