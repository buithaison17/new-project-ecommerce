package com.example.ecomerce_backend.model.dto.request;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.List;

public record CreateProductRequest(
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
        Long categoryId,
        @Min(value = 0, message = "Số lượng ban đầu không được âm")
        Integer initialQuantity,
        @Size(max = 10, message = "Tối đa 10 ảnh")
        List<@NotBlank(message = "URL ảnh không được để trống") @Size(max = 500, message = "URL ảnh tối đa 500 ký tự") String> imageUrls
) {
}
