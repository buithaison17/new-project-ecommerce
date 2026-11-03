package com.example.ecomerce_backend.model.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record ChangePasswordRequest(
        @NotBlank(message = "Mật khẩu cũ không được để trống")
        @Min(value = 6, message = "Mật khẩu phải tối thiểu 6 kí tự")
        String oldPassword,
        @NotBlank(message = "Mật khẩu mới không được để trống")
        @Min(value = 6, message = "Mật khẩu phải tối thiểu 6 kí tự")
        String newPassword
) {
}
