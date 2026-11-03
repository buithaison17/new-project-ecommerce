package com.example.ecomerce_backend.model.dto.response;

public record UserResponse(
        Long id,
        String username,
        String email,
        String role
) {
}
