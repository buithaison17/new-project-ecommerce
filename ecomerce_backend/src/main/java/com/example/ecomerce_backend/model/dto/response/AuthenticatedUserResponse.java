package com.example.ecomerce_backend.model.dto.response;

import java.time.LocalDate;

public record AuthenticatedUserResponse(
        Long id,
        String username,
        String email,
        String fullName,
        String avatarUrl,
        LocalDate dateOfBirth,
        String role
) {
}
