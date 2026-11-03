package com.example.ecomerce_backend.model.dto.response;

import java.time.LocalDate;

public record UserInformationResponse(
        Long id,
        String fullName,
        String avatarUrl,
        LocalDate dateOfBirth,
        String gender
) {
}
