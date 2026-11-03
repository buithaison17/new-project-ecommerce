package com.example.ecomerce_backend.model.dto.request;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record UpdateProductRequest(
        @NotBlank(message = "Tên sản phẩm không được để trống")
        @Size(max = 255, message = "Tên sản phẩm tối đa 255 ký tự")
        String name,
        @NotBlank(message = "Mô tả không được để trống")
        String description,
        @NotNull(message = "Giá không được để trống")
        @DecimalMin(value = "0.01", message = "Giá phải lớn hơn 0")
        @Digits(integer = 8, fraction = 2, message = "Giá tối đa 8 chữ số nguyên và 2 chữ số thập phân")
        BigDecimal price,
        @NotNull(message = "Danh mục không được để trống")
        Long categoryId
) {
}
