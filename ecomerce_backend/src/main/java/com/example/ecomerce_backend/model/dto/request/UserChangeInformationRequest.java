package com.example.ecomerce_backend.model.dto.request;

import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

public record UserChangeInformationRequest(
        String email,
        String fullName,
        MultipartFile avatarUrl,
        LocalDate dateOfBirth,
        String gender
) {
}
