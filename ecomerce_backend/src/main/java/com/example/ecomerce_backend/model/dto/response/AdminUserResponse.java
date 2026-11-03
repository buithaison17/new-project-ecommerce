package com.example.ecomerce_backend.model.dto.response;

import java.time.LocalDateTime;

public record AdminUserResponse(
        Long id,
        String username,
        String email,
        String role,
        Boolean isEnabled,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
