package com.example.ecomerce_backend.model.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record CreateAdminRequest(
        @NotBlank(message = "Username không được để trống")
        String username,
        @NotBlank(message = "Email không được để trống")
        @Email(message = "Email không hợp lệ")
        String email,
        @NotBlank(message = "Mật khẩu không được để trống")
        @Min(value = 6, message = "Mật khẩu tối thiểu 6 kí tự")
        String password,
        @NotBlank(message = "Vai trò không được để trống")
        String role
) {
}
