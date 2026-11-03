package com.example.ecomerce_backend.model.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;

public record RegisterRequest(
        @NotBlank(message = "Username không được để trống")
        String username,
        @NotBlank(message = "Email không được để trống")
        String email,
        @NotBlank(message = "Mật khẩu không được để trống")
        @Min(value = 6, message = "Mật khẩu tối thiểu 6 kí tự")
        String password,
        @NotBlank(message = "Họ tên không được để trống")
        String fullName,
        @NotNull(message = "Ngày sinh không được để trống")
        @JsonFormat(pattern = "yyyy-MM-dd")
        LocalDate dateOfBirth,
        @NotBlank(message = "Giới tính không được để trống")
        @Pattern(regexp = "^(MALE|FEMALE)$", message = "Giới tính phải là nam hoặc nữa")
        String gender
) {
}
